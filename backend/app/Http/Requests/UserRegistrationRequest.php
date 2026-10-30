<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UserRegistrationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'min:2',
                'max:100',
                'regex:/^[a-zA-Z\s\-\'\.]+$/' // Only letters, spaces, hyphens, apostrophes, dots
            ],
            'email' => [
                'required',
                'string',
                'email:rfc,dns',
                'max:255',
                'unique:users,email'
            ],
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
            ],
            'referral_code' => [
                'nullable',
                'string',
                'exists:users,referral_code',
                'regex:/^[A-Za-z0-9\-_]{4,30}$/'
            ],
            'phone' => [
                'nullable',
                'string',
                'regex:/^(\+62|62|0)[\d-\s]{8,15}$/',
                'max:20'
            ],
        ];
    }

    /**
     * Get custom error messages.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama lengkap wajib diisi.',
            'name.min' => 'Nama minimal 2 karakter.',
            'name.max' => 'Nama maksimal 100 karakter.',
            'name.regex' => 'Nama hanya boleh berisi huruf, spasi, tanda hubung, apostrof, dan titik.',
            
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.max' => 'Email maksimal 255 karakter.',
            'email.unique' => 'Email sudah terdaftar. Silakan gunakan email lain atau login.',
            
            'password.required' => 'Password wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
            'password.min' => 'Password minimal 8 karakter.',
            
            'referral_code.exists' => 'Kode referral tidak valid.',
            'referral_code.regex' => 'Format kode referral tidak valid.',
            
            'phone.regex' => 'Format nomor telepon tidak valid. Gunakan format Indonesia (0xxx, +62xxx, atau 62xxx).',
            'phone.max' => 'Nomor telepon maksimal 20 karakter.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Additional security checks
            $email = $this->input('email');
            
            // Block temporary/disposable email domains
            $disposableDomains = [
                '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
                'tempmail.org', 'temp-mail.org', 'getnada.com'
            ];
            
            if ($email) {
                $domain = substr(strrchr($email, '@'), 1);
                if (in_array(strtolower($domain), $disposableDomains)) {
                    $validator->errors()->add('email', 'Email sementara tidak diperbolehkan. Gunakan email permanen.');
                }
            }

            // Validate referral code belongs to active user
            if ($this->referral_code) {
                $referrer = \App\Models\User::where('referral_code', $this->referral_code)
                    ->where('is_active', true)
                    ->first();
                
                if (!$referrer) {
                    $validator->errors()->add('referral_code', 'Kode referral tidak aktif atau sudah kadaluarsa.');
                }
            }
        });
    }
}