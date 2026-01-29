const mongoose = require('mongoose');

const carreraSchema = new mongoose.Schema({
  escuela: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Escuela'
  },
  codigo: {
    type: String,
    required: [true, 'El código de la carrera es requerido'],
    unique: true,
    trim: true,
    uppercase: true
  },
  nombre: {
    type: String,
    required: [true, 'El nombre de la carrera es requerido'],
    trim: true
  },
  nivel: {
    type: String,
    trim: true
  },
  grado: {
    type: String,
    trim: true
  },
  catalogo: {
    type: String,
    trim: true
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índice para búsquedas rápidas
carreraSchema.index({ nombre: 'text', codigo: 'text' });

module.exports = mongoose.model('Carrera', carreraSchema);
