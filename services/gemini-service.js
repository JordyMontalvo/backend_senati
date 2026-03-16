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
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
  }

  async planificarBloque(contexto) {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY no configurada en el entorno.");
    }

    const { bloque, cursos, profesores, aulas, horariosExistentes } = contexto;

    const prompt = `
      Eres un experto en programación académica para SENATI. Necesito que planifiques el horario para el bloque ${bloque.codigo} (${bloque.turno}).
      
      CURSOS A PROGRAMAR (con sus horas totales):
      ${cursos.map(c => `- ${c.nombre} (${c.horasTotal}h total)`).join('\n')}
      
      RESTRICCIONES:
      1. Turno: ${bloque.turno}. Solo usa horas dentro de este rango.
      2. No debe haber cruces de aulas ni de profesores.
      3. Horarios ya ocupados en la institución: ${JSON.stringify(horariosExistentes.slice(0, 50))}
      4. Profesores especialistas asignados: ${profesores.map(p => p.apellidos).join(', ')}
      
      FORMATO DE SALIDA (JSON ÚNICAMENTE):
      [
        { "curso": "Nombre", "dia": "Lunes", "inicio": "07:45", "fin": "10:00", "tipo": "Teoría", "aula": "CodigoAula" }
      ]
      
      Genera una distribución equilibrada y eficiente.
    `;

    try {
      logger.ai(`🤖 Consultando a Gemini para el bloque ${bloque.codigo}...`);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Limpiar markdown si Gemini lo incluye
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      
      return JSON.parse(text);
    } catch (error) {
      logger.error("Error en GeminiService:", error);
      throw error;
    }
  }
}

module.exports = new GeminiService();
