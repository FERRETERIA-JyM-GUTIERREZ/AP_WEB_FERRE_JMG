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
        // Actualizar todos los registros de 'Shalon' a 'Shalom'
        DB::table('agencias_envio')
            ->where('transportista', 'Shalon')
            ->update(['transportista' => 'Shalom']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revertir el cambio: 'Shalom' a 'Shalon'
        DB::table('agencias_envio')
            ->where('transportista', 'Shalom')
            ->update(['transportista' => 'Shalon']);
    }
};
