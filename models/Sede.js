const mongoose = require('mongoose');

const sedeSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la sede es requerido'],
    unique: true,
    trim: true
  },
  direccion: {
    type: String,
    trim: true
  },
  telefono: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índice de búsqueda
sedeSchema.index({ nombre: 'text' });

module.exports = mongoose.model('Sede', sedeSchema);
