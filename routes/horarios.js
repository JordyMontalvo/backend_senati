const express = require('express');
const router = express.Router();
const Horario = require('../models/Horario');

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

// Función auxiliar para validar cruces
async function validarCruce(diaSemana, horaInicio, horaFin, aulaId, horarioId = null) {
  if (!aulaId) return null; // Si no hay aula asignada (ej. virtual), no validamos cruce físico

  // Buscar horarios en el mismo día y aula
  const query = {
    diaSemana,
    aula: aulaId,
    $or: [
      { horaInicio: { $lt: horaFin }, horaFin: { $gt: horaInicio } } // Solapamiento
    ]
  };

  if (horarioId) {
    query._id = { $ne: horarioId }; // Excluir el propio horario al editar
  }

  const cruce = await Horario.findOne(query).populate({
    path: 'asignacion',
    populate: { path: 'curso' }
  });

  return cruce;
}

router.post('/', async (req, res) => {
  try {
    const { asignacion: asignacionId, diaSemana, horaInicio, horaFin, aula } = req.body;
    
    // Determinar Aula ID
    let aulaId = aula;
    if (!aulaId) {
      const Asignacion = require('../models/Asignacion');
      const docAsignacion = await Asignacion.findById(asignacionId);
      if (docAsignacion) aulaId = docAsignacion.aula;
    }

    // Validar Cruce
    const cruce = await validarCruce(diaSemana, horaInicio, horaFin, aulaId);
    if (cruce) {
      const cursoNombre = cruce.asignacion?.curso?.nombre || 'Otro curso';
      const horaCruce = `${cruce.horaInicio} - ${cruce.horaFin}`;
      return res.status(409).json({ 
        success: false, 
        message: `Conflicto de horario: El aula ya está ocupada por "${cursoNombre}" de ${horaCruce}.` 
      });
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

    // Validar cruce
    const cruce = await validarCruce(nuevoDia, nuevoInicio, nuevoFin, nuevoAula, req.params.id);
    if (cruce) {
      const cursoNombre = cruce.asignacion?.curso?.nombre || 'Otro curso';
      const horaCruce = `${cruce.horaInicio} - ${cruce.horaFin}`;
      return res.status(409).json({ 
        success: false, 
        message: `Conflicto de horario: El aula ya está ocupada por "${cursoNombre}" de ${horaCruce}.` 
      });
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
