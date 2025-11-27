# 🚀 Guía para Subir Cambios a Producción con Git

## ✅ Estado Actual

Tu proyecto **SÍ está configurado** para desplegarse automáticamente desde Git:

- **Frontend**: Vercel (despliega automáticamente desde GitHub)
- **Backend**: Render o Railway (despliega automáticamente desde GitHub)
- **Rama principal**: `main`
- **Repositorio**: Conectado a GitHub (origin)

---

## 📋 Proceso para Subir Cambios a Producción

### Paso 1: Verificar Cambios Locales

```bash
# Ver qué archivos has modificado
git status

# Ver los cambios específicos
git diff
```

### Paso 2: Agregar Cambios al Staging

```bash
# Agregar todos los archivos modificados
git add .

# O agregar archivos específicos
git add jm-ferreteria-frontend/src/pages/Checkout.js
```

### Paso 3: Hacer Commit (Guardar Cambios Localmente)

```bash
# Hacer commit con un mensaje descriptivo
git commit -m "Descripción de los cambios realizados"

# Ejemplos de mensajes:
# git commit -m "Corregir problema en checkout"
# git commit -m "Agregar nueva funcionalidad de envío"
# git commit -m "Actualizar diseño del carrito"
```

### Paso 4: Subir Cambios a GitHub (Producción)

```bash
# Subir cambios a la rama main
git push origin main
```

**⚠️ IMPORTANTE**: Una vez que hagas `git push`, los cambios se subirán automáticamente a producción:

- **Vercel** (Frontend): Detectará el push y desplegará automáticamente
- **Render/Railway** (Backend): Detectará el push y desplegará automáticamente

---

## ⏱️ Tiempo de Despliegue

- **Frontend (Vercel)**: 2-5 minutos
- **Backend (Render/Railway)**: 5-10 minutos

Puedes ver el progreso del despliegue en:
- **Vercel**: https://vercel.com/dashboard
- **Render**: https://dashboard.render.com
- **Railway**: https://railway.app/dashboard

---

## 🔍 Verificar que los Cambios se Subieron

### 1. Verificar en GitHub

```bash
# Ver el último commit
git log --oneline -1

# Ver el estado del repositorio remoto
git remote -v
```

### 2. Verificar en las Plataformas de Despliegue

- **Vercel**: Revisa el dashboard para ver el estado del último deploy
- **Render/Railway**: Revisa los logs del servicio para ver el progreso

---

## ⚠️ Antes de Subir Cambios

### Checklist Pre-Deploy:

- [ ] **NO subir archivos `.env`** (están en `.gitignore`)
- [ ] **NO subir `node_modules/`** (están en `.gitignore`)
- [ ] **NO subir `vendor/`** (están en `.gitignore`)
- [ ] Verificar que los cambios funcionan localmente
- [ ] Revisar que no hay errores de sintaxis
- [ ] Mensaje de commit descriptivo

### Verificar Archivos que NO se Deben Subir:

```bash
# Ver qué archivos están siendo ignorados
git status --ignored

# Verificar que .env no está en el commit
git check-ignore .env
```

---

## 🐛 Solución de Problemas

### Error: "No se puede hacer push"

```bash
# Si hay cambios en el remoto que no tienes localmente
git pull origin main

# Resolver conflictos si los hay, luego:
git push origin main
```

### Error: "Cambios no guardados"

```bash
# Ver qué archivos tienen cambios sin guardar
git status

# Guardar cambios
git add .
git commit -m "Mensaje descriptivo"
git push origin main
```

### Verificar Estado del Repositorio

```bash
# Ver estado actual
git status

# Ver últimos commits
git log --oneline -10

# Ver diferencias con el remoto
git fetch
git log HEAD..origin/main
```

---

## 📝 Ejemplo Completo de Flujo

```bash
# 1. Hacer cambios en tu código (ej: Checkout.js)

# 2. Ver qué cambió
git status

# 3. Agregar cambios
git add jm-ferreteria-frontend/src/pages/Checkout.js

# 4. Hacer commit
git commit -m "Mejorar validación en checkout"

# 5. Subir a producción
git push origin main

# 6. Esperar 2-5 minutos y verificar en Vercel/Render
```

---

## 🔄 Flujo de Trabajo Recomendado

### Para Cambios Pequeños (Hotfix):

```bash
git add .
git commit -m "Fix: Descripción del fix"
git push origin main
```

### Para Cambios Grandes (Feature):

```bash
# 1. Crear una rama nueva (opcional pero recomendado)
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios y commits
git add .
git commit -m "Feat: Agregar nueva funcionalidad"

# 3. Fusionar con main
git checkout main
git merge feature/nueva-funcionalidad

# 4. Subir a producción
git push origin main
```

---

## 🎯 Comandos Rápidos de Referencia

```bash
# Ver estado
git status

# Ver cambios
git diff

# Agregar todo
git add .

# Commit
git commit -m "Mensaje"

# Subir a producción
git push origin main

# Ver historial
git log --oneline -10

# Ver remotes
git remote -v
```

---

## ✅ Conclusión

**SÍ, puedes subir cambios a producción con Git**. El proceso es:

1. `git add .` - Agregar cambios
2. `git commit -m "mensaje"` - Guardar cambios
3. `git push origin main` - Subir a producción

Los servicios de despliegue (Vercel, Render, Railway) detectarán automáticamente el push y desplegarán los cambios.

**¡Es así de simple!** 🚀

