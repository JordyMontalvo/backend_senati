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
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Sanitizar JSON
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      
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
