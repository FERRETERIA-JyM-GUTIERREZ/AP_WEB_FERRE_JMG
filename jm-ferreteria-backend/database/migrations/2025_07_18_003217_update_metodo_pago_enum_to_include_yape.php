<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Actualizar el enum para incluir 'yape'
        DB::statement("ALTER TABLE ventas MODIFY COLUMN metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'yape') DEFAULT 'efectivo'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revertir el enum a su estado anterior
        DB::statement("ALTER TABLE ventas MODIFY COLUMN metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia') DEFAULT 'efectivo'");
    }
};
