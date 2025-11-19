<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WishlistItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'wishlist_id',
        'producto_id',
    ];

    public function wishlist()
    {
        return $this->belongsTo(Wishlist::class);
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class);
    }
}














