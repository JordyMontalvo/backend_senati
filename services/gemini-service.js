const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../utils/logger");

/**
 * Gemini Planner Service
 * Uses Google Generative AI to optimize schedules based on multiple constraints
 */
class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      // Actualizado a modelos 2.0 y Flash-Latest para evitar 404
      this.modelName = "gemini-2.0-flash"; 
      this.model = this.genAI.getGenerativeModel({ model: this.modelName });
    }
  }

  async planificarBloque(contexto, retries = 3) {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY no configurada.");
    }

    const { bloque, cursos, profesores, aulas, asignacionesActuales, horariosOcupadosGlobal } = contexto;

    const prompt = `
      Eres el motor de IA 'Sify', experto en planificación académica para SENATI.
      Tu misión es CREAR HORARIOS (Sesiones Semanales) para el bloque ${bloque.codigo} (NRC).
      
      ESTRUCTURA DEL BLOQUE:
      - Periodo: ${bloque.periodo?.codigo || 'Actual'}
      - Carrera: ${bloque.carrera?.nombre || 'General'}
      - Turno: ${bloque.turno || 'Mañana'} (Suele ser 07:45-12:30 o 13:15-18:00)

      CURSOS Y CARGA HORARIA (DISTRIBUIR HASTA COMPLETAR HORAS):
      ${cursos.map(c => {
        const asig = asignacionesActuales.find(a => String(a.cursoId) === String(c._id));
        const profActual = asig?.profesorNombre || 'SIN DOCENTE ASIGNADO';
        return `- ${c.nombre} (${c.codigo}):
          * Horas Teoría/Tecnología: ${c.horasTeoria}h
          * Horas Taller/Laboratorio: ${c.horasTaller}h
          * Horas Virtuales: ${c.horasVirtual}h
          * DOCENTE ASIGNADO: ${profActual}`;
      }).join('\n')}
      
      RECURSOS DISPONIBLES:
      - DOCENTES (Pool para sugerir si no hay asignación): ${profesores.map(p => `${p.apellidos} (${p.especialidad})`).join(', ')}
      - AMBIENTES: ${aulas.map(a => `${a.codigo} (${a.tipo})`).join(', ')}
      
      REGLAS DE ORO SENATI (ESCUELA ETI):
      1. FLEXIBILIDAD DOCENTE: Todos los profesores del pool están calificados para dictar CUALQUIER materia de CUALQUIER carrera de ETI. No hay restricción de especialidad rígida.
      2. DURACIÓN ACADÉMICA (CRÍTICO): 
         - Cursos con nombre 'SEMINARIO' (ej. Seminario de Oratoria): SIEMPRE duran las 16 SEMANAS completas del periodo. No reducirlos.
         - OTROS cursos: Deben ser MODULARES, típicamente de 4 a 8 semanas, según la carga de horas (Teoría + Taller). No los extiendas a 16 semanas si no es necesario.
      3. PRIORIDAD DE ASIGNACIÓN: Si un curso tiene "DOCENTE ASIGNADO", úsalo. Si no, sugiere uno libre del pool.
      4. TIPO DE SESIÓN: 
         - Teoría -> Pabellón K / Aula.
         - Taller -> Pabellón 60TA o G / Laboratorio.
         - Virtual -> Entorno Virtual.
      5. BLOQUES DE TIEMPO: Sesiones de 2h 15m o 3h 00m. Distribúyelas equitativamente. Evita huecos muertos.
      6. COMPLETITUD: Cubre el 100% de las horas del curso en la semana para su periodo correspondiente.

      FORMATO DE SALIDA (ESTRICTAMENTE JSON):
      [
        { 
          "curso": "Nombre Curso", 
          "profesor": "Apellidos Docente", 
          "dia": "Lunes", 
          "inicio": "07:45", 
          "fin": "10:00", 
          "aula": "CodigoAula",
          "tipo": "Teoría|Laboratorio|Taller|Virtual"
        }
      ]
    `;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        logger.ai(`🧠 Sify IA (Gemini) analizando bloque ${bloque.codigo} (Intento ${attempt}/${retries})...`);
        let result;
        try {
          result = await this.model.generateContent(prompt);
        } catch (e) {
          if (e.status === 404) {
             const fallbackModel = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
             result = await fallbackModel.generateContent(prompt);
          } else {
            throw e;
          }
        }

        const response = await result.response;
        let text = response.text();
        
        text = text.replace(/```json/g, "").replace(/```/g, "").replace(/`/g, "").trim();
        const firstBracket = text.indexOf('[');
        const lastBracket = text.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1) {
          text = text.substring(firstBracket, lastBracket + 1);
        }
        
        const jsonResponse = JSON.parse(text);
        logger.ai(`✅ Sify IA propuso ${jsonResponse.length} sesiones.`);
        return jsonResponse;

      } catch (error) {
        const isQuotaExceeded = error.status === 429 || error.message?.includes("quota") || error.message?.includes("429");
        
        if (isQuotaExceeded && attempt < retries) {
          const waitTime = attempt * 2000; // 2s, 4s...
          logger.warn(`⚠️ Cuota excedida. Reintentando en ${waitTime/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        logger.error(`Error en Sify Gemini Service (Intento ${attempt}):`, error.message);
        throw error;
      }
    }
  }
}

module.exports = new GeminiService();
