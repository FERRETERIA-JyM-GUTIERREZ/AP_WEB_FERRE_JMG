<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class CheckUsers extends Command
{
    protected $signature = 'users:check';
    protected $description = 'Verificar usuarios en la base de datos';

    public function handle()
    {
        $users = User::all(['id', 'name', 'email', 'rol']);
        
        $this->info('Usuarios en la base de datos:');
        $this->table(
            ['ID', 'Nombre', 'Email', 'Rol'],
            $users->map(function($user) {
                return [$user->id, $user->name, $user->email, $user->rol];
            })->toArray()
        );
        
        return 0;
    }
} 