const express = require('express');
const router = express.Router();
const Aula = require('../models/Aula');

router.get('/', async (req, res) => {
  try {
    const { tipo, activo } = req.query;
    const query = {};
    if (tipo) query.tipo = tipo;
    if (activo !== undefined) query.activo = activo === 'true';

    const aulas = await Aula.find(query).sort({ codigo: 1 });
    res.json({ success: true, data: aulas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const aula = await Aula.create(req.body);
    res.status(201).json({ success: true, data: aula });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const aula = await Aula.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!aula) return res.status(404).json({ success: false, message: 'Aula no encontrada' });
    res.json({ success: true, data: aula });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const aula = await Aula.findByIdAndDelete(req.params.id);
    if (!aula) return res.status(404).json({ success: false, message: 'Aula no encontrada' });
    res.json({ success: true, message: 'Aula eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
