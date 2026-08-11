<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'referral_code' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // SECURITY FIX: `role` used to be accepted straight from the request
        // body (nullable|in:user,admin,reseller), which meant anyone calling
        // POST /api/register directly (e.g. via curl/Postman, bypassing the
        // React form that never exposes a role picker) could send
        // {"role":"admin"} and instantly get an administrator account. Public
        // self-registration must always create a plain "user"; only an
        // existing admin (via UserController::store/update) may grant the
        // admin or reseller role.
        // Generate unique referral code for new user
        $referralCode = $this->generateUniqueReferralCode();

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
            'status' => 'active',
            'referral_code' => $referralCode,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email atau password salah.'
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Akun ini telah dinonaktifkan. Hubungi admin untuk info lebih lanjut.'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

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
}