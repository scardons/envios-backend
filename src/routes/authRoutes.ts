import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { createUser, getUserByEmail } from "../models/userModel";

const router = express.Router();

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("El nombre es obligatorio"),
    body("email").isEmail().withMessage("Email inválido"),
    body("password").isLength({ min: 6 }).withMessage("Mínimo 6 caracteres"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, email, password } = req.body;

    try {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        res.status(400).json({ message: "El email ya está registrado" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await createUser({ name, email, password: hashedPassword });

      res.status(201).json({ message: "Usuario registrado correctamente" });
    } catch (error: any) {
      console.error("❌ Error en el registro:", error.message);
      res.status(500).json({ message: "Error al registrar usuario", error: error.message });
    }
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    try {
      const user = (await getUserByEmail(email)) as User | undefined;
      if (!user) {
        res.status(400).json({ message: "Usuario no encontrado" });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(400).json({ message: "Contraseña incorrecta" });
        return;
      }

      if (!process.env.JWT_SECRET) {
        console.error("❌ FALTA JWT_SECRET en las variables de entorno");
        res.status(500).json({ message: "Error interno del servidor" });
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ token });
    } catch (error: any) {
      console.error("❌ Error en el login:", error.message);
      res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
  }
);
router.post("/enviar", (req: Request, res: Response) => {
  console.log("🟢 Datos recibidos en el backend:", req.body); // Verifica los datos aquí
  res.status(200).json({ message: "Datos recibidos correctamente" });
});


export default router;
