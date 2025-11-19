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
            // Solo cambiar el enum de roles a la versión simplificada
            $table->enum('rol', ['admin', 'vendedor', 'cliente'])->default('cliente')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('rol', [
                'admin', 
                'gerente', 
                'vendedor', 
                'cajero', 
                'almacenero', 
                'supervisor', 
                'cliente'
            ])->default('cliente')->change();
        });
    }
};


