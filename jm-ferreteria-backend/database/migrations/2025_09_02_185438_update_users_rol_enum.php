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
        // Actualizar el ENUM para incluir 'cliente'
        DB::statement("ALTER TABLE users MODIFY COLUMN rol ENUM('admin', 'vendedor', 'cliente') NOT NULL DEFAULT 'cliente'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revertir el ENUM a su estado original
        DB::statement("ALTER TABLE users MODIFY COLUMN rol ENUM('admin', 'vendedor') NOT NULL DEFAULT 'vendedor'");
    }
};