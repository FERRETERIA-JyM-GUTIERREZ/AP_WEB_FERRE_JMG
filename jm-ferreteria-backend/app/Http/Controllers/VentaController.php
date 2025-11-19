<?php

namespace App\Http\Controllers;

use App\Models\Venta;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class VentaController extends Controller
{
    public function myHistory(Request $request)
    {
        try {
            $user = $request->user();
            $ventas = Venta::with(['usuario', 'detalles.producto'])
                ->where('usuario_id', $user->id)
                ->orderBy('fecha', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $ventas,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener historial: ' . $e->getMessage(),
            ], 500);
        }
    }
    public function index(Request $request)
    {
        try {
            $query = Venta::with(['usuario', 'detalles.producto', 'anulador']);

            // Filtro por búsqueda de cliente
            if ($request->filled('buscar')) {
                $buscar = $request->input('buscar');
                $query->where('cliente_nombre', 'like', "%$buscar%");
            }

            // Filtro por fecha
            if ($request->filled('fecha')) {
                $fecha = $request->input('fecha');
                $query->whereDate('fecha', $fecha);
            }

            // Filtro por estado
            if ($request->filled('estado') && $request->estado !== '') {
                $estado = $request->input('estado');
                $query->where('estado', $estado);
            }

            $ventas = $query->orderBy('fecha', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $ventas
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener ventas: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $venta = Venta::with(['usuario', 'detalles.producto', 'anulador'])->find($id);
            
            if (!$venta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Venta no encontrada'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $venta
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener venta: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'cliente_nombre' => 'nullable|string|max:100',
                'cliente_telefono' => 'nullable|string|max:20',
                'cliente_dni' => 'nullable|string|max:20', // Cambiado de size:8 a max:20 para ser más flexible
                'productos' => 'required|array|min:1',
                'productos.*.producto_id' => 'required|exists:productos,id',
                'productos.*.cantidad' => 'required|integer|min:1',
                'metodo_pago' => 'required|in:efectivo,tarjeta,transferencia,yape',
                'monto_pagado' => 'required|numeric|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $total = 0;
            $productos = [];

            // Validar stock y calcular total
            foreach ($request->productos as $item) {
                $producto = Producto::find($item['producto_id']);
                
                if (!$producto) {
                    throw new \Exception('Producto no encontrado: ' . $item['producto_id']);
                }

                if ($producto->stock < $item['cantidad']) {
                    throw new \Exception('Stock insuficiente para: ' . $producto->nombre);
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

            // Calcular vuelto
            $montoPagado = $request->monto_pagado;
            $vuelto = $montoPagado - $total;

            // Validar que el monto pagado sea suficiente
            if ($montoPagado < $total) {
                return response()->json([
                    'success' => false,
                    'message' => 'El monto pagado es insuficiente. Total: S/ ' . number_format($total, 2) . ', Pagado: S/ ' . number_format($montoPagado, 2)
                ], 422);
            }

            // Crear venta
            $venta = Venta::create([
                'usuario_id' => $request->user() ? $request->user()->id : 1, // Usuario por defecto si no hay autenticación
                'cliente_nombre' => $request->cliente_nombre,
                'cliente_telefono' => $request->cliente_telefono,
                'cliente_dni' => $request->cliente_dni,
                'total' => $total,
                'metodo_pago' => $request->metodo_pago,
                'monto_pagado' => $montoPagado,
                'vuelto' => $vuelto,
                'fecha' => now(),
            ]);

            // Crear detalles de venta y actualizar stock
            foreach ($productos as $item) {
                $venta->detalles()->create($item);
                
                // Actualizar stock
                $producto = Producto::find($item['producto_id']);
                $producto->decrement('stock', $item['cantidad']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Venta registrada exitosamente',
                'data' => $venta->load(['usuario', 'detalles.producto'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            
            \Log::error('Error al registrar venta: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar venta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar cliente por DNI en ventas anteriores
     */
    public function buscarClientePorDni($dni)
    {
        try {
            // Validar DNI
            if (strlen($dni) !== 8 || !is_numeric($dni)) {
                return response()->json([
                    'success' => false,
                    'message' => 'DNI debe tener 8 dígitos numéricos'
                ], 422);
            }

            // Buscar ventas con este DNI
            $ventas = Venta::where('cliente_dni', $dni)
                          ->select('cliente_nombre', 'cliente_telefono', 'cliente_dni')
                          ->distinct()
                          ->get();

            if ($ventas->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontraron ventas con este DNI'
                ], 404);
            }

            // Tomar el primer cliente encontrado (el más reciente)
            $cliente = $ventas->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'cliente_nombre' => $cliente->cliente_nombre,
                    'cliente_telefono' => $cliente->cliente_telefono,
                    'cliente_dni' => $cliente->cliente_dni,
                    'ventas_anteriores' => $ventas->count()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al buscar cliente: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Devuelve estadísticas de ventas para los cuadros del dashboard
     */
    public function estadisticas()
    {
        try {
            $hoy = now()->toDateString();
            $inicioMes = now()->startOfMonth()->toDateString();
            $inicioAno = now()->startOfYear()->toDateString();

            // Ventas e ingresos de hoy
            $ventasHoy = \DB::table('ventas')->whereDate('fecha', $hoy)->count();
            $ingresosHoy = \DB::table('ventas')->whereDate('fecha', $hoy)->sum('total');

            // Ventas e ingresos del mes
            $ventasMes = \DB::table('ventas')->whereDate('fecha', '>=', $inicioMes)->count();
            $ingresosMes = \DB::table('ventas')->whereDate('fecha', '>=', $inicioMes)->sum('total');

            // Ingresos anuales
            $ingresosAnuales = \DB::table('ventas')->whereDate('fecha', '>=', $inicioAno)->sum('total');

            // Pendientes
            $pendientes = \DB::table('ventas')->where('estado', 'pendiente')->count();

            // Ventas anuladas
            $ventasAnuladas = \DB::table('ventas')->where('estado', 'anulada')->count();

            // Stock bajos (≤3 productos)
            $stockBajos = \DB::table('productos')->where('stock', '<=', 3)->count();

            // Productos no vendidos (0 ventas)
            $productosNoVendidos = \DB::table('productos')
                ->leftJoin('venta_detalles', 'productos.id', '=', 'venta_detalles.producto_id')
                ->whereNull('venta_detalles.producto_id')
                ->count();

            // Categorías más vendidas
            $categoriaMasVendida = \DB::table('venta_detalles')
                ->join('productos', 'venta_detalles.producto_id', '=', 'productos.id')
                ->join('categorias', 'productos.categoria_id', '=', 'categorias.id')
                ->select('categorias.nombre', \DB::raw('SUM(venta_detalles.cantidad) as total_vendido'))
                ->groupBy('categorias.id', 'categorias.nombre')
                ->orderByDesc('total_vendido')
                ->first();

            // Método de pago dominante
            $metodoPagoDominante = \DB::table('ventas')
                ->select('metodo_pago', \DB::raw('COUNT(*) as total_ventas'))
                ->groupBy('metodo_pago')
                ->orderByDesc('total_ventas')
                ->first();

            // Clientes únicos (solo por nombre)
            $clientesUnicos = \DB::table('ventas')
                ->whereNotNull('cliente_nombre')
                ->where('cliente_nombre', '!=', '')
                ->select('cliente_nombre')
                ->groupBy('cliente_nombre')
                ->get()
                ->count();

            // Producto más vendido
            $productoMasVendido = \DB::table('venta_detalles')
                ->select('producto_id', \DB::raw('SUM(cantidad) as total_vendido'))
                ->groupBy('producto_id')
                ->orderByDesc('total_vendido')
                ->first();
            $productoNombre = null;
            $productoCantidad = null;
            if ($productoMasVendido) {
                $prod = \DB::table('productos')->where('id', $productoMasVendido->producto_id)->first();
                $productoNombre = $prod ? $prod->nombre : null;
                $productoCantidad = $productoMasVendido->total_vendido;
            }

            // Siempre devolver datos válidos, nunca error ni success: false
            return response()->json([
                'success' => true,
                'data' => [
                    'ventas_hoy' => $ventasHoy ?? 0,
                    'ingresos_hoy' => $ingresosHoy ?? 0,
                    'ventas_mes' => $ventasMes ?? 0,
                    'ingresos_mes' => $ingresosMes ?? 0,
                    'ingresos_anuales' => $ingresosAnuales ?? 0,
                    'pendientes' => $pendientes ?? 0,
                    'ventas_anuladas' => $ventasAnuladas ?? 0,
                    'stock_bajos' => $stockBajos ?? 0,
                    'productos_no_vendidos' => $productosNoVendidos ?? 0,
                    'categoria_mas_vendida' => [
                        'nombre' => $categoriaMasVendida ? $categoriaMasVendida->nombre : null,
                        'total_vendido' => $categoriaMasVendida ? $categoriaMasVendida->total_vendido : 0
                    ],
                    'metodo_pago_dominante' => [
                        'metodo' => $metodoPagoDominante ? $metodoPagoDominante->metodo_pago : null,
                        'total_ventas' => $metodoPagoDominante ? $metodoPagoDominante->total_ventas : 0
                    ],
                    'clientes_unicos' => $clientesUnicos ?? 0,
                    'producto_mas_vendido' => [
                        'nombre' => $productoNombre,
                        'cantidad' => $productoCantidad
                    ]
                ]
            ]);
        } catch (\Throwable $e) {
            \Log::error('Error en estadisticas de ventas: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Anula una venta (cambia su estado a 'anulada', admin y vendedores, solo ventas del día, guarda motivo y auditoría)
     */
    public function anularVenta(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Debe estar autenticado para anular ventas.'
            ], 401);
        }
        
        // Permitir que administradores y vendedores anulen ventas
        if ($user->rol !== 'admin' && $user->rol !== 'vendedor') {
            return response()->json([
                'success' => false,
                'message' => 'Solo administradores y vendedores pueden anular ventas.'
            ], 403);
        }
        $venta = Venta::find($id);
        if (!$venta) {
            return response()->json([
                'success' => false,
                'message' => 'Venta no encontrada'
            ], 404);
        }
        // Solo ventas dentro de las primeras 24 horas
        $fechaVenta = \Carbon\Carbon::parse($venta->fecha);
        $ahora = \Carbon\Carbon::now();
        $diferenciaHoras = $ahora->diffInHours($fechaVenta);
        
        if ($diferenciaHoras > 24) {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden anular ventas dentro de las primeras 24 horas. Esta venta tiene ' . $diferenciaHoras . ' horas de antigüedad.'
            ], 422);
        }
        $motivo = $request->input('motivo');
        if (!$motivo || strlen(trim($motivo)) < 5) {
            return response()->json([
                'success' => false,
                'message' => 'Debe ingresar un motivo válido para la anulación.'
            ], 422);
        }
        try {
            DB::beginTransaction();
            
            // Restaurar stock de los productos
            foreach ($venta->detalles as $detalle) {
                $producto = Producto::find($detalle->producto_id);
                if ($producto) {
                    $producto->increment('stock', $detalle->cantidad);
                }
            }
            
            // Actualizar estado de la venta
            $venta->estado = 'anulada';
            $venta->anulado_por = $user->id;
            $venta->anulado_en = now();
            $venta->motivo_anulacion = $motivo;
            $venta->save();
            
            DB::commit();
            
            $venta->load('anulador');
            return response()->json([
                'success' => true,
                'message' => 'Venta anulada exitosamente. El stock de los productos ha sido restaurado.',
                'data' => $venta
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Error al anular venta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtiene los productos más vendidos ordenados por cantidad
     */
    public function productosMasVendidos()
    {
        try {
            $productos = \DB::table('venta_detalles')
                ->join('productos', 'venta_detalles.producto_id', '=', 'productos.id')
                ->join('categorias', 'productos.categoria_id', '=', 'categorias.id')
                ->select(
                    'productos.id',
                    'productos.nombre',
                    'productos.precio',
                    'categorias.nombre as categoria',
                    \DB::raw('SUM(venta_detalles.cantidad) as unidades_vendidas'),
                    \DB::raw('SUM(venta_detalles.subtotal) as total_generado')
                )
                ->groupBy('productos.id', 'productos.nombre', 'productos.precio', 'categorias.nombre')
                ->orderByDesc('unidades_vendidas')
                ->limit(50)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $productos
            ]);
        } catch (\Exception $e) {
            \Log::error('Error al obtener productos más vendidos: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener productos más vendidos: ' . $e->getMessage()
            ], 500);
        }
    }
}
