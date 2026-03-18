const mongoose = require('mongoose');
require('dotenv').config();

// Configuración de modelos
const Sede = require('../models/Sede');
const Aula = require('../models/Aula');
const Profesor = require('../models/Profesor');
const Escuela = require('../models/Escuela');
const Zonal = require('../models/Zonal');

async function seedDIstinct() {
  try {
    console.log('🚀 Iniciando Carga de Datos SENATI Independencia (ETI)...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Conectado a MongoDB');

    // 1. Zonal
    let zonal = await Zonal.findOne({ nombre: /LIMA - CALLAO/i });
    if (!zonal) {
      zonal = await Zonal.create({
        codigo: 'LC-01',
        nombre: 'LIMA - CALLAO',
        sedes: []
      });
    }

    // 2. Sede
    let sede = await Sede.findOne({ nombre: /INDEPENDENCIA/i });
    if (!sede) {
      sede = await Sede.create({
        codigo: 'SI-01',
        nombre: 'SEDE PRINCIPAL INDEPENDENCIA',
        direccion: 'Av. Alfredo Mendiola 3520, Independencia',
        zonal: zonal._id,
        activo: true
      });
    }

    // 3. Escuela
    let escuela = await Escuela.findOne({ nombre: /TECNOLOGÍAS DE LA INFORMACIÓN/i });
    if (!escuela) {
      escuela = await Escuela.create({
        codigo: 'ETI',
        nombre: 'ESCUELA DE TECNOLOGÍAS DE LA INFORMACIÓN',
        activo: true
      });
    }

    // 4. Aulas (Edificios 60TA, G, K)
    const aulasData = [
      { codigo: '60TA-201', nombre: 'Laboratorio de Desarrollo de Software', edificio: '60TA', piso: 2, tipo: 'Laboratorio' },
      { codigo: '60TA-305', nombre: 'Laboratorio de Ciberseguridad', edificio: '60TA', piso: 3, tipo: 'Laboratorio' },
      { codigo: '60TA-410', nombre: 'Laboratorio de IA y Ciencia de Datos', edificio: '60TA', piso: 4, tipo: 'Laboratorio' },
      { codigo: '60TA-501', nombre: 'Laboratorio Multiplataforma', edificio: '60TA', piso: 5, tipo: 'Laboratorio' },
      { codigo: 'G-102', nombre: 'Laboratorio de Redes CISCO', edificio: 'G', piso: 1, tipo: 'Laboratorio' },
      { codigo: 'G-204', nombre: 'Laboratorio de Soporte y Hardware', edificio: 'G', piso: 2, tipo: 'Laboratorio' },
      { codigo: 'K-301', nombre: 'Aula Teórica 301', edificio: 'K', piso: 3, tipo: 'Aula' },
      { codigo: 'K-405', nombre: 'Aula Teórica 405', edificio: 'K', piso: 4, tipo: 'Aula' },
      { codigo: 'K-510', nombre: 'Aula de Conferencias ETI', edificio: 'K', piso: 5, tipo: 'Auditorio' }
    ];

    console.log('🧹 Limpiando aulas previas de Independencia...');
    // Opcional: solo para este ejercicio del usuario
    
    for (const a of aulasData) {
      await Aula.findOneAndUpdate(
        { codigo: a.codigo },
        { ...a, sede: sede._id },
        { upsert: true, new: true }
      );
    }
    console.log('✅ Aulas cargadas');

    // 5. Profesores (ETI SENATI Realistas)
    const profesData = [
      { codigo: 'P0100', nombres: 'Daniel', apellidos: 'Agama Moreno', especialidad: 'Sistemas de Información', email: 'dagama@senati.pe' },
      { codigo: 'P0101', nombres: 'Miguel Angel', apellidos: 'Pastor Cardenas', especialidad: 'Gestión de TI', email: 'mpastor@senati.pe' },
      { codigo: 'P0102', nombres: 'Iván', apellidos: 'Muñiz Herrera', especialidad: 'Ciberseguridad & Redes', email: 'imuniz@senati.pe' },
      { codigo: 'P0103', nombres: 'Mara', apellidos: 'Cáceres O’Brian', especialidad: 'Ingeniería de Software', email: 'mcaceres@senati.pe' },
      { codigo: 'P0104', nombres: 'Giampierre', apellidos: 'Poma Monago', especialidad: 'IA & Ciencia de Datos', email: 'gpoma@senati.pe' },
      { codigo: 'P0105', nombres: 'Jesús', apellidos: 'Palpa Guimaray', especialidad: 'Hardware & Soporte', email: 'jpalpa@senati.pe' },
      { codigo: 'P0106', nombres: 'Gonzalo', apellidos: 'Romero Rojas', especialidad: 'Cloud Computing', email: 'gromero@senati.pe' },
      { codigo: 'P0107', nombres: 'Karen', apellidos: 'Saravia López', especialidad: 'Diseño Web & UX', email: 'ksaravia@senati.pe' }
    ];

    for (const p of profesData) {
      await Profesor.findOneAndUpdate(
        { codigo: p.codigo },
        { ...p, sedes: [sede._id] },
        { upsert: true, new: true }
      );
    }
    console.log('✅ Profesores cargados');

    console.log('\n✨ RESUMEN DE CARGA:');
    console.log(`- Sede: ${sede.nombre}`);
    console.log(`- Aulas de ETI: ${aulasData.length}`);
    console.log(`- Profesores de ETI: ${profesData.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la carga:', error);
    process.exit(1);
  }
}

seedDIstinct();
