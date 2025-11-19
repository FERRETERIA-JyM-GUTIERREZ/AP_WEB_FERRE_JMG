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
        // Modificar la columna metodo_pago para incluir 'whatsapp'
        DB::statement("ALTER TABLE ventas MODIFY COLUMN metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'yape', 'whatsapp') DEFAULT 'efectivo'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revertir a los valores originales
        DB::statement("ALTER TABLE ventas MODIFY COLUMN metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'yape') DEFAULT 'efectivo'");
    }
};
