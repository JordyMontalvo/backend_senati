const mongoose = require('mongoose');

const aulaSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: [true, 'El código del aula es requerido'],
    unique: true,
    trim: true,
    uppercase: true
  },
  nombre: {
    type: String,
    required: [true, 'El nombre del aula es requerido'],
    trim: true
  },
  edificio: {
    type: String,
    trim: true
  },
  piso: {
    type: Number,
    min: 0
  },
  capacidad: {
    type: Number,
    default: 30,
    min: 1
  },
  tipo: {
    type: String,
    enum: ['Aula', 'Taller', 'Laboratorio', 'Auditorio', 'Otro'],
    default: 'Aula'
  },
  equipamiento: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índice de búsqueda
aulaSchema.index({ nombre: 'text', codigo: 'text' });

module.exports = mongoose.model('Aula', aulaSchema);
