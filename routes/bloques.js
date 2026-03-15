const express = require('express');
const router = express.Router();
const Bloque = require('../models/Bloque');

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

module.exports = router;
