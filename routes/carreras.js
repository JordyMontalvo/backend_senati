const express = require('express');
const router = express.Router();
const Carrera = require('../models/Carrera');

// @route   GET /api/carreras
// @desc    Obtener todas las carreras
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { activo, search, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (activo !== undefined) query.activo = activo === 'true';
    if (search) {
      query.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { codigo: { $regex: search, $options: 'i' } }
      ];
    }

    const carreras = await Carrera.find(query)
      .populate('escuela')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ nombre: 1 });

    const count = await Carrera.countDocuments(query);

    res.json({
      success: true,
      count: carreras.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: carreras
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener carreras',
      error: error.message
    });
  }
});

// @route   GET /api/carreras/:id
// @desc    Obtener una carrera por ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const carrera = await Carrera.findById(req.params.id).populate('escuela');
    
    if (!carrera) {
      return res.status(404).json({
        success: false,
        message: 'Carrera no encontrada'
      });
    }

    res.json({
      success: true,
      data: carrera
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la carrera',
      error: error.message
    });
  }
});

// @route   POST /api/carreras
// @desc    Crear una nueva carrera
// @access  Private (Admin)
router.post('/', async (req, res) => {
  try {
    const carrera = await Carrera.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Carrera creada exitosamente',
      data: carrera
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear la carrera',
      error: error.message
    });
  }
});

// @route   PUT /api/carreras/:id
// @desc    Actualizar una carrera
// @access  Private (Admin)
router.put('/:id', async (req, res) => {
  try {
    const carrera = await Carrera.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!carrera) {
      return res.status(404).json({
        success: false,
        message: 'Carrera no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Carrera actualizada exitosamente',
      data: carrera
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar la carrera',
      error: error.message
    });
  }
});

// @route   DELETE /api/carreras/:id
// @desc    Eliminar una carrera
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const carrera = await Carrera.findByIdAndDelete(req.params.id);

    if (!carrera) {
      return res.status(404).json({
        success: false,
        message: 'Carrera no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Carrera eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la carrera',
      error: error.message
    });
  }
});

module.exports = router;
