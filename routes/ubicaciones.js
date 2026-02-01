const express = require('express');
const router = express.Router();
const Zonal = require('../models/Zonal');
const Sede = require('../models/Sede');

// === ZONALES ===

// Obtener todas las zonales
router.get('/zonales', async (req, res) => {
  try {
    const zonales = await Zonal.find({ activo: true });
    res.json(zonales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear nueva zonal
router.post('/zonales', async (req, res) => {
  try {
    const nuevaZonal = new Zonal(req.body);
    await nuevaZonal.save();
    res.status(201).json(nuevaZonal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// === SEDES (CFPs) ===

// Obtener todas las sedes (opcionalmente filtrar por zonal)
router.get('/sedes', async (req, res) => {
  try {
    const filter = { activo: true };
    if (req.query.zonal) {
      filter.zonal = req.query.zonal;
    }
    
    const sedes = await Sede.find(filter).populate('zonal', 'nombre');
    res.json(sedes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear nueva sede
router.post('/sedes', async (req, res) => {
  try {
    const nuevaSede = new Sede(req.body);
    await nuevaSede.save();
    res.status(201).json(nuevaSede);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
