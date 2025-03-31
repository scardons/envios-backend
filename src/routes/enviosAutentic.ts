import { Router } from "express";
import { obtenerEstadoEnvio } from "../controllers/enviosController";


const router = Router();

// 📌 Endpoint para consultar el estado de un envío por ID
router.get("/estado/:id", obtenerEstadoEnvio);

export default router;
