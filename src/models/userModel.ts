import pool from "../config/db";

export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
}

export const createUser = async (user: User) => {
  console.log("🟢 Intentando crear usuario en la BD:", user);

  try {
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [user.name, user.email, user.password]
    );

    console.log("✅ Usuario creado correctamente:", result);
    return result;
  } catch (error) {
    console.error("❌ Error en createUser:", error);
    throw error;
  }
};

export const getUserByEmail = async (email: string) => {
  console.log("🔍 Buscando usuario por email:", email);

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (Array.isArray(rows) && rows.length > 0) {
      console.log("✅ Usuario encontrado:", rows[0]);
      return rows[0];
    } else {
      console.log("⚠️ No se encontró el usuario.");
      return null;
    }
  } catch (error) {
    console.error("❌ Error en getUserByEmail:", error);
    throw error;
  }
};
