<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TestLogin extends Command
{
    protected $signature = 'auth:test-login {email} {password}';
    protected $description = 'Probar login de un usuario';

    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password');
        
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error("Usuario no encontrado: {$email}");
            return 1;
        }
        
        if (Hash::check($password, $user->password)) {
            $this->info("✅ Login exitoso para: {$user->name}");
            $this->info("Email: {$user->email}");
            $this->info("Rol: {$user->rol}");
            $this->info("ID: {$user->id}");
            return 0;
        } else {
            $this->error("❌ Contraseña incorrecta para: {$email}");
            return 1;
        }
    }
} 