import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./formulario"; 
import Dashboard from "./Dashboard";
import FormularioEnvio from "./FormularioEnvio";
import AsignarRuta from "./AsignarRuta";
import DashboardAdmin from "./DashboardAdmin";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/envios" element={<FormularioEnvio />} />
        <Route path="/dashboard/envios/asignar-ruta" element={<AsignarRuta />} />
        <Route path="/dashboard/admin" element={<DashboardAdmin />} /> {/* 🚀 Nueva ruta */}
      </Routes>
    </Router>
  );
}

export default App;
