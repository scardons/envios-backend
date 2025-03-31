import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any; // 👈 Define que `user` puede existir en `Request`
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.header("Authorization");

  if (!token) {
    res.status(401).json({ message: "⛔ Acceso denegado, token no proporcionado" });
    return;
  }

  try {
    const secretKey = process.env.JWT_SECRET || "tu_clave_secreta";
    const decoded = jwt.verify(token.replace("Bearer ", ""), secretKey);
    
    req.user = decoded; // ✅ Ahora `req.user` está tipado correctamente
    next(); // ✅ Se llama `next()` sin retornar una respuesta
  } catch (error) {
    res.status(403).json({ message: "⛔ Token inválido" });
  }
};
