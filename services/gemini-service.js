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
      // Intentar usar el modelo flash más reciente, con fallback
      this.modelName = "gemini-1.5-flash";
      this.model = this.genAI.getGenerativeModel({ model: this.modelName });
    }
  }

  async planificarBloque(contexto) {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY no configurada.");
    }

    const { bloque, cursos, profesores, aulas, horariosExistentes } = contexto;

    const prompt = `
      Eres el motor de IA 'Sify' para SENATI. Necesito planificar el bloque ${bloque.codigo} (Turno: ${bloque.turno}).
      
      CURSOS A PROGRAMAR:
      ${cursos.map(c => `- ${c.nombre} (Semanales: ${c.horasSemanales || 4}h)`).join('\n')}
      
      RECURSOS DISPONIBLES:
      - Docentes Expertos: ${profesores.map(p => `${p.apellidos} (${p.especialidad})`).join(', ')}
      - Aulas/Laboratorios: ${aulas.map(a => `${a.codigo} (${a.tipo})`).join(', ')}
      
      RESTRICCIONES SENATI:
      1. Horarios permitidos: Lunes a Sábado.
      2. No cruces de docente ni aula. Considera horarios ocupados: ${JSON.stringify(horariosExistentes.slice(0, 30))}
      3. Importante: "Formación en Empresa" no se programa en el aula.
      4. Los bloques de clase son usualmente de 2h 15m (3h pedagógicas).
      
      FORMATO DE SALIDA (ESTRICTAMENTE JSON):
      [
        { 
          "curso": "Nombre Exacto", 
          "profesor": "Apellidos Docente", 
          "dia": "Lunes", 
          "inicio": "07:45", 
          "fin": "10:00", 
          "aula": "CodigoAula",
          "tipo": "Teoría/Laboratorio/Taller"
        }
      ]
    `;

    try {
      logger.ai(`🧠 Sify IA (Gemini) analizando bloque ${bloque.codigo}...`);
      let result;
      try {
        result = await this.model.generateContent(prompt);
      } catch (e) {
        if (e.status === 404) {
          logger.warn("⚠️ Modelo Flash no hallado, intentando con Gemini Pro...");
          const fallbackModel = this.genAI.getGenerativeModel({ model: "gemini-pro" });
          result = await fallbackModel.generateContent(prompt);
        } else {
          throw e;
        }
      }

      const response = await result.response;
      let text = response.text();
      
      // Sanitizar JSON (remover markdown, espacios extras, etc)
      text = text.replace(/```json/g, "").replace(/```/g, "").replace(/`/g, "").trim();
      
      // Encontrar el primer [ y el último ]
      const firstBracket = text.indexOf('[');
      const lastBracket = text.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1) {
        text = text.substring(firstBracket, lastBracket + 1);
      }
      
      const jsonResponse = JSON.parse(text);
      logger.ai(`✅ Sify IA propuso ${jsonResponse.length} sesiones óptimas.`);
      return jsonResponse;
    } catch (error) {
      logger.error("Error en Sify Gemini Service:", error);
      throw error;
    }
  }
}

module.exports = new GeminiService();
