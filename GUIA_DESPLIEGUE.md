# 🚀 Guía Completa de Despliegue - Ferretería J&M Gutiérrez

Esta guía te ayudará a desplegar tu aplicación full-stack en Render.com (backend) y Vercel.com (frontend) de forma completamente gratuita.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Despliegue del Backend en Render.com](#despliegue-del-backend-en-rendercom)
3. [Despliegue del Frontend en Vercel.com](#despliegue-del-frontend-en-vercelcom)
4. [Configuración Final](#configuración-final)
5. [Solución de Problemas](#solución-de-problemas)

---

## ✅ Requisitos Previos

- ✅ Cuenta en GitHub con el proyecto subido
- ✅ Cuenta en Render.com (gratuita, sin tarjeta)
- ✅ Cuenta en Vercel.com (gratuita, sin tarjeta)
- ✅ Base de datos MySQL en AWS RDS configurada
- ✅ Security Group de AWS configurado correctamente

**Credenciales de Base de Datos:**
- Host: `jm-ferreteria-db.cby8iosgukxi.us-east-2.rds.amazonaws.com`
- Puerto: `3306`
- Base de datos: `jm_ferreteria`
- Usuario: `admin`
- Contraseña: `Emersonvelez$3`

---

## 🔧 Despliegue del Backend en Render.com

### Paso 1: Crear cuenta en Render.com

1. Ve a [https://render.com](https://render.com)
2. Haz clic en **"Get Started for Free"**
3. Regístrate con tu cuenta de GitHub (recomendado)
4. Confirma tu email

### Paso 2: Crear nuevo Web Service

1. En el dashboard de Render, haz clic en **"New +"**
2. Selecciona **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio `AP_WEB_FERRE_JMG`

### Paso 3: Configurar el servicio

**Configuración básica:**
- **Name**: `jm-ferreteria-backend`
- **Region**: Elige la más cercana (ej: `Oregon (US West)`)
- **Branch**: `main` (o la rama que uses)
- **Root Directory**: `jm-ferreteria-backend`
- **Runtime**: `PHP`
- **Build Command**: 
  ```bash
  composer install --no-dev --optimize-autoloader && php artisan config:cache && php artisan route:cache && php artisan view:cache
  ```
- **Start Command**: 
  ```bash
  php -S 0.0.0.0:$PORT -t public
  ```
- **Plan**: `Free`

### Paso 4: Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega las siguientes variables:

```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=(se generará después)
DB_CONNECTION=mysql
DB_HOST=jm-ferreteria-db.cby8iosgukxi.us-east-2.rds.amazonaws.com
DB_PORT=3306
DB_DATABASE=jm_ferreteria
DB_USERNAME=admin
DB_PASSWORD=Emersonvelez$3
FRONTEND_URL=(se configurará después con la URL de Vercel)
```

**⚠️ IMPORTANTE: Generar APP_KEY**

1. En tu máquina local, dentro de la carpeta `jm-ferreteria-backend`, ejecuta:
   ```bash
   php artisan key:generate --show
   ```
2. Copia la clave generada (algo como: `base64:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx=`)
3. Pégala como valor de `APP_KEY` en Render

**O alternativamente**, puedes dejar `APP_KEY` vacío y Render intentará generarlo automáticamente durante el build.

### Paso 5: Desplegar

1. Haz clic en **"Create Web Service"**
2. Render comenzará a construir y desplegar tu aplicación
3. Espera a que termine el proceso (puede tardar 5-10 minutos)
4. Una vez completado, obtendrás una URL como: `https://jm-ferreteria-backend.onrender.com`

### Paso 6: Ejecutar Migraciones

1. En Render, ve a tu servicio
2. Abre la pestaña **"Shell"** o **"Logs"**
3. Ejecuta las migraciones:
   ```bash
   php artisan migrate --force
   ```
   
   **Nota**: Si necesitas ejecutar seeders también:
   ```bash
   php artisan db:seed --force
   ```

### Paso 7: Verificar el Backend

1. Visita la URL de tu backend: `https://tu-backend.onrender.com/api/test`
2. Deberías ver una respuesta JSON:
   ```json
   {
     "success": true,
     "message": "API funciona correctamente"
   }
   ```

---

## 🎨 Despliegue del Frontend en Vercel.com

### Paso 1: Crear cuenta en Vercel.com

1. Ve a [https://vercel.com](https://vercel.com)
2. Haz clic en **"Sign Up"**
3. Regístrate con tu cuenta de GitHub (recomendado)
4. Confirma tu email

### Paso 2: Importar Proyecto

1. En el dashboard de Vercel, haz clic en **"Add New..."**
2. Selecciona **"Project"**
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio `AP_WEB_FERRE_JMG`

### Paso 3: Configurar el Proyecto

**Configuración básica:**
- **Project Name**: `jm-ferreteria-frontend`
- **Framework Preset**: `Create React App` (o `Other`)
- **Root Directory**: `jm-ferreteria-frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### Paso 4: Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega:

```env
REACT_APP_API_URL=https://tu-backend.onrender.com/api
```

**⚠️ IMPORTANTE**: Reemplaza `tu-backend.onrender.com` con la URL real de tu backend en Render.

### Paso 5: Desplegar

1. Haz clic en **"Deploy"**
2. Vercel comenzará a construir y desplegar tu aplicación
3. Espera a que termine el proceso (puede tardar 2-5 minutos)
4. Una vez completado, obtendrás una URL como: `https://jm-ferreteria-frontend.vercel.app`

### Paso 6: Verificar el Frontend

1. Visita la URL de tu frontend
2. Deberías ver la aplicación funcionando
3. Prueba hacer login y navegar por la aplicación

---

## 🔗 Configuración Final

### Actualizar FRONTEND_URL en Render

1. Ve a tu servicio en Render
2. Ve a **"Environment"**
3. Actualiza la variable `FRONTEND_URL` con la URL de Vercel:
   ```
   FRONTEND_URL=https://tu-frontend.vercel.app
   ```
4. Guarda los cambios
5. Render reiniciará automáticamente el servicio

### Verificar CORS

El backend ya está configurado para aceptar peticiones desde el frontend. El archivo `config/cors.php` usa la variable `FRONTEND_URL` para permitir el origen correcto.

### Probar la Conexión Completa

1. Abre tu frontend en Vercel
2. Intenta hacer login
3. Navega por las diferentes secciones
4. Verifica que las peticiones al backend funcionen correctamente

---

## 🐛 Solución de Problemas

### Problema: El backend no se conecta a la base de datos

**Solución:**
1. Verifica que las credenciales de la base de datos sean correctas
2. Asegúrate de que el Security Group de AWS permita conexiones desde Render
3. Verifica que la IP de Render esté permitida (puede ser necesario permitir `0.0.0.0/0` temporalmente)

### Problema: Error 500 en el backend

**Solución:**
1. Revisa los logs en Render (pestaña "Logs")
2. Verifica que `APP_KEY` esté configurado
3. Asegúrate de que todas las variables de entorno estén correctas
4. Verifica que las migraciones se hayan ejecutado

### Problema: CORS Error en el frontend

**Solución:**
1. Verifica que `FRONTEND_URL` en Render tenga la URL correcta de Vercel
2. Asegúrate de que la URL no termine con `/`
3. Revisa los logs del backend para ver errores de CORS

### Problema: El frontend no encuentra la API

**Solución:**
1. Verifica que `REACT_APP_API_URL` en Vercel tenga la URL correcta del backend
2. Asegúrate de que la URL termine con `/api`
3. Revisa la consola del navegador para ver errores de red

### Problema: El servicio se "duerme" en Render (Free Plan)

**Solución:**
- El plan gratuito de Render "duerme" el servicio después de 15 minutos de inactividad
- La primera petición después de dormir puede tardar 30-60 segundos
- Considera usar un servicio de "ping" gratuito como [UptimeRobot](https://uptimerobot.com) para mantener el servicio activo

### Problema: Build falla en Render

**Solución:**
1. Verifica que `composer.json` esté en la raíz del backend
2. Asegúrate de que PHP 8.2 esté disponible (Render lo detecta automáticamente)
3. Revisa los logs de build para ver el error específico

### Problema: Build falla en Vercel

**Solución:**
1. Verifica que `package.json` esté en la raíz del frontend
2. Asegúrate de que Node.js esté configurado (Vercel lo detecta automáticamente)
3. Revisa los logs de build para ver el error específico

---

## 📝 Checklist Final

- [ ] Backend desplegado en Render.com
- [ ] Variables de entorno configuradas en Render
- [ ] Migraciones ejecutadas
- [ ] Backend responde en `/api/test`
- [ ] Frontend desplegado en Vercel.com
- [ ] Variable `REACT_APP_API_URL` configurada en Vercel
- [ ] Variable `FRONTEND_URL` actualizada en Render
- [ ] Login funciona correctamente
- [ ] Las peticiones API funcionan desde el frontend
- [ ] CORS configurado correctamente

---

## 🔒 Notas de Seguridad

1. **Nunca** subas archivos `.env` a GitHub
2. Las contraseñas y claves deben estar solo en las variables de entorno
3. El plan gratuito de Render expone las variables de entorno en los logs (ten cuidado)
4. Considera usar variables de entorno secretas cuando sea posible

---

## 📞 URLs de Referencia

- **Render Dashboard**: [https://dashboard.render.com](https://dashboard.render.com)
- **Vercel Dashboard**: [https://vercel.com/dashboard](https://vercel.com/dashboard)
- **Documentación Render**: [https://render.com/docs](https://render.com/docs)
- **Documentación Vercel**: [https://vercel.com/docs](https://vercel.com/docs)

---

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando completamente. Si tienes algún problema, revisa la sección de solución de problemas o los logs en Render y Vercel.

**URLs de ejemplo:**
- Backend: `https://jm-ferreteria-backend.onrender.com`
- Frontend: `https://jm-ferreteria-frontend.vercel.app`

¡Feliz despliegue! 🚀

