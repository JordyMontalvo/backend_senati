const mongoose = require('mongoose');

const matriculaSchema = new mongoose.Schema({
  estudiante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Estudiante',
    required: true
  },
  bloque: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bloque',
    required: true
  },
  fechaMatricula: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ['matriculado', 'retirado', 'trasladado'],
    default: 'matriculado'
  }
}, {
  timestamps: true
});

// Índice único: un estudiante no puede matricularse dos veces en el mismo bloque
matriculaSchema.index({ estudiante: 1, bloque: 1 }, { unique: true });

module.exports = mongoose.model('Matricula', matriculaSchema);
