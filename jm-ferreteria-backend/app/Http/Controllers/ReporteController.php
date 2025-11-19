<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Venta;
use App\Models\Producto;
use App\Models\Categoria;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;

class ReporteController extends Controller
{
    /**
     * Reporte de ventas
     */
    public function ventas(Request $request)
    {
        try {
            $fechaInicio = $request->get('fecha_inicio', Carbon::now()->startOfDay());
            $fechaFin = $request->get('fecha_fin', Carbon::now()->endOfDay());
            $periodo = $request->get('periodo', 'hoy');

            // Ajustar fechas según el período
            switch ($periodo) {
                case 'hoy':
                    $fechaInicio = Carbon::now()->startOfDay();
                    $fechaFin = Carbon::now()->endOfDay();
                    break;
                case 'semana':
                    $fechaInicio = Carbon::now()->startOfWeek();
                    $fechaFin = Carbon::now()->endOfWeek();
                    break;
                case 'mes':
                    $fechaInicio = Carbon::now()->startOfMonth();
                    $fechaFin = Carbon::now()->endOfMonth();
                    break;
                case 'trimestre':
                    $fechaInicio = Carbon::now()->startOfQuarter();
                    $fechaFin = Carbon::now()->endOfQuarter();
                    break;
                case 'anio':
                    $fechaInicio = Carbon::now()->startOfYear();
                    $fechaFin = Carbon::now()->endOfYear();
                    break;
                case 'personalizado':
                    if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
                        $fechaInicio = Carbon::parse($request->fecha_inicio)->startOfDay();
                        $fechaFin = Carbon::parse($request->fecha_fin)->endOfDay();
                    }
                    break;
            }

            // Estadísticas generales
            $stats = [
                'total_ventas' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                    ->where('estado', '!=', 'anulada')
                    ->count(),
                'ingresos_totales' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                    ->where('estado', '!=', 'anulada')
                    ->sum('total'),
                'productos_vendidos' => DB::table('venta_detalles')
                    ->join('ventas', 'venta_detalles.venta_id', '=', 'ventas.id')
                    ->whereBetween('ventas.fecha', [$fechaInicio, $fechaFin])
                    ->where('ventas.estado', '!=', 'anulada')
                    ->sum('venta_detalles.cantidad'),
                'clientes_unicos' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                    ->where('estado', '!=', 'anulada')
                    ->whereNotNull('cliente_nombre')
                    ->distinct('cliente_nombre')
                    ->count('cliente_nombre'),
                'ventas_anuladas' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                    ->where('estado', 'anulada')
                    ->count(),
                'promedio_venta' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                    ->where('estado', '!=', 'anulada')
                    ->avg('total')
            ];

            // Ventas por día para el gráfico
            $ventasPorDia = Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->where('estado', '!=', 'anulada')
                ->selectRaw('DATE(fecha) as fecha, COUNT(*) as total_ventas, SUM(total) as ingresos')
                ->groupBy('fecha')
                ->orderBy('fecha')
                ->get();

            // Métodos de pago más usados
            $metodosPago = Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->where('estado', '!=', 'anulada')
                ->selectRaw('metodo_pago, COUNT(*) as total_ventas, SUM(total) as total_ingresos')
                ->groupBy('metodo_pago')
                ->orderByDesc('total_ventas')
                ->get();

            // Productos más vendidos
            $productosMasVendidos = DB::table('venta_detalles')
                ->join('ventas', 'venta_detalles.venta_id', '=', 'ventas.id')
                ->join('productos', 'venta_detalles.producto_id', '=', 'productos.id')
                ->whereBetween('ventas.fecha', [$fechaInicio, $fechaFin])
                ->where('ventas.estado', '!=', 'anulada')
                ->selectRaw('productos.nombre, SUM(venta_detalles.cantidad) as unidades_vendidas, SUM(venta_detalles.subtotal) as total_generado')
                ->groupBy('productos.id', 'productos.nombre')
                ->orderByDesc('unidades_vendidas')
                ->limit(10)
                ->get();

            // Detalle de ventas
            $detalleVentas = Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->where('estado', '!=', 'anulada')
                ->with(['detalles.producto'])
                ->orderByDesc('fecha')
                ->limit(50)
                ->get()
                ->map(function ($venta) {
                    return [
                        'id' => $venta->id,
                        'numero' => $venta->numero,
                        'fecha' => $venta->fecha,
                        'cliente_nombre' => $venta->cliente_nombre,
                        'total' => $venta->total,
                        'metodo_pago' => $venta->metodo_pago,
                        'estado' => $venta->estado,
                        'productos_count' => $venta->detalles->count(),
                        'productos' => $venta->detalles->map(function ($detalle) {
                            return [
                                'nombre' => $detalle->producto->nombre ?? 'Producto no encontrado',
                                'cantidad' => $detalle->cantidad,
                                'precio_unitario' => $detalle->precio_unitario,
                                'subtotal' => $detalle->subtotal
                            ];
                        })
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'stats' => $stats,
                    'ventas_por_dia' => $ventasPorDia,
                    'metodos_pago' => $metodosPago,
                    'productos_mas_vendidos' => $productosMasVendidos,
                    'detalle_ventas' => $detalleVentas,
                    'fecha_inicio' => $fechaInicio->format('Y-m-d'),
                    'fecha_fin' => $fechaFin->format('Y-m-d'),
                    'periodo' => $periodo
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error en reporte de ventas: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte de ventas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reporte de productos
     */
    public function productos(Request $request)
    {
        try {
            $fechaInicio = $request->get('fecha_inicio', Carbon::now()->startOfMonth());
            $fechaFin = $request->get('fecha_fin', Carbon::now()->endOfMonth());

            // Estadísticas de productos
            $stats = [
                'total_productos' => Producto::count(),
                'productos_con_stock' => Producto::where('stock', '>', 0)->count(),
                'productos_sin_stock' => Producto::where('stock', 0)->count(),
                'productos_stock_bajo' => Producto::where('stock', '<=', 3)->where('stock', '>', 0)->count(),
                'valor_inventario' => Producto::sum(DB::raw('stock * precio')),
                'productos_vendidos' => DB::table('venta_detalles')
                    ->join('ventas', 'venta_detalles.venta_id', '=', 'ventas.id')
                    ->whereBetween('ventas.fecha', [$fechaInicio, $fechaFin])
                    ->where('ventas.estado', '!=', 'anulada')
                    ->sum('venta_detalles.cantidad')
            ];

            // Productos por categoría
            $productosPorCategoria = DB::table('productos')
                ->join('categorias', 'productos.categoria_id', '=', 'categorias.id')
                ->selectRaw('categorias.nombre as categoria, COUNT(productos.id) as total_productos, SUM(productos.stock) as stock_total, SUM(productos.stock * productos.precio) as valor_categoria')
                ->groupBy('categorias.id', 'categorias.nombre')
                ->orderByDesc('total_productos')
                ->get();

            // Productos más vendidos
            $productosMasVendidos = DB::table('venta_detalles')
                ->join('ventas', 'venta_detalles.venta_id', '=', 'ventas.id')
                ->join('productos', 'venta_detalles.producto_id', '=', 'productos.id')
                ->join('categorias', 'productos.categoria_id', '=', 'categorias.id')
                ->whereBetween('ventas.fecha', [$fechaInicio, $fechaFin])
                ->where('ventas.estado', '!=', 'anulada')
                ->selectRaw('productos.id, productos.nombre, categorias.nombre as categoria, productos.precio, productos.stock, SUM(venta_detalles.cantidad) as unidades_vendidas, SUM(venta_detalles.subtotal) as total_generado')
                ->groupBy('productos.id', 'productos.nombre', 'categorias.nombre', 'productos.precio', 'productos.stock')
                ->orderByDesc('unidades_vendidas')
                ->get();

            // Productos sin ventas
            $productosSinVentas = DB::table('productos')
                ->leftJoin('venta_detalles', 'productos.id', '=', 'venta_detalles.producto_id')
                ->leftJoin('ventas', 'venta_detalles.venta_id', '=', 'ventas.id')
                ->whereNull('venta_detalles.producto_id')
                ->orWhere('ventas.estado', 'anulada')
                ->select('productos.*')
                ->distinct()
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'stats' => $stats,
                    'productos_por_categoria' => $productosPorCategoria,
                    'productos_mas_vendidos' => $productosMasVendidos,
                    'productos_sin_ventas' => $productosSinVentas,
                    'fecha_inicio' => $fechaInicio->format('Y-m-d'),
                    'fecha_fin' => $fechaFin->format('Y-m-d')
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error en reporte de productos: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte de productos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reporte de clientes
     */
    public function clientes(Request $request)
    {
        try {
            $fechaInicio = $request->get('fecha_inicio', Carbon::now()->startOfYear());
            $fechaFin = $request->get('fecha_fin', Carbon::now()->endOfYear());

            // Estadísticas de clientes
            $stats = [
                'total_clientes' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                    ->where('estado', '!=', 'anulada')
                    ->whereNotNull('cliente_nombre')
                    ->distinct('cliente_nombre')
                    ->count('cliente_nombre'),
                'clientes_nuevos' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                    ->where('estado', '!=', 'anulada')
                    ->whereNotNull('cliente_nombre')
                    ->whereNotExists(function ($query) use ($fechaInicio) {
                        $query->select(DB::raw(1))
                            ->from('ventas as v2')
                            ->whereRaw('v2.cliente_nombre = ventas.cliente_nombre')
                            ->where('v2.fecha', '<', $fechaInicio)
                            ->where('v2.estado', '!=', 'anulada');
                    })
                    ->distinct('cliente_nombre')
                    ->count('cliente_nombre'),
                'total_ventas_clientes' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                    ->where('estado', '!=', 'anulada')
                    ->whereNotNull('cliente_nombre')
                    ->count(),
                'promedio_compra_cliente' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                    ->where('estado', '!=', 'anulada')
                    ->whereNotNull('cliente_nombre')
                    ->avg('total')
            ];

            // Clientes más frecuentes
            $clientesMasFrecuentes = Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->where('estado', '!=', 'anulada')
                ->whereNotNull('cliente_nombre')
                ->selectRaw('cliente_nombre, COUNT(*) as total_ventas, SUM(total) as total_gastado, AVG(total) as promedio_compra')
                ->groupBy('cliente_nombre')
                ->orderByDesc('total_ventas')
                ->limit(20)
                ->get();

            // Clientes por valor de compra
            $clientesPorValor = Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->where('estado', '!=', 'anulada')
                ->whereNotNull('cliente_nombre')
                ->selectRaw('cliente_nombre, COUNT(*) as total_ventas, SUM(total) as total_gastado')
                ->groupBy('cliente_nombre')
                ->orderByDesc('total_gastado')
                ->limit(20)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'stats' => $stats,
                    'clientes_mas_frecuentes' => $clientesMasFrecuentes,
                    'clientes_por_valor' => $clientesPorValor,
                    'fecha_inicio' => $fechaInicio->format('Y-m-d'),
                    'fecha_fin' => $fechaFin->format('Y-m-d')
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error en reporte de clientes: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte de clientes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reporte financiero
     */
    public function financiero(Request $request)
    {
        try {
            $fechaInicio = $request->get('fecha_inicio', Carbon::now()->startOfYear());
            $fechaFin = $request->get('fecha_fin', Carbon::now()->endOfYear());

            // Estadísticas financieras
            $stats = [
                'ingresos_totales' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                    ->where('estado', '!=', 'anulada')
                    ->sum('total'),
                'ventas_totales' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                    ->where('estado', '!=', 'anulada')
                    ->count(),
                'ventas_anuladas' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                    ->where('estado', 'anulada')
                    ->count(),
                'promedio_venta' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                    ->where('estado', '!=', 'anulada')
                    ->avg('total'),
                'valor_inventario' => Producto::sum(DB::raw('stock * precio')),
                'productos_vendidos' => DB::table('venta_detalles')
                    ->join('ventas', 'venta_detalles.venta_id', '=', 'ventas.id')
                    ->whereBetween('ventas.fecha', [$fechaInicio, $fechaFin])
                    ->where('ventas.estado', '!=', 'anulada')
                    ->sum('venta_detalles.cantidad')
            ];

            // Ingresos por método de pago
            $ingresosPorMetodo = Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->where('estado', '!=', 'anulada')
                ->selectRaw('metodo_pago, COUNT(*) as total_ventas, SUM(total) as total_ingresos')
                ->groupBy('metodo_pago')
                ->orderByDesc('total_ingresos')
                ->get();

            // Ingresos por día
            $ingresosPorDia = Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->where('estado', '!=', 'anulada')
                ->selectRaw('DATE(fecha) as fecha, COUNT(*) as total_ventas, SUM(total) as ingresos')
                ->groupBy('fecha')
                ->orderBy('fecha')
                ->get();

            // Top categorías por ingresos
            $categoriasPorIngresos = DB::table('venta_detalles')
                ->join('ventas', 'venta_detalles.venta_id', '=', 'ventas.id')
                ->join('productos', 'venta_detalles.producto_id', '=', 'productos.id')
                ->join('categorias', 'productos.categoria_id', '=', 'categorias.id')
                ->whereBetween('ventas.fecha', [$fechaInicio, $fechaFin])
                ->where('ventas.estado', '!=', 'anulada')
                ->selectRaw('categorias.nombre, SUM(venta_detalles.subtotal) as total_ingresos, SUM(venta_detalles.cantidad) as unidades_vendidas')
                ->groupBy('categorias.id', 'categorias.nombre')
                ->orderByDesc('total_ingresos')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'stats' => $stats,
                    'ingresos_por_metodo' => $ingresosPorMetodo,
                    'ingresos_por_dia' => $ingresosPorDia,
                    'categorias_por_ingresos' => $categoriasPorIngresos,
                    'fecha_inicio' => $fechaInicio->format('Y-m-d'),
                    'fecha_fin' => $fechaFin->format('Y-m-d')
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error en reporte financiero: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte financiero: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exportar reporte a PDF
     */
    public function exportPDF($tipo, Request $request)
    {
        try {
            $fechaInicio = $request->get('fecha_inicio', Carbon::now()->startOfDay());
            $fechaFin = $request->get('fecha_fin', Carbon::now()->endOfDay());
            $periodo = $request->get('periodo', 'hoy');

            // Ajustar fechas según el período
            switch ($periodo) {
                case 'hoy':
                    $fechaInicio = Carbon::now()->startOfDay();
                    $fechaFin = Carbon::now()->endOfDay();
                    break;
                case 'semana':
                    $fechaInicio = Carbon::now()->startOfWeek();
                    $fechaFin = Carbon::now()->endOfWeek();
                    break;
                case 'mes':
                    $fechaInicio = Carbon::now()->startOfMonth();
                    $fechaFin = Carbon::now()->endOfMonth();
                    break;
                case 'trimestre':
                    $fechaInicio = Carbon::now()->startOfQuarter();
                    $fechaFin = Carbon::now()->endOfQuarter();
                    break;
                case 'anio':
                    $fechaInicio = Carbon::now()->startOfYear();
                    $fechaFin = Carbon::now()->endOfYear();
                    break;
                case 'personalizado':
                    if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
                        $fechaInicio = Carbon::parse($request->fecha_inicio)->startOfDay();
                        $fechaFin = Carbon::parse($request->fecha_fin)->endOfDay();
                    }
                    break;
            }

            $data = [];
            $titulo = '';

            switch ($tipo) {
                case 'ventas':
                    $data = $this->getDatosReporteVentas($fechaInicio, $fechaFin);
                    $titulo = 'Reporte de Ventas';
                    break;
                case 'productos':
                    $data = $this->getDatosReporteProductos($fechaInicio, $fechaFin);
                    $titulo = 'Reporte de Productos';
                    break;
                case 'clientes':
                    $data = $this->getDatosReporteClientes($fechaInicio, $fechaFin);
                    $titulo = 'Reporte de Clientes';
                    break;
                case 'financiero':
                    $data = $this->getDatosReporteFinanciero($fechaInicio, $fechaFin);
                    $titulo = 'Reporte Financiero';
                    break;
                default:
                    throw new \Exception('Tipo de reporte no válido');
            }

            $html = view('reportes.pdf', [
                'titulo' => $titulo,
                'data' => $data,
                'fechaInicio' => $fechaInicio->format('d/m/Y'),
                'fechaFin' => $fechaFin->format('d/m/Y'),
                'tipo' => $tipo
            ])->render();

            $pdf = PDF::loadHTML($html);
            $pdf->setPaper('A4', 'portrait');

            return $pdf->download("reporte_{$tipo}_{$fechaInicio->format('Y-m-d')}_{$fechaFin->format('Y-m-d')}.pdf");

        } catch (\Exception $e) {
            \Log::error('Error exportando PDF: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al exportar PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exportar reporte a Excel (CSV)
     */
    public function exportExcel($tipo, Request $request)
    {
        try {
            $fechaInicio = $request->get('fecha_inicio', Carbon::now()->startOfDay());
            $fechaFin = $request->get('fecha_fin', Carbon::now()->endOfDay());
            $periodo = $request->get('periodo', 'hoy');

            // Ajustar fechas según el período
            switch ($periodo) {
                case 'hoy':
                    $fechaInicio = Carbon::now()->startOfDay();
                    $fechaFin = Carbon::now()->endOfDay();
                    break;
                case 'semana':
                    $fechaInicio = Carbon::now()->startOfWeek();
                    $fechaFin = Carbon::now()->endOfWeek();
                    break;
                case 'mes':
                    $fechaInicio = Carbon::now()->startOfMonth();
                    $fechaFin = Carbon::now()->endOfMonth();
                    break;
                case 'trimestre':
                    $fechaInicio = Carbon::now()->startOfQuarter();
                    $fechaFin = Carbon::now()->endOfQuarter();
                    break;
                case 'anio':
                    $fechaInicio = Carbon::now()->startOfYear();
                    $fechaFin = Carbon::now()->endOfYear();
                    break;
                case 'personalizado':
                    if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
                        $fechaInicio = Carbon::parse($request->fecha_inicio)->startOfDay();
                        $fechaFin = Carbon::parse($request->fecha_fin)->endOfDay();
                    }
                    break;
            }

            $data = [];
            $titulo = '';

            switch ($tipo) {
                case 'ventas':
                    $data = $this->getDatosReporteVentas($fechaInicio, $fechaFin);
                    $titulo = 'Reporte de Ventas';
                    break;
                case 'productos':
                    $data = $this->getDatosReporteProductos($fechaInicio, $fechaFin);
                    $titulo = 'Reporte de Productos';
                    break;
                case 'clientes':
                    $data = $this->getDatosReporteClientes($fechaInicio, $fechaFin);
                    $titulo = 'Reporte de Clientes';
                    break;
                case 'financiero':
                    $data = $this->getDatosReporteFinanciero($fechaInicio, $fechaFin);
                    $titulo = 'Reporte Financiero';
                    break;
                default:
                    throw new \Exception('Tipo de reporte no válido');
            }

            $filename = "reporte_{$tipo}_{$fechaInicio->format('Y-m-d')}_{$fechaFin->format('Y-m-d')}.csv";

            // Generar contenido CSV
            $csvContent = $this->generateCSVContent($tipo, $data, $titulo, $fechaInicio, $fechaFin);

            return response($csvContent)
                ->header('Content-Type', 'text/csv; charset=UTF-8')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
                ->header('Pragma', 'no-cache')
                ->header('Expires', '0');

        } catch (\Exception $e) {
            \Log::error('Error exportando Excel: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al exportar Excel: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener datos para reporte de ventas
     */
    private function getDatosReporteVentas($fechaInicio, $fechaFin)
    {
        $stats = [
            'total_ventas' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->where('estado', '!=', 'anulada')
                ->count(),
            'ingresos_totales' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->where('estado', '!=', 'anulada')
                ->sum('total'),
            'productos_vendidos' => DB::table('venta_detalles')
                ->join('ventas', 'venta_detalles.venta_id', '=', 'ventas.id')
                ->whereBetween('ventas.fecha', [$fechaInicio, $fechaFin])
                ->where('ventas.estado', '!=', 'anulada')
                ->sum('venta_detalles.cantidad'),
            'clientes_unicos' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->where('estado', '!=', 'anulada')
                ->whereNotNull('cliente_nombre')
                ->distinct('cliente_nombre')
                ->count('cliente_nombre'),
            'promedio_venta' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->where('estado', '!=', 'anulada')
                ->avg('total')
        ];

        $detalleVentas = Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->where('estado', '!=', 'anulada')
            ->with(['detalles.producto'])
            ->orderByDesc('fecha')
            ->get()
            ->map(function ($venta) {
                return [
                    'fecha' => $venta->fecha,
                    'numero' => $venta->numero,
                    'cliente_nombre' => $venta->cliente_nombre,
                    'total' => $venta->total,
                    'metodo_pago' => $venta->metodo_pago,
                    'productos_count' => $venta->detalles->count(),
                    'productos' => $venta->detalles->map(function ($detalle) {
                        return [
                            'nombre' => $detalle->producto->nombre ?? 'Producto no encontrado',
                            'cantidad' => $detalle->cantidad,
                            'precio_unitario' => $detalle->precio_unitario,
                            'subtotal' => $detalle->subtotal
                        ];
                    })
                ];
            });

        return [
            'stats' => $stats,
            'detalle_ventas' => $detalleVentas
        ];
    }

    /**
     * Obtener datos para reporte de productos
     */
    private function getDatosReporteProductos($fechaInicio, $fechaFin)
    {
        $stats = [
            'total_productos' => Producto::count(),
            'productos_con_stock' => Producto::where('stock', '>', 0)->count(),
            'productos_sin_stock' => Producto::where('stock', 0)->count(),
            'productos_stock_bajo' => Producto::where('stock', '<=', 3)->where('stock', '>', 0)->count(),
            'valor_inventario' => Producto::sum(DB::raw('stock * precio'))
        ];

        $productosMasVendidos = DB::table('venta_detalles')
            ->join('ventas', 'venta_detalles.venta_id', '=', 'ventas.id')
            ->join('productos', 'venta_detalles.producto_id', '=', 'productos.id')
            ->join('categorias', 'productos.categoria_id', '=', 'categorias.id')
            ->whereBetween('ventas.fecha', [$fechaInicio, $fechaFin])
            ->where('ventas.estado', '!=', 'anulada')
            ->selectRaw('productos.id, productos.nombre, categorias.nombre as categoria, productos.precio, productos.stock, SUM(venta_detalles.cantidad) as unidades_vendidas, SUM(venta_detalles.subtotal) as total_generado')
            ->groupBy('productos.id', 'productos.nombre', 'categorias.nombre', 'productos.precio', 'productos.stock')
            ->orderByDesc('unidades_vendidas')
            ->get();

        return [
            'stats' => $stats,
            'productos_mas_vendidos' => $productosMasVendidos
        ];
    }

    /**
     * Obtener datos para reporte de clientes
     */
    private function getDatosReporteClientes($fechaInicio, $fechaFin)
    {
        $stats = [
            'total_clientes' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->where('estado', '!=', 'anulada')
                ->whereNotNull('cliente_nombre')
                ->distinct('cliente_nombre')
                ->count('cliente_nombre'),
            'clientes_nuevos' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->where('estado', '!=', 'anulada')
                ->whereNotNull('cliente_nombre')
                ->whereNotExists(function ($query) use ($fechaInicio) {
                    $query->select(DB::raw(1))
                        ->from('ventas as v2')
                        ->whereRaw('v2.cliente_nombre = ventas.cliente_nombre')
                        ->where('v2.fecha', '<', $fechaInicio)
                        ->where('v2.estado', '!=', 'anulada');
                })
                ->distinct('cliente_nombre')
                ->count('cliente_nombre'),
            'promedio_compra_cliente' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->where('estado', '!=', 'anulada')
                ->whereNotNull('cliente_nombre')
                ->avg('total')
        ];

        $clientesMasFrecuentes = Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->where('estado', '!=', 'anulada')
            ->whereNotNull('cliente_nombre')
            ->selectRaw('cliente_nombre, COUNT(*) as total_ventas, SUM(total) as total_gastado, AVG(total) as promedio_compra')
            ->groupBy('cliente_nombre')
            ->orderByDesc('total_ventas')
            ->get();

        return [
            'stats' => $stats,
            'clientes_mas_frecuentes' => $clientesMasFrecuentes
        ];
    }

    /**
     * Obtener datos para reporte financiero
     */
    private function getDatosReporteFinanciero($fechaInicio, $fechaFin)
    {
        $stats = [
            'ingresos_totales' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->where('estado', '!=', 'anulada')
                ->sum('total'),
            'ventas_totales' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->where('estado', '!=', 'anulada')
                ->count(),
            'ventas_anuladas' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->where('estado', 'anulada')
                ->count(),
            'promedio_venta' => Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->where('estado', '!=', 'anulada')
                ->avg('total'),
            'valor_inventario' => Producto::sum(DB::raw('stock * precio'))
        ];

        $ingresosPorMetodo = Venta::whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->where('estado', '!=', 'anulada')
            ->selectRaw('metodo_pago, COUNT(*) as total_ventas, SUM(total) as total_ingresos')
            ->groupBy('metodo_pago')
            ->orderByDesc('total_ingresos')
            ->get();

        return [
            'stats' => $stats,
            'ingresos_por_metodo' => $ingresosPorMetodo
        ];
    }

    /**
     * Generar contenido CSV
     */
    private function generateCSVContent($tipo, $data, $titulo, $fechaInicio, $fechaFin)
    {
        $csv = [];
        
        // Encabezado
        $csv[] = [$titulo];
        $csv[] = ['J&M GUTIERREZ E.I.R.L.'];
        $csv[] = ['Período: ' . $fechaInicio->format('d/m/Y') . ' - ' . $fechaFin->format('d/m/Y')];
        $csv[] = ['Generado el: ' . date('d/m/Y H:i:s')];
        $csv[] = []; // Línea en blanco

        switch ($tipo) {
            case 'ventas':
                // Resumen de ventas
                $csv[] = ['RESUMEN DE VENTAS'];
                $csv[] = ['Total Ventas', 'Ingresos Totales', 'Productos Vendidos', 'Clientes Únicos', 'Promedio Venta'];
                $csv[] = [
                    $data['stats']['total_ventas'],
                    'S/ ' . number_format($data['stats']['ingresos_totales'], 2),
                    $data['stats']['productos_vendidos'],
                    $data['stats']['clientes_unicos'],
                    'S/ ' . number_format($data['stats']['promedio_venta'], 2)
                ];
                $csv[] = []; // Línea en blanco

                // Detalle de ventas
                if (count($data['detalle_ventas']) > 0) {
                    $csv[] = ['DETALLE DE VENTAS'];
                    $csv[] = ['Fecha', 'Venta #', 'Cliente', 'Productos', 'Método Pago', 'Total'];
                    
                    foreach ($data['detalle_ventas'] as $venta) {
                        $csv[] = [
                            date('d/m/Y', strtotime($venta['fecha'])),
                            $venta['numero'],
                            $venta['cliente_nombre'],
                            $venta['productos_count'] . ' items',
                            $venta['metodo_pago'],
                            'S/ ' . number_format($venta['total'], 2)
                        ];
                    }
                }
                break;

            case 'productos':
                // Resumen de productos
                $csv[] = ['RESUMEN DE PRODUCTOS'];
                $csv[] = ['Total Productos', 'Con Stock', 'Sin Stock', 'Stock Bajo', 'Valor Inventario'];
                $csv[] = [
                    $data['stats']['total_productos'],
                    $data['stats']['productos_con_stock'],
                    $data['stats']['productos_sin_stock'],
                    $data['stats']['productos_stock_bajo'],
                    'S/ ' . number_format($data['stats']['valor_inventario'], 2)
                ];
                $csv[] = []; // Línea en blanco

                // Productos más vendidos
                if (count($data['productos_mas_vendidos']) > 0) {
                    $csv[] = ['PRODUCTOS MÁS VENDIDOS'];
                    $csv[] = ['Producto', 'Categoría', 'Precio', 'Stock', 'Unidades Vendidas', 'Total Generado'];
                    
                    foreach ($data['productos_mas_vendidos'] as $producto) {
                        $csv[] = [
                            $producto->nombre,
                            $producto->categoria,
                            'S/ ' . number_format($producto->precio, 2),
                            $producto->stock,
                            $producto->unidades_vendidas,
                            'S/ ' . number_format($producto->total_generado, 2)
                        ];
                    }
                }
                break;

            case 'clientes':
                // Resumen de clientes
                $csv[] = ['RESUMEN DE CLIENTES'];
                $csv[] = ['Total Clientes', 'Clientes Nuevos', 'Promedio Compra'];
                $csv[] = [
                    $data['stats']['total_clientes'],
                    $data['stats']['clientes_nuevos'],
                    'S/ ' . number_format($data['stats']['promedio_compra_cliente'], 2)
                ];
                $csv[] = []; // Línea en blanco

                // Clientes más frecuentes
                if (count($data['clientes_mas_frecuentes']) > 0) {
                    $csv[] = ['CLIENTES MÁS FRECUENTES'];
                    $csv[] = ['Cliente', 'Total Ventas', 'Total Gastado', 'Promedio Compra'];
                    
                    foreach ($data['clientes_mas_frecuentes'] as $cliente) {
                        $csv[] = [
                            $cliente->cliente_nombre,
                            $cliente->total_ventas,
                            'S/ ' . number_format($cliente->total_gastado, 2),
                            'S/ ' . number_format($cliente->promedio_compra, 2)
                        ];
                    }
                }
                break;

            case 'financiero':
                // Resumen financiero
                $csv[] = ['RESUMEN FINANCIERO'];
                $csv[] = ['Ingresos Totales', 'Total Ventas', 'Ventas Anuladas', 'Promedio Venta', 'Valor Inventario'];
                $csv[] = [
                    'S/ ' . number_format($data['stats']['ingresos_totales'], 2),
                    $data['stats']['ventas_totales'],
                    $data['stats']['ventas_anuladas'],
                    'S/ ' . number_format($data['stats']['promedio_venta'], 2),
                    'S/ ' . number_format($data['stats']['valor_inventario'], 2)
                ];
                $csv[] = []; // Línea en blanco

                // Ingresos por método de pago
                if (count($data['ingresos_por_metodo']) > 0) {
                    $csv[] = ['INGRESOS POR MÉTODO DE PAGO'];
                    $csv[] = ['Método de Pago', 'Total Ventas', 'Total Ingresos'];
                    
                    foreach ($data['ingresos_por_metodo'] as $metodo) {
                        $csv[] = [
                            $metodo->metodo_pago,
                            $metodo->total_ventas,
                            'S/ ' . number_format($metodo->total_ingresos, 2)
                        ];
                    }
                }
                break;
        }

        // Convertir array a CSV
        $output = '';
        foreach ($csv as $row) {
            $output .= $this->arrayToCSV($row) . "\n";
        }

        return $output;
    }

    /**
     * Convertir array a formato CSV
     */
    private function arrayToCSV($array)
    {
        $csv = [];
        foreach ($array as $value) {
            // Escapar comillas y envolver en comillas si contiene comas o comillas
            $value = str_replace('"', '""', $value);
            if (strpos($value, ',') !== false || strpos($value, '"') !== false || strpos($value, "\n") !== false) {
                $value = '"' . $value . '"';
            }
            $csv[] = $value;
        }
        return implode(',', $csv);
    }
} 