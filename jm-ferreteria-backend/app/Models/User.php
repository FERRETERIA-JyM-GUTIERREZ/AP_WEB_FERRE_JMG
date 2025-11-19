<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'rol',
        'permisos',
        'activo',
        'ultimo_acceso',
        'google_id',
        'avatar',
        'phone',
        'address',
        'dni',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'permisos' => 'array',
            'activo' => 'boolean',
            'ultimo_acceso' => 'datetime',
        ];
    }

    /**
     * Verificar si el usuario tiene un permiso específico
     */
    public function hasPermission(string $permission): bool
    {
        $permissionService = app(\App\Services\PermissionService::class);
        return $permissionService->hasPermission($this, $permission);
    }

    /**
     * Verificar si el usuario tiene cualquiera de los permisos
     */
    public function hasAnyPermission(array $permissions): bool
    {
        $permissionService = app(\App\Services\PermissionService::class);
        return $permissionService->hasAnyPermission($this, $permissions);
    }

    /**
     * Verificar si el usuario tiene todos los permisos
     */
    public function hasAllPermissions(array $permissions): bool
    {
        $permissionService = app(\App\Services\PermissionService::class);
        return $permissionService->hasAllPermissions($this, $permissions);
    }

    /**
     * Obtener todos los permisos del usuario
     */
    public function getPermissions(): array
    {
        $permissionService = app(\App\Services\PermissionService::class);
        return $permissionService->getUserPermissions($this);
    }

    /**
     * Verificar si es administrador
     */
    public function isAdmin(): bool
    {
        return $this->rol === 'admin';
    }

    /**
     * Verificar si es empleado (no cliente)
     */
    public function isEmployee(): bool
    {
        return !in_array($this->rol, ['cliente']);
    }

    /**
     * Actualizar último acceso
     */
    public function updateLastAccess(): void
    {
        $this->update(['ultimo_acceso' => now()]);
    }
}
