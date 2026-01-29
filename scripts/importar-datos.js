require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Importar modelos
const Escuela = require('../models/Escuela');
const Carrera = require('../models/Carrera');
const Curso = require('../models/Curso');
const Periodo = require('../models/Periodo');

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Función principal de importación
const importarDatos = async () => {
  console.log('\n🚀 Iniciando importación de datos desde Excel...\n');

  try {
    // Nota: Necesitarás instalar: npm install xlsx
    const XLSX = require('xlsx');
    
    // Leer archivo de estructura curricular
    const archivoEstructura = path.join(__dirname, '../../Estructura curricular Consolidado_202520_20250604.xlsx');
    
    if (!fs.existsSync(archivoEstructura)) {
      console.error('❌ No se encontró el archivo de estructura curricular');
      console.log('   Coloca el archivo en:', archivoEstructura);
      return;
    }

    console.log('📖 Leyendo archivo de estructura curricular...');
    const workbook = XLSX.readFile(archivoEstructura);
    const sheetName = 'cursos 202520';
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir a JSON (saltar primeras 2 filas)
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: 2 });
    
    console.log(`✓ ${jsonData.length} registros encontrados\n`);

    // 1. Crear Período
    console.log('📅 Creando período 202520...');
    const periodo = await Periodo.findOneAndUpdate(
      { codigo: '202520' },
      {
        codigo: '202520',
        nombre: 'Período Académico 2025-2',
        fechaInicio: new Date('2025-08-01'),
        fechaFin: new Date('2025-12-20'),
        estado: 'activo'
      },
      { upsert: true, new: true }
    );
    console.log('✓ Período creado\n');

    // 2. Crear Escuelas Profesionales
    console.log('🏫 Creando escuelas profesionales...');
    const escuelasUnicas = [...new Set(jsonData.map(row => row['ESCUELA PROFESIONAL']).filter(Boolean))];
    const escuelasMap = {};
    
    for (const nombreEscuela of escuelasUnicas) {
      const escuela = await Escuela.findOneAndUpdate(
        { nombre: nombreEscuela },
        { nombre: nombreEscuela },
        { upsert: true, new: true }
      );
      escuelasMap[nombreEscuela] = escuela._id;
    }
    console.log(`✓ ${escuelasUnicas.length} escuelas creadas\n`);

    // 3. Crear Carreras
    console.log('🎓 Creando carreras...');
    const carrerasMap = {};
    const carrerasAgrupadas = {}; 
    
    jsonData.forEach(row => {
      const codigoCarrera = row['CODIGO'];
      const nombreCarrera = row['CARRERA'];
      const nombreEscuela = row['ESCUELA PROFESIONAL'];
      const nivel = row['NIVEL'];
      const grado = row['GRADO'];
      const catalogo = row['CATALOGO'];
      
      if (codigoCarrera && nombreCarrera && !carrerasAgrupadas[codigoCarrera]) {
        carrerasAgrupadas[codigoCarrera] = {
          codigo: codigoCarrera,
          nombre: nombreCarrera,
          escuela: escuelasMap[nombreEscuela],
          nivel,
          grado,
          catalogo
        };
      }
    });

    for (const [codigo, data] of Object.entries(carrerasAgrupadas)) {
      const carrera = await Carrera.findOneAndUpdate(
        { codigo: codigo },
        data,
        { upsert: true, new: true }
      );
      carrerasMap[codigo] = carrera._id;
    }
    console.log(`✓ ${Object.keys(carrerasAgrupadas).length} carreras creadas\n`);

    // 4. Crear Cursos
    console.log('📚 Creando cursos...');
    let cursosCreados = 0;
    
    for (const row of jsonData) {
      const materia = row['MATERIA'];
      const numero = row['CURSO'];
      const codigo = row['MAT CUR\nCORREGIDO'] || `${materia}-${numero}`;
      const nombre = row['DESCRIPCION DE CURSO'];
      const semestre = row['SEMESTRE'];
      const codigoCarrera = row['CODIGO'];
      
      if (!codigo || !nombre || !codigoCarrera) continue;
      
      const cursoData = {
        carrera: carrerasMap[codigoCarrera],
        materia: materia || '',
        numero: numero ? numero.toString() : '',
        codigo: codigo,
        nombre: nombre,
        semestre: semestre || 'I',
        creditos: parseFloat(row['CRÉDITOS']) || 0,
        horasTeoria: parseInt(row['TEORÍA / TECNOLOGÍA']) || 0,
        horasTaller: parseInt(row['TALLER / EMPRESA']) || 0,
        horasVirtual: parseInt(row['VIRTUAL']) || 0,
        horasTotal: parseInt(row['TOTAL HORAS']) || 0,
        tipoCurso: row['TIPO*'] || 'TEC',
        clasificacion: row['CLASIFICACIÓN\nBLACKBOARD\nPRODUCCIÓN - VIRTUALIZACIÓN'] || ''
      };

      try {
        await Curso.findOneAndUpdate(
          { codigo: codigo },
          cursoData,
          { upsert: true, new: true }
        );
        cursosCreados++;
      } catch (error) {
        console.error(`Error creando curso ${codigo}:`, error.message);
      }
    }
    
    console.log(`✓ ${cursosCreados} cursos creados\n`);

    // Estadísticas finales
    console.log('📊 RESUMEN DE IMPORTACIÓN:');
    console.log('═══════════════════════════════════════');
    console.log(`   Períodos:  ${await Periodo.countDocuments()}`);
    console.log(`   Escuelas:  ${await Escuela.countDocuments()}`);
    console.log(`   Carreras:  ${await Carrera.countDocuments()}`);
    console.log(`   Cursos:    ${await Curso.countDocuments()}`);
    console.log('═══════════════════════════════════════');
    console.log('\n✅ Importación completada exitosamente!\n');

  } catch (error) {
    console.error('\n❌ Error durante la importación:', error);
    throw error;
  }
};

// Ejecutar
const run = async () => {
  await connectDB();
  await importarDatos();
  await mongoose.connection.close();
  console.log('👋 Desconectado de MongoDB');
  process.exit(0);
};

run().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
