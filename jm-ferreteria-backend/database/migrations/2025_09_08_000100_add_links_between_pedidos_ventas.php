<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            if (!Schema::hasColumn('ventas', 'pedido_id')) {
                $table->foreignId('pedido_id')->nullable()->constrained('pedidos')->nullOnDelete();
            }
        });

        Schema::table('pedidos', function (Blueprint $table) {
            if (!Schema::hasColumn('pedidos', 'venta_id')) {
                $table->foreignId('venta_id')->nullable()->constrained('ventas')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            if (Schema::hasColumn('pedidos', 'venta_id')) {
                $table->dropConstrainedForeignId('venta_id');
            }
        });

        Schema::table('ventas', function (Blueprint $table) {
            if (Schema::hasColumn('ventas', 'pedido_id')) {
                $table->dropConstrainedForeignId('pedido_id');
            }
        });
    }
};




