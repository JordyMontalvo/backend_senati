const express = require('express');
const router = express.Router();
const Matricula = require('../models/Matricula');

router.get('/', async (req, res) => {
  try {
    const { estudiante, bloque, estado } = req.query;
    const query = {};
    if (estudiante) query.estudiante = estudiante;
    if (bloque) query.bloque = bloque;
    if (estado) query.estado = estado;

    const matriculas = await Matricula.find(query)
      .populate('estudiante')
      .populate('bloque')
      .sort({ fechaMatricula: -1 });
    
    res.json({ success: true, data: matriculas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const matricula = await Matricula.create(req.body);
    
    // Actualizar contador de inscritos en el bloque
    const Bloque = require('../models/Bloque');
    await Bloque.findByIdAndUpdate(
      req.body.bloque,
      { $inc: { totalInscritos: 1 } }
    );
    
    res.status(201).json({ success: true, data: matricula });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const matricula = await Matricula.findByIdAndDelete(req.params.id);
    if (!matricula) return res.status(404).json({ success: false, message: 'Matrícula no encontrada' });
    
    // Decrementar contador de inscritos
    const Bloque = require('../models/Bloque');
    await Bloque.findByIdAndUpdate(
      matricula.bloque,
      { $inc: { totalInscritos: -1 } }
    );
    
    res.json({ success: true, message: 'Matrícula eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
