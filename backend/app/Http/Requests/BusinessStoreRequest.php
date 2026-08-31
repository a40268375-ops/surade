<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Http\Helpers\SecurityHelper;

class BusinessStoreRequest extends FormRequest
{
    public function authorize()
    {
        return true; // Authorization is handled by middleware
    }

    public function rules()
    {
        return [
            'category_id' => 'required',
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:2000',
            'address' => 'required|string|max:500',
            'village' => 'nullable|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'operating_hours' => 'nullable|string|max:500',
            'closed_days' => 'nullable|array',
            'closed_days.*' => 'string',
            'price_category' => 'nullable|integer|in:1,2,3',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'website' => 'nullable|url|max:255',
            'video_url' => 'nullable|url|max:255',
            'video' => 'nullable|file|mimetypes:video/mp4,video/webm,video/quicktime|max:20480',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'referred_by' => 'nullable|string|max:50',
            'package' => 'nullable|string|in:Gratis,Bisnis,Premium',
        ];
    }

    public function messages()
    {
        return [
            'category_id.required' => 'Kategori harus dipilih.',
            'title.required' => 'Judul bisnis harus diisi.',
            'title.max' => 'Judul bisnis maksimal 255 karakter.',
            'description.required' => 'Deskripsi harus diisi.',
            'description.max' => 'Deskripsi maksimal 2000 karakter.',
            'address.required' => 'Alamat harus diisi.',
            'address.max' => 'Alamat maksimal 500 karakter.',
            'village.max' => 'Nama desa/kelurahan maksimal 100 karakter.',
            'latitude.numeric' => 'Latitude harus berupa angka.',
            'latitude.between' => 'Latitude harus antara -90 dan 90.',
            'longitude.numeric' => 'Longitude harus berupa angka.',
            'longitude.between' => 'Longitude harus antara -180 dan 180.',
            'phone.required' => 'Nomor telepon harus diisi.',
            'phone.max' => 'Nomor telepon maksimal 20 karakter.',
            'email.email' => 'Format email tidak valid.',
            'operating_hours.max' => 'Jam operasional maksimal 500 karakter.',
            'price_category.integer' => 'Kategori harga harus berupa angka.',
            'price_category.in' => 'Kategori harga tidak valid.',
            'tags.*.max' => 'Setiap tag maksimal 50 karakter.',
            'website.url' => 'Format website tidak valid.',
            'video_url.url' => 'Format URL video tidak valid.',
            'video.file' => 'Video harus berupa file.',
            'video.mimetypes' => 'Video harus berformat mp4, webm, atau quicktime.',
            'video.max' => 'Ukuran video maksimal 20MB.',
            'image.image' => 'File harus berupa gambar.',
            'image.mimes' => 'Gambar harus berformat jpeg, png, jpg, atau gif.',
            'image.max' => 'Ukuran gambar maksimal 5MB.',
            'images.*.image' => 'File harus berupa gambar.',
            'images.*.mimes' => 'Gambar harus berformat jpeg, png, jpg, atau gif.',
            'images.*.max' => 'Ukuran gambar maksimal 5MB.',
            'referred_by.max' => 'Kode referral maksimal 50 karakter.',
            'package.in' => 'Paket tidak valid.',
        ];
    }

    protected function prepareForValidation()
    {
        // Handle dynamic category creation
        if ($this->has('category_id') && !is_numeric($this->input('category_id'))) {
            $catId = $this->input('category_id');
            if (!empty($catId)) {
                $cat = \App\Models\Category::firstOrCreate(
                    ['name' => SecurityHelper::sanitizeInput($catId)],
                    [
                        'slug' => \Illuminate\Support\Str::slug($catId), 
                        'icon' => 'tag'
                    ]
                );
                $this->merge(['category_id' => $cat->id]);
            }
        }

        // Sanitize text inputs
        $sanitizedInputs = [];
        
        if ($this->has('title')) {
            $sanitizedInputs['title'] = SecurityHelper::sanitizeInput($this->title);
        }
        
        if ($this->has('description')) {
            $sanitizedInputs['description'] = SecurityHelper::sanitizeInput($this->description);
        }
        
        if ($this->has('address')) {
            $sanitizedInputs['address'] = SecurityHelper::sanitizeInput($this->address);
        }
        
        if ($this->has('village')) {
            $sanitizedInputs['village'] = SecurityHelper::sanitizeInput($this->village);
        }
        
        if ($this->has('phone')) {
            $sanitizedInputs['phone'] = SecurityHelper::sanitizeInput($this->phone);
        }
        
        if ($this->has('operating_hours')) {
            $sanitizedInputs['operating_hours'] = SecurityHelper::sanitizeInput($this->operating_hours);
        }
        
        if ($this->has('website')) {
            $sanitizedInputs['website'] = SecurityHelper::sanitizeUrl($this->website);
        }
        
        if ($this->has('video_url')) {
            $sanitizedInputs['video_url'] = SecurityHelper::sanitizeUrl($this->video_url);
        }
        
        if ($this->has('referred_by')) {
            $sanitizedInputs['referred_by'] = SecurityHelper::sanitizeInput($this->referred_by);
        }

        if (!empty($sanitizedInputs)) {
            $this->merge($sanitizedInputs);
        }
    }
}