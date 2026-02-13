const mongoose = require('mongoose');

const cursoSchema = new mongoose.Schema({
  carrera: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carrera',
    required: [true, 'La carrera es obligatoria']
  },
  
  // --- Mapeo directo del CSV ---
  
  // Col 7: CATALOGO
  catalogo: {
    type: String,
    trim: true
  },
  
  // Col 8: MAT CUR CORREGIDO
  mat_cur_corregido: {
    type: String,
    trim: true
  },
  
  // Col 9: TIPO*
  tipo_especifico: {
    type: String,
    trim: true
  },
  
  // Col 10: Identificación
  identificacion: {
    type: String,
    trim: true
  },
  
  // Col 11: HORARIO SINFO (COD-PATRON)
  horario_sinfo: {
    type: String,
    trim: true
  },
  
  // Col 12: CLASIFICACIÓN BLACKBOARD
  clasificacion_blackboard: {
    type: String,
    trim: true
  },
  
  // Col 13: SEMESTRE / CICLO
  semestre: {
    type: String,
    required: [true, 'El semestre es obligatorio'],
    trim: true,
    uppercase: true
  },
  
  // Col 14: MATERIA
  materia: {
    type: String,
    required: [true, 'La materia es obligatoria'],
    trim: true,
    uppercase: true
  },
  
  // Col 15: CURSO (Nombre)
  nombre: {
    type: String,
    required: [true, 'El nombre del curso es obligatorio'],
    trim: true
  },
  
  // Col 16: DESCRIPCION DE CURSO
  descripcion: {
    type: String,
    trim: true
  },
  
  // Col 17: SEMANAS
  semanas: {
    type: Number,
    default: 0
  },
  
  // Col 18: TEORÍA / TECNOLOGÍA
  horasTeoria: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Col 19: TALLER / EMPRESA
  horasTaller: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Col 20: VIRTUAL
  horasVirtual: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Col 21: EVALUACIÓN SEMESTRAL
  evaluacion_semestral: {
    type: String,
    trim: true
  },
  
  // Col 22: TOTAL HORAS (Semanal o total?)
  horasTotal: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Col 23: HORAS SEMESTRE
  horasSemestre: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Col 24: CRÉDITOS
  creditos: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Col 26: STATUS
  status: {
    type: String,
    trim: true
  },
  
  // Col 27: COMENTARIOS
  comentarios: {
    type: String,
    trim: true
  },
  
  // Col 28: CONTENIDO CURRICULAR
  contenido_curricular: {
    type: String,
    trim: true
  },

  // --- Campos de Sistema ---
  
  // Usaremos el ID del CSV como código único si es posible, o generado
  codigo: {
    type: String,
    required: true,
    unique: true, // Importante para evitar duplicados
    trim: true,
    uppercase: true
  },
  
  activo: {
    type: Boolean,
    default: true
  }
  
}, {
  timestamps: true
});

// Índices para mejorar rendimiento de búsquedas
cursoSchema.index({ carrera: 1, semestre: 1 });
cursoSchema.index({ nombre: 'text', materia: 'text', codigo: 'text' });
cursoSchema.index({ mat_cur_corregido: 1 });

module.exports = mongoose.model('Curso', cursoSchema);
