const mongoose = require('mongoose');

const cursoSchema = new mongoose.Schema({
  carrera: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carrera',
    required: true
  },
  materia: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  numero: {
    type: String,
    required: true,
    trim: true
  },
  codigo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  nombre: {
    type: String,
    required: [true, 'El nombre del curso es requerido'],
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  semestre: {
    type: String,
    required: true,
    uppercase: true
  },
  creditos: {
    type: Number,
    min: 0
  },
  horasTeoria: {
    type: Number,
    default: 0,
    min: 0
  },
  horasTaller: {
    type: Number,
    default: 0,
    min: 0
  },
  horasVirtual: {
    type: Number,
    default: 0,
    min: 0
  },
  horasTotal: {
    type: Number,
    default: 0,
    min: 0
  },
  tipoCurso: {
    type: String,
    enum: ['TEC', 'TAL', 'VIR', 'TEC-INGLES', 'OTRO'],
    default: 'TEC'
  },
  clasificacion: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Índices
cursoSchema.index({ carrera: 1, semestre: 1 });
cursoSchema.index({ nombre: 'text', codigo: 'text' });

// Virtual para código completo
cursoSchema.virtual('codigoCompleto').get(function() {
  return `${this.materia}-${this.numero}`;
});

module.exports = mongoose.model('Curso', cursoSchema);
