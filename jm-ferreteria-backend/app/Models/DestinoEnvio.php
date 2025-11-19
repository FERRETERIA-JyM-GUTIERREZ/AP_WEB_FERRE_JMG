<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DestinoEnvio extends Model
{
    use HasFactory;

    protected $table = 'destinos_envio';

    protected $fillable = [
        'nombre',
        'costo',
        'terminal',
        'direccion_terminal',
        'telefono_terminal',
        'horarios',
        'activo',
        'tipo_envio'
    ];

    protected $casts = [
        'costo' => 'decimal:2',
        'activo' => 'boolean',
        'horarios' => 'array'
    ];

    public function envios()
    {
        return $this->hasMany(Envio::class, 'destino_id');
    }

    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    public function scopeAereos($query)
    {
        return $query->where('tipo_envio', 'aereo');
    }

    public function scopeTerrestres($query)
    {
        return $query->where('tipo_envio', 'terrestre');
    }

    public function getCostoFormateadoAttribute()
    {
        return 'S/ ' . number_format($this->costo, 2);
    }

    public function getTipoEnvioTextoAttribute()
    {
        return $this->tipo_envio === 'aereo' ? 'Aéreo ✈️' : 'Terrestre 🚚';
    }

    public function getIconoTipoAttribute()
    {
        return $this->tipo_envio === 'aereo' ? '✈️' : '🚚';
    }
}
