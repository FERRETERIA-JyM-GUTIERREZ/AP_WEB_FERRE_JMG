<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PedidoController extends Controller
{
    public function index()
    {
        try {
            $pedidos = Pedido::with('detalles.producto')->orderBy('fecha', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $pedidos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener pedidos: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $pedido = Pedido::with('detalles.producto')->find($id);
            
            if (!$pedido) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pedido no encontrado'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $pedido
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener pedido: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cliente_nombre' => 'required|string|max:100',
            'cliente_telefono' => 'required|string|max:20',
            'cliente_email' => 'nullable|email',
            'mensaje' => 'nullable|string',
            'tipo_pedido' => 'required|in:whatsapp,formulario,carrito',
            'productos' => 'required|array|min:1',
            'productos.*.producto_id' => 'required|exists:productos,id',
            'productos.*.cantidad' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $total = 0;
            $productos = [];

            // Validar productos y calcular total
            foreach ($request->productos as $item) {
                $producto = Producto::find($item['producto_id']);
                
                if (!$producto || !$producto->activo) {
                    throw new \Exception('Producto no disponible: ' . $item['producto_id']);
                }

                $subtotal = $producto->precio * $item['cantidad'];
                $total += $subtotal;

                $productos[] = [
                    'producto_id' => $producto->id,
                    'cantidad' => $item['cantidad'],
                    'precio_unitario' => $producto->precio,
                    'subtotal' => $subtotal
                ];
            }

            // Crear pedido
            $pedido = Pedido::create([
                'cliente_nombre' => $request->cliente_nombre,
                'cliente_telefono' => $request->cliente_telefono,
                'cliente_email' => $request->cliente_email,
                'mensaje' => $request->mensaje,
                'tipo_pedido' => $request->tipo_pedido,
                'estado' => 'pendiente',
                'fecha' => now(),
            ]);

            // Crear detalles del pedido
            foreach ($productos as $item) {
                $pedido->detalles()->create($item);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pedido enviado exitosamente. Nos pondremos en contacto contigo pronto.',
                'data' => $pedido->load('detalles.producto')
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar pedido: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateEstado(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'estado' => 'required|in:pendiente,confirmado,enviado,entregado,cancelado',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Estado inválido',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $pedido = Pedido::find($id);
            
            if (!$pedido) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pedido no encontrado'
                ], 404);
            }

            $pedido->update(['estado' => $request->estado]);

            return response()->json([
                'success' => true,
                'message' => 'Estado del pedido actualizado exitosamente',
                'data' => $pedido
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar estado: ' . $e->getMessage()
            ], 500);
        }
    }
}
