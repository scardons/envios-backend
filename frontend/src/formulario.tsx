import { useState } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Formulario = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate(); // Hook para redirigir

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Limpiar errores previos

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token); // Guardar el token en localStorage
        alert("✅ Usuario registrado correctamente");

        // Limpiar formulario
        setFormData({ name: "", email: "", password: "" });

        // 🔄 Redirigir automáticamente al login
        navigate("/login");
      } else {
        setError(data.message || "⚠️ Error en el registro");
      }
    } catch {
      setError("❌ Error en la conexión con el servidor.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Registro de Usuario
      </Typography>
      {error && (
        <Typography color="error" variant="body1">
          {error}
        </Typography>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Nombre"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Contraseña"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          margin="normal"
        />

        {/* Botones alineados horizontalmente */}
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button variant="contained" color="primary" type="submit">
            Registrarse
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => navigate("/")}>
            Volver al Login
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default Formulario;
