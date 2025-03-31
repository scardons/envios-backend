import pool from "../config/db"; // Conexión a MySQL
import Redis from "ioredis"; // Cliente de Redis
import { RowDataPacket } from "mysql2/promise";



/*** 🏷 INTERFACES ***/
export interface OrdenEnvio {
  id?: number;
  usuario_id: number;
  peso: number;
  dimensiones: string;
  tipo_producto: string;
  direccion_destino: string;
  estado?: string; // "En espera" por defecto
}

/*** 🟢 CREACIÓN Y CONSULTA DE ENVÍOS ***/
// 📌 Crear un nuevo envío
export const crearOrdenEnvio = async (orden: OrdenEnvio) => {
  const query = `
    INSERT INTO ordenes_envio (usuario_id, peso, dimensiones, tipo_producto, direccion_destino, estado) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [
    orden.usuario_id,
    orden.peso,
    orden.dimensiones,
    orden.tipo_producto,
    orden.direccion_destino,
    orden.estado || "En espera",
  ];
  const [result] = await pool.execute(query, values);
  return result;
};

// 📌 Obtener todas las órdenes de envío
export const obtenerOrdenesEnvio = async () => {
  const query = "SELECT * FROM ordenes_envio";
  const [rows] = await pool.execute(query);
  return rows;
};

/*** 🚛 ASIGNACIÓN DE RUTAS Y TRANSPORTISTAS ***/
// 📌 Obtener rutas disponibles
export const obtenerRutas = async () => {
  const [rutas] = await pool.query("SELECT * FROM rutas");
  return rutas;
};

// 📌 Obtener transportistas disponibles
export const obtenerTransportistas = async () => {
  const [transportistas]: any = await pool.query(
    "SELECT id, nombre, disponible FROM transportistas WHERE disponible = 1"
  );
  return transportistas;
};

// 📌 Asignar un envío a una ruta y transportista
export const asignarRutaEnvio = async (envio_id: number, ruta_id: number, transportista_id: number) => {
  const [enviosAsignados]: any = await pool.query(
    "SELECT id FROM envios_rutas WHERE transportista_id = ? AND estado IN ('Asignado', 'En ruta')",
    [transportista_id]
  );

  if (enviosAsignados.length > 0) {
    throw new Error("❌ El transportista ya tiene un envío activo.");
  }

  const [envio]: any = await pool.query(
    "SELECT peso FROM ordenes_envio WHERE id = ?",
    [envio_id]
  );

  if (envio.length === 0) {
    throw new Error("❌ Envío no encontrado.");
  }

  await pool.query(
    "INSERT INTO envios_rutas (envio_id, ruta_id, transportista_id, estado) VALUES (?, ?, ?, 'Asignado')",
    [envio_id, ruta_id, transportista_id]
  );

  await pool.query("UPDATE transportistas SET disponible = 0 WHERE id = ?", [transportista_id]);

  // 🔹 Una vez asignado, el transportista comienza el viaje → Cambia estado a "En tránsito"
  await actualizarEstadoEnvio(envio_id, "En tránsito");

  return { mensaje: "✅ Envío asignado y ahora está en tránsito." };
};


/*** 🔎 CONSULTA DE ENVÍOS Y ESTADOS ***/
// 📌 Obtener lista de envíos con su estado actual
export const listarEnvios = async () => {
  const query = `
    SELECT oe.id, oe.usuario_id, oe.peso, oe.dimensiones, oe.tipo_producto, oe.direccion_destino, 
           COALESCE(er.estado, 'En espera') AS estado, 
           er.ruta_id, er.transportista_id
    FROM ordenes_envio oe
    LEFT JOIN envios_rutas er ON oe.id = er.envio_id
  `;

  const [envios] = await pool.query(query);
  return envios;
};

//------------- modo redis activado para optimizar------------

const redis = new Redis(); // Se conecta a Redis en localhost:6379 por defecto

/*** 🟢 CREAR Y ACTUALIZAR ESTADOS EN REDIS ***/
// 📌 Guardar estado en Redis
const guardarEstadoEnRedis = async (envio_id: number, estado: string) => {
  await redis.set(`envio:${envio_id}`, estado, "EX", 300); // Expira en 5 minutos
};

export const obtenerEstadoEnvioModel = async (envio_id: number) => {
  // 🔹 Primero buscamos en Redis
  const estadoEnCache = await redis.get(`envio:${envio_id}`);
  if (estadoEnCache) return { estado: estadoEnCache, cache: true };

  // 🔹 Si no está en Redis, consultamos en MySQL
  const query = `SELECT estado FROM ordenes_envio WHERE id = ? LIMIT 1;`;
  const [resultado]: any = await pool.query(query, [envio_id]);

  if (!resultado.length) return null;

  const estado = resultado[0].estado;

  // 🔹 Guardamos en Redis para futuras consultas
  await guardarEstadoEnRedis(envio_id, estado);

  return { estado, cache: false };
};

/*** ✅ COMPLETAR ENVÍO ***/
// 📌 Marcar envío como completado y actualizar Redis
export const completarEnvio = async (envio_id: number) => {
  const [envio]: any = await pool.query(
    "SELECT transportista_id FROM envios_rutas WHERE envio_id = ?",
    [envio_id]
  );

  if (!envio.length) throw new Error("❌ Envío no encontrado.");

  const transportista_id = envio[0].transportista_id;

  await pool.query(
    "UPDATE envios_rutas SET estado = 'Completado' WHERE envio_id = ?",
    [envio_id]
  );

  await pool.query(
    "UPDATE transportistas SET disponible = 1 WHERE id = ?",
    [transportista_id]
  );

  // 🔹 Al completar el envío, se cambia el estado a "Entregado"
  await actualizarEstadoEnvio(envio_id, "Entregado");

  return { mensaje: "✅ Envío entregado y transportista disponible." };
};


//----------------------------- actualizar estado 

export const actualizarEstadoEnvio = async (envio_id: number, nuevoEstado: string) => {
  const estadosValidos = ["En espera", "En tránsito", "Entregado"];

  if (!estadosValidos.includes(nuevoEstado)) {
    throw new Error("❌ Estado no válido. Los estados permitidos son: 'En espera', 'En tránsito', 'Entregado'.");
  }

  // 🔹 Eliminar la caché en Redis antes de actualizar
  await redis.del(`envio_estado_${envio_id}`);

  // 🔹 Actualizar en la base de datos
  await pool.query(
    "UPDATE ordenes_envio SET estado = ? WHERE id = ?",
    [nuevoEstado, envio_id]
  );

  // 🔹 Actualizar la caché en Redis con el nuevo estado
  await guardarEstadoEnRedis(envio_id, nuevoEstado);

  return { mensaje: `✅ Estado actualizado a '${nuevoEstado}'.` };
};

//--------------------------

// 📦 Completar el envío y cambiar estado a "Entregado"
export const completarEnvioModel = async (envio_id: number): Promise<boolean> => {
  const [envio] = await pool.query("SELECT * FROM ordenes_envio WHERE id = ?", [envio_id]);

  if (Array.isArray(envio) && envio.length === 0) {
    return false; // Envío no encontrado
  }

  await pool.query("UPDATE ordenes_envio SET estado = 'Entregado' WHERE id = ?", [envio_id]);
  return true; // Envío actualizado correctamente
};



// 📦 Actualizar el estado del envío ---------

// 📌 Definir el tipo del resultado de la consulta
type Envio = { estado: string } | undefined;

// 📦 Actualizar el estado del envío
export const actualizarEstadoEnvioModel = async (envio_id: number, nuevo_estado: string): Promise<boolean> => {
  try {
    // 🔹 Ejecutar la consulta y obtener los resultados con `as Envio[]`
    
const [rows] = await pool.query<RowDataPacket[]>(
  "SELECT estado FROM ordenes_envio WHERE id = ?",
  [envio_id]
);

if (rows.length === 0) {
  return false; // No se encontró el envío
}

const estadoActual = rows[0].estado; // ✅ Ahora TypeScript lo reconoce

    // 🔹 Definir las transiciones de estado permitidas
    const transicionesValidas: Record<string, string[]> = {
      "En espera": ["En tránsito"],
      "En tránsito": ["Entregado"],
    };

    if (!(estadoActual in transicionesValidas) || !transicionesValidas[estadoActual].includes(nuevo_estado)) {
      return false; // ❌ Transición de estado no permitida
    }

    // 🔹 Actualizar el estado en la base de datos
    await pool.query("UPDATE ordenes_envio SET estado = ? WHERE id = ?", [nuevo_estado, envio_id]);

    return true; // ✅ Estado actualizado correctamente
  } catch (error) {
    console.error("❌ Error al actualizar el estado del envío:", error);
    return false;
  }
};