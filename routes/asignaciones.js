const express = require('express');
const router = express.Router();
const Asignacion = require('../models/Asignacion');

router.get('/', async (req, res) => {
  try {
    const { bloque, curso, profesor } = req.query;
    const query = {};
    if (bloque) query.bloque = bloque;
    if (curso) query.curso = curso;
    if (profesor) query.profesor = profesor;

    const asignaciones = await Asignacion.find(query)
      .populate('bloque')
      .populate('curso')
      .populate('profesor');
    
    res.json({ success: true, data: asignaciones });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const asignacion = await Asignacion.create(req.body);
    res.status(201).json({ success: true, data: asignacion });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const asignacion = await Asignacion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!asignacion) return res.status(404).json({ success: false, message: 'Asignación no encontrada' });
    res.json({ success: true, data: asignacion });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const asignacion = await Asignacion.findByIdAndDelete(req.params.id);
    if (!asignacion) return res.status(404).json({ success: false, message: 'Asignación no encontrada' });
    res.json({ success: true, message: 'Asignación eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
