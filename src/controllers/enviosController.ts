//CONTROLADOR DE LOS ENVIOS PUNTO NUMERO 2

import { Request, Response } from "express";
import { obtenerRutas, obtenerTransportistas, asignarRutaEnvio, completarEnvioModel } from "../models/envioModel";
import { crearOrdenEnvio, obtenerOrdenesEnvio } from "../models/envioModel";
import pool from "../config/db"; // 👈 Importa correctamente la conexión a la BD
import { obtenerEstadoEnvioModel } from "../models/envioModel";
import Redis from "ioredis";
import { EnvioModel } from "../models/envioModel"; // Asegúrate de que esta ruta sea correcta

import { actualizarEstadoEnvioModel } from "../models/envioModel";


const redis = new Redis(); // Usar el puerto 6379 por defecto

export default redis;




export const crearEnvio = async (req: Request, res: Response) => {
  try {
    console.log("📩 Datos recibidos en el backend:", req.body); // 👀 Ver qué llega desde el frontend

    const nuevaOrden = await crearOrdenEnvio(req.body);
    res.status(201).json({ message: "Orden de envío creada", nuevaOrden });
  } catch (error) {
    console.error("❌ Error al crear la orden:", error); // 🔴 Muestra errores en la terminal
    res.status(500).json({ message: "Error al crear la orden", error });
  }
};

  

export const listarEnvios = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT oe.id, oe.usuario_id, oe.peso, oe.dimensiones, oe.tipo_producto, oe.direccion_destino, 
             COALESCE(er.estado, 'En espera') AS estado, 
             er.ruta_id, er.transportista_id
      FROM ordenes_envio oe
      LEFT JOIN envios_rutas er ON oe.id = er.envio_id
    `;

    const [envios] = await pool.query(query);
    res.json({ message: "Lista de envíos", envios });
  } catch (error) {
    console.error("❌ Error al obtener envíos:", error);
    res.status(500).json({ message: "Error al obtener envíos", error });
  }
};

//-----------------------------------------------------
// 📌 Obtener rutas disponibles
export const listarRutas = async (_req: Request, res: Response) => {
  try {
    const rutas = await obtenerRutas();
    res.json({ message: "Lista de rutas", rutas });
  } catch (error) {
    console.error("❌ Error al obtener rutas:", error);
    res.status(500).json({ message: "Error al obtener rutas" });
  }
};

// 📌 Obtener transportistas disponibles
export const listarTransportistas = async (_req: Request, res: Response) => {
  try {
    const transportistas = await obtenerTransportistas();
    res.json({ message: "Lista de transportistas", transportistas });
  } catch (error) {
    console.error("❌ Error al obtener transportistas:", error);
    res.status(500).json({ message: "Error al obtener transportistas" });
  }
};

// 📌 Asignar ruta a un envío
export const asignarRuta = async (req: Request, res: Response): Promise<void> => { 
  try {
    console.log("📦 Datos recibidos para asignar ruta:", req.body); // 👀 Ver qué está llegando

    const { envio_id, ruta_id, transportista_id } = req.body;

    if (!envio_id || !ruta_id || !transportista_id) {
      console.log("❌ Faltan datos en la solicitud:", req.body); // ⚠️ Mensaje en consola
      res.status(400).json({ message: "Faltan datos obligatorios" });
      return;
    }

    const resultado = await asignarRutaEnvio(envio_id, ruta_id, transportista_id);
    res.status(201).json(resultado);
  } catch (error) {
    console.error("❌ Error al asignar ruta:", error); // 🛑 Muestra errores en la terminal
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

//---------------------------- 4 punto ----------------


export const obtenerEstadoEnvio = async (req: Request, res: Response): Promise<void> => {
  try {
    const envio_id = parseInt(req.params.id, 10);
    if (isNaN(envio_id)) {
      res.status(400).json({ message: "ID de envío inválido" });
      return;
    }

    const estado = await obtenerEstadoEnvioModel(envio_id);

    if (estado) {
      res.json({ message: "Estado del envío obtenido", estado });
    } else {
      res.status(404).json({ message: "No se encontró información para el envío" });
    }
  } catch (error) {
    console.error("❌ Error al obtener estado del envío:", error);
    res.status(500).json({ message: "Error al obtener estado del envío", error });
  }
};


//------------------
export const completarEnvio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { envio_id } = req.body;

    if (!envio_id) {
      res.status(400).json({ message: "Falta el ID del envío" });
      return;
    }

    const actualizado = await completarEnvioModel(envio_id);

    if (!actualizado) {
      res.status(404).json({ message: "El envío no existe" });
      return;
    }

    res.json({ message: "✅ Envío marcado como entregado", envio_id });
  } catch (error) {
    console.error("❌ Error al completar el envío:", error);
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

//actualizar estado 

// 🔹 Actualizar el estado del envío
export const actualizarEstadoEnvio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { envio_id, nuevo_estado } = req.body;

    if (!envio_id || !nuevo_estado) {
      res.status(400).json({ message: "Faltan datos: envio_id y nuevo_estado son requeridos" });
      return;
    }

    const estadosValidos = ["En espera", "En tránsito", "Entregado"];
    if (!estadosValidos.includes(nuevo_estado)) {
      res.status(400).json({ message: "Estado no válido" });
      return;
    }

    const actualizado = await actualizarEstadoEnvioModel(envio_id, nuevo_estado);

    if (!actualizado) {
      res.status(404).json({ message: "El envío no existe o ya tiene este estado" });
      return;
    }

    res.json({ message: `✅ Estado actualizado a '${nuevo_estado}'`, envio_id });
  } catch (error) {
    console.error("❌ Error al actualizar estado del envío:", error);
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

//------------para los filtros avanzados

export const obtenerEnviosConFiltros = async (req: Request, res: Response) => {
  try {
    const { fechaInicio, fechaFin, estado, transportista } = req.query;

    const envios = await EnvioModel.obtenerEnviosFiltrados(
      fechaInicio as string,
      fechaFin as string,
      estado as string,
      transportista as string
    );

    res.json(envios);
  } catch (error) {
    console.error("Error al obtener envíos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


