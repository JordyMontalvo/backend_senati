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
    
    // Cargar datos REALES de la base de datos para usar en el preview
    const Curso = require('../models/Curso');
    const Profesor = require('../models/Profesor');
    const Aula = require('../models/Aula');
    const Carrera = require('../models/Carrera');

    console.log('📚 Cargando datos maestros de MongoDB...');
    const cursosDb = await Curso.find().populate('carrera');
    const profesoresDb = await Profesor.find({ activo: true });
    const aulasDb = await Aula.find({ activo: true });
    const carrerasDb = await Carrera.find({ activo: true });

    console.log(`✅ Datos cargados: ${cursosDb.length} cursos, ${profesoresDb.length} profesores, ${aulasDb.length} aulas`);

    // Procesamiento con datos REALES
    for (const fila of datos) {
      const bloqueId = `temp_bloque_${bloquesTemp.length + 1}`;
      
      // Normalizar nombre de carrera del Excel
      const nombreCarreraExcel = (fila.Carrera || '').trim();
      
      // Buscar carrera en DB (coincidencia parcial insensible a mayúsculas)
      const carreraReal = carrerasDb.find(c => 
        c.nombre.toLowerCase().includes(nombreCarreraExcel.toLowerCase()) || 
        nombreCarreraExcel.toLowerCase().includes(c.nombre.toLowerCase())
      );

      // Crear bloque temporal
      const bloqueTemp = {
        id: bloqueId,
        codigo: fila['Código'] || fila.Codigo,
        periodo: fila['Período'] || fila.Periodo,
        semestre: fila.Semestre,
        carrera: carreraReal ? carreraReal.nombre : nombreCarreraExcel, // Usar nombre real si existe
        turno: fila.Turno,
        capacidadMax: fila['Capacidad Máxima'] || fila['Capacidad Maxima'] || 30,
        fechaInicio: fila['Fecha Inicio'],
        fechaFin: fila['Fecha Fin']
      };
      
      bloquesTemp.push(bloqueTemp);
      
      // 1. Obtener cursos del semestre correspondiente
      let cursosDelBloque = [];
      
      if (carreraReal) {
        // Filtrar cursos de la carrera y semestre
        cursosDelBloque = cursosDb.filter(c => 
          c.carrera._id.toString() === carreraReal._id.toString() && 
          c.semestre === parseInt(bloqueTemp.semestre)
        );
      }

      // Si no hay cursos reales (ej. carrera nueva o semestre sin cursos), usar genéricos
      if (cursosDelBloque.length === 0) {
        console.warn(`⚠️ No se encontraron cursos para ${bloqueTemp.carrera} Semestre ${bloqueTemp.semestre}. Usando genéricos.`);
        cursosDelBloque = [
          { nombre: `Curso Técnico I (Sem ${bloqueTemp.semestre})`, creditos: 3 },
          { nombre: `Taller Práctico I (Sem ${bloqueTemp.semestre})`, creditos: 4 },
          { nombre: `Habilidades Blandas`, creditos: 2 },
          { nombre: `Inglés Técnico`, creditos: 2 }
        ];
      }

      // Configuración de horarios por turno
      const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const horasPorTurno = {
        'mañana': [
          { inicio: '07:00', fin: '09:00' }, { inicio: '09:00', fin: '11:00' }, { inicio: '11:00', fin: '13:00' }
        ],
        'tarde': [
          { inicio: '14:00', fin: '16:00' }, { inicio: '16:00', fin: '18:00' }, { inicio: '18:00', fin: '20:00' }
        ],
        'noche': [
          { inicio: '18:30', fin: '20:00' }, { inicio: '20:00', fin: '21:30' }, { inicio: '21:30', fin: '23:00' }
        ]
      };
      
      const turnoLower = (bloqueTemp.turno || 'mañana').toLowerCase();
      const slotsHorarios = horasPorTurno[turnoLower] || horasPorTurno.mañana;
      
      // Asignar cursos a slots disponibles
      let slotIndex = 0;
      let diaIndex = 0;

      cursosDelBloque.forEach((curso, idx) => {
        // Seleccionar Profesor (aleatorio de los disponibles o "Por asignar")
        // Intenta buscar por especialidad si el curso tiene nombre real
        let profesorAsignado = profesoresDb.find(p => 
          p.especialidad && curso.nombre && p.especialidad.includes(curso.nombre)
        );
        
        if (!profesorAsignado && profesoresDb.length > 0) {
          // Si no hay especialista, asignar uno aleatorio para balancear carga (simulado con módulo)
          profesorAsignado = profesoresDb[(idx + bloquesTemp.length) % profesoresDb.length];
        }

        const nombreProfesor = profesorAsignado 
          ? `${profesorAsignado.nombres} ${profesorAsignado.apellidos}` 
          : 'Profesor Por Asignar';

        // Crear Asignación Temporal
        const asignacionId = `temp_asig_${asignacionesTemp.length + 1}`;
        asignacionesTemp.push({
          id: asignacionId,
          bloqueId: bloqueId,
          curso: curso.nombre,
          profesor: nombreProfesor
        });

        // Determinar carga horaria (sesiones por semana)
        // Cursos de 4+ créditos suelen tener más horas
        const sesionesPorSemana = curso.creditos >= 4 ? 2 : 1;

        for (let s = 0; s < sesionesPorSemana; s++) {
          // Rotar días y horas para distribuir carga
          const dia = dias[diaIndex % 6]; // Lunes a Sábado
          const horario = slotsHorarios[slotIndex % slotsHorarios.length];

          // Seleccionar Aula
          // Si el curso parece práctico (Lab, Taller, Software), buscar Laboratorio
          const esPractico = /Laboratorio|Taller|Software|Programación|Desarrollo|Datos|IA/.test(curso.nombre);
          let aulaAsignada;

          if (esPractico) {
            const laboratorios = aulasDb.filter(a => a.tipo === 'Laboratorio');
            aulaAsignada = laboratorios.length > 0 
              ? laboratorios[(idx + s) % laboratorios.length] 
              : aulasDb[0];
          } else {
            const aulasTeoricas = aulasDb.filter(a => a.tipo !== 'Laboratorio');
            aulaAsignada = aulasTeoricas.length > 0 
              ? aulasTeoricas[(idx + s) % aulasTeoricas.length] 
              : aulasDb[0];
          }

          horariosTemp.push({
            id: `temp_hora_${horariosTemp.length + 1}`,
            asignacionId: asignacionId,
            bloqueId: bloqueId,
            bloque: bloqueTemp.codigo,
            curso: curso.nombre,
            profesor: nombreProfesor,
            aula: aulaAsignada ? aulaAsignada.codigo : 'AULA-GEN',
            dia: dia,
            horaInicio: horario.inicio,
            horaFin: horario.fin,
            tipo: esPractico ? 'Laboratorio' : 'Teoría'
          });

          // Avanzar slot para la siguiente sesión del siguiente curso
          slotIndex++;
          if (slotIndex >= slotsHorarios.length) {
            slotIndex = 0;
            diaIndex++; // Cambiar de día si se llenan los slots del turno
          }
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

/**
 * POST /api/upload/bloques/confirmar-preview
 * Guarda definitivamente los datos del preview editado en la BD
 */
router.post('/bloques/confirmar-preview', async (req, res) => {
  try {
    const { bloques, horarios } = req.body;
    
    if (!bloques || !horarios) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos'
      });
    }
    
    console.log('💾 Guardando preview confirmado en BD...');
    
    const Periodo = require('../models/Periodo');
    const Carrera = require('../models/Carrera');
    const Curso = require('../models/Curso');
    const Profesor = require('../models/Profesor');
    const Aula = require('../models/Aula');
    const Sede = require('../models/Sede');
    const Asignacion = require('../models/Asignacion');
    const Horario = require('../models/Horario');
    
    const bloquesGuardados = [];
    const asignacionesGuardadas = [];
    const horariosGuardados = [];
    const conflictos = [];
    
    // Mapa de IDs temporales a IDs reales
    const bloqueIdMap = {};
    const asignacionIdMap = {};
    
    // 1. Guardar bloques
    for (const bloqueTemp of bloques) {
      try {
        // Buscar o crear período
        let periodo = await Periodo.findOne({ nombre: bloqueTemp.periodo });
        if (!periodo) {
          periodo = await Periodo.create({
            codigo: bloqueTemp.periodo.replace(/\s+/g, '-').toUpperCase(),
            nombre: bloqueTemp.periodo,
            fechaInicio: new Date(bloqueTemp.fechaInicio),
            fechaFin: new Date(bloqueTemp.fechaFin),
            estado: 'planificado'
          });
        }
        
        // Buscar o crear carrera
        let carrera = await Carrera.findOne({ nombre: new RegExp(bloqueTemp.carrera, 'i') });
        if (!carrera) {
          carrera = await Carrera.create({
            nombre: bloqueTemp.carrera,
            codigo: bloqueTemp.carrera.substring(0, 3).toUpperCase(),
            activo: true
          });
        }
        
        // Verificar si ya existe
        let bloque = await Bloque.findOne({ codigo: bloqueTemp.codigo });
        
        if (!bloque) {
          // Crear bloque
          bloque = await Bloque.create({
            periodo: periodo._id,
            carrera: carrera._id,
            codigo: bloqueTemp.codigo,
            semestreAcademico: bloqueTemp.semestre,
            fechaInicio: new Date(bloqueTemp.fechaInicio),
            fechaFin: new Date(bloqueTemp.fechaFin),
            capacidadMax: bloqueTemp.capacidadMax,
            totalInscritos: 0,
            estado: 'planificado',
            subPeriodo: bloqueTemp.turno.toLowerCase()
          });
        }
        
        bloqueIdMap[bloqueTemp.id] = bloque._id;
        bloquesGuardados.push(bloque);
      } catch (error) {
        console.error(`Error guardando bloque ${bloqueTemp.codigo}:`, error.message);
      }
    }
    
    // 2. Agrupar horarios por asignación única
    const asignacionesMap = new Map();
    
    horarios.forEach(hora => {
      const key = `${hora.bloqueId}_${hora.curso}_${hora.profesor}`;
      if (!asignacionesMap.has(key)) {
        asignacionesMap.set(key, {
          bloqueId: hora.bloqueId,
          curso: hora.curso,
          profesor: hora.profesor,
          horarios: []
        });
      }
      asignacionesMap.get(key).horarios.push(hora);
    });
    
    // 3. Crear asignaciones y horarios
    for (const [key, asigData] of asignacionesMap) {
      try {
        const bloqueReal = bloqueIdMap[asigData.bloqueId];
        if (!bloqueReal) continue;
        
        const bloqueData = bloques.find(b => b.id === asigData.bloqueId);
        
        // Buscar o crear curso
        let curso = await Curso.findOne({ nombre: new RegExp(asigData.curso, 'i') });
        if (!curso) {
          const carrera = await Carrera.findOne({ nombre: new RegExp(bloqueData.carrera, 'i') });
          curso = await Curso.create({
            nombre: asigData.curso,
            carrera: carrera._id,
            semestre: bloqueData.semestre,
            horasSemanales: 4,
            creditos: 3
          });
        }
        
        // Buscar o crear profesor
        const nombreProf = asigData.profesor.replace('Prof. ', '');
        const nombrePartes = nombreProf.split(' ');
        let profesor = await Profesor.findOne({ 
          nombres: new RegExp(nombrePartes[0], 'i')
        });
        
        if (!profesor) {
          profesor = await Profesor.create({
            nombres: nombrePartes[0],
            apellidos: nombrePartes.slice(1).join(' ') || nombrePartes[0],
            especialidad: asigData.curso,
            activo: true
          });
        }
        
        // Crear asignación
        const asignacion = await Asignacion.create({
          bloque: bloqueReal,
          curso: curso._id,
          profesor: profesor._id,
          observaciones: 'Importado desde preview confirmado'
        });
        
        asignacionesGuardadas.push(asignacion);
        
        // Guardar horarios de esta asignación
        for (const horaTemp of asigData.horarios) {
          try {
            // Buscar o crear aula
            let aula = await Aula.findOne({ codigo: horaTemp.aula });
            if (!aula) {
              let sede = await Sede.findOne();
              if (!sede) {
                sede = await Sede.create({
                  nombre: 'Sede Principal',
                  direccion: 'Lima',
                  activo: true
                });
              }
              
              aula = await Aula.create({
                codigo: horaTemp.aula,
                nombre: `Aula ${horaTemp.aula}`,
                sede: sede._id,
                capacidad: 30,
                tipo: 'Aula Común',
                activo: true
              });
            }
            
            // VALIDAR CONFLICTOS
            const conflicto = await validarConflictoHorario(
              aula._id,
              profesor._id,
              horaTemp.dia,
              horaTemp.horaInicio,
              horaTemp.horaFin
            );
            
            if (conflicto) {
              conflictos.push({
                tipo: conflicto.tipo,
                mensaje: conflicto.mensaje,
                horario: horaTemp
              });
              continue; // Saltar este horario si hay conflicto
            }
            
            // Crear horario
            const horario = await Horario.create({
              asignacion: asignacion._id,
              aula: aula._id,
              diaSemana: horaTemp.dia,
              horaInicio: horaTemp.horaInicio,
              horaFin: horaTemp.horaFin,
              tipoSesion: horaTemp.tipo || 'Teoría'
            });
            
            horariosGuardados.push(horario);
          } catch (error) {
            console.error(`Error guardando horario:`, error.message);
          }
        }
      } catch (error) {
        console.error(`Error en asignación:`, error.message);
      }
    }
    
    console.log(`✅ Guardado completo: ${bloquesGuardados.length} bloques, ${horariosGuardados.length} horarios`);
    
    res.json({
      success: true,
      resultado: {
        bloques: bloquesGuardados.length,
        asignaciones: asignacionesGuardadas.length,
        horarios: horariosGuardados.length,
        conflictos: conflictos.length
      },
      conflictos: conflictos,
      message: conflictos.length > 0
        ? `⚠️ Guardado con ${conflictos.length} conflictos detectados`
        : `✅ Importación confirmada: ${bloquesGuardados.length} bloques, ${horariosGuardados.length} horarios`
    });

  } catch (error) {
    console.error('Error al confirmar preview:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar: ' + error.message
    });
  }
});

/**
 * Validar conflictos de horario
 */
async function validarConflictoHorario(aulaId, profesorId, dia, horaInicio, horaFin) {
  const Horario = require('../models/Horario');
  const Asignacion = require('../models/Asignacion');
  
  // Buscar horarios en el mismo día y rango de horas
  const horariosExistentes = await Horario.find({
    diaSemana: dia,
    $or: [
      { aula: aulaId },
      { asignacion: { $in: await Asignacion.find({ profesor: profesorId }).select('_id') } }
    ]
  }).populate('asignacion');
  
  for (const horario of horariosExistentes) {
    // Verificar si hay solapamiento de horarios
    if (
      (horaInicio >= horario.horaInicio && horaInicio < horario.horaFin) ||
      (horaFin > horario.horaInicio && horaFin <= horario.horaFin) ||
      (horaInicio <= horario.horaInicio && horaFin >= horario.horaFin)
    ) {
      if (horario.aula.toString() === aulaId.toString()) {
        return {
          tipo: 'aula',
          mensaje: `Conflicto: Aula ya ocupada en ${dia} ${horaInicio}-${horaFin}`
        };
      }
      if (horario.asignacion && horario.asignacion.profesor.toString() === profesorId.toString()) {
        return {
          tipo: 'profesor',
          mensaje: `Conflicto: Profesor ya tiene clase en ${dia} ${horaInicio}-${horaFin}`
        };
      }
    }
  }
  
  return null;
}

module.exports = router;
