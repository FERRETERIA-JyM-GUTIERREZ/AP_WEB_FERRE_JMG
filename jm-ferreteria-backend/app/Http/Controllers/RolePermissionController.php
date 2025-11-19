<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\PermissionService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RolePermissionController extends Controller
{
    protected $permissionService;

    public function __construct(PermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    /**
     * Obtener todos los roles disponibles
     */
    public function getRoles()
    {
        return response()->json([
            'success' => true,
            'roles' => $this->permissionService->getAvailableRoles(),
        ]);
    }

    /**
     * Obtener todos los permisos disponibles
     */
    public function getPermissions()
    {
        return response()->json([
            'success' => true,
            'permissions' => $this->permissionService->getAllPermissions(),
        ]);
    }

    /**
     * Obtener permisos de un rol específico
     */
    public function getRolePermissions(Request $request, $role)
    {
        $permissions = $this->permissionService->getAvailablePermissions($role);
        
        return response()->json([
            'success' => true,
            'role' => $role,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Obtener permisos de un usuario específico
     */
    public function getUserPermissions(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        $permissions = $this->permissionService->getUserPermissions($user);
        
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'rol' => $user->rol,
            ],
            'permissions' => $permissions,
        ]);
    }

    /**
     * Actualizar permisos de un usuario
     */
    public function updateUserPermissions(Request $request, $userId)
    {
        $request->validate([
            'rol' => ['required', Rule::in(array_keys($this->permissionService->getAvailableRoles()))],
            'permisos' => 'nullable|array',
            'permisos.*' => 'string|in:' . implode(',', array_keys($this->permissionService->getAllPermissions())),
            'activo' => 'boolean',
        ]);

        $user = User::findOrFail($userId);
        
        // Solo admin puede cambiar roles de otros usuarios
        if ($request->user()->rol !== 'admin' && $user->id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para modificar este usuario',
            ], 403);
        }

        $user->update([
            'rol' => $request->rol,
            'permisos' => $request->permisos,
            'activo' => $request->input('activo', $user->activo),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permisos actualizados correctamente',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'rol' => $user->rol,
                'permisos' => $user->permisos,
                'activo' => $user->activo,
            ],
        ]);
    }

    /**
     * Verificar si un usuario tiene un permiso específico
     */
    public function checkPermission(Request $request, $userId, $permission)
    {
        $user = User::findOrFail($userId);
        $hasPermission = $this->permissionService->hasPermission($user, $permission);
        
        return response()->json([
            'success' => true,
            'user_id' => $userId,
            'permission' => $permission,
            'has_permission' => $hasPermission,
        ]);
    }

    /**
     * Obtener empleados activos
     */
    public function getEmployees()
    {
        $employees = User::where('activo', true)
            ->whereNotIn('rol', ['cliente'])
            ->select('id', 'name', 'email', 'rol', 'activo', 'ultimo_acceso')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'employees' => $employees,
        ]);
    }

    /**
     * Obtener estadísticas de roles
     */
    public function getRoleStats()
    {
        $stats = User::selectRaw('rol, COUNT(*) as count')
            ->where('activo', true)
            ->groupBy('rol')
            ->get()
            ->pluck('count', 'rol')
            ->toArray();

        return response()->json([
            'success' => true,
            'stats' => $stats,
        ]);
    }
}


