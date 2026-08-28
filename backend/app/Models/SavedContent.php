<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavedContent extends Model
{
    protected $fillable = ['user_id', 'content_type', 'content_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Ambil data blog/event aslinya sesuai content_type - dipakai supaya
    // daftar favorit bisa menampilkan judul, gambar, dst tanpa query terpisah.
    public function getContentAttribute()
    {
        if ($this->content_type === 'blog') {
            return Blog::find($this->content_id);
        }
        if ($this->content_type === 'event') {
            return Event::find($this->content_id);
        }
        return null;
    }
}