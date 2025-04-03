import { useState } from "react";
import { TextField, Button, Container, Typography, Box, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        alert("✅ Inicio de sesión exitoso");
        navigate("/dashboard");
      } else {
        setError(data.message || "⚠️ Credenciales incorrectas");
      }
    } catch {
      setError("❌ Error en la conexión con el servidor.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, borderRadius: 2, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Iniciar Sesión
        </Typography>
        {error && (
          <Typography color="error" variant="body1" mb={2}>
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Contraseña"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
          />

          <Box display="flex" justifyContent="space-between" mt={3}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              sx={{ fontWeight: "bold", borderRadius: 2, paddingX: 3 }}
            >
              Iniciar Sesión
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/register")}
              sx={{ fontWeight: "bold", borderRadius: 2, paddingX: 3, borderWidth: 2 }}
            >
              Crear Usuario
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
