# envios-backend

Proyecto de Gestión de Envíos y Rutas Logísticas
Descripción
Este proyecto es una plataforma para gestionar envíos, optimizar rutas logísticas y rastrear pedidos en tiempo real. La solución incluye un frontend desarrollado en React con TypeScript y un backend basado en Node.js con Express y una base de datos SQL.
________________________________________
Requisitos Previos
General
•	Tener instalado Git
•	Tener una cuenta en GitHub
Backend
•	Node.js v16 o superior
•	NPM o Yarn
•	MySQL (o cualquier otra base de datos SQL compatible)
Frontend
•	Node.js v16 o superior
•	NPM o Yarn
________________________________________
Instalación
1. Clonar el repositorio
# Clonar el backend
git clone https://github.com/scardons/envios-backend.git

# Clonar el frontend
git clone https://github.com/scardons/envios-frontend.git
2. Configurar el Backend
cd envios-backend

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Editar el archivo .env con las credenciales de la base de datos

# Ejecutar migraciones (si aplica)
npx sequelize db:migrate

3. Configurar el Frontend
cd envios-frontend

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Editar el archivo .env con la URL del backend
Ejecución
Iniciar Backend
cd envios-backend
npm run dev
l backend correrá en http://localhost:3000 por defecto.
Iniciar Frontend
cd envios-frontend
npm run dev
El frontend estará disponible en http://localhost:5173/ por defecto.
Contribuir
1.	Crea una rama: git checkout -b feature/nueva-funcionalidad
2.	Realiza cambios y haz commit: git commit -m "Describiendo el cambio"
3.	Sube los cambios: git push origin feature/nueva-funcionalidad
4.	Abre un Pull Request en GitHub.


