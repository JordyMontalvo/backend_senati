require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
const mongoose = require('mongoose');
const path = require('path');

// Modelos
const Carrera = require('../models/Carrera');
const Curso = require('../models/Curso');

// Conexión
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:ADMIN_sifrah@ec2-18-220-240-71.us-east-2.compute.amazonaws.com:27017/senati_horarios?authSource=admin';

const CSV_FILE = path.join(__dirname, '../../Estructura curricular Consolidado_202520_20250604 2(cursos 202520).csv');

async function conectarDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('📦 Conectado a MongoDB');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

async function importar() {
  await conectarDB();

  console.log(`📂 Leyendo archivo: ${CSV_FILE}`);
  
  if (!fs.existsSync(CSV_FILE)) {
    console.error('❌ Archivo CSV no encontrado');
    process.exit(1);
  }

  const fileStream = fs.createReadStream(CSV_FILE, { encoding: 'latin1' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  let cursosCount = 0;
  let carrerasCount = 0;
  const carrerasCache = new Map(); // Cache local para evitar queries repetidos
  
  console.log('🚀 Iniciando importación...');

  // Acumulador para operaciones masivas
  const bulkOps = [];
  const BATCH_SIZE = 500;

  for await (const line of rl) {
    lineCount++;
    if (lineCount === 1) continue; // Saltar título
    
    const row = line.split(';'); 
    
    if (lineCount === 2) {
      console.log('📋 Encabezados detectados y saltados');
      continue; 
    }
    
    if (row.length < 5) continue; // Línea vacía o irrelevante

    // Mapeo Indices
    const id = row[0]?.trim();
    const escuela = row[1]?.trim();
    const codigoCarrera = row[2]?.trim();
    const nombreCarrera = row[3]?.trim();
    const nivel = row[4]?.trim();
    const grado = row[5]?.trim();
    
    if (!codigoCarrera || !nombreCarrera) continue;

    // --- PROCESAR CARRERA ---
    let carreraId = carrerasCache.get(codigoCarrera);
    
    if (!carreraId) {
      // Buscar en BD por si ya existe (fuera de caché local de esta ejecución)
      let carrera = await Carrera.findOne({ codigo: codigoCarrera });
      
      if (!carrera) {
        carrera = new Carrera({
          codigo: codigoCarrera,
          nombre: nombreCarrera,
          escuela_profesional: escuela,
          nivel: nivel,
          grado: grado,
          activo: true
        });
        await carrera.save();
        carrerasCount++;
      } else {
        // Actualizar datos por si cambiaron
        carrera.escuela_profesional = escuela;
        carrera.nivel = nivel;
        carrera.grado = grado;
        await carrera.save();
      }
      carreraId = carrera._id;
      carrerasCache.set(codigoCarrera, carreraId);
    }

    // --- PROCESAR CURSO ---
    
    // Helpers de conversión numérica
    const parseNum = (val) => {
        if (!val) return 0;
        return parseFloat(val.replace(',', '.')) || 0;
    };

    const cursoData = {
      carrera: carreraId,
      codigo: id, // Usamos ID fila como único
      
      catalogo: row[6]?.trim(),
      mat_cur_corregido: row[7]?.trim(),
      tipo_especifico: row[8]?.trim(),
      identificacion: row[9]?.trim(),
      horario_sinfo: row[10]?.trim(),
      clasificacion_blackboard: row[11]?.trim(),
      
      semestre: row[12]?.trim() || 'SIN CICLO',
      materia: row[13]?.trim() || 'SIN MATERIA',
      nombre: row[14]?.trim() || 'SIN NOMBRE',
      descripcion: row[15]?.trim(),
      
      semanas: parseInt(row[16]) || 0,
      horasTeoria: parseNum(row[17]),
      horasTaller: parseNum(row[18]),
      horasVirtual: parseNum(row[19]),
      
      evaluacion_semestral: row[20]?.trim(),
      horasTotal: parseNum(row[21]),
      horasSemestre: parseNum(row[22]),
      creditos: parseNum(row[23]),
      
      status: row[25]?.trim(), // Salto row[24] (Semestre dup)
      comentarios: row[26]?.trim(),
      contenido_curricular: row[27]?.trim(),
      
      // Generar numero basado en materia si no existe mejor dato
      numero: row[13]?.trim()
    };

    // Agregar a lote
    bulkOps.push({
      updateOne: {
        filter: { codigo: id },
        update: { $set: cursoData },
        upsert: true
      }
    });
    
    // Ejecutar lote si alcanza tamaño
    if (bulkOps.length >= BATCH_SIZE) {
      await Curso.bulkWrite(bulkOps);
      cursosCount += bulkOps.length;
      bulkOps.length = 0; // Limpiar array
      process.stdout.write(`Processed ${cursosCount} rows...\r`);
    }
  }
  
  // Procesar remanentes
  if (bulkOps.length > 0) {
    await Curso.bulkWrite(bulkOps);
    cursosCount += bulkOps.length;
  }
  
  console.log(`\n✅ Importación Finalizada.`);
  console.log(`🎓 Carreras procesadas (nuevas/actualizadas): ${carrerasCache.size}`);
  console.log(`📚 Cursos procesados (upsert): ${cursosCount}`);
  
  process.exit(0);
}

importar();
