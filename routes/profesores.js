const express = require('express');
const router = express.Router();
const Profesor = require('../models/Profesor');

router.get('/', async (req, res) => {
  try {
    const { activo, search } = req.query;
    const query = {};
    if (activo !== undefined) query.activo = activo === 'true';
    if (search) {
      query.$or = [
        { nombres: { $regex: search, $options: 'i' } },
        { apellidos: { $regex: search, $options: 'i' } },
        { codigo: { $regex: search, $options: 'i' } }
      ];
    }

    const profesores = await Profesor.find(query).sort({ apellidos: 1, nombres: 1 });
    res.json({ success: true, data: profesores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const profesor = await Profesor.findById(req.params.id);
    if (!profesor) return res.status(404).json({ success: false, message: 'Profesor no encontrado' });
    res.json({ success: true, data: profesor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const profesor = await Profesor.create(req.body);
    res.status(201).json({ success: true, data: profesor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const profesor = await Profesor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!profesor) return res.status(404).json({ success: false, message: 'Profesor no encontrado' });
    res.json({ success: true, data: profesor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const profesor = await Profesor.findByIdAndDelete(req.params.id);
    if (!profesor) return res.status(404).json({ success: false, message: 'Profesor no encontrado' });
    res.json({ success: true, message: 'Profesor eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
