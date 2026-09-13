<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Http\Helpers\SecurityHelper;

class BusinessUpdateRequest extends FormRequest
{
    public function authorize()
    {
        return true; // Authorization is handled by middleware
    }

    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'category_id' => 'required|exists:categories,id',
            'address' => 'required|string|max:500',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'opening_hours' => 'nullable|json',
            'social_media' => 'nullable|json',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120',
            'logo' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'remove_images' => 'nullable|array',
            'remove_images.*' => 'string',
            'remove_logo' => 'nullable|boolean',
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'Nama bisnis harus diisi.',
            'name.max' => 'Nama bisnis maksimal 255 karakter.',
            'description.max' => 'Deskripsi maksimal 2000 karakter.',
            'category_id.required' => 'Kategori harus dipilih.',
            'category_id.exists' => 'Kategori yang dipilih tidak valid.',
            'address.required' => 'Alamat harus diisi.',
            'address.max' => 'Alamat maksimal 500 karakter.',
            'phone.max' => 'Nomor telepon maksimal 20 karakter.',
            'email.email' => 'Format email tidak valid.',
            'website.url' => 'Format website tidak valid.',
            'opening_hours.json' => 'Format jam buka tidak valid.',
            'social_media.json' => 'Format media sosial tidak valid.',
            'latitude.numeric' => 'Latitude harus berupa angka.',
            'latitude.between' => 'Latitude harus antara -90 dan 90.',
            'longitude.numeric' => 'Longitude harus berupa angka.',
            'longitude.between' => 'Longitude harus antara -180 dan 180.',
            'images.*.image' => 'File harus berupa gambar.',
            'images.*.mimes' => 'Gambar harus berformat jpeg, png, jpg, atau gif.',
            'images.*.max' => 'Ukuran gambar maksimal 5MB.',
            'logo.image' => 'Logo harus berupa gambar.',
            'logo.mimes' => 'Logo harus berformat jpeg, png, jpg, atau gif.',
            'logo.max' => 'Ukuran logo maksimal 2MB.',
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
        
        if ($this->has('name')) {
            $sanitizedInputs['name'] = SecurityHelper::sanitizeInput($this->name);
        }
        
        if ($this->has('description')) {
            $sanitizedInputs['description'] = SecurityHelper::sanitizeInput($this->description);
        }
        
        if ($this->has('address')) {
            $sanitizedInputs['address'] = SecurityHelper::sanitizeInput($this->address);
        }
        
        if ($this->has('phone')) {
            $sanitizedInputs['phone'] = SecurityHelper::sanitizeInput($this->phone);
        }
        
        if ($this->has('website')) {
            $sanitizedInputs['website'] = SecurityHelper::sanitizeUrl($this->website);
        }

        if (!empty($sanitizedInputs)) {
            $this->merge($sanitizedInputs);
        }
    }
}