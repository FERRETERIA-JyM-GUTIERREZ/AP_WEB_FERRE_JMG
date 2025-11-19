# Frontend - Ferretería J&M GUTIÉRREZ

## Descripción
Frontend desarrollado en **React** para la gestión y visualización de productos, ventas, usuarios y pedidos de la ferretería J&M Gutiérrez.

---

## Tecnologías
- **React 18**
- **Axios** (consumo de API)
- **Tailwind CSS** (diseño responsivo, paleta naranja personalizada)

---

## Estructura principal
```
src/
  components/
  context/
  pages/
  services/
  index.js
  index.css
tailwind.config.js
postcss.config.js
```

---

## Funcionalidades implementadas
- Instalación y configuración de Tailwind CSS con paleta personalizada
- Componentes principales: Navbar, Footer, Catálogo, Login, Dashboard, Productos, Ventas, Usuarios, Reportes
- Servicio API con Axios (manejo de tokens y errores)
- Contexto de autenticación y carrito
- Página de login con validaciones y notificaciones
- Diseño moderno y responsivo usando Tailwind CSS
- Limpieza de archivos CSS innecesarios y migración total a Tailwind
- Solución de conflictos de dependencias y configuración de PostCSS

---

## Instalación y uso
1. Entra a la carpeta del frontend:
   ```bash
   cd jm-ferreteria-frontend
   npm install
   npm start
   ```
2. El frontend estará disponible en `http://localhost:3000`

---

## Notas
- Ejecuta los comandos npm **siempre dentro de la carpeta** `jm-ferreteria-frontend`.
- El frontend se conecta al backend por defecto en `http://localhost:8000` (ajusta el proxy si es necesario).
- Si tienes errores de dependencias, elimina `node_modules` y `package-lock.json` y ejecuta `npm install` de nuevo.

---

## Pendiente / Próximos pasos
- Conectar el frontend con los endpoints reales del backend
- Mejorar la gestión de roles y permisos en el frontend
- Agregar más validaciones y feedback visual
- Implementar funcionalidades CRUD completas para productos, ventas, usuarios y reportes
- Mejorar la experiencia móvil 