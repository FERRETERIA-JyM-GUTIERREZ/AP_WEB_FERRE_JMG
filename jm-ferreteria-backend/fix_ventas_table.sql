-- Script SQL para agregar la columna cliente_dni a la tabla ventas
-- Ejecutar este script directamente en MySQL

-- Verificar si la columna existe
SELECT COUNT(*) as column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'ventas' 
AND COLUMN_NAME = 'cliente_dni';

-- Agregar la columna si no existe
ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS cliente_dni VARCHAR(20) NULL 
AFTER cliente_telefono;

-- Verificar la estructura de la tabla
DESCRIBE ventas; 