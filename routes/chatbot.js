const express = require('express');
const router = express.Router();
const Horario = require('../models/Horario');
const Asignacion = require('../models/Asignacion');
const Profesor = require('../models/Profesor');
const Aula = require('../models/Aula');
const Bloque = require('../models/Bloque');

/**
 * POST /api/chatbot/ask
 * Procesa preguntas sobre el sistema de horarios
 */
router.post('/ask', async (req, res) => {
  try {
    const { message } = req.body;
    const msg = message.toLowerCase();
    
    let response = "";

    // Lógica de respuesta basada en palabras clave
    if (msg.includes('profesor') || msg.includes('docente') || msg.includes('quién')) {
      if (msg.includes('bloque')) {
        const codigoBloque = msg.match(/[n-][j-][i-]\w+/i)?.[0] || "";
        if (codigoBloque) {
            const bloque = await Bloque.findOne({ codigo: new RegExp(codigoBloque, 'i') });
            if (bloque) {
                const asigs = await Asignacion.find({ bloque: bloque._id }).populate('profesor curso');
                if (asigs.length > 0) {
                    response = `Para el bloque **${bloque.codigo}**, los docentes asignados son: <br>` + 
                               asigs.map(a => `- **${a.profesor.nombres} ${a.profesor.apellidos}** (${a.curso.nombre})`).join('<br>');
                } else {
                    response = `El bloque **${bloque.codigo}** aún no tiene docentes vinculados.`;
                }
            } else {
                response = `No encontré ningún bloque con el código **${codigoBloque}**.`;
            }
        } else {
            response = "Dime el código del bloque (ej: NIID-301) para decirte qué profesores tiene.";
        }
      } else {
        const totalProfs = await Profesor.countDocuments({ activo: true });
        response = `Actualmente tenemos **${totalProfs}** docentes registrados en el sistema.`;
      }
    } 
    else if (msg.includes('aula') || msg.includes('libre')) {
      const totalAulas = await Aula.countDocuments({ activo: true });
      response = `Contamos con **${totalAulas}** ambientes de aprendizaje entre aulas teóricas y laboratorios. `;
      if (msg.includes('libre')) {
        response += "Para ver la disponibilidad en tiempo real, te recomiendo ir a la sección de **Infraestructura**.";
      }
    }
    else if (msg.includes('horario') || msg.includes('clase')) {
        const totalHorarios = await Horario.countDocuments();
        response = `Hay un total de **${totalHorarios}** sesiones programadas para este ciclo académico.`;
    }
    else {
      response = "Hola, soy **Sify**, tu asistente de SENATI. Puedo decirte quién enseña en un bloque, cuántas aulas tenemos o el estado general de la programación. ¿Qué necesitas saber?";
    }

    res.json({ success: true, response });

  } catch (error) {
    console.error('Error chatbot:', error);
    res.status(500).json({ success: false, message: 'Fallo al procesar consulta' });
  }
});

module.exports = router;
