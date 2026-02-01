require('dotenv').config();
const mongoose = require('mongoose');
const Zonal = require('./models/Zonal');
const Sede = require('./models/Sede');
const connectDB = require('./config/database');

const datosZonales = [
  {
    nombre: "Zonal Lima-Callao",
    sedes: [
      { nombre: "Sede Central (Independencia)", direccion: "Av. Alfredo Mendiola #3520, Independencia", tipo: "CFP" },
      { nombre: "CFP Surquillo", direccion: "Calle Bárbara D'Achille 280", tipo: "CFP" },
      { nombre: "CFP San Juan de Lurigancho", direccion: "Av. Canto Grande 2470", tipo: "CFP" },
      { nombre: "CFP Villa El Salvador", direccion: "Av. Pachacútec cuadra 6", tipo: "CFP" },
      { nombre: "CFP Callao (Ventanilla)", direccion: "Av. La Playa s/n", tipo: "CFP" },
      { nombre: "CFP Luis Cáceres Graziani", direccion: "Av. 28 de Julio 715", tipo: "ESCUELA" }
    ]
  },
  {
    nombre: "Zonal Arequipa-Puno",
    sedes: [
      { nombre: "CFP Arequipa", direccion: "Calle Miguel Forga Nº 246-Parque Industrial", tipo: "CFP" },
      { nombre: "CFP Puno", direccion: "Av. Estudiante 700, Salcedo", tipo: "CFP" },
      { nombre: "CFP Juliaca", direccion: "Av. Universal 208 Urb. Taparachi", tipo: "CFP" }
    ]
  },
  {
    nombre: "Zonal Piura-Tumbes",
    sedes: [
      { nombre: "CFP Piura", direccion: "Av. Los Diamantes s/n - Zona Industrial", tipo: "CFP" },
      { nombre: "CFP Tumbes", direccion: "Panamericana Norte Km 1276", tipo: "CFP" }
    ]
  },
  {
    nombre: "Zonal La Libertad",
    sedes: [
      { nombre: "CFP Trujillo", direccion: "Parque Industrial Mz. A Lote 11", tipo: "CFP" },
      { nombre: "Sede Pacasmayo", direccion: "Av. Enrique Valenzuela s/n", tipo: "UCP" }
    ]
  },
  {
    nombre: "Zonal Lambayeque",
    sedes: [
      { nombre: "CFP Chiclayo", direccion: "Av. Juan Tomis Stack N° 990", tipo: "CFP" }
    ]
  },
  {
    nombre: "Zonal Ancash",
    sedes: [
      { nombre: "CFP Chimbote", direccion: "Av. Universitaria s/n - Nuevo Chimbote", tipo: "CFP" },
      { nombre: "CFP Huaraz", direccion: "Av. Los Girasoles 176-A", tipo: "CFP" }
    ]
  },
  {
    nombre: "Zonal Ica-Ayacucho",
    sedes: [
      { nombre: "CFP Ica", direccion: "Av. Los Maestros s/n", tipo: "CFP" },
      { nombre: "CFP Chincha", direccion: "Calle Las Gardenias Nº 120", tipo: "CFP" },
      { nombre: "CFP Pisco", direccion: "Av. Las Américas 202", tipo: "CFP" },
       { nombre: "CFP Ayacucho", direccion: "Jr. Ayacucho 201", tipo: "CFP" }
    ]
  },
  {
    nombre: "Zonal Junín-Pasco-Huancavelica",
    sedes: [
      { nombre: "CFP Huancayo", direccion: "Av. Mariscal Castilla 4030", tipo: "CFP" },
      { nombre: "Sede Cerro de Pasco", direccion: "Jr. Crespo y Castillo #300", tipo: "CFP" }
    ]
  },
  {
    nombre: "Zonal Cusco-Apurímac-Madre de Dios",
    sedes: [
      { nombre: "CFP Cusco", direccion: "Av. Pedro Vilcapaza 305", tipo: "CFP" },
      { nombre: "CFP Abancay", direccion: "Av. Circunvalación 1515", tipo: "CFP" },
      { nombre: "CFP Puerto Maldonado", direccion: "Jr. Marco Ruiz 701", tipo: "CFP" }
    ]
  },
  {
    nombre: "Zonal Ucayali-Huánuco",
    sedes: [
      { nombre: "CFP Pucallpa", direccion: "Av. Centenario Km. 4.50", tipo: "CFP" },
      { nombre: "CFP Huánuco", direccion: "Jr. Hermilio Valdizán 871", tipo: "CFP" }
    ]
  },
  {
    nombre: "Zonal Cajamarca-Amazonas-San Martín",
    sedes: [
      { nombre: "CFP Cajamarca", direccion: "Km. 6 Carretera Cajamarca-Baños del Inca", tipo: "CFP" },
      { nombre: "CFP Moyobamba", direccion: "Jr. 20 de Abril s/n", tipo: "CFP" },
      { nombre: "UCP Chachapoyas", direccion: "Jr. Hermosura 531", tipo: "UCP" }
    ]
  },
  {
    nombre: "Zonal Loreto",
    sedes: [
      { nombre: "CFP Iquitos", direccion: "Av. 28 de Julio s/n - Punchana", tipo: "CFP" }
    ]
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log('🔌 Conectado a MongoDB...');

    // Limpiar colecciones
    await Zonal.deleteMany({});
    await Sede.deleteMany({});
    console.log('🧹 Colecciones Zonal y Sede limpiadas.');

    for (const data of datosZonales) {
      // Crear Zonal
      const nuevaZonal = await Zonal.create({ nombre: data.nombre });
      console.log(`✅ Zonal creada: ${data.nombre}`);

      // Crear Sedes vinculadas
      const sedesConRef = data.sedes.map(sede => ({
        ...sede,
        zonal: nuevaZonal._id
      }));

      await Sede.insertMany(sedesConRef);
      console.log(`   📍 ${data.sedes.length} sedes agregadas a ${data.nombre}`);
    }

    console.log('\n✨ Proceso de carga finalizado con éxito.');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

seedDB();
