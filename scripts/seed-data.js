const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

// Modelos (asumiendo ubicación estándar basada en el proyecto)
const Carrera = require('../models/Carrera');
const Curso = require('../models/Curso');
const Profesor = require('../models/Profesor');
const Aula = require('../models/Aula');
const Sede = require('../models/Sede');
const Periodo = require('../models/Periodo');

// URL de conexión proporcionada por el usuario
const MONGO_URI = 'mongodb://admin:ADMIN_sifrah@ec2-18-220-240-71.us-east-2.compute.amazonaws.com:27017/senati_horarios?authSource=admin';

const seedData = async () => {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conexión exitosa');

    // 1. Crear Sede Principal
    console.log('🏭 Creando/Buscando Sede...');
    let sede = await Sede.findOne({ nombre: 'Sede Principal Independencia' });
    if (!sede) {
      sede = await Sede.create({
        nombre: 'Sede Principal Independencia',
        direccion: 'Av. Alfredo Mendiola 3520, Independencia',
        codigo: 'IND-01',
        activo: true
      });
      console.log('✅ Sede creada');
    }

    // 2. Crear Aulas
    console.log('🏫 Creando Aulas...');
    const aulasData = [
      { codigo: 'LAB-101', nombre: 'Laboratorio de Desarrollo 1', capacidad: 25, tipo: 'Laboratorio' },
      { codigo: 'LAB-102', nombre: 'Laboratorio de Desarrollo 2', capacidad: 25, tipo: 'Laboratorio' },
      { codigo: 'LAB-201', nombre: 'Laboratorio de Redes', capacidad: 20, tipo: 'Laboratorio' },
      { codigo: 'LAB-202', nombre: 'Laboratorio de IA y Big Data', capacidad: 20, tipo: 'Laboratorio' },
      { codigo: 'TEO-301', nombre: 'Aula Teórica 301', capacidad: 40, tipo: 'Aula' },
      { codigo: 'TEO-302', nombre: 'Aula Teórica 302', capacidad: 40, tipo: 'Aula' },
      { codigo: 'AUD-01', nombre: 'Auditorio Tecnológico', capacidad: 100, tipo: 'Auditorio' }
    ];

    for (const aula of aulasData) {
      await Aula.findOneAndUpdate(
        { codigo: aula.codigo },
        { ...aula, sede: sede._id, activo: true },
        { upsert: true, new: true }
      );
    }
    console.log('✅ Aulas creadas/actualizadas');

    // 3. Crear Carrera
    console.log('🎓 Creando Carrera ETI...');
    const carreraData = {
      codigo: 'ISIA',
      nombre: 'Ingeniería de Software con Inteligencia Artificial',
      descripcion: 'Carrera profesional técnica enfocada en desarrollo de software y soluciones de IA.',
      duracionSemestres: 6,
      activo: true
    };

    const carrera = await Carrera.findOneAndUpdate(
      { codigo: carreraData.codigo },
      carreraData,
      { upsert: true, new: true }
    );
    console.log('✅ Carrera creada');

    // 4. Crear Cursos por Semestre (Malla Curricular)
    console.log('📚 Creando Cursos...');
    const mallaCurricular = [
      // Semestre I
      { semestre: 1, nombre: 'Física y Química', creditos: 3, horas: 4 },
      { semestre: 1, nombre: 'Inglés I', creditos: 2, horas: 3 },
      { semestre: 1, nombre: 'Introducción a las TI', creditos: 3, horas: 4 },
      { semestre: 1, nombre: 'Competencias Digitales para la Industria', creditos: 2, horas: 2 },
      { semestre: 1, nombre: 'Lenguaje y Comunicación', creditos: 2, horas: 3 },
      { semestre: 1, nombre: 'Desarrollo Personal y Liderazgo', creditos: 2, horas: 2 },
      
      // Semestre II
      { semestre: 2, nombre: 'Algoritmia para el Desarrollo de Programas', creditos: 4, horas: 5 },
      { semestre: 2, nombre: 'Java Fundamentals (Oracle)', creditos: 4, horas: 5 },
      { semestre: 2, nombre: 'Fundamentos de Programación Web', creditos: 3, horas: 4 },
      { semestre: 2, nombre: 'Database Foundations (Oracle)', creditos: 4, horas: 5 },
      { semestre: 2, nombre: 'Red Hat System Administration I', creditos: 3, horas: 4 },
      { semestre: 2, nombre: 'Inglés II', creditos: 2, horas: 3 },

      // Semestre III
      { semestre: 3, nombre: 'Programación para Desarrollo de Software', creditos: 4, horas: 5 },
      { semestre: 3, nombre: 'Ingeniería de Software y Ágiles', creditos: 3, horas: 4 },
      { semestre: 3, nombre: 'Backend Developer Web', creditos: 5, horas: 6 },
      { semestre: 3, nombre: 'Inglés III', creditos: 2, horas: 3 },
      
      // Semestre IV
      { semestre: 4, nombre: 'Machine Learning con Python', creditos: 5, horas: 6 },
      { semestre: 4, nombre: 'Fundamentos de Inteligencia Artificial', creditos: 4, horas: 5 },
      { semestre: 4, nombre: 'Machine Learning y Deep Learning', creditos: 5, horas: 6 },
      { semestre: 4, nombre: 'AI with Machine Learning in Java', creditos: 4, horas: 5 },
      
      // Semestre V
      { semestre: 5, nombre: 'Diseño y Desarrollo de Aplicaciones Móviles', creditos: 5, horas: 6 },
      { semestre: 5, nombre: 'Desarrollo de Soluciones IoT', creditos: 4, horas: 5 },
      { semestre: 5, nombre: 'Fullstack Developer Software', creditos: 6, horas: 8 },
      { semestre: 5, nombre: 'Taller de Apps con Machine Learning', creditos: 5, horas: 6 },
      
      // Semestre VI
      { semestre: 6, nombre: 'Big Data y Análisis de Datos', creditos: 5, horas: 6 },
      { semestre: 6, nombre: 'Tecnología Cloud con AWS', creditos: 5, horas: 6 },
      { semestre: 6, nombre: 'Conceptos Básicos de IA en Azure', creditos: 4, horas: 5 },
      { semestre: 6, nombre: 'Proyecto de Innovación y/o Mejora', creditos: 6, horas: 8 }
    ];

    const cursosCreados = [];
    let cursoIndex = 1;
    for (const data of mallaCurricular) {
      const codigoCurso = `${carreraData.codigo}-${String(cursoIndex).padStart(3, '0')}`;
      
      const curso = await Curso.findOneAndUpdate(
        { nombre: data.nombre, carrera: carrera._id },
        { 
          ...data, 
          codigo: codigoCurso,
          carrera: carrera._id, 
          activo: true 
        },
        { upsert: true, new: true }
      );
      cursosCreados.push(curso);
      cursoIndex++;
    }
    console.log(`✅ ${cursosCreados.length} cursos creados/actualizados`);

    // 5. Crear Profesores
    console.log('👨‍🏫 Creando Profesores...');
    const profesoresData = [
      { nombres: 'Juan Carlos', apellidos: 'Pérez López', especialidad: 'Desarrollo de Software', email: 'jperez@senati.pe' },
      { nombres: 'Maria Elena', apellidos: 'García Torres', especialidad: 'Inteligencia Artificial', email: 'mgarcia@senati.pe' },
      { nombres: 'Luis Alberto', apellidos: 'Rodríguez Silva', especialidad: 'Base de Datos y Cloud', email: 'lrodriguez@senati.pe' },
      { nombres: 'Ana Paula', apellidos: 'Mendoza Ruiz', especialidad: 'Inglés y Habilidades Blandas', email: 'amendoza@senati.pe' },
      { nombres: 'Carlos Eduardo', apellidos: 'Sánchez Mía', especialidad: 'Redes e Infraestructura', email: 'csanchez@senati.pe' },
      { nombres: 'Rosa Isabel', apellidos: 'Flores Quispe', especialidad: 'Matemática y Ciencias Básicas', email: 'rflores@senati.pe' }
    ];

    for (const prof of profesoresData) {
      await Profesor.findOneAndUpdate(
        { email: prof.email },
        { ...prof, activo: true, tipoContrato: 'Tiempo Completo' },
        { upsert: true, new: true }
      );
    }
    console.log('✅ Profesores creados');

    console.log('🎉 PROCESO COMPLETADO EXITOSAMENTE');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error en el proceso:', error);
    process.exit(1);
  }
};

seedData();
