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
    // Estrategia 1: Buscar por especialidad
    let profesores = await Profesor.find({
      activo: true,
      especialidad: new RegExp(curso.nombre, 'i')
    });
    
    if (profesores.length > 0) {
      return profesores[0]; // Retornar el primero que coincida
    }
    
    // Estrategia 2: Buscar profesor menos cargado
    const todosProfesores = await Profesor.find({ activo: true });
    
    if (todosProfesores.length === 0) {
      return null;
    }
    
    // Calcular carga de trabajo para cada profesor
    const cargaPorProfesor = await Promise.all(
      todosProfesores.map(async (profesor) => {
        const asignaciones = await Asignacion.countDocuments({
          profesor: profesor._id
        });
        
        return { profesor, carga: asignaciones };
      })
    );
    
    // Ordenar por menor carga
    cargaPorProfesor.sort((a, b) => a.carga - b.carga);
    
    return cargaPorProfesor[0].profesor;
  }

  /**
   * Genera horarios óptimos sin conflictos
   */
  async generarHorariosOptimos(asignacion, bloque, curso) {
    const turno = (bloque.subPeriodo || 'mañana').toLowerCase();
    const configHorario = this.horariosPorTurno[turno] || this.horariosPorTurno.mañana;
    
    // Calcular cuántas sesiones necesita el curso (basado en horas)
    const horasSemanales = curso.horasSemanales || 4;
    const sesionesNecesarias = Math.ceil(horasSemanales / 2); // Sesiones de 2 horas
    
    let sesionesCreadas = 0;
    
    // Intentar asignar sesiones
    for (const dia of configHorario.dias) {
      if (sesionesCreadas >= sesionesNecesarias) break;
      
      for (const bloqueHorario of configHorario.bloques) {
        if (sesionesCreadas >= sesionesNecesarias) break;
        
        // Buscar aula disponible
        const aula = await this.buscarAulaDisponible(dia, bloqueHorario.inicio, bloqueHorario.fin);
        
        if (!aula) {
          console.log(`   ⚠️  No hay aulas disponibles para ${dia} ${bloqueHorario.inicio}-${bloqueHorario.fin}`);
          continue;
        }
        
        // Verificar conflicto de profesor
        const profesorOcupado = await this.verificarProfesorOcupado(
          asignacion.profesor,
          dia,
          bloqueHorario.inicio,
          bloqueHorario.fin
        );
        
        if (profesorOcupado) {
          continue;
        }
        
        // Crear horario
        await Horario.create({
          asignacion: asignacion._id,
          aula: aula._id,
          diaSemana: dia,
          horaInicio: bloqueHorario.inicio,
          horaFin: bloqueHorario.fin,
          tipoSesion: curso.tipo || 'Teoría'
        });
        
        sesionesCreadas++;
        this.horariosCreados++;
      }
    }
    
    console.log(`   📅 Horarios creados: ${sesionesCreadas}/${sesionesNecesarias} sesiones`);
  }

  /**
   * Busca un aula disponible en un horario específico
   */
  async buscarAulaDisponible(dia, horaInicio, horaFin) {
    const aulas = await Aula.find({ activo: true });
    
    for (const aula of aulas) {
      // Verificar si el aula está ocupada
      const ocupada = await Horario.exists({
        aula: aula._id,
        diaSemana: dia,
        $or: [
          {
            horaInicio: { $lte: horaInicio },
            horaFin: { $gt: horaInicio }
          },
          {
            horaInicio: { $lt: horaFin },
            horaFin: { $gte: horaFin }
          },
          {
            horaInicio: { $gte: horaInicio },
            horaFin: { $lte: horaFin }
          }
        ]
      });
      
      if (!ocupada) {
        return aula;
      }
    }
    
    return null;
  }

  /**
   * Verifica si un profesor está ocupado
   */
  async verificarProfesorOcupado(profesorId, dia, horaInicio, horaFin) {
    const asignaciones = await Asignacion.find({ profesor: profesorId });
    const asignacionIds = asignaciones.map(a => a._id);
    
    const ocupado = await Horario.exists({
      asignacion: { $in: asignacionIds },
      diaSemana: dia,
      $or: [
        {
          horaInicio: { $lte: horaInicio },
          horaFin: { $gt: horaInicio }
        },
        {
          horaInicio: { $lt: horaFin },
          horaFin: { $gte: horaFin }
        },
        {
          horaInicio: { $gte: horaInicio },
          horaFin: { $lte: horaFin }
        }
      ]
    });
    
    return ocupado;
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
