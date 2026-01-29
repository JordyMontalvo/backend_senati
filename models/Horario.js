const mongoose = require('mongoose');

const horarioSchema = new mongoose.Schema({
  asignacion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asignacion',
    required: true
  },
  aula: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Aula'
  },
  diaSemana: {
    type: String,
    required: true,
    enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  },
  horaInicio: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
  },
  horaFin: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
  },
  tipoSesion: {
    type: String,
    enum: ['Teoría', 'Taller', 'Laboratorio', 'Virtual', 'Evaluación'],
    default: 'Teoría'
  }
}, {
  timestamps: true
});

// Índices para consultas eficientes
horarioSchema.index({ asignacion: 1 });
horarioSchema.index({ aula: 1, diaSemana: 1, horaInicio: 1 });

module.exports = mongoose.model('Horario', horarioSchema);
