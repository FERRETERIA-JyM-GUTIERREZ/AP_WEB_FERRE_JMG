<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\WishlistItem;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $wishlist = Wishlist::firstOrCreate(['user_id' => $user->id]);

        $wishlist->load(['items.producto']);

        return response()->json([
            'success' => true,
            'data' => $wishlist,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'producto_id' => 'required|exists:productos,id',
        ]);

        $user = $request->user();

        $wishlist = Wishlist::firstOrCreate(['user_id' => $user->id]);

        $producto = Producto::find($request->producto_id);
        if (!$producto || !$producto->activo) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no disponible'
            ], 422);
        }

        $exists = WishlistItem::where('wishlist_id', $wishlist->id)
            ->where('producto_id', $request->producto_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => true,
                'message' => 'Producto ya estaba en favoritos'
            ]);
        }

        WishlistItem::create([
            'wishlist_id' => $wishlist->id,
            'producto_id' => $request->producto_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Agregado a favoritos',
        ], 201);
    }

    public function destroy(Request $request, $productoId)
    {
        $user = $request->user();
        $wishlist = Wishlist::firstOrCreate(['user_id' => $user->id]);

        WishlistItem::where('wishlist_id', $wishlist->id)
            ->where('producto_id', $productoId)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Eliminado de favoritos',
        ]);
    }
}














