const mongoose = require('mongoose');

const estudianteSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: [true, 'El código del estudiante es requerido'],
    unique: true,
    trim: true,
    uppercase: true
  },
  dni: {
    type: String,
    required: [true, 'El DNI es requerido'],
    unique: true,
    trim: true,
    match: [/^\d{8}$/, 'DNI inválido (debe tener 8 dígitos)']
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
  fechaNacimiento: {
    type: Date
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual para nombre completo
estudianteSchema.virtual('nombreCompleto').get(function() {
  return `${this.nombres} ${this.apellidos}`;
});

// Índice de búsqueda
estudianteSchema.index({ nombres: 'text', apellidos: 'text', codigo: 'text' });

module.exports = mongoose.model('Estudiante', estudianteSchema);
