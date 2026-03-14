const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

// Register models
require('./models/Carrera');
const Curso = require('./models/Curso');
const Bloque = require('./models/Bloque');

async function main() {
  try {
    console.log("Connecting to:", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully.");

    const totalCursos = await Curso.countDocuments();
    console.log("Total courses in DB:", totalCursos);

    const totalBloques = await Bloque.countDocuments();
    console.log("Total blocks in DB:", totalBloques);

    const bloque = await Bloque.findOne().populate('carrera');
    if (!bloque) {
      console.log("No blocks found in DB.");
      const anyCurso = await Curso.findOne();
      if (anyCurso) {
          console.log("Found a course anyway:", {
              id: anyCurso._id,
              nombre: anyCurso.nombre,
              carrera: anyCurso.carrera,
              semestre: anyCurso.semestre
          });
      }
      return;
    }

    console.log("Inspecting Bloque:", {
      id: bloque._id.toString(),
      codigo: bloque.codigo,
      carrera_id: bloque.carrera ? (bloque.carrera._id || bloque.carrera).toString() : null,
      semestreAcademico: bloque.semestreAcademico
    });

    const carreraId = bloque.carrera ? (bloque.carrera._id || bloque.carrera) : null;
    
    if (carreraId) {
        // Find courses for this career
        const cursosPorCarrera = await Curso.find({ carrera: carreraId });
        console.log(`Found ${cursosPorCarrera.length} courses for this career ID: ${carreraId}`);
        
        if (cursosPorCarrera.length > 0) {
            const semestresDisponibles = [...new Set(cursosPorCarrera.map(c => c.semestre))];
            console.log("Semesters available for this career in courses:", semestresDisponibles);
            
            const matchedCursos = cursosPorCarrera.filter(c => 
                String(c.semestre || '').trim().toUpperCase() === String(bloque.semestreAcademico || '').trim().toUpperCase()
            );
            console.log(`Found ${matchedCursos.length} matching courses for semester: "${bloque.semestreAcademico}"`);
            
            if (matchedCursos.length === 0 && cursosPorCarrera.length > 0) {
                console.log("Example course from this career (first 1):", {
                    nombre: cursosPorCarrera[0].nombre,
                    semestreOriginal: cursosPorCarrera[0].semestre,
                    semestreTrimmed: String(cursosPorCarrera[0].semestre || '').trim().toUpperCase()
                });
            }
        }
    }

  } catch(e) {
    console.error("Error in script:", e);
  } finally {
    await mongoose.disconnect();
  }
}
main();
