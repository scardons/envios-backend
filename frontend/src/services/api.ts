const API_URL = "http://localhost:3000/api"; // Ajusta según el backend

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}), // Agrega el token si existe
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Error en la solicitud");
  }
  return data;
};
