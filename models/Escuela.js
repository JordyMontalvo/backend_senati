const mongoose = require('mongoose');

const escuelaSchema = new mongoose.Schema({
  codigo: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  nombre: {
    type: String,
    required: [true, 'El nombre de la escuela es requerido'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Escuela', escuelaSchema);
