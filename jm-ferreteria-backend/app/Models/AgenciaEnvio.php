<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgenciaEnvio extends Model
{
    use HasFactory;

    protected $table = 'agencias_envio';

    protected $fillable = [
        'nombre',
        'ciudad',
        'departamento',
        'direccion',
        'referencia',
        'tipo',
        'telefono',
        'horarios',
        'transportista',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    /**
     * Scope para filtrar agencias activas
     */
    public function scopeActivas($query)
    {
        return $query->where('activo', true);
    }

    /**
     * Scope para filtrar por ciudad
     */
    public function scopePorCiudad($query, $ciudad)
    {
        return $query->where('ciudad', 'like', "%{$ciudad}%");
    }

    /**
     * Scope para filtrar por departamento
     */
    public function scopePorDepartamento($query, $departamento)
    {
        return $query->where('departamento', $departamento);
    }

    /**
     * Scope para filtrar por transportista
     */
    public function scopePorTransportista($query, $transportista = 'Shalon')
    {
        return $query->where('transportista', $transportista);
    }
}

