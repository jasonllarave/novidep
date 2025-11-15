// src/config/database.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Carga las variables desde .env

const connectDB = async () => {
  try {
    // Si tienes la variable en el archivo .env
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI ||"mongodb://127.0.0.1:27017/chatbot_novi";

    // Conexión a la base de datos
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(` MongoDB conectada: ${conn.connection.host}`);
  } catch (error) {
    console.error(" Error conectando a MongoDB:", error.message);
    process.exit(1); // Detiene el servidor si no hay conexión
  }
};

export default connectDB;
