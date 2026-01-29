const mongoose = require('mongoose');

const periodoSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: [true, 'El código del período es requerido'],
    unique: true,
    trim: true
  },
  nombre: {
    type: String,
    required: [true, 'El nombre del período es requerido'],
    trim: true
  },
  fechaInicio: {
    type: Date,
    required: [true, 'La fecha de inicio es requerida']
  },
  fechaFin: {
    type: Date,
    required: [true, 'La fecha de fin es requerida']
  },
  estado: {
    type: String,
    enum: ['activo', 'cerrado', 'planificado'],
    default: 'planificado'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Periodo', periodoSchema);
