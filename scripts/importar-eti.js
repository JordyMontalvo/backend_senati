require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
const mongoose = require('mongoose');
const path = require('path');

// Modelos
const Carrera = require('../models/Carrera');
const Curso = require('../models/Curso');
const Escuela = require('../models/Escuela');
const Sede = require('../models/Sede');
const Zonal = require('../models/Zonal');

const MONGO_URI = process.env.MONGODB_URI;
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

async function prepararMaestros() {
  console.log('🛠️ Preparando datos maestros (Sede, Zonal, Escuela)...');
  
  // 1. Zonal Lima-Callao
  let zonal = await Zonal.findOne({ nombre: /LIMA/i });
  if (!zonal) {
    zonal = await Zonal.create({ nombre: 'LIMA - CALLAO' });
  }

  // 2. Sede Independencia
  let sede = await Sede.findOne({ nombre: /INDEPENDENCIA/i });
  if (!sede) {
    sede = await Sede.create({ 
      nombre: 'SEDE PRINCIPAL INDEPENDENCIA',
      direccion: 'Av. Alfredo Mendiola 3520',
      distrito: 'Independencia',
      zonal: zonal._id
    });
  }

  // 3. Escuela ETI
  let escuela = await Escuela.findOne({ nombre: /INFORMÁTICA|ETI/i });
  if (!escuela) {
    escuela = await Escuela.create({ 
      codigo: 'ETI',
      nombre: 'ESCUELA DE TECNOLOGÍAS DE LA INFORMACIÓN' 
    });
  }

  return { zonal, sede, escuela };
}

async function importar() {
  await conectarDB();
  const { escuela: escuelaObj } = await prepararMaestros();

  console.log(`📂 Analizando archivo curricular: ${CSV_FILE}`);
  
  if (!fs.existsSync(CSV_FILE)) {
    console.error('❌ Archivo consolidado no encontrado. Asegúrate de que el CSV esté en la raíz.');
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
  const carrerasCache = new Map();
  const bulkOps = [];
  const BATCH_SIZE = 200;

  console.log('🚀 Filtrando e importando carreras de ETI (INFORMÁTICA)...');

  for await (const line of rl) {
    lineCount++;
    if (lineCount <= 2) continue; // Saltar títulos y encabezados
    
    const row = line.split(';'); 
    if (row.length < 5) continue;

    const escuelaCSV = row[1]?.trim().toUpperCase();
    
    // FILTRO CRÍTICO: Solo ETI (INFORMÁTICA en el CSV)
    if (!escuelaCSV.includes('INFORMÁTICA') && !escuelaCSV.includes('INFORMTICA')) {
      continue;
    }

    const codigoCarrera = row[2]?.trim();
    const nombreCarrera = row[3]?.trim();
    const nivel = row[4]?.trim();
    const grado = row[5]?.trim();
    
    if (!codigoCarrera || !nombreCarrera) continue;

    // --- PROCESAR CARRERA ---
    let carreraId = carrerasCache.get(codigoCarrera);
    if (!carreraId) {
      let carrera = await Carrera.findOne({ codigo: codigoCarrera });
      if (!carrera) {
        carrera = new Carrera({
          codigo: codigoCarrera,
          nombre: nombreCarrera,
          escuela: escuelaObj._id,
          escuela_profesional: 'INFORMÁTICA',
          nivel,
          grado,
          activo: true
        });
        await carrera.save();
        carrerasCount++;
      }
      carreraId = carrera._id;
      carrerasCache.set(codigoCarrera, carreraId);
    }

    // --- PROCESAR CURSO ---
    const parseNum = (val) => {
        if (!val) return 0;
        return parseFloat(val.replace(',', '.')) || 0;
    };

    const idUnico = row[0]?.trim();
    const cursoData = {
      carrera: carreraId,
      codigo: idUnico,
      semestre: row[12]?.trim() || 'I',
      materia: row[13]?.trim() || 'GEN',
      nombre: row[15]?.trim() || 'CURSO SIN NOMBRE',
      horasTeoria: parseNum(row[17]),
      horasTaller: parseNum(row[18]),
      horasVirtual: parseNum(row[19]),
      horasTotal: parseNum(row[21]),
      creditos: parseNum(row[23]),
      activo: true
    };

    bulkOps.push({
      updateOne: {
        filter: { codigo: idUnico },
        update: { $set: cursoData },
        upsert: true
      }
    });

    if (bulkOps.length >= BATCH_SIZE) {
      await Curso.bulkWrite(bulkOps);
      cursosCount += bulkOps.length;
      bulkOps.length = 0;
      process.stdout.write(`⚡ Procesados ${cursosCount} cursos de ETI...\r`);
    }
  }

  if (bulkOps.length > 0) {
    await Curso.bulkWrite(bulkOps);
    cursosCount += bulkOps.length;
  }
  
  console.log(`\n\n✨ IMPORTACIÓN EXITOSA (ETI INDEPENDENCIA)`);
  console.log(`------------------------------------------`);
  console.log(`🏢 Sede: SEDE PRINCIPAL INDEPENDENCIA`);
  console.log(`🎓 Escuela: ${escuelaObj.nombre}`);
  console.log(`📚 Carreras cargadas/identificadas: ${carrerasCache.size}`);
  console.log(`📖 Cursos cargados (upsert): ${cursosCount}`);
  console.log(`------------------------------------------`);
  
  process.exit(0);
}

importar();
