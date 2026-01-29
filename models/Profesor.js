const mongoose = require('mongoose');

const profesorSchema = new mongoose.Schema({
  codigo: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  nombres: {
    type: String,
    required: [true, 'Los nombres son requeridos'],
    trim: true
  },
  apellidos: {
    type: String,
    required: [true, 'Los apellidos son requeridos'],
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  telefono: {
    type: String,
    trim: true
  },
  especialidad: {
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

// Virtual para nombre completo
profesorSchema.virtual('nombreCompleto').get(function() {
  return `${this.nombres} ${this.apellidos}`;
});

// Índice de búsqueda
profesorSchema.index({ nombres: 'text', apellidos: 'text', especialidad: 'text' });

module.exports = mongoose.model('Profesor', profesorSchema);
