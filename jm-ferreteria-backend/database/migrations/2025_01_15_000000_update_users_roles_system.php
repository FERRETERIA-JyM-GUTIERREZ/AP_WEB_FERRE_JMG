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
        Schema::table('users', function (Blueprint $table) {
            // Cambiar el enum de rol para incluir más roles específicos
            $table->enum('rol', [
                'admin',           // Administrador completo
                'gerente',         // Gerente de tienda
                'vendedor',        // Vendedor general
                'cajero',          // Cajero/Registro de ventas
                'almacenero',      // Gestión de inventario
                'supervisor',      // Supervisor de operaciones
                'cliente'          // Cliente final
            ])->default('cliente')->change();
            
            // Agregar campos adicionales para permisos específicos
            $table->json('permisos')->nullable()->after('rol');
            $table->boolean('activo')->default(true)->after('permisos');
            $table->timestamp('ultimo_acceso')->nullable()->after('activo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('rol', ['admin', 'vendedor', 'cliente'])->default('cliente')->change();
            $table->dropColumn(['permisos', 'activo', 'ultimo_acceso']);
        });
    }
};


