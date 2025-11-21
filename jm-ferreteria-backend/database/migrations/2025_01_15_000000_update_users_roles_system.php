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
        // Para PostgreSQL: cambiar a string y agregar constraint CHECK
        Schema::table('users', function (Blueprint $table) {
            $table->string('rol')->change(); // Cambiar a string temporalmente
        });
        
        // Agregar constraint CHECK para PostgreSQL
        \DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS check_rol");
        \DB::statement("ALTER TABLE users ADD CONSTRAINT check_rol CHECK (rol IN ('admin', 'gerente', 'vendedor', 'cajero', 'almacenero', 'supervisor', 'cliente'))");
        
        Schema::table('users', function (Blueprint $table) {
            $table->string('rol')->default('cliente')->notNull()->change();
            
            // Agregar campos adicionales para permisos específicos
            $table->json('permisos')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamp('ultimo_acceso')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['permisos', 'activo', 'ultimo_acceso']);
        });
        
        // Para PostgreSQL: cambiar constraint
        \DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS check_rol");
        \DB::statement("ALTER TABLE users ADD CONSTRAINT check_rol CHECK (rol IN ('admin', 'vendedor', 'cliente'))");
        
        Schema::table('users', function (Blueprint $table) {
            $table->string('rol')->default('cliente')->change();
        });
    }
};


