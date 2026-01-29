const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Opciones de conexión (las versiones nuevas de Mongoose ya no necesitan muchas)
    });

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    
    // Event listeners para la conexión
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB desconectado');
    });

    // Manejo de cierre graceful
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB desconectado por finalización de la aplicación');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error de conexión a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
