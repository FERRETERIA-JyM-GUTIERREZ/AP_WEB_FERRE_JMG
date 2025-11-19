<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RolePermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado',
            ], 401);
        }

        // Verificar si el usuario está activo
        if (!$user->activo) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario inactivo',
            ], 403);
        }

        // Admin tiene acceso a todo
        if ($user->rol === 'admin') {
            return $next($request);
        }

        // Verificar permisos específicos
        if (!$this->hasPermission($user, $permission)) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para realizar esta acción',
                'required_permission' => $permission,
                'user_role' => $user->rol,
            ], 403);
        }

        return $next($request);
    }

    /**
     * Verificar si el usuario tiene un permiso específico
     */
    private function hasPermission($user, string $permission): bool
    {
        // Obtener permisos del usuario (JSON o array)
        $userPermissions = $user->permisos ? json_decode($user->permisos, true) : [];
        
        // Si tiene permisos específicos, verificar en ellos
        if (!empty($userPermissions)) {
            return in_array($permission, $userPermissions);
        }

        // Si no tiene permisos específicos, usar permisos por defecto del rol
        return $this->getDefaultPermissions($user->rol, $permission);
    }

    /**
     * Obtener permisos por defecto según el rol - SIMPLIFICADO
     */
    private function getDefaultPermissions(string $role, string $permission): bool
    {
        $rolePermissions = [
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

        return in_array($permission, $rolePermissions[$role] ?? []);
    }
}
