const express = require('express');
const router = express.Router();
const Periodo = require('../models/Periodo');

router.get('/', async (req, res) => {
  try {
    const periodos = await Periodo.find().sort({ fechaInicio: -1 });
    res.json({ success: true, data: periodos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const periodo = await Periodo.findById(req.params.id);
    if (!periodo) return res.status(404).json({ success: false, message: 'Período no encontrado' });
    res.json({ success: true, data: periodo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const periodo = await Periodo.create(req.body);
    res.status(201).json({ success: true, data: periodo });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const periodo = await Periodo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!periodo) return res.status(404).json({ success: false, message: 'Período no encontrado' });
    res.json({ success: true, data: periodo });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const periodo = await Periodo.findByIdAndDelete(req.params.id);
    if (!periodo) return res.status(404).json({ success: false, message: 'Período no encontrado' });
    res.json({ success: true, message: 'Período eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
