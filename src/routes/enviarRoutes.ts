import { Router } from "express";
import { crearEnvio, listarEnvios } from "../controllers/enviosController";

const router = Router();
//punto numero dos para crear envio y listar envios 
router.post("/", crearEnvio);

router.get("/", listarEnvios);



export default router;
