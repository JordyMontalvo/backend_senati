const express = require('express');
const router = express.Router();
const Estudiante = require('../models/Estudiante');

router.get('/', async (req, res) => {
  try {
    const { activo, search } = req.query;
    const query = {};
    if (activo !== undefined) query.activo = activo === 'true';
    if (search) {
      query.$or = [
        { nombres: { $regex: search, $options: 'i' } },
        { apellidos: { $regex: search, $options: 'i' } },
        { codigo: { $regex: search, $options: 'i' } },
        { dni: { $regex: search, $options: 'i' } }
      ];
    }

    const estudiantes = await Estudiante.find(query).sort({ apellidos: 1, nombres: 1 });
    res.json({ success: true, data: estudiantes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const estudiante = await Estudiante.create(req.body);
    res.status(201).json({ success: true, data: estudiante });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const estudiante = await Estudiante.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!estudiante) return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    res.json({ success: true, data: estudiante });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const estudiante = await Estudiante.findByIdAndDelete(req.params.id);
    if (!estudiante) return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    res.json({ success: true, message: 'Estudiante eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
