const express = require('express');
const router = express.Router();
const Escuela = require('../models/Escuela');

router.get('/', async (req, res) => {
  try {
    const escuelas = await Escuela.find().sort({ nombre: 1 });
    res.json({ success: true, data: escuelas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const escuela = await Escuela.create(req.body);
    res.status(201).json({ success: true, data: escuela });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const escuela = await Escuela.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!escuela) return res.status(404).json({ success: false, message: 'Escuela no encontrada' });
    res.json({ success: true, data: escuela });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const escuela = await Escuela.findByIdAndDelete(req.params.id);
    if (!escuela) return res.status(404).json({ success: false, message: 'Escuela no encontrada' });
    res.json({ success: true, message: 'Escuela eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
