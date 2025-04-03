import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  transports: ["websocket"], // 🔹 Solo WebSockets (sin polling)
  withCredentials: true, // ✅ Asegura que envía cookies y autenticación si es necesario
});

const WebSocketComponent = () => {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("🟢 Conectado a WebSockets con ID:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Desconectado de WebSockets");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <div>WebSocket conectado</div>;
};

export default WebSocketComponent;
