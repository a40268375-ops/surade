<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Http\Helpers\SecurityHelper;

class AdvertisementStoreRequest extends FormRequest
{
    public function authorize()
    {
        return true; // Authorization is handled by middleware
    }

    public function rules()
    {
        return [
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:2000',
            'company_name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ];
    }

    public function messages()
    {
        return [
            'category_id.required' => 'Kategori harus dipilih.',
            'category_id.exists' => 'Kategori yang dipilih tidak valid.',
            'title.required' => 'Judul iklan harus diisi.',
            'title.max' => 'Judul iklan maksimal 255 karakter.',
            'description.required' => 'Deskripsi iklan harus diisi.',
            'description.max' => 'Deskripsi iklan maksimal 2000 karakter.',
            'company_name.required' => 'Nama perusahaan harus diisi.',
            'company_name.max' => 'Nama perusahaan maksimal 255 karakter.',
            'location.required' => 'Lokasi harus diisi.',
            'location.max' => 'Lokasi maksimal 255 karakter.',
            'phone.max' => 'Nomor telepon maksimal 20 karakter.',
            'website.url' => 'Format website tidak valid.',
            'website.max' => 'Website maksimal 255 karakter.',
            'image.image' => 'File harus berupa gambar.',
            'image.mimes' => 'Gambar harus berformat jpeg, png, jpg, gif, atau webp.',
            'image.max' => 'Ukuran gambar maksimal 5MB.',
        ];
    }

    protected function prepareForValidation()
    {
        // Sanitize text inputs
        $sanitizedInputs = [];
        
        if ($this->has('title')) {
            $sanitizedInputs['title'] = SecurityHelper::sanitizeInput($this->title);
        }
        
        if ($this->has('description')) {
            $sanitizedInputs['description'] = SecurityHelper::sanitizeInput($this->description);
        }
        
        if ($this->has('company_name')) {
            $sanitizedInputs['company_name'] = SecurityHelper::sanitizeInput($this->company_name);
        }
        
        if ($this->has('location')) {
            $sanitizedInputs['location'] = SecurityHelper::sanitizeInput($this->location);
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