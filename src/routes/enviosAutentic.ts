import { Router } from "express";
import { obtenerEstadoEnvio } from "../controllers/enviosController";


const router = Router();

router.get("/estado/:id", obtenerEstadoEnvio);

export default router;
