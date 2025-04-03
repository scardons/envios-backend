import { useEffect, useState } from "react";
import { fetchWithAuth } from "./services/api";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, Box, Paper, CircularProgress, Alert } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import socket from "./components/socket";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("⚠️ No tienes permiso para ver esta página. Inicia sesión.");
      navigate("/");
      return;
    }

    // ✅ Conectar WebSocket
    socket.connect();

    // ✅ Escuchar eventos del servidor
    socket.on("connect", () => {
      console.log("🟢 Conectado a WebSockets con ID:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Desconectado de WebSockets");
    });

    const fetchData = async () => {
      try {
        const result = await fetchWithAuth("/protected-route");
        setData(result);
      } catch (err) {
        setError("Error al cargar los datos");
      }
    };

    fetchData();

    return () => {
      socket.disconnect(); 
    };
  }, [navigate]);

  const handleLogout = () => {
    socket.disconnect(); 
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, position: "relative" }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, position: "relative" }}>
        
        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
          sx={{ position: "absolute", top: 10, right: 10 }}
        >
          Cerrar sesión
        </Button>

        <Typography variant="h4" gutterBottom textAlign="center">
          📦 Dashboard Logístico
        </Typography>

        {error && <Alert severity="error">⚠️ {error}</Alert>}
        {!data && !error && <CircularProgress sx={{ display: "block", mx: "auto", my: 2 }} />}

        {data && (
          <Box sx={{ backgroundColor: "#f4f4f4", p: 2, borderRadius: 1 }}>
            <Typography variant="body1">Datos Protegidos:</Typography>
            <pre style={{ overflowX: "auto" }}>{JSON.stringify(data, null, 2)}</pre>
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
          <Button variant="contained" color="primary" onClick={() => navigate("/dashboard/envios")}>
            ➕ Registrar Envío
          </Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/dashboard/envios/asignar-ruta")}> 
            🚛 Asignar Ruta
          </Button>
          <Button variant="contained" color="success" onClick={() => navigate("/dashboard/admin")}> 
            🔧 Panel de Administración
          </Button>
          <Button variant="contained" color="info" onClick={() => navigate("/tracking")}> 
            📍 Seguimiento de Envíos
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Dashboard;
