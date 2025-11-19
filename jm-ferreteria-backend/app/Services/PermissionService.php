<?php

namespace App\Services;

use App\Models\User;

class PermissionService
{
    /**
     * Definición de permisos del sistema
     */
    public const PERMISSIONS = [
        // Inventario
        'inventario.view' => 'Ver inventario',
        'inventario.create' => 'Crear productos',
        'inventario.update' => 'Actualizar productos',
        'inventario.delete' => 'Eliminar productos',
        'inventario.stock' => 'Gestionar stock',
        
        // Ventas
        'ventas.view' => 'Ver ventas',
        'ventas.create' => 'Crear ventas',
        'ventas.update' => 'Actualizar ventas',
        'ventas.delete' => 'Eliminar ventas',
        'ventas.anular' => 'Anular ventas',
        
        // Pedidos
        'pedidos.view' => 'Ver pedidos',
        'pedidos.create' => 'Crear pedidos',
        'pedidos.update' => 'Actualizar pedidos',
        'pedidos.delete' => 'Eliminar pedidos',
        'pedidos.estado' => 'Cambiar estado de pedidos',
        
        // Categorías
        'categorias.view' => 'Ver categorías',
        'categorias.create' => 'Crear categorías',
        'categorias.update' => 'Actualizar categorías',
        'categorias.delete' => 'Eliminar categorías',
        
        // Reportes
        'reportes.view' => 'Ver reportes',
        'reportes.export' => 'Exportar reportes',
        
        // Usuarios
        'usuarios.view' => 'Ver usuarios',
        'usuarios.create' => 'Crear usuarios',
        'usuarios.update' => 'Actualizar usuarios',
        'usuarios.delete' => 'Eliminar usuarios',
        
        // Envíos
        'envios.view' => 'Ver envíos',
        'envios.update' => 'Actualizar envíos',
    ];

    /**
     * Permisos por defecto según el rol - SIMPLIFICADO
     */
    public const ROLE_PERMISSIONS = [
        'admin' => [
            // Admin tiene todos los permisos
        ],
        'vendedor' => [
            // Vendedores pueden hacer todo excepto gestionar usuarios
            'inventario.view',
            'inventario.create',
            'inventario.update',
            'inventario.delete',
            'inventario.stock',
            'ventas.view',
            'ventas.create',
            'ventas.update',
            'ventas.delete',
            'ventas.anular',
            'pedidos.view',
            'pedidos.create',
            'pedidos.update',
            'pedidos.delete',
            'pedidos.estado',
            'categorias.view',
            'categorias.create',
            'categorias.update',
            'categorias.delete',
            'reportes.view',
            'reportes.export',
            'envios.view',
            'envios.update',
        ],
        'cliente' => [
            // Los clientes no tienen permisos de empleado
        ],
    ];

    /**
     * Verificar si un usuario tiene un permiso específico
     */
    public function hasPermission(User $user, string $permission): bool
    {
        // Admin tiene todos los permisos
        if ($user->rol === 'admin') {
            return true;
        }

        // Verificar si el usuario está activo
        if (!$user->activo) {
            return false;
        }

        // Obtener permisos del usuario
        $userPermissions = $this->getUserPermissions($user);
        
        return in_array($permission, $userPermissions);
    }

    /**
     * Obtener todos los permisos de un usuario
     */
    public function getUserPermissions(User $user): array
    {
        // Si tiene permisos específicos, usarlos
        if ($user->permisos) {
            $customPermissions = json_decode($user->permisos, true);
            if (is_array($customPermissions)) {
                return $customPermissions;
            }
        }

        // Usar permisos por defecto del rol
        return self::ROLE_PERMISSIONS[$user->rol] ?? [];
    }

    /**
     * Obtener permisos disponibles para un rol
     */
    public function getAvailablePermissions(string $role): array
    {
        return self::ROLE_PERMISSIONS[$role] ?? [];
    }

    /**
     * Obtener todos los permisos del sistema
     */
    public function getAllPermissions(): array
    {
        return self::PERMISSIONS;
    }

    /**
     * Verificar múltiples permisos
     */
    public function hasAnyPermission(User $user, array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($user, $permission)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Verificar que tenga todos los permisos
     */
    public function hasAllPermissions(User $user, array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (!$this->hasPermission($user, $permission)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Obtener roles disponibles - SIMPLIFICADO
     */
    public function getAvailableRoles(): array
    {
        return [
            'admin' => 'Administrador',
            'vendedor' => 'Vendedor',
            'cliente' => 'Cliente',
        ];
    }
}
