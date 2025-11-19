<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Categoria;
use App\Models\Producto;

class ProductoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear categorías
        $categoria1 = Categoria::create([
            'nombre' => 'Herramientas',
            'descripcion' => 'Herramientas de construcción'
        ]);

        $categoria2 = Categoria::create([
            'nombre' => 'Materiales',
            'descripcion' => 'Materiales de construcción'
        ]);

        $categoria3 = Categoria::create([
            'nombre' => 'Electricidad',
            'descripcion' => 'Productos eléctricos'
        ]);

        $categoria4 = Categoria::create([
            'nombre' => 'Plomería',
            'descripcion' => 'Productos de plomería'
        ]);

        // Crear productos
        Producto::create([
            'nombre' => 'Martillo de 500g',
            'descripcion' => 'Martillo de acero forjado, mango de madera',
            'precio' => 25000,
            'stock' => 50,
            'categoria_id' => $categoria1->id,
            'foto' => 'martillo.jpg'
        ]);

        Producto::create([
            'nombre' => 'Destornillador Phillips',
            'descripcion' => 'Destornillador Phillips 6 pulgadas',
            'precio' => 8000,
            'stock' => 100,
            'categoria_id' => $categoria1->id,
            'foto' => 'destornillador.jpg'
        ]);

        Producto::create([
            'nombre' => 'Cemento Portland 50kg',
            'descripcion' => 'Cemento Portland tipo I, bolsa de 50kg',
            'precio' => 18000,
            'stock' => 100,
            'categoria_id' => $categoria2->id,
            'foto' => 'cemento.jpg'
        ]);

        Producto::create([
            'nombre' => 'Arena Fina 1m³',
            'descripcion' => 'Arena fina para construcción, metro cúbico',
            'precio' => 35000,
            'stock' => 20,
            'categoria_id' => $categoria2->id,
            'foto' => 'arena.jpg'
        ]);

        Producto::create([
            'nombre' => 'Cable THW 12 AWG',
            'descripcion' => 'Cable eléctrico THW calibre 12, 100 metros',
            'precio' => 45000,
            'stock' => 25,
            'categoria_id' => $categoria3->id,
            'foto' => 'cable.jpg'
        ]);

        Producto::create([
            'nombre' => 'Interruptor Simple',
            'descripcion' => 'Interruptor simple para 110V',
            'precio' => 12000,
            'stock' => 80,
            'categoria_id' => $categoria3->id,
            'foto' => 'interruptor.jpg'
        ]);

        Producto::create([
            'nombre' => 'Tubo PVC 4 pulgadas',
            'descripcion' => 'Tubo PVC para alcantarillado, 4 pulgadas x 6 metros',
            'precio' => 28000,
            'stock' => 30,
            'categoria_id' => $categoria4->id,
            'foto' => 'tubo_pvc.jpg'
        ]);

        Producto::create([
            'nombre' => 'Llave de Paso 1/2"',
            'descripcion' => 'Llave de paso de bronce, 1/2 pulgada',
            'precio' => 15000,
            'stock' => 60,
            'categoria_id' => $categoria4->id,
            'foto' => 'llave_paso.jpg'
        ]);
    }
}