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
        Schema::table('ventas', function (Blueprint $table) {
            if (!Schema::hasColumn('ventas', 'cliente_dni')) {
                $table->string('cliente_dni', 20)->nullable()->after('cliente_telefono');
            }
            if (!Schema::hasColumn('ventas', 'anulado_por')) {
                $table->unsignedBigInteger('anulado_por')->nullable()->after('estado');
            }
            if (!Schema::hasColumn('ventas', 'anulado_en')) {
                $table->timestamp('anulado_en')->nullable()->after('anulado_por');
            }
            if (!Schema::hasColumn('ventas', 'motivo_anulacion')) {
                $table->string('motivo_anulacion')->nullable()->after('anulado_en');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            if (Schema::hasColumn('ventas', 'cliente_dni')) {
                $table->dropColumn('cliente_dni');
            }
            if (Schema::hasColumn('ventas', 'anulado_por')) {
                $table->dropColumn('anulado_por');
            }
            if (Schema::hasColumn('ventas', 'anulado_en')) {
                $table->dropColumn('anulado_en');
            }
            if (Schema::hasColumn('ventas', 'motivo_anulacion')) {
                $table->dropColumn('motivo_anulacion');
            }
        });
    }
};
