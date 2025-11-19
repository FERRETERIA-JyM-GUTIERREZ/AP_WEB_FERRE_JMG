# 📋 Resumen Rápido de Despliegue

## 🎯 Pasos Rápidos

### Backend (Render.com)

1. **Crear servicio en Render:**
   - New → Web Service
   - Conectar GitHub
   - Root Directory: `jm-ferreteria-backend`
   - Build: `composer install --no-dev --optimize-autoloader && php artisan config:cache && php artisan route:cache && php artisan view:cache`
   - Start: `php -S 0.0.0.0:$PORT -t public`

2. **Variables de entorno:**
   ```
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=(generar con: php artisan key:generate --show)
   DB_CONNECTION=mysql
   DB_HOST=jm-ferreteria-db.cby8iosgukxi.us-east-2.rds.amazonaws.com
   DB_PORT=3306
   DB_DATABASE=jm_ferreteria
   DB_USERNAME=admin
   DB_PASSWORD=Emersonvelez$3
   FRONTEND_URL=(URL de Vercel después)
   ```

3. **Ejecutar migraciones:**
   ```bash
   php artisan migrate --force
   ```

### Frontend (Vercel.com)

1. **Importar proyecto:**
   - Add New → Project
   - Conectar GitHub
   - Root Directory: `jm-ferreteria-frontend`
   - Build: `npm run build`
   - Output: `build`

2. **Variable de entorno:**
   ```
   REACT_APP_API_URL=https://tu-backend.onrender.com/api
   ```

3. **Actualizar FRONTEND_URL en Render:**
   ```
   FRONTEND_URL=https://tu-frontend.vercel.app
   ```

## 📁 Archivos Creados

- ✅ `jm-ferreteria-backend/Procfile` - Actualizado para Render
- ✅ `jm-ferreteria-frontend/vercel.json` - Configuración de Vercel
- ✅ `jm-ferreteria-backend/render.yaml` - Configuración opcional de Render
- ✅ `GUIA_DESPLIEGUE.md` - Guía completa paso a paso
- ✅ Scripts para generar APP_KEY

## 🔗 URLs Esperadas

- Backend: `https://jm-ferreteria-backend.onrender.com`
- Frontend: `https://jm-ferreteria-frontend.vercel.app`

## ⚠️ Importante

1. Generar `APP_KEY` antes de desplegar
2. Ejecutar migraciones después del primer despliegue
3. Actualizar `FRONTEND_URL` en Render después de desplegar el frontend
4. El plan gratuito de Render "duerme" después de 15 min de inactividad

Para más detalles, ver `GUIA_DESPLIEGUE.md`

