<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\OtpVerification;
use App\Mail\OtpMail;
use App\Http\Requests\UserRegistrationRequest;
use App\Http\Helpers\SecurityHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(UserRegistrationRequest $request)
    {
        // Rate limiting check
        $rateLimitCheck = SecurityHelper::checkOtpRateLimit($request->email, 'registration');
        if ($rateLimitCheck['blocked']) {
            return response()->json([
                'message' => $rateLimitCheck['message'],
                'error' => 'RATE_LIMITED'
            ], 429);
        }

        // Generate unique referral code for new user
        $referralCode = $this->generateUniqueReferralCode();

        $user = User::create([
            'name' => SecurityHelper::sanitizeInput($request->name),
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone ? SecurityHelper::sanitizeInput($request->phone) : null,
            'role' => 'user',
            'status' => 'active',
            'referral_code' => $referralCode,
            'is_active' => true,
            // Don't set email_verified_at yet - wait for OTP verification
        ]);

        // Record OTP request for rate limiting
        SecurityHelper::recordOtpRequest($request->email, 'registration');

        // Create OTP for email verification
        $otpRecord = OtpVerification::createOtp($request->email, 'register', $user->id);

        // Send OTP email
        $mailResult = $this->sendOtpEmail($user, $otpRecord, 'register');

        $response = [
            'message' => $mailResult['sent']
                ? 'Registrasi berhasil. Kode verifikasi telah dikirim ke email Anda.'
                : 'Registrasi berhasil, tapi kami gagal mengirim email verifikasi. Coba klik "Kirim ulang kode" di halaman berikutnya.',
            'email' => $user->email,
            'requires_verification' => true,
            'email_sent' => $mailResult['sent'],
        ];
        
        if (isset($mailResult['debug_otp_code'])) {
            $response['debug_otp_code'] = $mailResult['debug_otp_code'];
        }

        return response()->json($response, 201);
    }

    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp_code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $otpRecord = OtpVerification::verifyOtp($request->email, $request->otp_code, 'register');

        if (!$otpRecord) {
            return response()->json([
                'message' => 'Kode OTP tidak valid atau sudah kadaluarsa.'
            ], 401);
        }

        // Mark OTP as verified
        $otpRecord->markAsVerified();

        // Mark user email as verified
        $user = User::where('email', $request->email)->first();
        if ($user) {
            $user->email_verified_at = now();
            $user->save();

            // Create token for auto-login after verification
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Email berhasil diverifikasi.',
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]);
        }

        return response()->json([
            'message' => 'User tidak ditemukan.'
        ], 404);
    }

    public function resendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            return response()->json([
                'message' => 'Email tidak ditemukan.'
            ], 404);
        }

        if ($user->email_verified_at) {
            return response()->json([
                'message' => 'Email sudah terverifikasi.'
            ], 400);
        }

        // Create new OTP (this will delete any existing unverified OTPs)
        $otpRecord = OtpVerification::createOtp($request->email, 'register', $user->id);

        // Send OTP email
        $mailResult = $this->sendOtpEmail($user, $otpRecord, 'register');

        if (!$mailResult['sent']) {
            $response = ['message' => 'Gagal mengirim ulang kode OTP. Silakan coba lagi.'];
            if (isset($mailResult['debug_otp_code'])) {
                $response['debug_otp_code'] = $mailResult['debug_otp_code'];
            }
            return response()->json($response, 500);
        }

        return response()->json([
            'message' => 'Kode OTP baru telah dikirim ke email Anda.'
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            return response()->json([
                'message' => 'Email tidak ditemukan.'
            ], 404);
        }

        // Create OTP for password reset
        $otpRecord = OtpVerification::createOtp($request->email, 'reset_password', $user->id);

        // Send OTP email
        $mailResult = $this->sendOtpEmail($user, $otpRecord, 'reset_password');

        if (!$mailResult['sent']) {
            $response = ['message' => 'Gagal mengirim kode reset password. Silakan coba lagi.'];
            if (isset($mailResult['debug_otp_code'])) {
                $response['debug_otp_code'] = $mailResult['debug_otp_code'];
            }
            return response()->json($response, 500);
        }

        return response()->json([
            'message' => 'Kode reset password telah dikirim ke email Anda.',
            'email' => $user->email,
        ]);
    }

    public function verifyResetOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp_code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $otpRecord = OtpVerification::verifyOtp($request->email, $request->otp_code, 'reset_password');

        if (!$otpRecord) {
            return response()->json([
                'message' => 'Kode OTP tidak valid atau sudah kadaluarsa.'
            ], 401);
        }

        // Mark OTP as verified but don't delete it yet - we need it for password reset
        $otpRecord->markAsVerified();

        return response()->json([
            'message' => 'Kode OTP valid. Silakan masukkan password baru.',
            'reset_token' => $otpRecord->id, // Use OTP record ID as reset token
        ]);
    }

    public function resendResetOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            return response()->json([
                'message' => 'Email tidak ditemukan.'
            ], 404);
        }

        // Create new OTP for reset password
        $otpRecord = OtpVerification::createOtp($request->email, 'reset_password', $user->id);

        // Send OTP email
        $mailResult = $this->sendOtpEmail($user, $otpRecord, 'reset_password');

        if (!$mailResult['sent']) {
            $response = ['message' => 'Gagal mengirim ulang kode OTP. Silakan coba lagi.'];
            if (isset($mailResult['debug_otp_code'])) {
                $response['debug_otp_code'] = $mailResult['debug_otp_code'];
            }
            return response()->json($response, 500);
        }

        return response()->json([
            'message' => 'Kode OTP baru telah dikirim ke email Anda.'
        ]);
    }

    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reset_token' => 'required',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Find the verified OTP record
        $otpRecord = OtpVerification::where('id', $request->reset_token)
            ->where('purpose', 'reset_password')
            ->whereNotNull('verified_at')
            ->first();

        if (!$otpRecord) {
            return response()->json([
                'message' => 'Token reset password tidak valid.'
            ], 401);
        }

        // Check if token is still valid (within reasonable time after verification)
        if ($otpRecord->verified_at < now()->subMinutes(10)) {
            return response()->json([
                'message' => 'Token reset password sudah kadaluarsa. Silakan ulangi proses reset.'
            ], 401);
        }

        $user = User::where('email', $otpRecord->email)->first();
        
        if (!$user) {
            return response()->json([
                'message' => 'User tidak ditemukan.'
            ], 404);
        }

        // Update password
        $user->password = Hash::make($request->password);
        $user->save();

        // Delete the used OTP record
        $otpRecord->delete();

        return response()->json([
            'message' => 'Password berhasil diubah. Silakan login dengan password baru.'
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        // Rate limiting check for login attempts
        $rateLimitCheck = SecurityHelper::checkLoginRateLimit($request);
        if ($rateLimitCheck['blocked']) {
            return response()->json([
                'message' => $rateLimitCheck['message'],
                'error' => 'RATE_LIMITED'
            ], 429);
        }

        // Sanitize input
        $email = SecurityHelper::sanitizeInput($request->email);
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            // Record failed login attempt
            SecurityHelper::recordFailedLogin($request);
            
            return response()->json([
                'message' => 'Email atau password salah.'
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Akun ini telah dinonaktifkan. Hubungi admin untuk info lebih lanjut.'
            ], 403);
        }

        // Check if email is verified
        if (!$user->email_verified_at) {
            // Create new OTP for verification
            $otpRecord = OtpVerification::createOtp($user->email, 'register', $user->id);

            // Send OTP email
            $mailResult = $this->sendOtpEmail($user, $otpRecord, 'register');

            $response = [
                'message' => $mailResult['sent']
                    ? 'Email belum diverifikasi. Kode verifikasi telah dikirim ke email Anda.'
                    : 'Email belum diverifikasi, dan kami gagal mengirim ulang kodenya. Coba klik "Kirim ulang kode" di halaman berikutnya.',
                'requires_verification' => true,
                'email' => $user->email,
                'email_sent' => $mailResult['sent'],
            ];
            if (isset($mailResult['debug_otp_code'])) {
                $response['debug_otp_code'] = $mailResult['debug_otp_code'];
            }

            return response()->json($response, 403);
        }

        // Record successful login and reset failed attempts
        SecurityHelper::clearFailedLoginAttempts($request);

        // Generate secure token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Log security event
        SecurityHelper::logSecurityEvent('user_login', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    // Menyimpan perubahan dari form "Pengaturan Profil" (tab profile) di
    // Dashboard: nama, email, no. HP, bio, dan foto profil. Dikirim sebagai
    // POST multipart/form-data (bukan PUT) supaya file foto ikut terkirim -
    // sama seperti pola upload gambar bisnis di BusinessController.
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:30',
            'bio' => 'nullable|string',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'remove_avatar' => 'nullable|boolean',
            'cover_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'remove_cover_photo' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['name', 'email', 'phone', 'bio']);

        if ($request->hasFile('avatar')) {
            // Hapus foto lama supaya file lama tidak menumpuk di storage.
            if ($user->avatar) {
                $oldPath = str_replace('/storage/', '', $user->avatar);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = '/storage/' . $path;
        } elseif ($request->boolean('remove_avatar')) {
            // User minta hapus foto profil (tanpa mengganti dengan foto baru).
            if ($user->avatar) {
                $oldPath = str_replace('/storage/', '', $user->avatar);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }
            $data['avatar'] = null;
        }

        // Foto sampul (cover/banner) - sama polanya dengan foto profil di atas.
        if ($request->hasFile('cover_photo')) {
            if ($user->cover_photo) {
                $oldCoverPath = str_replace('/storage/', '', $user->cover_photo);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldCoverPath);
            }
            $coverPath = $request->file('cover_photo')->store('covers', 'public');
            $data['cover_photo'] = '/storage/' . $coverPath;
        } elseif ($request->boolean('remove_cover_photo')) {
            if ($user->cover_photo) {
                $oldCoverPath = str_replace('/storage/', '', $user->cover_photo);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldCoverPath);
            }
            $data['cover_photo'] = null;
        }

        $user->update($data);

        return response()->json($user->fresh());
    }

    private function generateUniqueReferralCode()
    {
        do {
            // Generate 8-character code: REF + 5 random uppercase alphanumeric
            $code = 'REF' . strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 5));
        } while (User::where('referral_code', $code)->exists());

        return $code;
    }

    // Kirim email OTP, dan kembalikan info apakah berhasil terkirim.
    // Di environment local/debug, kode OTP-nya selalu dikembalikan di response
    // supaya development/testing tetap bisa jalan tanpa perlu setup SMTP.
    private function sendOtpEmail($user, $otpRecord, $purpose)
    {
        try {
            Mail::to($user->email)->send(new OtpMail($user->name, $otpRecord->otp_code, $purpose));
            $result = ['sent' => true];
        } catch (\Exception $e) {
            \Log::error("Failed to send OTP email ($purpose): " . $e->getMessage());
            $result = ['sent' => false, 'error' => $e->getMessage()];
        }
        
        // Always return debug OTP code in local environment
        if (app()->environment('local') && config('app.debug')) {
            $result['debug_otp_code'] = $otpRecord->otp_code;
        }
        
        return $result;
    }
}