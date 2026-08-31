<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Http\Helpers\SecurityHelper;

class ReviewStoreRequest extends FormRequest
{
    public function authorize()
    {
        return true; // Authorization is handled by middleware
    }

    public function rules()
    {
        return [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:10|max:1000',
            'business_id' => 'required|exists:businesses,id',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:3072', // 3MB max per image
        ];
    }

    public function messages()
    {
        return [
            'rating.required' => 'Rating harus dipilih.',
            'rating.integer' => 'Rating harus berupa angka.',
            'rating.min' => 'Rating minimal 1 bintang.',
            'rating.max' => 'Rating maksimal 5 bintang.',
            'comment.required' => 'Komentar harus diisi.',
            'comment.min' => 'Komentar minimal 10 karakter.',
            'comment.max' => 'Komentar maksimal 1000 karakter.',
            'business_id.required' => 'Bisnis harus dipilih.',
            'business_id.exists' => 'Bisnis yang dipilih tidak valid.',
            'images.*.image' => 'File harus berupa gambar.',
            'images.*.mimes' => 'Gambar harus berformat jpeg, png, jpg, atau gif.',
            'images.*.max' => 'Ukuran gambar maksimal 3MB.',
        ];
    }

    protected function prepareForValidation()
    {
        // Sanitize comment input
        if ($this->has('comment')) {
            $this->merge(['comment' => SecurityHelper::sanitizeInput($this->comment)]);
        }
    }
}