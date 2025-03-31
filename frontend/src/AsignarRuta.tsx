import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AsignarRuta = () => {
  const [envios, setEnvios] = useState<any[]>([]);
  const [rutas, setRutas] = useState<any[]>([]);
  const [transportistas, setTransportistas] = useState<any[]>([]);
  const [envioSeleccionado, setEnvioSeleccionado] = useState<string | null>(null);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<string | null>(null);
  const [transportistaSeleccionado, setTransportistaSeleccionado] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string>("");

  const navigate = useNavigate(); // Hook para la navegación

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enviosRes, rutasRes, transportistasRes] = await Promise.all([
          axios.get("http://localhost:3000/api/envios"),
          axios.get("http://localhost:3000/api/envios/rutas"),  // ✅ Corrección aquí
          axios.get("http://localhost:3000/api/envios/transportistas"), // ✅ Corrección aquí
        ]);
        

        setEnvios(enviosRes.data.envios);
        setRutas(rutasRes.data.rutas);
        setTransportistas(transportistasRes.data.transportistas);
      } catch (error) {
        setMensaje("❌ Error al cargar datos");
      }
    };

    fetchData();
  }, []);

  const asignarRuta = async () => {
    if (!envioSeleccionado || !rutaSeleccionada || !transportistaSeleccionado) {
      setMensaje("⚠️ Debes seleccionar todos los campos");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/envios/asignar-ruta", {
        envio_id: Number(envioSeleccionado),
        ruta_id: Number(rutaSeleccionada),
        transportista_id: Number(transportistaSeleccionado),
      });

      setMensaje(`✅ ${res.data.mensaje}`);
    } catch (error) {
      setMensaje("❌ Error al asignar ruta");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🚛 Asignar Ruta</h2>

      {/* Select Envío */}
      <select
        value={envioSeleccionado || ""}
        onChange={(e) => setEnvioSeleccionado(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      >
        <option value="">Seleccione un envío</option>
        {envios.map((envio) => (
          <option key={envio.id} value={envio.id}>
            {envio.id} - {envio.direccion_destino}
          </option>
        ))}
      </select>

      {/* Select Ruta */}
      <select
        value={rutaSeleccionada || ""}
        onChange={(e) => setRutaSeleccionada(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      >
        <option value="">Seleccione una ruta</option>
        {rutas.map((ruta) => (
          <option key={ruta.id} value={ruta.id}>
            {ruta.nombre}
          </option>
        ))}
      </select>

      {/* Select Transportista */}
      <select
        value={transportistaSeleccionado || ""}
        onChange={(e) => setTransportistaSeleccionado(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      >
        <option value="">Seleccione un transportista</option>
        {transportistas.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nombre}
          </option>
        ))}
      </select>

      {/* Botón Asignar */}
      <button
        onClick={asignarRuta}
        className="w-full bg-blue-500 text-white p-2 rounded"
      >
        ✅ Asignar Ruta
      </button>

      {/* Botón para volver al Dashboard */}
      <button
        onClick={() => navigate("/dashboard")}
        className="w-full bg-gray-500 text-white p-2 rounded mt-4"
      >
        ⬅️ Volver al Dashboard
      </button>

      {/* Mensaje de Confirmación/Error */}
      {mensaje && <p className="mt-4 text-lg text-center">{mensaje}</p>}
    </div>
  );
};

export default AsignarRuta;
