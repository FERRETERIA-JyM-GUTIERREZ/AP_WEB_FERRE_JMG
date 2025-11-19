<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $titulo }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #333;
        }
        .header p {
            margin: 5px 0;
            font-size: 14px;
            color: #666;
        }
        .stats {
            margin-bottom: 20px;
        }
        .stats h2 {
            font-size: 16px;
            margin-bottom: 10px;
            color: #333;
        }
        .stats-grid {
            display: table;
            width: 100%;
            border-collapse: collapse;
        }
        .stats-item {
            display: table-cell;
            width: 25%;
            padding: 8px;
            text-align: center;
            border: 1px solid #ddd;
        }
        .stats-label {
            font-weight: bold;
            font-size: 11px;
            color: #666;
        }
        .stats-value {
            font-size: 14px;
            font-weight: bold;
            color: #333;
            margin-top: 5px;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .table th {
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
        }
        .table td {
            border: 1px solid #ddd;
            padding: 6px 8px;
            font-size: 11px;
        }
        .table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $titulo }}</h1>
        <p>J&M GUTIERREZ E.I.R.L.</p>
        <p>Período: {{ $fechaInicio }} - {{ $fechaFin }}</p>
        <p>Generado el: {{ date('d/m/Y H:i:s') }}</p>
    </div>

    @if($tipo === 'ventas')
        <div class="stats">
            <h2>Resumen de Ventas</h2>
            <div class="stats-grid">
                <div class="stats-item">
                    <div class="stats-label">Total Ventas</div>
                    <div class="stats-value">{{ $data['stats']['total_ventas'] }}</div>
                </div>
                <div class="stats-item">
                    <div class="stats-label">Ingresos Totales</div>
                    <div class="stats-value">S/ {{ number_format($data['stats']['ingresos_totales'], 2) }}</div>
                </div>
                <div class="stats-item">
                    <div class="stats-label">Productos Vendidos</div>
                    <div class="stats-value">{{ $data['stats']['productos_vendidos'] }}</div>
                </div>
                <div class="stats-item">
                    <div class="stats-label">Clientes Únicos</div>
                    <div class="stats-value">{{ $data['stats']['clientes_unicos'] }}</div>
                </div>
            </div>
        </div>

        @if(count($data['detalle_ventas']) > 0)
            <h2>Detalle de Ventas</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Venta #</th>
                        <th>Cliente</th>
                        <th>Productos</th>
                        <th>Método Pago</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($data['detalle_ventas'] as $venta)
                        <tr>
                            <td>{{ date('d/m/Y', strtotime($venta['fecha'])) }}</td>
                            <td>{{ $venta['numero'] }}</td>
                            <td>{{ $venta['cliente_nombre'] }}</td>
                            <td>{{ $venta['productos_count'] }} items</td>
                            <td>{{ $venta['metodo_pago'] }}</td>
                            <td>S/ {{ number_format($venta['total'], 2) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif

    @elseif($tipo === 'productos')
        <div class="stats">
            <h2>Resumen de Productos</h2>
            <div class="stats-grid">
                <div class="stats-item">
                    <div class="stats-label">Total Productos</div>
                    <div class="stats-value">{{ $data['stats']['total_productos'] }}</div>
                </div>
                <div class="stats-item">
                    <div class="stats-label">Con Stock</div>
                    <div class="stats-value">{{ $data['stats']['productos_con_stock'] }}</div>
                </div>
                <div class="stats-item">
                    <div class="stats-label">Sin Stock</div>
                    <div class="stats-value">{{ $data['stats']['productos_sin_stock'] }}</div>
                </div>
                <div class="stats-item">
                    <div class="stats-label">Valor Inventario</div>
                    <div class="stats-value">S/ {{ number_format($data['stats']['valor_inventario'], 2) }}</div>
                </div>
            </div>
        </div>

        @if(count($data['productos_mas_vendidos']) > 0)
            <h2>Productos Más Vendidos</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Unidades Vendidas</th>
                        <th>Total Generado</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($data['productos_mas_vendidos'] as $producto)
                        <tr>
                            <td>{{ $producto->nombre }}</td>
                            <td>{{ $producto->categoria }}</td>
                            <td>S/ {{ number_format($producto->precio, 2) }}</td>
                            <td>{{ $producto->stock }}</td>
                            <td>{{ $producto->unidades_vendidas }}</td>
                            <td>S/ {{ number_format($producto->total_generado, 2) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif

    @elseif($tipo === 'clientes')
        <div class="stats">
            <h2>Resumen de Clientes</h2>
            <div class="stats-grid">
                <div class="stats-item">
                    <div class="stats-label">Total Clientes</div>
                    <div class="stats-value">{{ $data['stats']['total_clientes'] }}</div>
                </div>
                <div class="stats-item">
                    <div class="stats-label">Clientes Nuevos</div>
                    <div class="stats-value">{{ $data['stats']['clientes_nuevos'] }}</div>
                </div>
                <div class="stats-item">
                    <div class="stats-label">Promedio Compra</div>
                    <div class="stats-value">S/ {{ number_format($data['stats']['promedio_compra_cliente'], 2) }}</div>
                </div>
                <div class="stats-item">
                    <div class="stats-label">-</div>
                    <div class="stats-value">-</div>
                </div>
            </div>
        </div>

        @if(count($data['clientes_mas_frecuentes']) > 0)
            <h2>Clientes Más Frecuentes</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Total Ventas</th>
                        <th>Total Gastado</th>
                        <th>Promedio Compra</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($data['clientes_mas_frecuentes'] as $cliente)
                        <tr>
                            <td>{{ $cliente->cliente_nombre }}</td>
                            <td>{{ $cliente->total_ventas }}</td>
                            <td>S/ {{ number_format($cliente->total_gastado, 2) }}</td>
                            <td>S/ {{ number_format($cliente->promedio_compra, 2) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif

    @elseif($tipo === 'financiero')
        <div class="stats">
            <h2>Resumen Financiero</h2>
            <div class="stats-grid">
                <div class="stats-item">
                    <div class="stats-label">Ingresos Totales</div>
                    <div class="stats-value">S/ {{ number_format($data['stats']['ingresos_totales'], 2) }}</div>
                </div>
                <div class="stats-item">
                    <div class="stats-label">Total Ventas</div>
                    <div class="stats-value">{{ $data['stats']['ventas_totales'] }}</div>
                </div>
                <div class="stats-item">
                    <div class="stats-label">Ventas Anuladas</div>
                    <div class="stats-value">{{ $data['stats']['ventas_anuladas'] }}</div>
                </div>
                <div class="stats-item">
                    <div class="stats-label">Valor Inventario</div>
                    <div class="stats-value">S/ {{ number_format($data['stats']['valor_inventario'], 2) }}</div>
                </div>
            </div>
        </div>

        @if(count($data['ingresos_por_metodo']) > 0)
            <h2>Ingresos por Método de Pago</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Método de Pago</th>
                        <th>Total Ventas</th>
                        <th>Total Ingresos</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($data['ingresos_por_metodo'] as $metodo)
                        <tr>
                            <td>{{ $metodo->metodo_pago }}</td>
                            <td>{{ $metodo->total_ventas }}</td>
                            <td>S/ {{ number_format($metodo->total_ingresos, 2) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    @endif

    <div class="footer">
        <p>Reporte generado automáticamente por el sistema de J&M GUTIERREZ E.I.R.L.</p>
        <p>Página 1</p>
    </div>
</body>
</html> 