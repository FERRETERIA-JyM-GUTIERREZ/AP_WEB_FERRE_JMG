<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UsuarioController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Solo mostrar empleados (admin y vendedor) - NO clientes
            $query = User::whereIn('rol', ['admin', 'vendedor']);

            // Filtro por búsqueda (nombre o email)
            if ($request->filled('buscar')) {
                $buscar = $request->input('buscar');
                $query->where(function($q) use ($buscar) {
                    $q->where('name', 'like', "%$buscar%")
                      ->orWhere('email', 'like', "%$buscar%") ;
                });
            }

            // Filtro por rol (solo admin o vendedor)
            if ($request->filled('rol')) {
                $rol = $request->input('rol');
                if (in_array($rol, ['admin', 'vendedor'])) {
                    $query->where('rol', $rol);
                }
            }

            // Filtro por estado (si existe el campo 'activo')
            if ($request->filled('estado')) {
                // Si el frontend manda 'activo' o 'inactivo'
                if ($request->estado === 'activo') {
                    $query->where('activo', true);
                } elseif ($request->estado === 'inactivo') {
                    $query->where('activo', false);
                }
            }

            $usuarios = $query->get();
            
            return response()->json([
                'success' => true,
                'data' => $usuarios
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener usuarios: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $usuario = User::find($id);
            
            if (!$usuario) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $usuario
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener usuario: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'rol' => 'required|in:admin,vendedor',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $usuario = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'rol' => $request->rol,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Usuario creado exitosamente',
                'data' => $usuario
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear usuario: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $usuario = User::find($id);
        
        if (!$usuario) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:100',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'password' => 'sometimes|required|string|min:6',
            'rol' => 'sometimes|required|in:admin,vendedor',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->only(['name', 'email', 'rol']);
            
            if ($request->has('password')) {
                $data['password'] = Hash::make($request->password);
            }
            
            $usuario->update($data);
            
            return response()->json([
                'success' => true,
                'message' => 'Usuario actualizado exitosamente',
                'data' => $usuario
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar usuario: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $usuario = User::find($id);
            
            if (!$usuario) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 404);
            }
            
            // No permitir eliminar el último admin
            if ($usuario->rol === 'admin' && User::where('rol', 'admin')->count() <= 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el último administrador'
                ], 422);
            }
            
            $usuario->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Usuario eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar usuario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener solo clientes (para reportes o estadísticas)
     */
    public function getClientes(Request $request)
    {
        try {
            $query = User::where('rol', 'cliente');

            // Filtro por búsqueda (nombre o email)
            if ($request->filled('buscar')) {
                $buscar = $request->input('buscar');
                $query->where(function($q) use ($buscar) {
                    $q->where('name', 'like', "%$buscar%")
                      ->orWhere('email', 'like', "%$buscar%") ;
                });
            }

            // Filtro por estado
            if ($request->filled('estado')) {
                if ($request->estado === 'activo') {
                    $query->where('activo', true);
                } elseif ($request->estado === 'inactivo') {
                    $query->where('activo', false);
                }
            }

            $clientes = $query->get();
            
            return response()->json([
                'success' => true,
                'data' => $clientes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener clientes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Devuelve todos los clientes únicos que hayan realizado al menos 3 ventas
     */
    public function clientesFrecuentes()
    {
        $clientes = \DB::table('ventas')
            ->select('cliente_nombre', 'cliente_telefono', 'cliente_dni', \DB::raw('COUNT(*) as compras'))
            ->whereNotNull('cliente_nombre')
            ->where('cliente_nombre', '!=', '')
            ->groupBy('cliente_nombre', 'cliente_telefono', 'cliente_dni')
            ->having('compras', '>=', 3)
            ->orderByDesc('compras')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $clientes
        ]);
    }

    /**
     * Devuelve todos los clientes únicos que hayan realizado al menos una venta (para autocompletado)
     */
    public function sugerirClientes()
    {
        $clientes = \DB::table('ventas')
            ->select('cliente_nombre', 'cliente_telefono', 'cliente_dni')
            ->whereNotNull('cliente_nombre')
            ->where('cliente_nombre', '!=', '')
            ->groupBy('cliente_nombre', 'cliente_telefono', 'cliente_dni')
            ->orderByDesc(\DB::raw('MAX(fecha)'))
            ->get();

        return response()->json([
            'success' => true,
            'data' => $clientes
        ]);
    }
}
