const express = require('express');
const router = express.Router();
const Curso = require('../models/Curso');

// Obtener todos los cursos
router.get('/', async (req, res) => {
  try {
    const { carrera, semestre, search, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (carrera) query.carrera = carrera;
    if (semestre) query.semestre = semestre;
    if (search) {
      query.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { codigo: { $regex: search, $options: 'i' } }
      ];
    }

    const cursos = await Curso.find(query)
      .populate('carrera')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ codigo: 1 });

    const count = await Curso.countDocuments(query);

    res.json({
      success: true,
      count: cursos.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: cursos
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Obtener un curso por ID
router.get('/:id', async (req, res) => {
  try {
    const curso = await Curso.findById(req.params.id).populate('carrera');
    if (!curso) return res.status(404).json({ success: false, message: 'Curso no encontrado' });
    res.json({ success: true, data: curso });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Crear curso
router.post('/', async (req, res) => {
  try {
    const curso = await Curso.create(req.body);
    res.status(201).json({ success: true, data: curso });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Actualizar curso
router.put('/:id', async (req, res) => {
  try {
    const curso = await Curso.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!curso) return res.status(404).json({ success: false, message: 'Curso no encontrado' });
    res.json({ success: true, data: curso });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Eliminar curso
router.delete('/:id', async (req, res) => {
  try {
    const curso = await Curso.findByIdAndDelete(req.params.id);
    if (!curso) return res.status(404).json({ success: false, message: 'Curso no encontrado' });
    res.json({ success: true, message: 'Curso eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
