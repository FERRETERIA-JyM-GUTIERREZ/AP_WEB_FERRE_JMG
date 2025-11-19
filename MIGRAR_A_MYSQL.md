# 🔄 Guía: Cambiar de SQLite a MySQL

## ❓ ¿Por qué cambiar a MySQL?

### SQLite (Actual - Solo Desarrollo):
- ❌ No es adecuado para producción
- ❌ Límites de concurrencia (un solo escritor a la vez)
- ❌ No soporta múltiples usuarios simultáneos bien
- ❌ Límites de tamaño de base de datos
- ✅ Solo sirve para desarrollo/pruebas

### MySQL (Recomendado para Producción):
- ✅ Diseñado para aplicaciones web
- ✅ Soporta múltiples usuarios simultáneos
- ✅ Mejor rendimiento y escalabilidad
- ✅ Transacciones más robustas
- ✅ Estándar en la industria

---

## 📋 PASO 1: Instalar MySQL

### Windows:
1. Descarga MySQL desde: https://dev.mysql.com/downloads/installer/
2. Ejecuta el instalador
3. Elige "Developer Default" o "Server only"
4. Durante la instalación:
   - Configura contraseña para usuario `root`
   - Anota la contraseña (la necesitarás)
5. Verifica la instalación:
   ```bash
   mysql --version
   ```

### Alternativa más fácil - XAMPP:
1. Descarga XAMPP: https://www.apachefriends.org/
2. Instala XAMPP (incluye MySQL)
3. Abre el Panel de Control de XAMPP
4. Inicia MySQL

---

## 📋 PASO 2: Crear la Base de Datos MySQL

### Opción A: Usando línea de comandos
```bash
# Conectar a MySQL
mysql -u root -p
# Te pedirá la contraseña que configuraste
```

Luego ejecuta:
```sql
-- Crear la base de datos
CREATE DATABASE jm_ferreteria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear un usuario (opcional pero recomendado)
CREATE USER 'ferreteria_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON jm_ferreteria.* TO 'ferreteria_user'@'localhost';
FLUSH PRIVILEGES;

-- Verificar que se creó
SHOW DATABASES;

-- Salir
EXIT;
```

### Opción B: Usando phpMyAdmin (si instalaste XAMPP)
1. Abre: http://localhost/phpmyadmin
2. Haz clic en "Nueva" (New)
3. Nombre: `jm_ferreteria`
4. Cotejamiento: `utf8mb4_unicode_ci`
5. Clic en "Crear"

---

## 📋 PASO 3: Cambiar Configuración en Laravel

### 1. Editar archivo `.env`:

Abre `jm-ferreteria-backend/.env` y cambia:

**ANTES (SQLite):**
```env
DB_CONNECTION=sqlite
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=database
# DB_USERNAME=root
# DB_PASSWORD=
```

**DESPUÉS (MySQL):**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=jm_ferreteria
DB_USERNAME=root
DB_PASSWORD=tu_password_de_mysql
```

**Si creaste un usuario específico:**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=jm_ferreteria
DB_USERNAME=ferreteria_user
DB_PASSWORD=tu_password_seguro
```

### 2. Verificar que PHP tiene extensión MySQL:

Abre PowerShell y ejecuta:
```bash
php -m | findstr pdo_mysql
```

Si no aparece, necesitas habilitar la extensión:
1. Abre `php.ini` (ubicación: `php --ini`)
2. Busca: `;extension=pdo_mysql`
3. Quita el `;` al inicio: `extension=pdo_mysql`
4. Reinicia el servidor

---

## 📋 PASO 4: Migrar los Datos (Si tienes datos importantes)

### Si NO tienes datos importantes:
Simplemente ejecuta las migraciones:
```bash
cd jm-ferreteria-backend
php artisan migrate:fresh --seed
```

### Si SÍ tienes datos importantes en SQLite:

#### Opción 1: Exportar e Importar manualmente
```bash
# Exportar datos de SQLite a SQL
sqlite3 database/database.sqlite .dump > backup.sql

# Editar backup.sql para que sea compatible con MySQL
# Luego importar en MySQL
mysql -u root -p jm_ferreteria < backup.sql
```

#### Opción 2: Usar un script de migración
Puedo crear un script que migre los datos automáticamente.

---

## 📋 PASO 5: Ejecutar Migraciones

```bash
cd jm-ferreteria-backend

# Limpiar cache de configuración
php artisan config:clear

# Ejecutar migraciones
php artisan migrate

# Si quieres datos de ejemplo
php artisan db:seed
```

---

## 📋 PASO 6: Verificar que Funciona

```bash
# Probar conexión
php artisan tinker
```

En tinker:
```php
DB::connection()->getPdo();
// Debe mostrar: PDO connection info

// Verificar tablas
DB::select('SHOW TABLES');
// Debe mostrar todas tus tablas

exit
```

---

## ✅ Checklist de Migración

- [ ] MySQL instalado y corriendo
- [ ] Base de datos `jm_ferreteria` creada
- [ ] Usuario creado (opcional)
- [ ] Archivo `.env` actualizado con credenciales MySQL
- [ ] Extensión `pdo_mysql` habilitada en PHP
- [ ] Migraciones ejecutadas: `php artisan migrate`
- [ ] Datos migrados (si aplica)
- [ ] Probar que la aplicación funciona

---

## 🆘 Problemas Comunes

### Error: "Class 'PDO' not found"
**Solución:** Habilita extensión MySQL en `php.ini`

### Error: "Access denied for user"
**Solución:** Verifica usuario y contraseña en `.env`

### Error: "Unknown database 'jm_ferreteria'"
**Solución:** Crea la base de datos primero (Paso 2)

### Error: "SQLSTATE[HY000] [2002]"
**Solución:** Verifica que MySQL está corriendo

---

## 💡 Recomendación

**Para desarrollo local:** Puedes seguir usando SQLite si quieres
**Para producción:** DEBES usar MySQL (o MariaDB)

¿Necesitas ayuda con algún paso específico?










