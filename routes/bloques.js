const express = require('express');
const router = express.Router();
const Bloque = require('../models/Bloque');
const geminiService = require('../services/gemini-service');
const Asignacion = require('../models/Asignacion');
const Horario = require('../models/Horario');
const Curso = require('../models/Curso');
const Profesor = require('../models/Profesor');
const Aula = require('../models/Aula');

router.get('/', async (req, res) => {
  try {
    const { periodo, carrera, estado } = req.query;
    const query = {};
    if (periodo) query.periodo = periodo;
    if (carrera) query.carrera = carrera;
    if (estado) query.estado = estado;

    const bloques = await Bloque.find(query)
      .populate('periodo')
      .populate('carrera')
      .sort({ codigo: 1 });
    
    res.json({ success: true, data: bloques });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const bloque = await Bloque.findById(req.params.id)
      .populate('periodo')
      .populate('carrera');
    if (!bloque) return res.status(404).json({ success: false, message: 'Bloque no encontrado' });
    res.json({ success: true, data: bloque });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const bloque = await Bloque.create(req.body);
    res.status(201).json({ success: true, data: bloque });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const bloque = await Bloque.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bloque) return res.status(404).json({ success: false, message: 'Bloque no encontrado' });
    res.json({ success: true, data: bloque });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const bloque = await Bloque.findByIdAndDelete(req.params.id);
    if (!bloque) return res.status(404).json({ success: false, message: 'Bloque no encontrado' });
    res.json({ success: true, message: 'Bloque eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CLONAR HORARIOS DE UN BLOQUE A OTRO
router.post('/:id/clonar', async (req, res) => {
  try {
    const targetBloqueId = req.params.id;
    const { fromBloqueId } = req.body;

    if (!fromBloqueId) return res.status(400).json({ success: false, message: 'Falta bloque de origen' });

    // 1. Obtener todas las asignaciones del bloque origen
    const Asignacion = require('../models/Asignacion');
    const Horario = require('../models/Horario');
    
    const asignacionesOrigen = await Asignacion.find({ bloque: fromBloqueId });

    for (const asigOrig of asignacionesOrigen) {
      // 2. Buscar si el bloque destino ya tiene este curso asignado
      let asigDest = await Asignacion.findOne({ bloque: targetBloqueId, curso: asigOrig.curso });
      
      if (!asigDest) {
        // Clonar la asignación (Docente y Aula pred)
        asigDest = await Asignacion.create({
          bloque: targetBloqueId,
          curso: asigOrig.curso,
          profesor: asigOrig.profesor,
          aula: asigOrig.aula,
          observaciones: `Clonado de bloque ${fromBloqueId}`
        });
      }

      // 3. Clonar los horarios de esta asignación
      const horariosOrigen = await Horario.find({ asignacion: asigOrig._id });
      for (const horOrig of horariosOrigen) {
        // Verificar que no exista el horario antes de clonar (para no duplicar si se corre 2 veces)
        const existe = await Horario.exists({
          asignacion: asigDest._id,
          diaSemana: horOrig.diaSemana,
          horaInicio: horOrig.horaInicio
        });

        if (!existe) {
          await Horario.create({
            asignacion: asigDest._id,
            aula: horOrig.aula,
            diaSemana: horOrig.diaSemana,
            horaInicio: horOrig.horaInicio,
            horaFin: horOrig.horaFin,
            tipoSesion: horOrig.tipoSesion
          });
        }
      }
    }

    res.json({ success: true, message: 'Horarios clonados exitosamente' });
  } catch (error) {
    console.error('Error al clonar bloque:', error);
    res.status(500).json({ success: false, message: 'Fallo al clonar la estructura' });
  }
});

// PLANIFICACIÓN INTELIGENTE CON GEMINI
router.post('/:id/planificar-gemini', async (req, res) => {
  try {
    const bloqueId = req.params.id;
    const bloque = await Bloque.findById(bloqueId).populate('periodo').populate('carrera');
    
    if (!bloque) return res.status(404).json({ success: false, message: 'Bloque no encontrado' });

    // 1. Recolectar contexto para la IA
    const cursos = await Curso.find({ carrera: bloque.carrera?._id, semestre: bloque.semestreAcademico });
    const asignaciones = await Asignacion.find({ bloque: bloqueId }).populate('profesor').populate('aula');
    const aulas = await Aula.find({ activo: true });
    
    // Horarios externos (para evitar cruces)
    const horariosExistentes = await Horario.find().populate({
      path: 'asignacion',
      populate: { path: 'bloque' }
    });

    const contexto = {
      bloque,
      cursos,
      profesores: asignaciones.map(a => a.profesor).filter(p => p),
      aulas,
      horariosExistentes: horariosExistentes.map(h => ({
        dia: h.diaSemana,
        inicio: h.horaInicio,
        aula: h.aula?.codigo,
        profesor: h.asignacion?.profesor?.apellidos
      }))
    };

    // 2. Llamar a Gemini
    const plan = await geminiService.planificarBloque(contexto);

    // 3. Procesar y Guardar el plan (Básico: Crear horarios si no hay conflictos)
    let creados = 0;
    for (const item of plan) {
      const asig = asignaciones.find(a => a.curso?.nombre === item.curso || a.curso?.codigo === item.curso);
      if (asig) {
        // Validación minimalista antes de guardar
        const existe = await Horario.exists({ 
          asignacion: asig._id, 
          diaSemana: item.dia, 
          horaInicio: item.inicio 
        });

        if (!existe) {
          const aulaObj = aulas.find(a => a.codigo === item.aula) || asig.aula;
          await Horario.create({
            asignacion: asig._id,
            diaSemana: item.dia,
            horaInicio: item.inicio,
            horaFin: item.fin,
            tipoSesion: item.tipo || 'Teoría',
            aula: aulaObj?._id
          });
          creados++;
        }
      }
    }

    res.json({ 
      success: true, 
      message: `Gemini ha generado ${creados} sesiones óptimas para este bloque.`,
      plan
    });

  } catch (error) {
    console.error('Error en Planificador Gemini:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
