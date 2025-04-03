import { Request, Response } from "express";
import { obtenerHistorialModel } from "../models/seguimientoModel";

export const obtenerHistorial = async (req: Request, res: Response): Promise<void> => {
  try {
    const envio_id = parseInt(req.params.id, 10);
    if (isNaN(envio_id)) {
      res.status(400).json({ message: "ID de envío inválido" });
      return;
    }

    const historial = await obtenerHistorialModel(envio_id);

    if (Array.isArray(historial) && historial.length > 0) {  // ✅ Verifica si es un array antes de acceder a length
        res.json({ message: "Historial obtenido", historial });
    } else {
      res.status(404).json({ message: "No se encontró historial para este envío" });
    }
  } catch (error) {
    console.error("❌ Error al obtener historial del envío:", error);
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};
