<?php

namespace App\Http\Controllers;

use App\Models\Envio;
use App\Models\DestinoEnvio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EnvioController extends Controller
{
    public function index()
    {
        try {
            $envios = Envio::with(['venta', 'destino'])->get();
            
            return response()->json([
                'success' => true,
                'data' => $envios
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener envíos: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $envio = Envio::with(['venta', 'destino'])->find($id);
            
            if (!$envio) {
                return response()->json([
                    'success' => false,
                    'message' => 'Envío no encontrado'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $envio
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener envío: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getDestinos()
    {
        try {
            $destinos = DestinoEnvio::all();
            
            return response()->json([
                'success' => true,
                'data' => $destinos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener destinos: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateEstado(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'estado' => 'required|string|in:pendiente,enviado,entregado,cancelado'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $envio = Envio::find($id);
            
            if (!$envio) {
                return response()->json([
                    'success' => false,
                    'message' => 'Envío no encontrado'
                ], 404);
            }
            
            $envio->update(['estado' => $request->estado]);
            
            return response()->json([
                'success' => true,
                'message' => 'Estado del envío actualizado exitosamente',
                'data' => $envio
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar estado: ' . $e->getMessage()
            ], 500);
        }
    }

    public function misEnvios()
    {
        try {
            $user = auth()->user();
            $envios = Envio::with(['venta', 'destino'])
                ->whereHas('venta', function($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $envios
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener envíos: ' . $e->getMessage()
            ], 500);
        }
    }

    public function checkout(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'venta_id' => 'required|exists:ventas,id',
            'destino_id' => 'required|exists:destino_envios,id',
            'direccion' => 'required|string|max:255',
            'telefono' => 'required|string|max:20',
            'observaciones' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $envio = Envio::create([
                'venta_id' => $request->venta_id,
                'destino_id' => $request->destino_id,
                'direccion' => $request->direccion,
                'telefono' => $request->telefono,
                'observaciones' => $request->observaciones,
                'estado' => 'pendiente'
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Envío creado exitosamente',
                'data' => $envio
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear envío: ' . $e->getMessage()
            ], 500);
        }
    }
}