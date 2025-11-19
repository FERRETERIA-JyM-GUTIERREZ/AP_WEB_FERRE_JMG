# Backend - Ferretería J&M GUTIÉRREZ

## Descripción
Backend desarrollado en **Laravel 10** para la gestión de usuarios, productos, ventas, pedidos y reportes de la ferretería J&M Gutiérrez.

---

## Tecnologías
- **PHP 8.2**
- **Laravel 10**
- **MySQL 8**
- **Laravel Sanctum** (autenticación por tokens)
- **CORS** (para conexión con frontend)

---

## Estructura principal
```
app/
database/
routes/
  api.php
  web.php
config/
  auth.php
  cors.php
```

---

## Funcionalidades implementadas
- Migraciones y modelos para:
  - Usuarios
  - Categorías
  - Productos
  - Ventas y detalles de venta
  - Pedidos y detalles de pedido
- Seeders con datos iniciales
- Controladores RESTful
- Rutas API protegidas con middleware de roles (`admin`, `vendedor`)
- Autenticación con Laravel Sanctum
- Configuración de CORS para permitir peticiones desde el frontend
- Pruebas de rutas públicas y protegidas

---

## Instalación y uso
1. Clona el repositorio y entra a la carpeta backend:
   ```bash
   cd jm-ferreteria-backend
   composer install
   cp .env.example .env
   # Configura tu base de datos en .env
   php artisan key:generate
   php artisan migrate --seed
   php artisan serve
   ```
2. El backend estará disponible en `http://localhost:8000`

---

## Notas
- El backend expone rutas API para autenticación, gestión de productos, ventas, usuarios y reportes.
- Usa Laravel Sanctum para autenticación segura con el frontend React.
- El middleware de roles protege rutas según el tipo de usuario.

---

## Pendiente / Próximos pasos
- Mejorar validaciones y mensajes de error
- Documentar endpoints con Swagger o similar
- Agregar pruebas unitarias y de integración
- Optimizar consultas y relaciones Eloquent
