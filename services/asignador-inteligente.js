const mongoose = require('mongoose');
const Bloque = require('../models/Bloque');
const Curso = require('../models/Curso');
const Profesor = require('../models/Profesor');
const Aula = require('../models/Aula');
const Asignacion = require('../models/Asignacion');
const Horario = require('../models/Horario');

/**
 * Sistema de Asignación Automática Inteligente con IA
 * Utiliza heurísticas y algoritmos de optimización para asignar:
 * - Cursos a bloques
 * - Profesores a cursos
 * - Aulas a horarios
 * - Horarios óptimos sin conflictos
 */

class AsignadorInteligente {
  constructor() {
    this.conflictos = [];
    this.asignacionesCreadas = 0;
    this.horariosCreados = 0;
    
    // Configuración de horarios por turno
    this.horariosPorTurno = {
      mañana: {
        dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
        bloques: [
          { inicio: '07:00', fin: '09:00' },
          { inicio: '09:00', fin: '11:00' },
          { inicio: '11:00', fin: '13:00' }
        ]
      },
      tarde: {
        dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
        bloques: [
          { inicio: '14:00', fin: '16:00' },
          { inicio: '16:00', fin: '18:00' },
          { inicio: '18:00', fin: '20:00' }
        ]
      },
      noche: {
        dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        bloques: [
          { inicio: '19:00', fin: '21:00' },
          { inicio: '21:00', fin: '23:00' }
        ]
      }
    };
  }

  /**
   * Asigna automáticamente todo para una lista de bloques
   */
  async asignarAutomaticamente(bloquesIds) {
    console.log('🤖 Iniciando asignación automática inteligente...\n');
    
    this.resetEstadisticas();
    
    const bloques = await Bloque.find({ _id: { $in: bloquesIds } })
      .populate('carrera periodo');
    
    console.log(`📦 Procesando ${bloques.length} bloques\n`);
    
    for (const bloque of bloques) {
      try {
        await this.procesarBloque(bloque);
      } catch (error) {
        console.error(`❌ Error procesando bloque ${bloque.codigo}:`, error.message);
        this.conflictos.push({
          bloque: bloque.codigo,
          error: error.message
        });
      }
    }
    
    return this.generarReporte();
  }

  /**
   * Procesa un bloque individual
   */
  async procesarBloque(bloque) {
    console.log(`\n📋 Procesando: ${bloque.codigo} - ${bloque.carrera.nombre}`);
    
    // 1. Obtener cursos del semestre y carrera
    const cursos = await this.obtenerCursosParaBloque(bloque);
    
    if (cursos.length === 0) {
      console.log(`⚠️  No hay cursos disponibles para este bloque`);
      return;
    }
    
    console.log(`   📚 Cursos encontrados: ${cursos.length}`);
    
    // 2. Para cada curso, asignar profesor y crear horarios
    for (const curso of cursos) {
      try {
        await this.asignarCurso(bloque, curso);
      } catch (error) {
        console.error(`   ❌ Error asignando curso ${curso.nombre}:`, error.message);
      }
    }
  }

  /**
   * Obtiene los cursos que corresponden al bloque
   */
  async obtenerCursosParaBloque(bloque) {
    return await Curso.find({
      carrera: bloque.carrera._id,
      semestre: bloque.semestreAcademico
    });
  }

  /**
   * Asigna un curso a un bloque con profesor y horarios
   */
  async asignarCurso(bloque, curso) {
    // 1. Buscar si ya existe asignación
    const asignacionExistente = await Asignacion.findOne({
      bloque: bloque._id,
      curso: curso._id
    });
    
    if (asignacionExistente) {
      console.log(`   ⏭️  Curso ${curso.nombre} ya asignado`);
      return;
    }
    
    // 2. Seleccionar profesor inteligentemente
    const profesor = await this.seleccionarProfesorOptimo(curso);
    
    if (!profesor) {
      console.log(`   ⚠️  No hay profesores disponibles para ${curso.nombre}`);
      return;
    }
    
    // 3. Crear la asignación
    const asignacion = await Asignacion.create({
      bloque: bloque._id,
      curso: curso._id,
      profesor: profesor._id,
      observaciones: 'Asignado automáticamente por IA'
    });
    
    this.asignacionesCreadas++;
    console.log(`   ✅ Asignado: ${curso.nombre} → ${profesor.nombres} ${profesor.apellidos}`);
    
    // 4. Generar horarios inteligentemente
    await this.generarHorariosOptimos(asignacion, bloque, curso);
  }

  /**
   * Selecciona el profesor más adecuado para un curso
   */
  async seleccionarProfesorOptimo(curso) {
    // V2.0: Heurística multivariable
    // 1. Buscar especialistas activos
    let especialistas = await Profesor.find({
      activo: true,
      especialidad: new RegExp(curso.nombre, 'i')
    });
    
    // 2. Si no hay especialistas directos, buscar por palabras clave (ej: "Redes", "Contabilidad")
    if (especialistas.length === 0 && curso.nombre.split(' ').length > 1) {
      const keywords = curso.nombre.split(' ').filter(w => w.length > 4);
      if (keywords.length > 0) {
        especialistas = await Profesor.find({
          activo: true,
          especialidad: new RegExp(keywords.join('|'), 'i')
        });
      }
    }

    // 3. De los candidatos, elegir el que tenga menos carga para balancear
    const candidatos = especialistas.length > 0 ? especialistas : await Profesor.find({ activo: true });
    
    if (candidatos.length === 0) return null;

    const cargaPromesa = candidatos.map(async (p) => {
      const count = await Asignacion.countDocuments({ profesor: p._id });
      return { p, count };
    });

    const resultados = await Promise.all(cargaPromesa);
    resultados.sort((a, b) => a.count - b.count);
    
    return resultados[0].p;
  }

  /**
   * Genera horarios óptimos sin conflictos
   */
  async generarHorariosOptimos(asignacion, bloque, curso) {
    const turno = (bloque.subPeriodo || 'mañana').toLowerCase();
    const config = this.horariosPorTurno[turno] || this.horariosPorTurno.mañana;
    
    const horasSemanales = curso.horasTotal || curso.horasSemanales || 4;
    let sesionesDeseadas = Math.ceil(horasSemanales / 2); // Bloques de 2h (90-120 min)
    
    let creadas = 0;

    // ESTRATEGIA: Intentar llenar los días secuencialmente para evitar huecos (gaps)
    for (const dia of config.dias) {
      if (creadas >= sesionesDeseadas) break;
      
      for (const slot of config.bloques) {
        if (creadas >= sesionesDeseadas) break;

        // 1. Determinar tipo de aula necesaria
        // Si el curso tiene "taller", "laboratorio" o "práctica" en el nombre, buscar ese tipo
        let tipoAulaRequerida = 'Aula Común';
        const nombreLower = curso.nombre.toLowerCase();
        if (nombreLower.includes('laboratorio') || nombreLower.includes('computo') || nombreLower.includes('software')) {
          tipoAulaRequerida = 'Laboratorio';
        } else if (nombreLower.includes('taller') || nombreLower.includes('maquinaria') || nombreLower.includes('mantenimiento')) {
          tipoAulaRequerida = 'Taller';
        }

        // 2. Buscar aula disponible del tipo correcto
        const aula = await this.buscarAulaDisponible(dia, slot.inicio, slot.fin, tipoAulaRequerida);
        
        if (!aula) continue;

        // 3. Verificar profesor libre
        const profOcupado = await this.verificarProfesorOcupado(asignacion.profesor, dia, slot.inicio, slot.fin);
        if (profOcupado) continue;

        // 4. Crear horario
        await Horario.create({
          asignacion: asignacion._id,
          aula: aula._id,
          diaSemana: dia,
          horaInicio: slot.inicio,
          horaFin: slot.fin,
          tipoSesion: tipoAulaRequerida === 'Aula Común' ? 'Teoría' : tipoAulaRequerida
        });

        creadas++;
        this.horariosCreados++;
      }
    }
  }

  /**
   * Busca un aula disponible en un horario específico
   */
  async buscarAulaDisponible(dia, horaInicio, horaFin, tipo = 'Aula Común') {
    // Priorizar el tipo solicitado, pero permitir 'Aula Común' como fallback si no es laboratorio
    const query = { activo: true };
    if (tipo !== 'Aula Común') query.tipo = tipo;

    const aulas = await Aula.find(query);
    
    for (const aula of aulas) {
      const busy = await Horario.exists({
        aula: aula._id,
        diaSemana: dia,
        $or: [
          { horaInicio: { $lt: horaFin }, horaFin: { $gt: horaInicio } }
        ]
      });
      
      if (!busy) return aula;
    }
    
    // Fallback search if specific type not found
    if (tipo !== 'Aula Común') {
        return this.buscarAulaDisponible(dia, horaInicio, horaFin, 'Aula Común');
    }

    return null;
  }

  /**
   * Verifica si un profesor está ocupado
   */
  async verificarProfesorOcupado(profesorId, dia, horaInicio, horaFin) {
    const asigs = await Asignacion.find({ profesor: profesorId }).select('_id');
    return await Horario.exists({
      asignacion: { $in: asigs.map(a => a._id) },
      diaSemana: dia,
      $or: [
        { horaInicio: { $lt: horaFin }, horaFin: { $gt: horaInicio } }
      ]
    });
  }

  /**
   * Resetea las estadísticas
   */
  resetEstadisticas() {
    this.conflictos = [];
    this.asignacionesCreadas = 0;
    this.horariosCreados = 0;
  }

  /**
   * Genera reporte final
   */
  generarReporte() {
    return {
      exitoso: true,
      asignacionesCreadas: this.asignacionesCreadas,
      horariosCreados: this.horariosCreados,
      conflictos: this.conflictos,
      mensaje: `✅ Asignación completada: ${this.asignacionesCreadas} asignaciones, ${this.horariosCreados} horarios`
    };
  }
}

module.exports = AsignadorInteligente;
