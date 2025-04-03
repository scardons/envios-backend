import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./formulario";
import Dashboard from "./Dashboard";
import FormularioEnvio from "./FormularioEnvio";
import AsignarRuta from "./AsignarRuta";
import DashboardAdmin from "./DashboardAdmin";
import Tracking from "./Tracking";
import WebSocketComponent from "./components/WebSocketComponent";

function App() {
  return (
    <Router>
      <div>
        <h1>Mi App con WebSockets</h1>
        <WebSocketComponent /> {/* ✅ Cliente WebSocket conectado */}

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/envios" element={<FormularioEnvio />} />
          <Route path="/dashboard/envios/asignar-ruta" element={<AsignarRuta />} />
          <Route path="/dashboard/admin" element={<DashboardAdmin />} />
          <Route path="/tracking" element={<Tracking />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;
