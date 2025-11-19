<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Envio extends Model
{
    use HasFactory;

    protected $table = 'envios';

    protected $fillable = [
        'venta_id',
        'destino_id',
        'estado',
        'costo',
        'datos_cliente',
        'fecha_envio',
        'fecha_entrega_estimada',
        'codigo_seguimiento',
        'notas'
    ];

    protected $casts = [
        'datos_cliente' => 'array',
        'fecha_envio' => 'datetime',
        'fecha_entrega_estimada' => 'datetime',
        'costo' => 'decimal:2'
    ];

    // Estados del envío
    const ESTADO_PREPARADO = 'preparado';
    const ESTADO_ENVIADO = 'enviado';
    const ESTADO_EN_TRANSITO = 'en_transito';
    const ESTADO_LLEGO_TERMINAL = 'llegó_terminal';
    const ESTADO_ENTREGADO = 'entregado';

    public function venta()
    {
        return $this->belongsTo(Venta::class);
    }

    public function destino()
    {
        return $this->belongsTo(DestinoEnvio::class);
    }

    public function getEstadoTextoAttribute()
    {
        $estados = [
            self::ESTADO_PREPARADO => 'Preparado',
            self::ESTADO_ENVIADO => 'Enviado',
            self::ESTADO_EN_TRANSITO => 'En Tránsito',
            self::ESTADO_LLEGO_TERMINAL => 'Llegó al Terminal',
            self::ESTADO_ENTREGADO => 'Entregado'
        ];

        return $estados[$this->estado] ?? $this->estado;
    }

    public function getColorEstadoAttribute()
    {
        $colores = [
            self::ESTADO_PREPARADO => 'bg-yellow-100 text-yellow-800',
            self::ESTADO_ENVIADO => 'bg-blue-100 text-blue-800',
            self::ESTADO_EN_TRANSITO => 'bg-purple-100 text-purple-800',
            self::ESTADO_LLEGO_TERMINAL => 'bg-green-100 text-green-800',
            self::ESTADO_ENTREGADO => 'bg-gray-100 text-gray-800'
        ];

        return $colores[$this->estado] ?? 'bg-gray-100 text-gray-800';
    }
}












