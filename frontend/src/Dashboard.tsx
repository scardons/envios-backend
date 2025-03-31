import { useEffect, useState } from "react";
import { fetchWithAuth } from "./services/api"; // Si api.ts está directamente en src
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Para redirigir al login si no hay token

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("⚠️ No tienes permiso para ver esta página. Inicia sesión.");
      navigate("/"); // Redirige al formulario de login
      return;
    }

    const fetchData = async () => {
      try {
        const result = await fetchWithAuth("/protected-route");
        setData(result);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchData();
  }, [navigate]);

  if (error) return <p>⚠️ {error}</p>;
  if (!data) return <p>⏳ Cargando...</p>;

  return (
    <div>
      <h2>📦 Datos Protegidos</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>

      <button 
        onClick={() => navigate("/dashboard/envios")}
        style={{
          marginTop: "20px",
          padding: "10px 15px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        ➕ Registrar Envío
      </button>

      <button 
  onClick={() => navigate("/dashboard/envios/asignar-ruta")}
  style={{
    marginTop: "20px",
    padding: "10px 15px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }}
>
  🚛 Asignar Ruta
</button>

{/* Nuevo botón para ir a Dashboard Admin */}
<button 
        onClick={() => navigate("/dashboard/admin")}
        style={{
          marginTop: "20px",
          padding: "10px 15px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        🔧 Panel de Administración
      </button>


    </div>
  );
};

export default Dashboard;
