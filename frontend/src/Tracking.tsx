import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface EstadoEnvio {
  id: number;
  envio_id: number;
  estado: string;
  fecha_cambio: string;
}

const Tracking = () => {
  const [historial, setHistorial] = useState<EstadoEnvio[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [envioId, setEnvioId] = useState<string>("");
  const [estadoEnvio, setEstadoEnvio] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    if (envioId) {
      cargarHistorial(envioId);
    }
    const interval = setInterval(() => {
      if (envioId) cargarHistorial(envioId);
    }, 5000);

    return () => clearInterval(interval);
  }, [envioId]);

  const cargarHistorial = async (idEnvio: string) => {
    if (!idEnvio) return;

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/seguimiento/historial/${idEnvio}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Error al obtener el historial");
      const data = await response.json();
      setHistorial(data.historial || []);
    } catch (error: any) {
      setError("No se pudo cargar el historial.");
      console.error("Error al cargar historial:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Seguimiento de Envíos en Tiempo Real</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="🔎 Ingrese ID del envío"
          value={envioId}
          onChange={(e) => {
            setEnvioId(e.target.value);
            cargarHistorial(e.target.value);
          }}
          className="p-2 border rounded w-2/3"
        />
        <button
          onClick={() => cargarHistorial(envioId)}
          className="bg-blue-500 text-white p-2 rounded ml-2"
        >
          📜 Ver Historial
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => console.log("Consultar estado")}
          className="bg-yellow-500 text-white p-2 rounded"
        >
          📦 Consultar Estado
        </button>
        <button
          onClick={() => console.log("Marcar como Entregado")}
          className="bg-green-500 text-white p-2 rounded"
        >
          ✅ Marcar como Entregado
        </button>
      </div>

      {loading && <p className="text-blue-500">Cargando historial...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <table className="w-full border-collapse border border-gray-300 mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID Envío</th>
            <th className="border p-2">Estado</th>
            <th className="border p-2">Fecha de Cambio</th>
          </tr>
        </thead>
        <tbody>
          {historial.length > 0 ? (
            historial.map((registro) => (
              <tr key={registro.id} className="border">
                <td className="border p-2">{registro.envio_id}</td>
                <td className="border p-2">{registro.estado}</td>
                <td className="border p-2">{new Date(registro.fecha_cambio).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="text-center p-4">No hay historial disponible.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          ⬅ Volver al Dashboard
        </button>
      </div>
    </div>
  );
};

export default Tracking;
