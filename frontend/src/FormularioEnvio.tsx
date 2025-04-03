import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { z } from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


// 📌 Esquema de validación
const envioSchema = z.object({
  usuario_id: z.coerce.number().min(1, "El usuario es obligatorio."),
  peso: z.coerce.number().min(0.1, "El peso debe ser mayor a 0."),
  dimensiones: z.string().min(1, "Las dimensiones son obligatorias."),
  tipo_producto: z.string().min(1, "Seleccione un tipo de producto."),
  direccion_destino: z.string().min(5, "La dirección debe tener al menos 5 caracteres."),
  email: z.string().email("Debe ser un correo válido."),
});

// 📌 Tipado de datos
type EnvioData = z.infer<typeof envioSchema>;

const FormularioEnvio = () => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EnvioData>({ resolver: zodResolver(envioSchema) });

  const onSubmit = async (data: EnvioData) => {
    try {
      await axios.post("http://localhost:3000/api/envios", data);
      setModalAbierto(true);
      reset();
    } catch (error) {
      console.error("❌ Error al enviar datos:", error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-xl bg-white p-8 rounded-3xl shadow-xl transition-all">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-6">📦 Registrar Envío</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {[
            { label: "ID de Usuario", name: "usuario_id", type: "number" },
            { label: "Peso (kg)", name: "peso", type: "number" },
            { label: "Dimensiones", name: "dimensiones", type: "text" },
            { label: "Dirección de Destino", name: "direccion_destino", type: "text" },
            { label: "Correo Electrónico", name: "email", type: "email" },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label className="block text-gray-700 font-semibold text-lg">{label}</label>
              <input
                type={type}
                {...register(name as keyof EnvioData)}
                className="w-full border p-4 rounded-lg text-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
              {errors[name as keyof EnvioData] && (
                <p className="text-red-500 text-sm">{errors[name as keyof EnvioData]?.message}</p>
              )}
            </div>
          ))}

          <div>
            <label className="block text-gray-700 font-semibold text-lg">Tipo de Producto</label>
            <select
              {...register("tipo_producto")}
              className="w-full border p-4 rounded-lg text-lg focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Seleccione un tipo</option>
              <option value="Electrónico">Electrónico</option>
              <option value="Ropa">Ropa</option>
              <option value="Alimentos">Alimentos</option>
              <option value="Muebles">Muebles</option>
            </select>
            {errors.tipo_producto && <p className="text-red-500 text-sm">{errors.tipo_producto.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg py-4 rounded-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Registrando..." : "📩 Registrar Envío"}
          </button>
        </form>

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold text-lg py-4 rounded-lg transition-all"
        >
          ⬅ Volver al Dashboard
        </button>
      </div>

      {modalAbierto && <ModalConfirmacion onClose={() => setModalAbierto(false)} />}
    </div>
  );
};

const ModalConfirmacion = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center transform scale-95 transition-transform">
        <h2 className="text-2xl font-bold text-gray-800">✅ ¡Envío registrado con éxito!</h2>
        <p className="text-gray-600 mt-2">Tu registro ha sido enviado correctamente.</p>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-all"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default FormularioEnvio;
