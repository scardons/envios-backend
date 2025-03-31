import { Router } from "express";
import { listarEnvios, crearEnvio, listarRutas, listarTransportistas, asignarRuta } from "../controllers/enviosController";
import { completarEnvio } from "../controllers/enviosController";

import { actualizarEstadoEnvio } from "../controllers/enviosController";



const router = Router();

// 📌 Endpoint para obtener la lista de envíos
router.get("/", listarEnvios);

// 📌 Endpoint para obtener transportistas disponibles
router.get("/transportistas", listarTransportistas);

// 📌 Endpoint para obtener rutas disponibles
router.get("/rutas", listarRutas);

// 📌 Endpoint para asignar ruta a un envío
router.post("/asignar-ruta", asignarRuta);

// 📌 Endpoint para crear un envío
router.post("/", crearEnvio);

// 📌 Endpoint para marcar un envío como "Entregado"
router.post("/completar", completarEnvio);

// 📌 Endpoint para actualizar el estado del envío
router.put("/actualizar-estado", actualizarEstadoEnvio);


export default router;
