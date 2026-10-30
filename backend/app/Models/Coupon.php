<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class Coupon extends Model
{
    protected $fillable = [
        'business_id', 'code', 'name', 'description', 'discount_type', 'discount_value',
        'applies_to', 'minimum_amount', 'maximum_discount',
        'usage_limit', 'max_uses', 'used_count', 'starts_at', 'expires_at', 'is_active',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'discount_value' => 'decimal:2',
        'minimum_amount' => 'decimal:2',
        'maximum_discount' => 'decimal:2',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function usages()
    {
        return $this->hasMany(CouponUsage::class);
    }

    /**
     * Check if a specific user has already used this coupon code.
     * Enforces the single-use per user policy across the entire platform.
     */
    public static function hasUserUsed($userId, $code)
    {
        if (!$userId || empty($code)) {
            return false;
        }

        $code = strtoupper(trim($code));

        // 1. Check coupon_usages table
        if (Schema::hasTable('coupon_usages')) {
            $used = DB::table('coupon_usages')
                ->where('user_id', $userId)
                ->whereRaw('UPPER(coupon_code) = ?', [$code])
                ->exists();
            if ($used) return true;
        }

        // 2. Check advertisements table
        if (Schema::hasTable('advertisements') && Schema::hasColumn('advertisements', 'coupon_code')) {
            $usedInAd = DB::table('advertisements')
                ->where(function ($q) use ($userId) {
                    $q->where('user_id', $userId)
                      ->orWhereIn('business_id', function ($sub) use ($userId) {
                          $sub->select('id')->from('businesses')->where('user_id', $userId);
                      });
                })
                ->whereRaw('UPPER(coupon_code) = ?', [$code])
                ->where('status', '!=', 'rejected')
                ->exists();
            if ($usedInAd) return true;
        }

        // 3. Check subscriptions table
        if (Schema::hasTable('subscriptions') && Schema::hasColumn('subscriptions', 'coupon_code')) {
            $usedInSub = DB::table('subscriptions')
                ->where(function ($q) use ($userId) {
                    $q->where('user_id', $userId)
                      ->orWhereIn('business_id', function ($sub) use ($userId) {
                          $sub->select('id')->from('businesses')->where('user_id', $userId);
                      });
                })
                ->whereRaw('UPPER(coupon_code) = ?', [$code])
                ->where('status', '!=', 'cancelled')
                ->exists();
            if ($usedInSub) return true;
        }

        // 4. Check blogs table
        if (Schema::hasTable('blogs') && Schema::hasColumn('blogs', 'coupon_code')) {
            $userCol = Schema::hasColumn('blogs', 'user_id') ? 'user_id' : (Schema::hasColumn('blogs', 'author_id') ? 'author_id' : null);
            if ($userCol) {
                $usedInBlog = DB::table('blogs')
                    ->where($userCol, $userId)
                    ->whereRaw('UPPER(coupon_code) = ?', [$code])
                    ->where('status', '!=', 'rejected')
                    ->exists();
                if ($usedInBlog) return true;
            }
        }

        // 5. Check whatsapp_access_logs table
        if (Schema::hasTable('whatsapp_access_logs') && Schema::hasColumn('whatsapp_access_logs', 'coupon_code')) {
            $userPhone = null;
            if (is_numeric($userId)) {
                $userPhone = DB::table('users')->where('id', $userId)->value('phone');
            }
            $cleanUserPhone = $userPhone ? preg_replace('/[^0-9]/', '', $userPhone) : null;

            $usedInWa = DB::table('whatsapp_access_logs')
                ->where(function ($q) use ($userId, $cleanUserPhone) {
                    $q->where('user_id', $userId);
                    if ($cleanUserPhone) {
                        $q->orWhereRaw("REPLACE(REPLACE(REPLACE(customer_phone, ' ', ''), '-', ''), '+', '') = ?", [$cleanUserPhone]);
                    }
                })
                ->whereRaw('UPPER(coupon_code) = ?', [$code])
                ->where('status', '!=', 'rejected')
                ->exists();
            if ($usedInWa) return true;
        }

        return false;
    }

    /**
     * Record coupon usage for a user.
     */
    public static function recordUsage($userId, $code, $discountAmount = 0, $refType = null, $refId = null, $couponId = null)
    {
        if (!$userId || empty($code)) {
            return null;
        }

        $code = strtoupper(trim($code));

        $coupon = null;
        if ($couponId) {
            $coupon = self::find($couponId);
        }
        if (!$coupon) {
            $coupon = self::whereRaw('UPPER(code) = ?', [$code])->first();
        }

        if ($coupon) {
            $coupon->increment('used_count');
            $couponId = $coupon->id;
        }

        // Also increment PlatformCoupon if it exists
        if (\Illuminate\Support\Facades\Schema::hasTable('platform_coupons')) {
            $pCoupon = \App\Models\PlatformCoupon::whereRaw('UPPER(code) = ?', [$code])->first();
            if ($pCoupon) {
                $pCoupon->increment('used_count');
            }
        }

        if (Schema::hasTable('coupon_usages')) {
            return CouponUsage::create([
                'user_id' => $userId,
                'coupon_id' => $couponId,
                'coupon_code' => $code,
                'discount_amount' => $discountAmount,
                'reference_type' => $refType,
                'reference_id' => (string) $refId,
                'used_at' => now(),
            ]);
        }

        return null;
    }
}