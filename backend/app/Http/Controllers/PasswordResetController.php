<?php

namespace App\Http\Controllers;

use App\Mail\ResetPasswordCode;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class PasswordResetController extends Controller
{
    /**
     * STEP 1 — user submits their email, we generate a 6-digit code,
     * store its hash in password_reset_tokens, and email it to them.
     */
    public function sendResetCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        // Don't reveal whether the email exists or not — always respond the
        // same way, but only actually send the email if the account exists.
        if ($user) {
            $code = (string) random_int(100000, 999999);

            DB::table('password_reset_tokens')->where('email', $user->email)->delete();
            DB::table('password_reset_tokens')->insert([
                'email' => $user->email,
                'token' => Hash::make($code),
                'created_at' => now(),
            ]);

            Mail::to($user->email)->send(new ResetPasswordCode($code, $user->name));
        }

        return response()->json([
            'message' => 'Kalau email tersebut terdaftar, kode verifikasi sudah dikirim.',
        ]);
    }

    /**
     * STEP 2 — user submits the 6-digit code they received, we check it
     * matches and hasn't expired (15 minutes), without consuming it yet.
     */
    public function verifyCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $record = $this->validCodeRecord($request->email, $request->code);

        if (!$record) {
            return response()->json([
                'message' => 'Kode verifikasi salah atau sudah kedaluwarsa.',
            ], 422);
        }

        return response()->json([
            'message' => 'Kode verifikasi valid.',
        ]);
    }

    /**
     * STEP 3 — user submits the code again together with the new password.
     * We re-validate the code (defense in depth against skipping step 2),
     * update the password, and consume (delete) the token.
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'code' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $record = $this->validCodeRecord($request->email, $request->code);

        if (!$record) {
            return response()->json([
                'message' => 'Kode verifikasi salah atau sudah kedaluwarsa.',
            ], 422);
        }

        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Consume the code and revoke all existing tokens so old sessions
        // (and anyone who might have gotten hold of the previous password)
        // are logged out everywhere.
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password berhasil direset. Silakan login dengan password baru kamu.',
        ]);
    }

    /**
     * Shared lookup: find a non-expired token row for this email whose
     * hashed value matches the submitted code.
     */
    private function validCodeRecord(string $email, string $code)
    {
        $record = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (!$record) {
            return null;
        }

        $expiresAt = \Carbon\Carbon::parse($record->created_at)->addMinutes(15);

        if (now()->greaterThan($expiresAt)) {
            return null;
        }

        if (!Hash::check($code, $record->token)) {
            return null;
        }

        return $record;
    }
}