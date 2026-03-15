const express = require('express');
const router = express.Router();
const Horario = require('../models/Horario');
const logger = require('../utils/logger');

router.get('/', async (req, res) => {
  try {
    const { asignacion, aula, diaSemana, bloque } = req.query;
    const query = {};
    if (asignacion) query.asignacion = asignacion;
    if (aula) query.aula = aula;
    if (diaSemana) query.diaSemana = diaSemana;
    
    // Si filtran por bloque, necesitamos buscar las asignaciones de ese bloque primero
    if (bloque) {
      const Asignacion = require('../models/Asignacion');
      const asignacionesBloque = await Asignacion.find({ bloque: bloque }).select('_id');
      query.asignacion = { $in: asignacionesBloque.map(a => a._id) };
    }

    const horarios = await Horario.find(query)
      .populate({
        path: 'asignacion',
        populate: [
          { 
            path: 'bloque',
            populate: [
              { path: 'carrera' },
              { path: 'periodo' }
            ]
          },
          { path: 'curso' },
          { path: 'profesor' }
        ]
      })
      .populate('aula')
      .sort({ diaSemana: 1, horaInicio: 1 });
    
    res.json({ success: true, data: horarios });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/bloque/:bloqueId', async (req, res) => {
  try {
    const Asignacion = require('../models/Asignacion');
    const asignaciones = await Asignacion.find(
      { bloque: req.params.bloqueId }
    ).select('_id');
    
    const asignacionIds = asignaciones.map(a => a._id);
    
    const horarios = await Horario.find({ asignacion: { $in: asignacionIds } })
      .populate({
        path: 'asignacion',
        populate: [
          { path: 'curso' },
          { path: 'profesor' }
        ]
      })
      .populate('aula')
      .sort({ diaSemana: 1, horaInicio: 1 });
    
    res.json({ success: true, data: horarios });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Función auxiliar para validar cruces de AULA y PROFESOR
async function validarCruce(diaSemana, horaInicio, horaFin, aulaId, profesorId, horarioId = null) {
  const queryAula = {
    diaSemana,
    aula: aulaId,
    $or: [{ horaInicio: { $lt: horaFin }, horaFin: { $gt: horaInicio } }]
  };

  if (horarioId) queryAula._id = { $ne: horarioId };

  // 1. Validar Aula
  if (aulaId) {
    const cruceAula = await Horario.findOne(queryAula).populate({
      path: 'asignacion',
      populate: { path: 'curso' }
    });
    if (cruceAula) return { tipo: 'aula', detalle: cruceAula };
  }

  // 2. Validar Profesor
  if (profesorId) {
    const Asignacion = require('../models/Asignacion');
    const asigsProf = await Asignacion.find({ profesor: profesorId }).select('_id');
    const queryProf = {
      diaSemana,
      asignacion: { $in: asigsProf.map(a => a._id) },
      $or: [{ horaInicio: { $lt: horaFin }, horaFin: { $gt: horaInicio } }]
    };
    if (horarioId) queryProf._id = { $ne: horarioId };

    const cruceProf = await Horario.findOne(queryProf).populate({
      path: 'asignacion',
      populate: [{ path: 'curso' }, { path: 'bloque' }]
    });
    if (cruceProf) return { tipo: 'profesor', detalle: cruceProf };
  }

  return null;
}

router.post('/', async (req, res) => {
  try {
    const { asignacion: asignacionId, diaSemana, horaInicio, horaFin, aula } = req.body;
    
    // Obtener información de la asignación para el profesor
    const Asignacion = require('../models/Asignacion');
    const docAsignacion = await Asignacion.findById(asignacionId).populate('profesor');
    if (!docAsignacion) return res.status(404).json({ success: false, message: 'Asignación no encontrada' });
    
    let aulaId = aula || docAsignacion.aula;
    const profesorId = docAsignacion.profesor?._id || docAsignacion.profesor;

    // Validar Cruce (Aula y Profesor)
    const conflicto = await validarCruce(diaSemana, horaInicio, horaFin, aulaId, profesorId);
    
    if (conflicto) {
      const { tipo, detalle } = conflicto;
      const cursoNombre = detalle.asignacion?.curso?.nombre || 'Otro curso';
      const bloqueNombre = detalle.asignacion?.bloque?.codigo || 'Otro bloque';
      const msg = tipo === 'aula' 
        ? `Aula ocupada por ${cursoNombre} en NRC ${bloqueNombre}` 
        : `Profesor ocupado dictando ${cursoNombre} en NRC ${bloqueNombre}`;
      
      logger.warn(`CONFLICTOR DETECTADO: ${msg}`);
      
      if (tipo === 'aula') {
        return res.status(409).json({ 
          success: false, 
          message: `Conflicto de Aula: El aula ya está siendo usada por "${cursoNombre}" (${bloqueNombre}) en este horario.` 
        });
      } else {
        return res.status(409).json({ 
          success: false, 
          message: `Conflicto de Docente: El profesor ya tiene asignado "${cursoNombre}" en el bloque ${bloqueNombre} a esta hora.` 
        });
      }
    }

    // Crear si no hay cruce
    // Si no enviaron aula específica para el horario, guardamos la de la asignación para consistencia de búsqueda
    const data = { ...req.body };
    if (!data.aula && aulaId) data.aula = aulaId;

    const horario = await Horario.create(data);
    res.status(201).json({ success: true, data: horario });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { diaSemana, horaInicio, horaFin, aula } = req.body;
    
    // Para validar necesitamos los datos completos. Si faltan en body, buscamos el doc actual.
    // Pero asumiremos que el frontend envía todo. Si no, habría que hacer un findById primero.
    // Para simplificar y mayor robustez, buscamos el actual.
    const horarioActual = await Horario.findById(req.params.id);
    if (!horarioActual) return res.status(404).json({ success: false, message: 'Horario no encontrado' });

    const nuevoDia = diaSemana || horarioActual.diaSemana;
    const nuevoInicio = horaInicio || horarioActual.horaInicio;
    const nuevoFin = horaFin || horarioActual.horaFin;
    let nuevoAula = aula || horarioActual.aula;

    // Obtener profesor de la asignación
    const Asignacion = require('../models/Asignacion');
    const asig = await Asignacion.findById(horarioActual.asignacion);
    const profesorId = asig?.profesor?._id || asig?.profesor;

    // Validar cruce
    const conflicto = await validarCruce(nuevoDia, nuevoInicio, nuevoFin, nuevoAula, profesorId, req.params.id);
    
    if (conflicto) {
      const { tipo, detalle } = conflicto;
      const cursoNombre = detalle.asignacion?.curso?.nombre || 'Otro curso';
      const bloqueNombre = detalle.asignacion?.bloque?.codigo || 'Otro bloque';

      if (tipo === 'aula') {
        return res.status(409).json({ 
          success: false, 
          message: `Conflicto de Aula: El aula para este cambio está ocupada por "${cursoNombre}" del NRC ${bloqueNombre}.` 
        });
      } else {
        return res.status(409).json({ 
          success: false, 
          message: `Conflicto de Docente: No se puede mover porque el docente ya dicta "${cursoNombre}" en el NRC ${bloqueNombre} en ese horario.` 
        });
      }
    }

    const horario = await Horario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: horario });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const horario = await Horario.findByIdAndDelete(req.params.id);
    if (!horario) return res.status(404).json({ success: false, message: 'Horario no encontrado' });
    res.json({ success: true, message: 'Horario eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
