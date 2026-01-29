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

module.exports = router;
