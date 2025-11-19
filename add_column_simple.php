<?php

// Script simple para agregar la columna cliente_dni
// Configuración de la base de datos (ajustar según tu configuración)
$host = 'localhost';
$dbname = 'jm_ferreteria'; // Ajustar al nombre de tu base de datos
$username = 'root'; // Ajustar según tu configuración
$password = 'Emerson$3'; // Ajustar según tu configuración

try {
    // Conectar a la base de datos
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Conectado a la base de datos exitosamente.\n";
    
    // Verificar si la columna existe
    $stmt = $pdo->prepare("SHOW COLUMNS FROM ventas LIKE 'cliente_dni'");
    $stmt->execute();
    $columns = $stmt->fetchAll();
    
    if (empty($columns)) {
        echo "La columna cliente_dni no existe. Agregándola...\n";
        
        // Agregar la columna
        $sql = "ALTER TABLE ventas ADD COLUMN cliente_dni VARCHAR(20) NULL AFTER cliente_telefono";
        $pdo->exec($sql);
        
        echo "Columna cliente_dni agregada exitosamente.\n";
    } else {
        echo "La columna cliente_dni ya existe.\n";
    }
    
    // Mostrar la estructura de la tabla
    echo "\nEstructura de la tabla ventas:\n";
    $stmt = $pdo->prepare("DESCRIBE ventas");
    $stmt->execute();
    $columns = $stmt->fetchAll();
    
    foreach ($columns as $column) {
        echo "- {$column['Field']}: {$column['Type']}\n";
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
} 