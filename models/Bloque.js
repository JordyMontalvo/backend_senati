const mongoose = require('mongoose');

const bloqueSchema = new mongoose.Schema({
  periodo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Periodo',
    required: true
  },
  carrera: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carrera',
    required: true
  },
  codigo: {
    type: String,
    required: [true, 'El código del bloque es requerido'],
    unique: true,
    trim: true,
    uppercase: true
  },
  semestreAcademico: {
    type: String,
    required: true,
    uppercase: true
  },
  subPeriodo: {
    type: String,
    trim: true
  },
  fechaInicio: {
    type: Date
  },
  fechaFin: {
    type: Date
  },
  capacidadMax: {
    type: Number,
    default: 30,
    min: 1
  },
  totalInscritos: {
    type: Number,
    default: 0,
    min: 0
  },
  estado: {
    type: String,
    enum: ['planificado', 'activo', 'finalizado'],
    default: 'planificado'
  }
}, {
  timestamps: true
});

// Índices
bloqueSchema.index({ periodo: 1, carrera: 1 });
bloqueSchema.index({ estado: 1 });

module.exports = mongoose.model('Bloque', bloqueSchema);
