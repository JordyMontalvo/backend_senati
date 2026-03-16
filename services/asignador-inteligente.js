const mongoose = require('mongoose');
const Bloque = require('../models/Bloque');
const Curso = require('../models/Curso');
const Profesor = require('../models/Profesor');
const Aula = require('../models/Aula');
const Asignacion = require('../models/Asignacion');
const Horario = require('../models/Horario');
const logger = require('../utils/logger');
const geminiService = require('./gemini-service');

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
    
    // Configuración de horarios por turno (Alineados con el GRID del frontend 07:45, etc)
    this.horariosPorTurno = {
      mañana: {
        dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        bloques: [
          { inicio: '07:45', fin: '10:00' },
          { inicio: '10:00', fin: '12:30' },
          { inicio: '12:30', fin: '14:45' }
        ]
      },
      tarde: {
        dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        bloques: [
          { inicio: '14:45', fin: '17:15' },
          { inicio: '17:15', fin: '19:30' },
          { inicio: '19:30', fin: '21:45' }
        ]
      },
      noche: {
        dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        bloques: [
          { inicio: '18:00', fin: '20:15' },
          { inicio: '20:15', fin: '22:30' }
        ]
      }
    };
  }

  /**
   * Asigna automáticamente todo para una lista de bloques
   */
  async asignarAutomaticamente(bloquesIds) {
    logger.ai(`🤖 Iniciando Sify-Engine para ${bloquesIds.length} bloques`);
    
    // Verificar si usamos IA Real (Gemini) o Heurística estándar
    const useSmartIA = !!process.env.GEMINI_API_KEY;
    if (useSmartIA) logger.ai("✨ Modo 'Smart Planner' activado via Sify (Gemini 2.0)");

    const bloques = await Bloque.find({ _id: { $in: bloquesIds } })
      .populate('carrera periodo');
    
    // Verificación de integridad: Confirmar que los bloques existen realmente en DB
    if (bloques.length !== bloquesIds.length) {
      logger.warn(`⚠️ Verificación DB: Se solicitaron ${bloquesIds.length} bloques, pero solo existen ${bloques.length} en la base de datos. Ajustando proceso...`);
    }

    logger.info(`📦 Cargados ${bloques.length} bloques verificados desde la BD`);

    // Limpieza de seguridad: Antes de asignar, eliminamos horarios previos de ESTOS bloques
    // para que la IA no choque consigo misma y tengamos una base limpia
    for (const b of bloques) {
      const asignacionesIds = await Asignacion.find({ bloque: b._id }).select('_id');
      await Horario.deleteMany({ asignacion: { $in: asignacionesIds.map(a => a._id) } });
      logger.info(`🧹 Limpieza completada para el bloque ${b.codigo}`);
    }
    
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
    logger.ai(`Procesando Bloque: ${bloque.codigo} (${bloque.carrera.nombre})`);
    
    // 1. Obtener cursos del semestre y carrera
    const cursos = await this.obtenerCursosParaBloque(bloque);
    
    if (cursos.length === 0) {
      logger.warn(`No hay cursos curriculares definidos para el Bloque ${bloque.codigo} (Semestre ${bloque.semestreAcademico})`);
      return;
    }
    
    logger.info(`   📚 Cursos identificados: ${cursos.length} para el semestre actual`);
    
    // 2. Si usamos Gemini, intentamos una planificación integral
    const useSmartIA = !!process.env.GEMINI_API_KEY;
    if (useSmartIA) {
      try {
        await this.planificarConIA(bloque, cursos);
        return; // Terminamos si la IA lo resolvió
      } catch (e) {
        logger.warn(`⚠️ Sify IA falló para ${bloque.codigo}, usando heurística de respaldo.`);
      }
    }

    // 2. Respaldo: Para cada curso, asignar profesor y crear horarios
    for (const curso of cursos) {
      try {
        await this.asignarCurso(bloque, curso);
      } catch (error) {
        logger.error(`Falló asignación del curso ${curso.nombre} en bloque ${bloque.codigo}`, error.message);
      }
    }
  }

  /**
   * Delegación total a Gemini para la planificación del bloque
   */
  async planificarConIA(bloque, cursos) {
    const profesores = await Profesor.find({ activo: true });
    const aulas = await Aula.find({ activo: true });
    const horariosExistentes = await Horario.find().populate({
      path: 'asignacion',
      populate: { path: 'bloque' }
    });

    const context = {
      bloque,
      cursos,
      profesores,
      aulas,
      // Filtramos para que la IA NO vea como conflicto el propio bloque que está planificando
      horariosExistentes: horariosExistentes
        .filter(h => h.asignacion?.bloque?._id.toString() !== bloque._id.toString())
        .map(h => ({
          dia: h.diaSemana,
          inicio: h.horaInicio,
          aula: h.aula?.codigo,
          profesor: h.asignacion?.profesor?.apellidos,
          bloque: h.asignacion?.bloque?.codigo
        }))
    };

    const plan = await geminiService.planificarBloque(context);

    // Guardar resultados del plan
    for (const item of plan) {
      const curso = cursos.find(c => c.nombre === item.curso || c.codigo === item.curso);
      if (!curso) continue;

      // 1. Asegurar asignación
      let asig = await Asignacion.findOne({ bloque: bloque._id, curso: curso._id });
      if (!asig) {
        // Búsqueda borrosa de profesor por apellido
        let profId;
        const apellidoIA = item.profesor?.split(' ').pop() || item.profesor;
        const profMatch = profesores.find(p => 
          p.apellidos.toLowerCase().includes(apellidoIA.toLowerCase()) ||
          apellidoIA.toLowerCase().includes(p.apellidos.toLowerCase())
        );

        profId = profMatch?._id || profesores[0]?._id;

        asig = await Asignacion.create({
          bloque: bloque._id,
          curso: curso._id,
          profesor: profId,
          aula: aulas.find(a => a.codigo === item.aula)?._id
        });
        this.asignacionesCreadas++;
      }

      // 2. Crear horarios
      const existe = await Horario.exists({ asignacion: asig._id, diaSemana: item.dia, horaInicio: item.inicio });
      if (!existe) {
        const aulaRef = aulas.find(a => a.codigo === item.aula) || asig.aula;
        await Horario.create({
          asignacion: asig._id,
          diaSemana: item.dia,
          horaInicio: item.inicio,
          horaFin: item.fin,
          tipoSesion: item.tipo || 'Teoría',
          aula: aulaRef?._id
        });
        this.horariosCreados++;
      }
    }
  }

  /**
   * Obtiene los cursos que corresponden al bloque
   */
  async obtenerCursosParaBloque(bloque) {
    const semestreNorm = this.normalizarSemestre(bloque.semestreAcademico);
    return await Curso.find({
      carrera: bloque.carrera._id,
      semestre: semestreNorm
    });
  }

  /**
   * Normaliza el formato de semestre (ej: IIII -> IV, 4 -> IV, "SEM 1" -> I)
   */
  normalizarSemestre(sem) {
    if (!sem) return 'I';
    
    // Limpieza profunda: Quitar palabras comunes y espacios
    let s = sem.toString().toUpperCase()
      .replace(/SEMESTRE|CICLO|SEM|NIVEL|/g, '')
      .trim();

    const map = {
      '1': 'I', '01': 'I', 'I': 'I', 'PRIMERO': 'I', 'PRIMER': 'I', 'I-I': 'I',
      '2': 'II', '02': 'II', 'II': 'II', 'SEGUNDO': 'II', 'II-II': 'II',
      '3': 'III', '03': 'III', 'III': 'III', 'TERCERO': 'III', 'III-III': 'III',
      '4': 'IV', '04': 'IV', 'IV': 'IV', 'IIII': 'IV', 'CUARTO': 'IV', 'IV-IV': 'IV',
      '5': 'V', '05': 'V', 'V': 'V', 'IIIII': 'V', 'QUINTO': 'V', 'V-V': 'V',
      '6': 'VI', '06': 'VI', 'VI': 'VI', 'IIIIII': 'VI', 'SEXTO': 'VI', 'VI-VI': 'VI'
    };
    
    // Si no está en el mapa, intentamos extraer los caracteres de números romanos o dígitos
    if (!map[s]) {
      const match = s.match(/(IV|VI|[IVXLCDM]+|\d+)/);
      if (match) s = match[0];
    }

    return map[s] || s;
  }

  /**
   * Normaliza el turno/subPeriodo para consistencia en la UI y lógica
   */
  normalizarTurno(turno) {
    if (!turno) return 'mañana';
    const t = turno.toString().toLowerCase().trim();
    
    if (t.includes('mañ') || t.includes('am') || t.includes('morn')) return 'mañana';
    if (t.includes('tar') || t.includes('pm') || t.includes('after')) return 'tarde';
    if (t.includes('noc') || t.includes('night') || t.includes('eve')) return 'noche';
    
    return t;
  }

  /**
   * Asigna un curso a un bloque con profesor y horarios
   */
  async asignarCurso(bloque, curso) {
    // 0. Omitir si es Formación en Empresa (no requiere horario físico en SENATI)
    const nombreLower = curso.nombre.toLowerCase();
    if (nombreLower.includes('empresa') && nombreLower.includes('práctica')) {
      logger.ai(`   🌴 Curso ${curso.nombre} es en empresa. Omitiendo generación de horarios.`);
      return;
    }

    // 1. Buscar si ya existe asignación
    let asignacion = await Asignacion.findOne({
      bloque: bloque._id,
      curso: curso._id
    });
    
    if (asignacion) {
      const horasAsignadas = await this.calcularHorasAsignadas(asignacion._id);
      if (horasAsignadas >= (curso.horasTotal || 4)) {
        logger.ai(`   ⏭️  Curso ${curso.nombre} ya completado (${horasAsignadas}h/${curso.horasTotal}h)`);
        return;
      }
      logger.ai(`   🔄  Curso ${curso.nombre} con asignación parcial (${horasAsignadas}h). Completando...`);
    } else {
      // 2. Seleccionar profesor inteligentemente
      const profesor = await this.seleccionarProfesorOptimo(curso);
      
      if (profesor) {
        logger.ai(`Heurística: ${profesor.nombres} ${profesor.apellidos} seleccionado por especialidad/carga baja`);
      } else {
        logger.warn(`Heurística: No se encontró docente idóneo para ${curso.nombre}`);
        return;
      }
      
      // 3. Crear la asignación
      asignacion = await Asignacion.create({
        bloque: bloque._id,
        curso: curso._id,
        profesor: profesor._id,
        observaciones: 'Asignado automáticamente por IA Engine v2.1'
      });
      
      this.asignacionesCreadas++;
      logger.success(`Asignación vinculada: ${curso.nombre} @ ${profesor.apellidos}`);
    }
    
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
   * Calcula cuántas horas pedagógicas (45min) tiene ya una asignación
   */
  async calcularHorasAsignadas(asignacionId) {
    const horarios = await Horario.find({ asignacion: asignacionId });
    return horarios.reduce((sum, h) => {
      const [h1, m1] = h.horaInicio.split(':').map(Number);
      const [h2, m2] = h.horaFin.split(':').map(Number);
      const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
      return sum + Math.ceil(diff / 45);
    }, 0);
  }

  /**
   * Genera horarios óptimos sin conflictos
   */
  async generarHorariosOptimos(asignacion, bloque, curso) {
    const turnoRaw = bloque.subPeriodo || 'mañana';
    const turno = this.normalizarTurno(turnoRaw);
    const config = this.horariosPorTurno[turno] || this.horariosPorTurno.mañana;
    
    const horasSemanales = curso.horasTotal || curso.horasSemanales || 4;
    let horasAsignadas = await this.calcularHorasAsignadas(asignacion._id);
    
    // Calcular cuántas horas pedagógicas (bloques de 45m) faltan realmente
    let horasFaltantes = horasSemanales - horasAsignadas;
    
    if (horasFaltantes <= 0) {
      logger.ai(`   ✅ Curso ${curso.nombre} ya tiene todas sus horas (${horasAsignadas}/${horasSemanales})`);
      return;
    }
    
    // Intentar bloques de 3h (135 min) que equivalen a 3 horas pedagógicas
    let sesionesDeseadas = Math.ceil(horasFaltantes / 3); 
    
    let creadas = 0;

    // ESTRATEGIA: Intentar llenar los días secuencialmente para evitar huecos (gaps)
    for (const dia of config.dias) {
      if (creadas >= sesionesDeseadas) break;
      
      for (const slot of config.bloques) {
        if (creadas >= sesionesDeseadas) break;

        // 1. Determinar tipo de aula necesaria
        let tipoAulaRequerida = 'Aula Común';
        const nombreLower = curso.nombre.toLowerCase();
        if (nombreLower.includes('laboratorio') || nombreLower.includes('computo') || nombreLower.includes('software')) {
          tipoAulaRequerida = 'Laboratorio';
        } else if (nombreLower.includes('taller') || nombreLower.includes('maquinaria') || nombreLower.includes('mantenimiento')) {
          tipoAulaRequerida = 'Taller';
        }

        // 2. Buscar aula disponible
        const aula = await this.buscarAulaDisponible(dia, slot.inicio, slot.fin, tipoAulaRequerida);
        if (!aula) continue;

        // 3. Verificar profesor libre
        const profOcupado = await this.verificarProfesorOcupado(asignacion.profesor, dia, slot.inicio, slot.fin);
        if (profOcupado) continue;

        // 4. Verificar bloque libre (no superponer cursos del mismo bloque)
        const asigIds = await Asignacion.find({ bloque: bloque._id }).select('_id');
        const bloqueOcupado = await Horario.exists({
            asignacion: { $in: asigIds.map(a => a._id) },
            diaSemana: dia,
            $or: [
              { horaInicio: { $lt: slot.fin }, horaFin: { $gt: slot.inicio } }
            ]
        });
        if (bloqueOcupado) continue;

        // 5. Crear horario
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

    if (creadas > 0) {
      logger.ai(`   🕒 Generados ${creadas} bloques de horario para ${curso.nombre} (${creadas * 3}h pedagógicas)`);
    } else if (sesionesDeseadas > 0) {
      logger.warn(`   ⚠️ No se pudieron encontrar huecos disponibles para ${curso.nombre} en el turno ${turno}`);
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
