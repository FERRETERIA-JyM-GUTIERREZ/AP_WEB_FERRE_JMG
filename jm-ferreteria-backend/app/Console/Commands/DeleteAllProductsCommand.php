<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Producto;

class DeleteAllProductsCommand extends Command
{
    protected $signature = 'productos:delete-all {--force : Forzar eliminación sin confirmación}';
    protected $description = 'Eliminar todos los productos de la base de datos';

    public function handle()
    {
        $count = Producto::count();
        
        if ($count === 0) {
            $this->info('✅ No hay productos para eliminar.');
            return 0;
        }

        $this->warn("⚠️  ADVERTENCIA: Se eliminarán {$count} productos de la base de datos.");
        $this->warn('⚠️  Esta acción NO se puede deshacer.');

        if (!$this->option('force')) {
            if (!$this->confirm('¿Estás seguro de que deseas continuar?')) {
                $this->info('Operación cancelada.');
                return 0;
            }
        }

        try {
            $deleted = Producto::query()->delete();
            
            $this->info("✅ Se eliminaron {$deleted} productos exitosamente.");
            return 0;
        } catch (\Exception $e) {
            $this->error("❌ Error al eliminar productos: {$e->getMessage()}");
            return 1;
        }
    }
}

