require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');

// Crear aplicación Express
const app = express();

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(helmet()); // Seguridad HTTP headers
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'https://fronted-senati.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origen (como apps móviles o curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      // Opcional: Permitir cualquier subdominio de vercel.app para preview
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
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

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Puerto y arranque del servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}\n`);
});
