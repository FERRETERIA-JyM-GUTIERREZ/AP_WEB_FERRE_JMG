<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Crear usuario admin
        User::create([
            'name' => 'Administrador',
            'email' => 'admin@ferreteria.com',
            'password' => Hash::make('password'),
            'rol' => 'admin'
        ]);

        // Crear usuario vendedor
        User::create([
            'name' => 'Vendedor',
            'email' => 'vendedor@ferreteria.com',
            'password' => Hash::make('password'),
            'rol' => 'vendedor'
        ]);

        $this->command->info('Usuarios de prueba creados exitosamente');
    }
} 