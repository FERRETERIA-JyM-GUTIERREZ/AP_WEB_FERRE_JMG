<?php

// Script para agregar la columna cliente_dni a la tabla ventas
require_once 'vendor/autoload.php';

// Cargar Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

try {
    echo "Verificando si la columna cliente_dni existe...\n";
    
    // Verificar si la columna existe
    $columns = DB::select("SHOW COLUMNS FROM ventas LIKE 'cliente_dni'");
    
    if (empty($columns)) {
        echo "La columna cliente_dni no existe. Agregándola...\n";
        
        // Agregar la columna
        DB::statement("ALTER TABLE ventas ADD COLUMN cliente_dni VARCHAR(20) NULL AFTER cliente_telefono");
        
        echo "Columna cliente_dni agregada exitosamente.\n";
    } else {
        echo "La columna cliente_dni ya existe.\n";
    }
    
    echo "Verificando estructura de la tabla ventas:\n";
    $columns = DB::select("DESCRIBE ventas");
    foreach ($columns as $column) {
        echo "- {$column->Field}: {$column->Type}\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
} 