import { Router } from "express";
import { obtenerHistorial } from "../controllers/seguimientoController";

const router = Router();

router.get("/historial/:id", obtenerHistorial);

export default router;
