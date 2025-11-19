<?php

use Illuminate\Console\Command;

class CheckUsersCommand extends Command
{
    protected $signature = 'check:users';
    protected $description = 'Verificar usuarios y sus permisos';

    public function handle()
    {
        $users = \App\Models\User::all();
        
        $this->info('Usuarios en el sistema:');
        foreach ($users as $user) {
            $this->line("ID: {$user->id} | Nombre: {$user->name} | Email: {$user->email} | Rol: {$user->rol} | Activo: " . ($user->activo ? 'Sí' : 'No'));
        }
    }
}
