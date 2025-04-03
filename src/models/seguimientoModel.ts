import pool from "../config/db"; // Conexión a MySQL
import Redis from "ioredis"; // Cliente de Redis
import { RowDataPacket } from "mysql2/promise";

const redis = new Redis(); // Se conecta a Redis en localhost:6379 por defecto

/*** 🔎 OBTENER ESTADO ACTUAL DE ENVÍO ***/
export const obtenerEstadoEnvioModel = async (envio_id: number) => {
    const estadoEnCache = await redis.get(`envio:${envio_id}`);
    if (estadoEnCache) return { estado: estadoEnCache, cache: true };

    const query = `SELECT estado FROM ordenes_envio WHERE id = ? LIMIT 1;`;
    const [resultado]: any = await pool.query(query, [envio_id]);

    if (!resultado.length) return null;

    const estado = resultado[0].estado;

    await redis.set(`envio:${envio_id}`, estado, "EX", 300); // Expira en 5 minutos

    return { estado, cache: false };
};

/*** 🔄 ACTUALIZAR ESTADO DE ENVÍO ***/
export const actualizarEstadoEnvioModel = async (envio_id: number, nuevo_estado: string): Promise<boolean> => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            "SELECT estado FROM ordenes_envio WHERE id = ?",
            [envio_id]
        );

        if (rows.length === 0) {
            return false; // No se encontró el envío
        }

        const estadoActual = rows[0].estado;

        const transicionesValidas: Record<string, string[]> = {
            "En espera": ["En tránsito"],
            "En tránsito": ["Entregado"],
        };

        if (!(estadoActual in transicionesValidas) || !transicionesValidas[estadoActual].includes(nuevo_estado)) {
            return false; // ❌ Transición de estado no permitida
        }

        await redis.del(`envio:${envio_id}`);
        await pool.query("UPDATE ordenes_envio SET estado = ? WHERE id = ?", [nuevo_estado, envio_id]);
        await redis.set(`envio:${envio_id}`, nuevo_estado, "EX", 300);

        return true;
    } catch (error) {
        console.error("❌ Error al actualizar el estado del envío:", error);
        return false;
    }
};

/*** 🚛 COMPLETAR ENVÍO ***/
export const completarEnvioModel = async (envio_id: number): Promise<boolean> => {
    const [envio] = await pool.query("SELECT * FROM ordenes_envio WHERE id = ?", [envio_id]);

    if (Array.isArray(envio) && envio.length === 0) {
        return false; // Envío no encontrado
    }

    await pool.query("UPDATE ordenes_envio SET estado = 'Entregado' WHERE id = ?", [envio_id]);
    await redis.del(`envio:${envio_id}`);

    return true;
};

/*** 📜 OBTENER HISTORIAL DE ESTADOS ***/
export const obtenerHistorialModel = async (envio_id: number) => {
    const query = `
        SELECT es.estado, es.fecha, t.nombre AS transportista
        FROM envios_estados es
        LEFT JOIN envios_rutas er ON es.envio_id = er.envio_id
        LEFT JOIN transportistas t ON er.transportista_id = t.id
        WHERE es.envio_id = ?
        ORDER BY es.fecha DESC;
    `;

    try {
        const [rows]: [any[], any] = await pool.query(query, [envio_id]);

        return Array.isArray(rows) ? rows : [];
    } catch (error) {
        console.error("❌ Error al obtener historial:", error);
        throw error;
    }
};
