<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UpdatePassword extends Command
{
    protected $signature = 'user:update-password {email} {password}';
    protected $description = 'Actualizar contraseña de un usuario';

    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password');
        
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error("Usuario no encontrado: {$email}");
            return 1;
        }
        
        $user->password = Hash::make($password);
        $user->save();
        
        $this->info("✅ Contraseña actualizada para: {$user->name}");
        $this->info("Email: {$user->email}");
        $this->info("Rol: {$user->rol}");
        
        return 0;
    }
} 