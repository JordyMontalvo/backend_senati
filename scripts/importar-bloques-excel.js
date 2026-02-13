const xlsx = require('xlsx');
const mongoose = require('mongoose');
require('dotenv').config();

// Modelos
const Bloque = require('../models/Bloque');
const Carrera = require('../models/Carrera');
const Periodo = require('../models/Periodo');

/**
 * Importa bloques desde un archivo Excel
 * @param {string} excelPath - Ruta del archivo Excel
 * @returns {Promise<Object>} Resultado de la importación
 */
async function importarBloquesDesdeExcel(excelPath) {
  try {
    console.log('📖 Leyendo archivo Excel:', excelPath);
    
    // Leer el archivo Excel
    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir a JSON
    const datos = xlsx.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Se encontraron ${datos.length} bloques en el Excel\n`);
    
    const resultados = {
      exitosos: 0,
      errores: [],
      bloques: []
    };
    
    for (const [index, fila] of datos.entries()) {
      try {
        // Buscar o crear el período
        let periodo = await Periodo.findOne({ nombre: fila['Período'] || fila.Periodo });
        if (!periodo) {
          periodo = await Periodo.create({
            nombre: fila['Período'] || fila.Periodo,
            fechaInicio: parsearFecha(fila['Fecha Inicio']),
            fechaFin: parsearFecha(fila['Fecha Fin']),
            activo: true
          });
          console.log(`✅ Período creado: ${periodo.nombre}`);
        }
        
        // Buscar la carrera
        let carrera = await Carrera.findOne({ 
          nombre: new RegExp(fila.Carrera, 'i') 
        });
        
        if (!carrera) {
          console.log(`⚠️  Carrera no encontrada: ${fila.Carrera}, creando una nueva...`);
          carrera = await Carrera.create({
            nombre: fila.Carrera,
            codigo: fila.Carrera.substring(0, 3).toUpperCase(),
            activo: true
          });
        }
        
        // Parsear el turno
        const turno = fila.Turno.toLowerCase();
        
        // Crear el bloque
        const bloqueData = {
          periodo: periodo._id,
          carrera: carrera._id,
          codigo: fila['Código'] || fila.Codigo,
          semestreAcademico: fila.Semestre,
          fechaInicio: parsearFecha(fila['Fecha Inicio']),
          fechaFin: parsearFecha(fila['Fecha Fin']),
          capacidadMax: fila['Capacidad Máxima'] || fila['Capacidad Maxima'] || 30,
          totalInscritos: 0,
          estado: 'planificado',
          subPeriodo: turno
        };
        
        // Verificar si ya existe
        const bloqueExistente = await Bloque.findOne({ codigo: bloqueData.codigo });
        
        if (bloqueExistente) {
          console.log(`⏭️  Bloque ${bloqueData.codigo} ya existe, omitiendo...`);
          continue;
        }
        
        const bloque = await Bloque.create(bloqueData);
        resultados.bloques.push(bloque);
        resultados.exitosos++;
        
        console.log(`✅ Bloque ${index + 1}/${datos.length}: ${bloque.codigo} - ${carrera.nombre}`);
        
      } catch (error) {
        console.error(`❌ Error en fila ${index + 1}:`, error.message);
        resultados.errores.push({
          fila: index + 1,
          datos: fila,
          error: error.message
        });
      }
    }
    
    console.log('\n📈 Resumen de Importación:');
    console.log(`   ✅ Exitosos: ${resultados.exitosos}`);
    console.log(`   ❌ Errores: ${resultados.errores.length}`);
    
    return resultados;
    
  } catch (error) {
    console.error('❌ Error al importar bloques:', error);
    throw error;
  }
}

/**
 * Parsea una fecha en diferentes formatos
 */
function parsearFecha(fechaStr) {
  if (!fechaStr) return null;
  
  // Si ya es una fecha
  if (fechaStr instanceof Date) return fechaStr;
  
  // Si es un string
  if (typeof fechaStr === 'string') {
    // Formato: DD/MM/YYYY
    if (fechaStr.includes('/')) {
      const [dia, mes, anio] = fechaStr.split('/');
      return new Date(anio, mes - 1, dia);
    }
    
    // Formato ISO
    return new Date(fechaStr);
  }
  
  // Si es número (Excel serial date)
  if (typeof fechaStr === 'number') {
    const date = new Date((fechaStr - 25569) * 86400 * 1000);
    return date;
  }
  
  return null;
}

// Si se ejecuta directamente
if (require.main === module) {
  const path = require('path');
  
  // Conectar a MongoDB
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/senati-horarios')
    .then(async () => {
      console.log('✅ Conectado a MongoDB\n');
      
      const excelPath = path.join(__dirname, '../../bloques_ejemplo.xlsx');
      
      const resultado = await importarBloquesDesdeExcel(excelPath);
      
      console.log('\n✨ Importación completada!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error de conexión:', error);
      process.exit(1);
    });
}

module.exports = { importarBloquesDesdeExcel };
