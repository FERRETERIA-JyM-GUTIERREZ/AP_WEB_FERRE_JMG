<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'cliente_nombre',
        'cliente_telefono',
        'cliente_email',
        'mensaje',
        'tipo_pedido',
        'estado',
        'fecha',
    ];

    protected $casts = [
        'fecha' => 'datetime',
    ];

    public function detalles()
    {
        return $this->hasMany(PedidoDetalle::class);
    }

    public function venta()
    {
        return $this->belongsTo(Venta::class, 'venta_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
