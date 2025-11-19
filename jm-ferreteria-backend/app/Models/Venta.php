<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Venta extends Model
{
    use HasFactory;

    protected $fillable = [
        'usuario_id',
        'cliente_nombre',
        'cliente_telefono',
        'cliente_dni',
        'total',
        'metodo_pago',
        'monto_pagado',
        'vuelto',
        'fecha',
        'estado',
        'anulado_por',
        'anulado_en',
        'motivo_anulacion',
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'monto_pagado' => 'decimal:2',
        'vuelto' => 'decimal:2',
        'fecha' => 'datetime',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function detalles()
    {
        return $this->hasMany(VentaDetalle::class);
    }

    public function anulador()
    {
        return $this->belongsTo(User::class, 'anulado_por');
    }

    public function pedido()
    {
        return $this->belongsTo(Pedido::class, 'pedido_id');
    }
}
