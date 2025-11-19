# Ferretería J&M GUTIÉRREZ - Sistema Web

## Descripción
Sistema web para la gestión de ventas, productos, usuarios y pedidos de la ferretería J&M Gutiérrez. El proyecto está dividido en dos partes:
- **Backend:** Laravel 10 (PHP 8.2, MySQL 8, Sanctum, CORS)
- **Frontend:** React, Axios, Tailwind CSS (diseño responsivo y paleta naranja personalizada)

---

## Estructura del Proyecto

```
AP_WEB_FERRE_JMG/
├── jm-ferreteria-backend/   # Backend Laravel
│   ├── app/
│   ├── database/
│   ├── routes/
│   ├── ...
│   └── README.md
├── jm-ferreteria-frontend/  # Frontend React
│   ├── src/
│   ├── public/
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── README.md
└── README.md                # Este archivo
```

---

## Tecnologías Utilizadas

### Backend
- **Laravel 10**
- **PHP 8.2**
- **MySQL 8**
- **Laravel Sanctum** (autenticación por tokens)
- **CORS** (para conexión segura con el frontend)

### Frontend
- **React 18**
- **Axios** (consumo de API)
- **Tailwind CSS** (diseño responsivo, paleta naranja personalizada)

---

## Progreso y Funcionalidades

### Backend (jm-ferreteria-backend)
- Estructura básica de Laravel creada
- Migraciones y modelos para:
  - Usuarios
  - Categorías
  - Productos
  - Ventas y detalles de venta
  - Pedidos y detalles de pedido
- Seeders con datos iniciales
- Controladores y rutas API protegidas con middleware de roles (admin, vendedor)
- Autenticación con Laravel Sanctum
- Configuración de CORS para permitir peticiones desde el frontend
- Pruebas de rutas públicas y protegidas funcionando correctamente

### Frontend (jm-ferreteria-frontend)
- Proyecto React creado y estructurado
- Instalación y configuración de Tailwind CSS con paleta personalizada
- Componentes principales: Navbar, Footer, Catálogo, Login, Dashboard, Productos, Ventas, Usuarios, Reportes
- Servicio API con Axios (incluye manejo de tokens y errores)
- Contexto de autenticación y carrito
- Página de login con validaciones y notificaciones
- Diseño moderno y responsivo usando Tailwind CSS
- Limpieza de archivos CSS innecesarios y migración total a Tailwind
- Solución de conflictos de dependencias y configuración de PostCSS

---

## Instalación y Uso

### 1. Clonar el repositorio
```bash
git clone <url-del-repo>
cd AP_WEB_FERRE_JMG
```

### 2. Backend (Laravel)
```bash
cd jm-ferreteria-backend
composer install
cp .env.example .env
# Configura tu base de datos en .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### 3. Frontend (React)
```bash
cd jm-ferreteria-frontend
npm install
npm start
```

---

## Notas importantes
- Ejecuta los comandos npm **siempre dentro de la carpeta** `jm-ferreteria-frontend`.
- Ejecuta los comandos de Laravel **dentro de** `jm-ferreteria-backend`.
- Si tienes errores de dependencias, elimina `node_modules` y `package-lock.json` y ejecuta `npm install` de nuevo.
- El frontend se conecta al backend por defecto en `http://localhost:8000` (ajusta el proxy si es necesario).

---

## Pendiente / Próximos pasos
- Conectar el frontend con los endpoints reales del backend
- Mejorar la gestión de roles y permisos en el frontend
- Agregar más validaciones y feedback visual
- Implementar funcionalidades CRUD completas para productos, ventas, usuarios y reportes
- Mejorar la experiencia móvil

---

**¡Gracias por tu trabajo y dedicación!** 