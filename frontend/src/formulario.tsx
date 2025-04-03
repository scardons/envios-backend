import { useState } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Formulario = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
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
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        alert("✅ Usuario registrado correctamente");
        setFormData({ name: "", email: "", password: "" });
        navigate("/login");
      } else {
        setError(data.message || "⚠️ Error en el registro");
      }
    } catch {
      setError("❌ Error en la conexión con el servidor.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5, p: 4, boxShadow: 3, borderRadius: 2, bgcolor: "white" }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold" color="primary">
        Registro de Usuario
      </Typography>
      {error && <Typography color="error" variant="body1">{error}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField fullWidth label="Nombre" name="name" value={formData.name} onChange={handleChange} margin="normal" />
        <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} margin="normal" />
        <TextField fullWidth label="Contraseña" name="password" type="password" value={formData.password} onChange={handleChange} margin="normal" />
        <Box display="flex" justifyContent="space-between" mt={3}>
          <Button variant="contained" color="primary" type="submit" sx={{ px: 4, py: 1.5, fontWeight: "bold" }}>
            Registrarse
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => navigate("/")} sx={{ px: 4, py: 1.5, fontWeight: "bold" }}>
            Volver al Login
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default Formulario;
