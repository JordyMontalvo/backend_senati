const mongoose = require('mongoose');

const asignacionSchema = new mongoose.Schema({
  bloque: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bloque',
    required: true
  },
  curso: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Curso',
    required: true
  },
  profesor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profesor'
  },
  observaciones: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Índice único: un curso solo puede estar asignado una vez por bloque
asignacionSchema.index({ bloque: 1, curso: 1 }, { unique: true });

module.exports = mongoose.model('Asignacion', asignacionSchema);
