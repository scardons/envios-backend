import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: any; // Usa un tipo más específico si sabes la estructura del usuario
  }
}
