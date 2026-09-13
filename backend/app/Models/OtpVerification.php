<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class OtpVerification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'email',
        'otp_code',
        'purpose',
        'expires_at',
        'verified_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isExpired()
    {
        return Carbon::now()->isAfter($this->expires_at);
    }

    public function isVerified()
    {
        return !is_null($this->verified_at);
    }

    public function markAsVerified()
    {
        $this->verified_at = Carbon::now();
        $this->save();
    }

    public static function generateOtp()
    {
        return random_int(100000, 999999);
    }

    public static function createOtp($email, $purpose, $userId = null)
    {
        // Delete any existing unverified OTPs for this email and purpose
        self::where('email', $email)
            ->where('purpose', $purpose)
            ->whereNull('verified_at')
            ->delete();

        $otp = self::generateOtp();
        $expiresAt = Carbon::now()->addMinutes(5);

        return self::create([
            'user_id' => $userId,
            'email' => $email,
            'otp_code' => $otp,
            'purpose' => $purpose,
            'expires_at' => $expiresAt,
        ]);
    }

    public static function verifyOtp($email, $otpCode, $purpose)
    {
        return self::where('email', $email)
            ->where('otp_code', $otpCode)
            ->where('purpose', $purpose)
            ->whereNull('verified_at')
            ->where('expires_at', '>', Carbon::now())
            ->first();
    }
}
