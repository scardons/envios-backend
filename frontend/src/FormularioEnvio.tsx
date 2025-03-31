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
  const [modalAbierto, setModalAbierto] = useState(false); // 🔹 Estado del modal
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EnvioData>({
    resolver: zodResolver(envioSchema),
  });

  // 📌 Enviar el formulario
  const onSubmit = async (data: EnvioData) => {
    try {
      const response = await axios.post("http://localhost:3000/api/envios", data);
      console.log("✅ Respuesta del servidor:", response.data);
      setModalAbierto(true); // 🔹 Abrir modal al registrar exitosamente
      reset();
    } catch (error) {
      console.error("❌ Error al enviar datos:", error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-xl bg-white p-8 rounded-3xl shadow-2xl">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">📦 Registrar Envío</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ID de usuario */}
          <div>
            <label className="block text-gray-700 font-semibold text-lg">ID de Usuario</label>
            <input type="number" {...register("usuario_id")} className="w-full border p-4 rounded-lg text-lg" />
            {errors.usuario_id && <p className="text-red-500">{errors.usuario_id.message}</p>}
          </div>

          {/* Peso */}
          <div>
            <label className="block text-gray-700 font-semibold text-lg">Peso (kg)</label>
            <input type="number" step="0.1" {...register("peso")} className="w-full border p-4 rounded-lg text-lg" />
            {errors.peso && <p className="text-red-500">{errors.peso.message}</p>}
          </div>

          {/* Dimensiones */}
          <div>
            <label className="block text-gray-700 font-semibold text-lg">Dimensiones</label>
            <input type="text" {...register("dimensiones")} className="w-full border p-4 rounded-lg text-lg" />
            {errors.dimensiones && <p className="text-red-500">{errors.dimensiones.message}</p>}
          </div>

          {/* Tipo de Producto */}
          <div>
            <label className="block text-gray-700 font-semibold text-lg">Tipo de Producto</label>
            <select {...register("tipo_producto")} className="w-full border p-4 rounded-lg text-lg">
              <option value="">Seleccione un tipo</option>
              <option value="Electrónico">Electrónico</option>
              <option value="Ropa">Ropa</option>
              <option value="Alimentos">Alimentos</option>
              <option value="Muebles">Muebles</option>
            </select>
            {errors.tipo_producto && <p className="text-red-500">{errors.tipo_producto.message}</p>}
          </div>

          {/* Dirección de Destino */}
          <div>
            <label className="block text-gray-700 font-semibold text-lg">Dirección de Destino</label>
            <input type="text" {...register("direccion_destino")} className="w-full border p-4 rounded-lg text-lg" />
            {errors.direccion_destino && <p className="text-red-500">{errors.direccion_destino.message}</p>}
          </div>

          {/* Correo Electrónico */}
          <div>
            <label className="block text-gray-700 font-semibold text-lg">Correo Electrónico</label>
            <input type="email" {...register("email")} className="w-full border p-4 rounded-lg text-lg" />
            {errors.email && <p className="text-red-500">{errors.email.message}</p>}
          </div>

          {/* Botón de enviar */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg py-4 rounded-lg transition-all"
          >
            {isSubmitting ? "Registrando..." : "📩 Registrar Envío"}
          </button>
        </form>

        {/* 🔹 Botón para volver al Dashboard */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold text-lg py-4 rounded-lg transition-all"
        >
          ⬅ Volver al Dashboard
        </button>
      </div>

      {/* 🔹 Modal de Confirmación */}
      {modalAbierto && <ModalConfirmacion onClose={() => setModalAbierto(false)} />}
    </div>
  );
};

// 🔹 Componente del Modal de Confirmación
const ModalConfirmacion = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800">✅ ¡Envío registrado con éxito!</h2>
        <p className="text-gray-600 mt-2">Tu registro ha sido enviado correctamente.</p>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default FormularioEnvio;
