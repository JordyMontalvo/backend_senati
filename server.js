require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');
const logger = require('./utils/logger');

// Crear aplicación Express
const app = express();

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(helmet()); // Seguridad HTTP headers
app.use(cors({
  origin: true, // Permitir cualquier origen en esta fase para resolver el bloqueo
  credentials: true
}));
app.use(morgan('dev')); // Logger
app.use(express.json()); // Parser JSON
app.use(express.urlencoded({ extended: true }));

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: '🎓 API Sistema de Gestión de Horarios - SENATI',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      periodos: '/api/periodos',
      escuelas: '/api/escuelas',
      carreras: '/api/carreras',
      cursos: '/api/cursos',
      bloques: '/api/bloques',
      profesores: '/api/profesores',
      aulas: '/api/aulas',
      asignaciones: '/api/asignaciones',
      horarios: '/api/horarios',
      estudiantes: '/api/estudiantes',
      matriculas: '/api/matriculas'
    }
  });
});

// Importar rutas
const periodosRoutes = require('./routes/periodos');
const escuelasRoutes = require('./routes/escuelas');
const carrerasRoutes = require('./routes/carreras');
const cursosRoutes = require('./routes/cursos');
const bloquesRoutes = require('./routes/bloques');
const profesoresRoutes = require('./routes/profesores');
const aulasRoutes = require('./routes/aulas');
const asignacionesRoutes = require('./routes/asignaciones');
const horariosRoutes = require('./routes/horarios');
const estudiantesRoutes = require('./routes/estudiantes');
const matriculasRoutes = require('./routes/matriculas');

// Usar rutas
app.use('/api/periodos', periodosRoutes);
app.use('/api/escuelas', escuelasRoutes);
app.use('/api/carreras', carrerasRoutes);
app.use('/api/cursos', cursosRoutes);
app.use('/api/bloques', bloquesRoutes);
app.use('/api/profesores', profesoresRoutes);
app.use('/api/aulas', aulasRoutes);
app.use('/api/asignaciones', asignacionesRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/estudiantes', estudiantesRoutes);
app.use('/api/upload', require('./routes/upload'));
app.use('/api/matriculas', matriculasRoutes);
app.use('/api/chatbot', require('./routes/chatbot'));

app.use('/api/ubicaciones', require('./routes/ubicaciones'));

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  logger.error('CRASH DETECTADO:', err.message);
  if (err.stack) console.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Puerto y arranque del servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.success(`Servidor corriendo en puerto ${PORT}`);
  logger.info(`📍 Modo: ${process.env.NODE_ENV || 'development'}`);
});
