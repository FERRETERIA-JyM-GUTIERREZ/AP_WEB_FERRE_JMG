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
        // Compatible con MySQL y PostgreSQL
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE ventas MODIFY COLUMN metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'yape', 'whatsapp') DEFAULT 'efectivo'");
        } else {
            // PostgreSQL: usar CHECK constraint
            DB::statement("ALTER TABLE ventas DROP CONSTRAINT IF EXISTS ventas_metodo_pago_check");
            DB::statement("ALTER TABLE ventas ADD CONSTRAINT ventas_metodo_pago_check CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia', 'yape', 'whatsapp'))");
            DB::statement("ALTER TABLE ventas ALTER COLUMN metodo_pago SET DEFAULT 'efectivo'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Compatible con MySQL y PostgreSQL
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE ventas MODIFY COLUMN metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'yape') DEFAULT 'efectivo'");
        } else {
            // PostgreSQL: revertir CHECK constraint
            DB::statement("ALTER TABLE ventas DROP CONSTRAINT IF EXISTS ventas_metodo_pago_check");
            DB::statement("ALTER TABLE ventas ADD CONSTRAINT ventas_metodo_pago_check CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia', 'yape'))");
            DB::statement("ALTER TABLE ventas ALTER COLUMN metodo_pago SET DEFAULT 'efectivo'");
        }
    }
};
