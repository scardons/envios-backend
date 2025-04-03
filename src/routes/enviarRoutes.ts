import { Router } from "express";
import { crearEnvio, listarEnvios } from "../controllers/enviosController";

const router = Router();
router.post("/", crearEnvio);

router.get("/", listarEnvios);



export default router;
