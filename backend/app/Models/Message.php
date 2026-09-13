<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id',
        'customer_id',
        'sender_id',
        'sender_role',
        'sender_name',
        'sender_contact',
        'message',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    // Pelanggan pemilik thread percakapan ini (bukan berarti pengirim baris
    // pesan ini - lihat sender() untuk itu). Dipakai untuk mengelompokkan
    // pesan jadi satu percakapan per pelanggan.
    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    // Akun yang benar-benar menulis baris pesan ini (pelanggan atau
    // pemilik bisnis/admin yang membalas).
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}