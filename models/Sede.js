const mongoose = require('mongoose');

const SedeSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  codigo: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  tipo: {
    type: String,
    enum: ['CFP', 'UCP', 'ESCUELA', 'OTRO'],
    default: 'CFP'
  },
  zonal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zonal',
    required: true
  },
  direccion: {
    type: String,
    trim: true
  },
  activo: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Sede', SedeSchema);
