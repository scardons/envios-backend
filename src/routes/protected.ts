import express from "express";
import { verifyToken } from "../middlewares/authMiddleware"; // Importa el middleware
import { AuthRequest } from "../middlewares/authMiddleware"; // Importa el tipo

const router = express.Router();

router.get("/protected-route", verifyToken, (req: AuthRequest, res) => {
  res.json({ message: "✅ Acceso concedido a la ruta protegida", user: req.user });
});

export default router;
