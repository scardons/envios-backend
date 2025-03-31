import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface OrdenEnvio {
  id: number;
  direccion_destino: string;
  estado: string;
}

const DashboardAdmin = () => {
  const [ordenes, setOrdenes] = useState<OrdenEnvio[]>([]);
  const [estadoFiltro, setEstadoFiltro] = useState<string>("En espera");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarOrdenes();
  }, [estadoFiltro]);

  const cargarOrdenes = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/envios", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      // 📌 Verifica si la respuesta es JSON antes de intentar parsearla
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("La respuesta no es JSON, revisar el servidor");
      }
  
      if (!response.ok) {
        const errorText = await response.text(); // Obtén la respuesta como texto
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
  
      const data = await response.json();
      console.log("🚀 Envíos recibidos:", data);
      setOrdenes(data.envios || []);
    } catch (error: any) {
      setError("No se pudieron cargar las órdenes. Inténtalo nuevamente.");
      console.error("❌ Error al cargar órdenes:", error);
    } finally {
      setLoading(false);
    }
  };
  

  const asignarRuta = async (idOrden: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/envios/asignar-ruta`, {
        method: "POST",
        body: JSON.stringify({ envio_id: idOrden, ruta_id: 1, transportista_id: 2 }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Error al asignar ruta");
      const data = await response.json();
      alert(data.mensaje);
      cargarOrdenes();
    } catch (error) {
      console.error("❌ Error al asignar ruta:", error);
      alert("No se pudo asignar la ruta. Inténtalo nuevamente.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard de Envíos y Rutas</h1>
      <select
        className="border p-2 mb-4"
        value={estadoFiltro}
        onChange={(e) => setEstadoFiltro(e.target.value)}
      >
        <option value="En espera">En espera</option>
        <option value="Asignado">Asignado</option>
        <option value="Completado">Completado</option>
      </select>
      
      {loading && <p className="text-blue-500">Cargando órdenes...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Destino</th>
            <th className="border p-2">Estado</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.length > 0 ? (
            ordenes.map((orden) => (
              <tr key={orden.id} className="border">
                <td className="border p-2">{orden.id}</td>
                <td className="border p-2">{orden.direccion_destino}</td>
                <td className="border p-2">{orden.estado}</td>
                <td className="border p-2">
                  {orden.estado === "En espera" && (
                    <button
                      onClick={() => asignarRuta(orden.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Asignar Ruta
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center p-4">
                No hay órdenes disponibles.
              </td>
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

export default DashboardAdmin;
