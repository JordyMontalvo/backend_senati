const mongoose = require('mongoose');
require('dotenv').config();

const Profesor = require('../models/Profesor');
const Aula = require('../models/Aula');
const Sede = require('../models/Sede');

/**
 * Script para crear datos de prueba: profesores y aulas
 */

async function crearDatosPrueba() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/senati-horarios');
    console.log('✅ Conectado a MongoDB\n');

    // 1. Crear o buscar sede
    let sede = await Sede.findOne({ nombre: 'Sede Lima' });
    if (!sede) {
      sede = await Sede.create({
        nombre: 'Sede Lima',
        direccion: 'Av. Alfredo Mendiola 3520, Independencia',
        telefono: '01-208-5555',
        activo: true
      });
      console.log('✅ Sede creada:', sede.nombre);
    }

    // 2. Crear profesores
    console.log('\n👨‍🏫 Creando profesores...\n');
    
    const profesores = [
      {
        nombres: 'Juan Carlos',
        apellidos: 'Pérez García',
        email: 'jperez@senati.edu.pe',
        telefono: '987654321',
        especialidad: 'Administración',
        sedes: [sede._id],
        activo: true
      },
      {
        nombres: 'María Elena',
        apellidos: 'Rodríguez López',
        email: 'mrodriguez@senati.edu.pe',
        telefono: '987654322',
        especialidad: 'Electrónica',
        sedes: [sede._id],
        activo: true
      },
      {
        nombres: 'Pedro Luis',
        apellidos: 'Martínez Campos',
        email: 'pmartinez@senati.edu.pe',
        telefono: '987654323',
        especialidad: 'Mecánica',
        sedes: [sede._id],
        activo: true
      },
      {
        nombres: 'Ana Patricia',
        apellidos: 'González Vargas',
        email: 'agonzalez@senati.edu.pe',
        telefono: '987654324',
        especialidad: 'Diseño',
        sedes: [sede._id],
        activo: true
      },
      {
        nombres: 'Roberto Carlos',
        apellidos: 'Fernández Silva',
        email: 'rfernandez@senati.edu.pe',
        telefono: '987654325',
        especialidad: 'Construcción',
        sedes: [sede._id],
        activo: true
      },
      {
        nombres: 'Carmen Rosa',
        apellidos: 'Torres Quispe',
        email: 'ctorres@senati.edu.pe',
        telefono: '987654326',
        especialidad: 'Informática',
        sedes: [sede._id],
        activo: true
      },
      {
        nombres: 'Luis Alberto',
        apellidos: 'Ramírez Chávez',
        email: 'lramirez@senati.edu.pe',
        telefono: '987654327',
        especialidad: 'Matemáticas',
        sedes: [sede._id],
        activo: true
      },
      {
        nombres: 'Diana Isabel',
        apellidos: 'Huamán Flores',
        email: 'dhuaman@senati.edu.pe',
        telefono: '987654328',
        especialidad: 'Comunicación',
        sedes: [sede._id],
        activo: true
      },
      {
        nombres: 'Jorge Eduardo',
        apellidos: 'Castillo Mendoza',
        email: 'jcastillo@senati.edu.pe',
        telefono: '987654329',
        especialidad: 'Física',
        sedes: [sede._id],
        activo: true
      },
      {
        nombres: 'Sandra Milena',
        apellidos: 'Vega Rojas',
        email: 'svega@senati.edu.pe',
        telefono: '987654330',
        especialidad: 'Química',
        sedes: [sede._id],
        activo: true
      }
    ];

    let profesoresCreados = 0;
    for (const profesorData of profesores) {
      const existe = await Profesor.findOne({ email: profesorData.email });
      if (!existe) {
        const profesor = await Profesor.create(profesorData);
        console.log(`✅ Profesor creado: ${profesor.nombres} ${profesor.apellidos} - ${profesor.especialidad}`);
        profesoresCreados++;
      } else {
        console.log(`⏭️  Profesor ya existe: ${profesorData.email}`);
      }
    }

    // 3. Crear aulas
    console.log('\n🏫 Creando aulas...\n');
    
    const aulas = [
      // Aulas normales
      { codigo: 'A-101', nombre: 'Aula 101', edificio: 'A', piso: 1, capacidad: 30, tipo: 'Aula' },
      { codigo: 'A-102', nombre: 'Aula 102', edificio: 'A', piso: 1, capacidad: 30, tipo: 'Aula' },
      { codigo: 'A-103', nombre: 'Aula 103', edificio: 'A', piso: 1, capacidad: 25, tipo: 'Aula' },
      { codigo: 'A-201', nombre: 'Aula 201', edificio: 'A', piso: 2, capacidad: 30, tipo: 'Aula' },
      { codigo: 'A-202', nombre: 'Aula 202', edificio: 'A', piso: 2, capacidad: 30, tipo: 'Aula' },
      { codigo: 'A-203', nombre: 'Aula 203', edificio: 'A', piso: 2, capacidad: 25, tipo: 'Aula' },
      { codigo: 'A-301', nombre: 'Aula 301', edificio: 'A', piso: 3, capacidad: 30, tipo: 'Aula' },
      { codigo: 'A-302', nombre: 'Aula 302', edificio: 'A', piso: 3, capacidad: 30, tipo: 'Aula' },
      
      // Talleres
      { codigo: 'T-101', nombre: 'Taller Mecánica 1', edificio: 'B', piso: 1, capacidad: 20, tipo: 'Taller' },
      { codigo: 'T-102', nombre: 'Taller Mecánica 2', edificio: 'B', piso: 1, capacidad: 20, tipo: 'Taller' },
      { codigo: 'T-201', nombre: 'Taller Electrónica 1', edificio: 'B', piso: 2, capacidad: 22, tipo: 'Taller' },
      { codigo: 'T-202', nombre: 'Taller Electrónica 2', edificio: 'B', piso: 2, capacidad: 22, tipo: 'Taller' },
      
      // Laboratorios
      { codigo: 'L-101', nombre: 'Lab. Computación 1', edificio: 'C', piso: 1, capacidad: 30, tipo: 'Laboratorio' },
      { codigo: 'L-102', nombre: 'Lab. Computación 2', edificio: 'C', piso: 1, capacidad: 30, tipo: 'Laboratorio' },
      { codigo: 'L-103', nombre: 'Lab. Computación 3', edificio: 'C', piso: 1, capacidad: 28, tipo: 'Laboratorio' },
      { codigo: 'L-201', nombre: 'Lab. Física', edificio: 'C', piso: 2, capacidad: 25, tipo: 'Laboratorio' },
      { codigo: 'L-202', nombre: 'Lab. Química', edificio: 'C', piso: 2, capacidad: 25, tipo: 'Laboratorio' },
      
      // Aulas adicionales
      { codigo: 'D-101', nombre: 'Aula Diseño 1', edificio: 'D', piso: 1, capacidad: 25, tipo: 'Aula' },
      { codigo: 'D-102', nombre: 'Aula Diseño 2', edificio: 'D', piso: 1, capacidad: 25, tipo: 'Aula' },
      { codigo: 'D-201', nombre: 'Aula Multimedia', edificio: 'D', piso: 2, capacidad: 35, tipo: 'Aula' }
    ];

    let aulasCreadas = 0;
    for (const aulaData of aulas) {
      const existe = await Aula.findOne({ codigo: aulaData.codigo });
      if (!existe) {
        const aula = await Aula.create({
          ...aulaData,
          sede: sede._id,
          activo: true
        });
        console.log(`✅ Aula creada: ${aula.codigo} - ${aula.nombre} (Capacidad: ${aula.capacidad})`);
        aulasCreadas++;
      } else {
        console.log(`⏭️  Aula ya existe: ${aulaData.codigo}`);
      }
    }

    console.log('\n📊 Resumen:');
    console.log(`   👨‍🏫 Profesores creados: ${profesoresCreados}/${profesores.length}`);
    console.log(`   🏫 Aulas creadas: ${aulasCreadas}/${aulas.length}`);
    console.log('\n✨ Proceso completado!\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Ejecutar
crearDatosPrueba();
