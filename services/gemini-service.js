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
      1. FLEXIBILIDAD DOCENTE: Todos los profesores del pool están calificados para dictar CUALQUIER materia de CUALQUIER carrera de ETI (Software, Redes, Ciberseguridad, etc.). No hay restricción de especialidad.
      2. PRIORIDAD DE ASIGNACIÓN: Si un curso ya tiene un "DOCENTE ASIGNADO", es obligatorio usar ese docente. Si no tiene (SIN DOCENTE ASIGNADO), puedes sugerir libremente a cualquiera del pool.
      3. TIPO DE SESIÓN: 
         - Si son Horas Teoría -> Tipo: 'Teoría', Aula: 'Aula Común' o Pabellón K.
         - Si son Horas Taller -> Tipo: 'Taller', Aula: 'Laboratorio' o Pabellón 60TA/G.
         - Si son Horas Virtuales -> Tipo: 'Virtual', Aula: 'Entorno Virtual'.
      4. BLOQUES DE TIEMPO: Las sesiones típicas duran 2h 15m (3h pedagógicas) o 3h 00m (4h pedagógicas). Distribúyelas equitativamente.
      5. DISPONIBILIDAD: No cruces docente ni aula. Horarios externos ocupados: ${JSON.stringify(horariosOcupadosGlobal.slice(0, 40))}
      6. COMPLETITUD: Intenta cubrir el 100% de las horas (Teoría + Taller + Virtual) del curso en la semana.

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
