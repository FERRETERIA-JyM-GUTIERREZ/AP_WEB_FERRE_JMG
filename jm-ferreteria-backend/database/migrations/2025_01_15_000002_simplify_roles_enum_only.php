<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Para PostgreSQL: cambiar constraint CHECK
        \DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS check_rol");
        \DB::statement("ALTER TABLE users ADD CONSTRAINT check_rol CHECK (rol IN ('admin', 'vendedor', 'cliente'))");
        
        Schema::table('users', function (Blueprint $table) {
            $table->string('rol')->default('cliente')->notNull()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Para PostgreSQL: revertir constraint CHECK
        \DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS check_rol");
        \DB::statement("ALTER TABLE users ADD CONSTRAINT check_rol CHECK (rol IN ('admin', 'gerente', 'vendedor', 'cajero', 'almacenero', 'supervisor', 'cliente'))");
        
        Schema::table('users', function (Blueprint $table) {
            $table->string('rol')->default('cliente')->change();
        });
    }
};


