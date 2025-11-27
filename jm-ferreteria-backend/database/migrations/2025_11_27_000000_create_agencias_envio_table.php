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
        Schema::create('agencias_envio', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('ciudad');
            $table->string('departamento');
            $table->text('direccion');
            $table->text('referencia')->nullable();
            $table->string('tipo')->nullable(); // Grande/Co, Pequeña, Mediana, Micro, Terminal, Mini-micro
            $table->string('telefono')->nullable();
            $table->text('horarios')->nullable();
            $table->string('transportista')->default('Shalom'); // Para futuras expansiones
            $table->boolean('activo')->default(true);
            $table->timestamps();
            
            // Índices para búsquedas rápidas
            $table->index('ciudad');
            $table->index('departamento');
            $table->index('activo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agencias_envio');
    }
};

