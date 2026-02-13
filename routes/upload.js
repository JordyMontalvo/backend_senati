const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const xlsx = require('xlsx');
const { importarBloquesDesdeExcel } = require('../scripts/importar-bloques-excel');
const AsignadorInteligente = require('../services/asignador-inteligente');
const Bloque = require('../models/Bloque');

// Configurar multer para manejar archivos
// En Vercel (serverless), solo /tmp es escribible
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    // Usar /tmp en entornos serverless (Vercel, AWS Lambda), o uploads en local
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    const uploadDir = isServerless ? '/tmp' : path.join(__dirname, '../uploads');
    
    try {
      // Solo intentar crear directorio si no es /tmp (que ya existe)
      if (!isServerless) {
        await fs.mkdir(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'bloques-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.xlsx' && ext !== '.xls') {
      return cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB máximo
  }
});

/**
 * POST /api/upload/bloques
 * Sube un archivo Excel y muestra una vista previa
 */
router.post('/bloques', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    const filePath = req.file.path;
    
    // Leer el archivo Excel
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Obtener encabezados
    const range = xlsx.utils.decode_range(worksheet['!ref']);
    const headers = [];
    
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = xlsx.utils.encode_cell({ r: 0, c: col });
      const cell = worksheet[cellAddress];
      headers.push(cell ? cell.v : `Columna ${col + 1}`);
    }
    
    // Obtener primera fila de datos
    const datos = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
    const firstRow = datos.length > 0 ? Object.values(datos[0]) : [];
    
    // Guardar la ruta del archivo en la sesión o memoria temporal
    // Para simplicidad, la guardamos en el nombre del archivo de respuesta
    
    res.json({
      success: true,
      preview: {
        filename: req.file.filename,
        filepath: filePath,
        headers: headers,
        firstRow: firstRow,
        totalRows: datos.length
      },
      message: 'Archivo procesado correctamente'
    });

  } catch (error) {
    console.error('Error al procesar archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar el archivo: ' + error.message
    });
  }
});

/**
 * POST /api/upload/bloques/importar
 * Importa los bloques del Excel a la base de datos
 */
router.post('/bloques/importar', async (req, res) => {
  try {
    const { filepath } = req.body;
    
    if (!filepath) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó la ruta del archivo'
      });
    }
    
    // Verificar que el archivo existe
    try {
      await fs.access(filepath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'El archivo no existe o ha expirado'
      });
    }
    
    // Importar bloques
    const resultado = await importarBloquesDesdeExcel(filepath);
    
    // Limpiar el archivo temporal
    try {
      await fs.unlink(filepath);
    } catch (error) {
      console.error('Error al eliminar archivo temporal:', error);
    }
    
    res.json({
      success: true,
      resultado: {
        exitosos: resultado.exitosos,
        errores: resultado.errores.length,
        bloques: resultado.bloques.map(b => ({
          id: b._id,
          codigo: b.codigo
        }))
      },
      message: `Importación completada: ${resultado.exitosos} bloques creados`
    });

  } catch (error) {
    console.error('Error al importar bloques:', error);
    res.status(500).json({
      success: false,
      message: 'Error al importar bloques: ' + error.message
    });
  }
});

/**
 * POST /api/upload/bloques/asignar-automatico
 * Asigna automáticamente cursos, profesores, aulas y horarios
 */
router.post('/bloques/asignar-automatico', async (req, res) => {
  try {
    const { bloquesIds } = req.body;
    
    if (!bloquesIds || !Array.isArray(bloquesIds) || bloquesIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar un array de IDs de bloques'
      });
    }
    
    // Verificar que los bloques existen
    const bloques = await Bloque.find({ _id: { $in: bloquesIds } });
    
    if (bloques.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron bloques con los IDs proporcionados'
      });
    }
    
    // Crear instancia del asignador inteligente
    const asignador = new AsignadorInteligente();
    
    // Ejecutar asignación automática
    const resultado = await asignador.asignarAutomaticamente(bloquesIds);
    
    res.json({
      success: true,
      resultado: resultado,
      message: resultado.mensaje
    });

  } catch (error) {
    console.error('Error en asignación automática:', error);
    res.status(500).json({
      success: false,
      message: 'Error en asignación automática: ' + error.message
    });
  }
});

/**
 * POST /api/upload/bloques/importar-y-asignar
 * Endpoint completo: importa y asigna en un solo paso
 */
router.post('/bloques/importar-y-asignar', async (req, res) => {
  try {
    const { filepath } = req.body;
    
    if (!filepath) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó la ruta del archivo'
      });
    }
    
    // 1. Importar bloques
    console.log('📥 Importando bloques...');
    const resultadoImportacion = await importarBloquesDesdeExcel(filepath);
    
    if (resultadoImportacion.exitosos === 0) {
      return res.json({
        success: false,
        message: 'No se importó ningún bloque',
        detalles: resultadoImportacion
      });
    }
    
    // 2. Asignar automáticamente
    console.log('🤖 Iniciando asignación automática...');
    const bloquesIds = resultadoImportacion.bloques.map(b => b._id);
    const asignador = new AsignadorInteligente();
    const resultadoAsignacion = await asignador.asignarAutomaticamente(bloquesIds);
    
    // 3. Limpiar archivo temporal
    try {
      await fs.unlink(filepath);
    } catch (error) {
      console.error('Error al eliminar archivo temporal:', error);
    }
    
    res.json({
      success: true,
      importacion: {
        bloquesCreados: resultadoImportacion.exitosos,
        errores: resultadoImportacion.errores.length
      },
      asignacion: resultadoAsignacion,
      message: `✅ Proceso completado: ${resultadoImportacion.exitosos} bloques importados, ${resultadoAsignacion.asignacionesCreadas} asignaciones, ${resultadoAsignacion.horariosCreados} horarios`
    });

  } catch (error) {
    console.error('Error en importación y asignación:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el proceso: ' + error.message
    });
  }
});

/**
 * POST /api/upload/bloques/generar-preview
 * Genera vista previa de bloques y horarios SIN guardar en BD
 */
router.post('/bloques/generar-preview', async (req, res) => {
  try {
    const { filepath } = req.body;
    
    if (!filepath) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó la ruta del archivo'
      });
    }
    
    console.log('🔍 Generando vista previa sin guardar...');
    
    // Leer el archivo Excel
    const workbook = xlsx.readFile(filepath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const datos = xlsx.utils.sheet_to_json(worksheet);
    
    // Estructuras para almacenar datos temporales
    const bloquesTemp = [];
    const asignacionesTemp = [];
    const horariosTemp = [];
    
    // Procesamiento simulado (sin guardar en BD)
    for (const fila of datos) {
      const bloqueId = `temp_bloque_${bloquesTemp.length + 1}`;
      
      // Crear bloque temporal
      const bloqueTemp = {
        id: bloqueId,
        codigo: fila['Código'] || fila.Codigo,
        periodo: fila['Período'] || fila.Periodo,
        semestre: fila.Semestre,
        carrera: fila.Carrera,
        turno: fila.Turno,
        capacidadMax: fila['Capacidad Máxima'] || fila['Capacidad Maxima'] || 30,
        fechaInicio: fila['Fecha Inicio'],
        fechaFin: fila['Fecha Fin']
      };
      
      bloquesTemp.push(bloqueTemp);
      
      // Generar asignaciones y horarios simulados para este bloque
      const cursosSimulados = [
        { nombre: 'Matemática I', profesor: 'Prof. Luis Ramírez' },
        { nombre: 'Comunicación I', profesor: 'Prof. Diana Huamán' },
        { nombre: 'Informática I', profesor: 'Prof. Carmen Torres' },
        { nombre: 'Física I', profesor: 'Prof. Jorge Castillo' }
      ];
      
      const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
      const horasPorTurno = {
        'mañana': [
          { inicio: '07:00', fin: '09:00' },
          { inicio: '09:00', fin: '11:00' },
          { inicio: '11:00', fin: '13:00' }
        ],
        'tarde': [
          { inicio: '14:00', fin: '16:00' },
          { inicio: '16:00', fin: '18:00' },
          { inicio: '18:00', fin: '20:00' }
        ],
        'noche': [
          { inicio: '19:00', fin: '21:00' },
          { inicio: '21:00', fin: '23:00' }
        ]
      };
      
      const turnoLower = bloqueTemp.turno.toLowerCase();
      const bloqueHorarios = horasPorTurno[turnoLower] || horasPorTurno.mañana;
      
      // Crear horarios para cada curso
      cursosSimulados.forEach((curso, cursoIdx) => {
        const asignacionId = `temp_asig_${asignacionesTemp.length + 1}`;
        
        asignacionesTemp.push({
          id: asignacionId,
          bloqueId: bloqueId,
          curso: curso.nombre,
          profesor: curso.profesor
        });
        
        // 2-3 sesiones por semana
        const sesiones = Math.min(2, dias.length);
        for (let s = 0; s < sesiones; s++) {
          const dia = dias[s];
          const horario = bloqueHorarios[cursoIdx % bloqueHorarios.length];
          
          horariosTemp.push({
            id: `temp_hora_${horariosTemp.length + 1}`,
            asignacionId: asignacionId,
            bloqueId: bloqueId,
            bloque: bloqueTemp.codigo,
            curso: curso.nombre,
            profesor: curso.profesor,
            aula: `A-${101 + (cursoIdx * 2)}`,
            dia: dia,
            horaInicio: horario.inicio,
            horaFin: horario.fin,
            tipo: cursoIdx === 0 ? 'Teoría' : cursoIdx === 1 ? 'Taller' : 'Laboratorio'
          });
        }
      });
    }
    
    console.log(`✅ Preview generado: ${bloquesTemp.length} bloques, ${horariosTemp.length} horarios`);
    
    // Limpiar archivo temporal
    try {
      await fs.unlink(filepath);
    } catch (error) {
      console.error('Error al eliminar archivo temporal:', error);
    }
    
    res.json({
      success: true,
      preview: {
        bloques: bloquesTemp,
        asignaciones: asignacionesTemp,
        horarios: horariosTemp
      },
      stats: {
        bloques: bloquesTemp.length,
        asignaciones: asignacionesTemp.length,
        horarios: horariosTemp.length
      },
      message: `Vista previa generada: ${bloquesTemp.length} bloques, ${horariosTemp.length} horarios`
    });

  } catch (error) {
    console.error('Error al generar preview:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar vista previa: ' + error.message
    });
  }
});

module.exports = router;
