<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Categoria;
use App\Models\Producto;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Usuario de prueba (admin)
        User::create([
            'name' => 'Admin',
            'email' => 'admin@ferreteria.com',
            'password' => Hash::make('admin123'),
            'rol' => 'admin',
        ]);

        // Usuario de prueba (vendedor)
        User::create([
            'name' => 'Vendedor',
            'email' => 'vendedor@ferreteria.com',
            'password' => Hash::make('vendedor123'),
            'rol' => 'vendedor',
        ]);

       

        // Crear categorías de ejemplo
        $categorias = [
            [
                'nombre' => 'Herramientas Manuales',
                'descripcion' => 'Herramientas básicas para trabajos manuales'
            ],
            [
                'nombre' => 'Herramientas Eléctricas',
                'descripcion' => 'Herramientas eléctricas para trabajos profesionales'
            ],
            [
                'nombre' => 'Plomería',
                'descripcion' => 'Productos para instalaciones de plomería'
            ],
            [
                'nombre' => 'Electricidad',
                'descripcion' => 'Materiales y herramientas para trabajos eléctricos'
            ],
            [
                'nombre' => 'Pintura',
                'descripcion' => 'Productos para pintura y acabados'
            ]
        ];

        foreach ($categorias as $cat) {
            Categoria::create($cat);
        }

        // Crear productos de ejemplo
        $productos = [
            [
                'nombre' => 'Taladro Eléctrico Profesional',
                'descripcion' => 'Taladro de 18V con batería recargable, ideal para trabajos profesionales',
                'precio' => 250000,
                'stock' => 15,
                'categoria_id' => 2,
                'imagen' => 'taladro1.jpg',
                'activo' => true
            ],
            [
                'nombre' => 'Martillo de Carpintero',
                'descripcion' => 'Martillo de 16oz con mango de madera, perfecto para trabajos básicos',
                'precio' => 45000,
                'stock' => 25,
                'categoria_id' => 1,
                'imagen' => 'martillo1.jpg',
                'activo' => true
            ],
            [
                'nombre' => 'Destornillador Phillips',
                'descripcion' => 'Destornillador Phillips de 6 pulgadas con mango ergonómico',
                'precio' => 15000,
                'stock' => 50,
                'categoria_id' => 1,
                'imagen' => 'destornillador1.jpg',
                'activo' => true
            ],
            [
                'nombre' => 'Sierra Circular',
                'descripcion' => 'Sierra circular de 7-1/4 pulgadas con motor de 15A',
                'precio' => 320000,
                'stock' => 8,
                'categoria_id' => 2,
                'imagen' => 'sierra1.jpg',
                'activo' => true
            ],
            [
                'nombre' => 'Tubo PVC 2 pulgadas',
                'descripcion' => 'Tubo PVC de 2 pulgadas, 3 metros de longitud',
                'precio' => 28000,
                'stock' => 30,
                'categoria_id' => 3,
                'imagen' => 'tubo1.jpg',
                'activo' => true
            ],
            [
                'nombre' => 'Cable Eléctrico 12 AWG',
                'descripcion' => 'Cable eléctrico 12 AWG, 100 metros, para instalaciones residenciales',
                'precio' => 85000,
                'stock' => 20,
                'categoria_id' => 4,
                'imagen' => 'cable1.jpg',
                'activo' => true
            ],
            [
                'nombre' => 'Pintura Interior Blanca',
                'descripcion' => 'Pintura interior blanca, 1 galón, acabado mate',
                'precio' => 65000,
                'stock' => 12,
                'categoria_id' => 5,
                'imagen' => 'pintura1.jpg',
                'activo' => true
            ],
            [
                'nombre' => 'Llave Ajustable 10 pulgadas',
                'descripcion' => 'Llave ajustable de 10 pulgadas, ideal para trabajos de plomería',
                'precio' => 35000,
                'stock' => 18,
                'categoria_id' => 1,
                'imagen' => 'llave1.jpg',
                'activo' => true
            ],
            [
                'nombre' => 'Interruptor Simple',
                'descripcion' => 'Interruptor simple para instalaciones eléctricas residenciales',
                'precio' => 12000,
                'stock' => 40,
                'categoria_id' => 4,
                'imagen' => 'interruptor1.jpg',
                'activo' => true
            ],
            [
                'nombre' => 'Rodillo de Pintura',
                'descripcion' => 'Rodillo de pintura de 9 pulgadas con mango telescópico',
                'precio' => 22000,
                'stock' => 15,
                'categoria_id' => 5,
                'imagen' => 'rodillo1.jpg',
                'activo' => true
            ]
        ];

        foreach ($productos as $prod) {
            Producto::create($prod);
        }
    }
}
