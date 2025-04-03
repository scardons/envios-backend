import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
const cors = require("cors");
import helmet from "helmet";
import authRoutes from "./routes/authRoutes";
import protectedRoutes from "./routes/protected";
import envios from "./routes/envios";
import enviosRoutes from "./routes/enviosAutentic";
import seguimientoRoutes from "./routes/seguimientoRoutes";

// Configurar variables de entorno
dotenv.config();

const app = express();
const server = http.createServer(app); 

// 🔹 **Mantén solo UNA instancia de `io`**
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, 
  },
  transports: ["websocket", "polling"], 
});


console.log("🔑 JWT_SECRET:", process.env.JWT_SECRET || "No detectado");

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, 
}));
app.use(helmet());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/envios", envios);
app.use("/api/envios-auth", enviosRoutes);
app.use("/api/seguimiento", seguimientoRoutes);

io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado a WebSockets con ID:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado de WebSockets");
  });
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("🚀 Servidor funcionando correctamente");
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

// Exportar `io` para usarlo en otros archivos si es necesario
export { io };
