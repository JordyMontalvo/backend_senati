const mongoose = require('mongoose');

const ZonalSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  codigo: {
    type: String,
    trim: true,
    sparse: true
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

module.exports = mongoose.model('Zonal', ZonalSchema);
