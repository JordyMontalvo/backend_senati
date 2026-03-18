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
    
    // Traer todos los profesores para que la IA pueda sugerir asignaciones si faltan
    const allProfesores = await Profesor.find({ activo: true });

    // Horarios externos (para evitar cruces)
    const horariosExistentes = await Horario.find().populate({
      path: 'asignacion',
      populate: { path: 'bloque' }
    });

    const contexto = {
      bloque,
      cursos: cursos.map(c => ({
        _id: c._id,
        nombre: c.nombre,
        codigo: c.codigo,
        horasTeoria: c.horasTeoria || 0,
        horasTaller: c.horasTaller || 0,
        horasVirtual: c.horasVirtual || 0,
        horasTotal: c.horasTotal || 0
      })),
      profesores: allProfesores.map(p => ({
        _id: p._id,
        apellidos: p.apellidos,
        nombres: p.nombres,
        especialidad: p.especialidad
      })),
      asignacionesActuales: asignaciones.map(a => ({
        cursoId: a.curso?._id,
        profesorId: a.profesor?._id,
        profesorNombre: a.profesor ? `${a.profesor.apellidos}, ${a.profesor.nombres}` : null,
        aulaId: a.aula?._id
      })),
      aulas: aulas.map(a => ({
        codigo: a.codigo,
        tipo: a.tipo,
        capacidad: a.capacidad
      })),
      horariosOcupadosGlobal: horariosExistentes.map(h => ({
        dia: h.diaSemana,
        inicio: h.horaInicio,
        fin: h.horaFin,
        aula: h.aula?.codigo,
        profesor: h.asignacion?.profesor?.apellidos,
        bloque: h.asignacion?.bloque?.codigo
      }))
    };

    // 2. Llamar a Gemini
    const plan = await geminiService.planificarBloque(contexto);

    // 3. Procesar y Guardar el plan
    let creados = 0;
    const Asignacion = require('../models/Asignacion');
    const Horario = require('../models/Horario');

    for (const item of plan) {
      // Búsqueda inteligente del curso
      const curso = cursos.find(c => 
        c.nombre.toLowerCase() === item.curso.toLowerCase() || 
        c.nombre.toLowerCase().includes(item.curso.toLowerCase()) ||
        item.curso.toLowerCase().includes(c.nombre.toLowerCase())
      );
      
      if (curso) {
        // Encontrar o crear asignación
        let asig = asignaciones.find(a => String(a.curso?._id || a.curso) === String(curso._id));
        
        if (!asig) {
          // Si la IA propuso un profesor, buscarlo en la lista completa
          const profMatch = allProfesores.find(p => 
            p.apellidos.toLowerCase().includes(item.profesor.toLowerCase()) ||
            item.profesor.toLowerCase().includes(p.apellidos.toLowerCase())
          );

          const profId = profMatch?._id || allProfesores[0]?._id;

          // Aula sugerida
          const aulaMatch = aulas.find(a => a.codigo === item.aula);

          asig = await Asignacion.create({
            bloque: bloqueId,
            curso: curso._id,
            profesor: profId,
            aula: aulaMatch?._id || aulas[0]?._id
          });
          // Añadir a la lista local para evitar duplicar asignación en el sig. item
          asignaciones.push(asig);
        }

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
            tipoSesion: item.tipo?.replace('|', '') || 'Teoría',
            aula: aulaObj?._id || asig.aula
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
