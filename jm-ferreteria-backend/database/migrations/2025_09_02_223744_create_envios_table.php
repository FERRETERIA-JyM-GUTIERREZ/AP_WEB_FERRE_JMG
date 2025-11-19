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
        Schema::create('envios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('venta_id')->constrained('ventas')->onDelete('cascade');
            $table->foreignId('destino_id')->constrained('destinos_envio');
            $table->enum('estado', ['preparado', 'enviado', 'en_transito', 'llegó_terminal', 'entregado'])->default('preparado');
            $table->decimal('costo', 8, 2);
            $table->json('datos_cliente');
            $table->timestamp('fecha_envio')->nullable();
            $table->timestamp('fecha_entrega_estimada')->nullable();
            $table->string('codigo_seguimiento')->unique();
            $table->text('notas')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('envios');
    }
};
