const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const Curso = require('./models/Curso');
const Bloque = require('./models/Bloque');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const cursos = await Curso.find().populate('carrera').limit(5);
    console.log("Cursos sample:", JSON.stringify(cursos.map(c => ({
      nombre: c.nombre,
      semestre: c.semestre,
      carrera_id: c.carrera ? (c.carrera._id || c.carrera) : null
    })), null, 2));

    const bloques = await Bloque.find().populate('carrera').limit(5);
    console.log("Bloques sample:", JSON.stringify(bloques.map(b => ({
      codigo: b.codigo,
      semestreAcademico: b.semestreAcademico,
      carrera_id: b.carrera ? (b.carrera._id || b.carrera) : null
    })), null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
  }
}
main();
