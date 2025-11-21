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
        // Compatible con MySQL y PostgreSQL
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN rol ENUM('admin', 'vendedor', 'cliente') NOT NULL DEFAULT 'cliente'");
        } else {
            // PostgreSQL: usar CHECK constraint
            DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_rol_check");
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_rol_check CHECK (rol IN ('admin', 'vendedor', 'cliente'))");
            DB::statement("ALTER TABLE users ALTER COLUMN rol SET DEFAULT 'cliente'");
            DB::statement("ALTER TABLE users ALTER COLUMN rol SET NOT NULL");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Compatible con MySQL y PostgreSQL
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN rol ENUM('admin', 'vendedor') NOT NULL DEFAULT 'vendedor'");
        } else {
            // PostgreSQL: revertir CHECK constraint
            DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_rol_check");
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_rol_check CHECK (rol IN ('admin', 'vendedor'))");
            DB::statement("ALTER TABLE users ALTER COLUMN rol SET DEFAULT 'vendedor'");
            DB::statement("ALTER TABLE users ALTER COLUMN rol SET NOT NULL");
        }
    }
};