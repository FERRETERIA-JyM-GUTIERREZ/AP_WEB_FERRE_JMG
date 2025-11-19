<?php

namespace App\Http\Controllers;

use App\Models\Carrito;
use App\Models\CarritoItem;
use App\Models\Producto;
use Illuminate\Http\Request;

class CarritoController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $carrito = Carrito::firstOrCreate(['user_id' => $user->id]);
        $carrito->load(['items.producto']);

        return response()->json([
            'success' => true,
            'data' => $carrito,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'producto_id' => 'required|exists:productos,id',
            'cantidad' => 'required|integer|min:1',
        ]);

        $user = $request->user();
        $carrito = Carrito::firstOrCreate(['user_id' => $user->id]);

        $producto = Producto::find($request->producto_id);
        if (!$producto || !$producto->activo) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no disponible'
            ], 422);
        }

        $item = CarritoItem::firstOrNew([
            'carrito_id' => $carrito->id,
            'producto_id' => $request->producto_id,
        ]);

        $item->cantidad = ($item->exists ? $item->cantidad : 0) + (int) $request->cantidad;
        $item->precio_unitario = $producto->precio;
        $item->save();

        $carrito->load(['items.producto']);

        return response()->json([
            'success' => true,
            'message' => 'Producto agregado/actualizado en el carrito',
            'data' => $carrito,
        ], 201);
    }

    public function update(Request $request, $productoId)
    {
        $request->validate([
            'cantidad' => 'required|integer|min:1',
        ]);

        $user = $request->user();
        $carrito = Carrito::firstOrCreate(['user_id' => $user->id]);

        $item = CarritoItem::where('carrito_id', $carrito->id)
            ->where('producto_id', $productoId)
            ->first();

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Item no encontrado en el carrito',
            ], 404);
        }

        $item->cantidad = (int) $request->cantidad;
        $item->save();

        $carrito->load(['items.producto']);

        return response()->json([
            'success' => true,
            'message' => 'Cantidad actualizada',
            'data' => $carrito,
        ]);
    }

    public function destroy(Request $request, $productoId)
    {
        $user = $request->user();
        $carrito = Carrito::firstOrCreate(['user_id' => $user->id]);

        CarritoItem::where('carrito_id', $carrito->id)
            ->where('producto_id', $productoId)
            ->delete();

        $carrito->load(['items.producto']);

        return response()->json([
            'success' => true,
            'message' => 'Producto eliminado del carrito',
            'data' => $carrito,
        ]);
    }

    public function clear(Request $request)
    {
        $user = $request->user();
        $carrito = Carrito::firstOrCreate(['user_id' => $user->id]);

        CarritoItem::where('carrito_id', $carrito->id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Carrito vaciado',
        ]);
    }
}














