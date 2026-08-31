<?php

namespace App\Http\Controllers;

use App\Models\ReferralCommission;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class WithdrawalController extends Controller
{
    /**
     * User submits a withdrawal request for their referral commission.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:50000',
            'payment_method' => 'required|string|max:50',
            'account_number' => 'required|string|max:100',
            'account_name' => 'required|string|max:150',
        ], [
            'amount.min' => 'Batas minimal penarikan komisi adalah Rp 50.000.',
            'payment_method.required' => 'Pilih metode penarikan (Bank atau E-Wallet).',
            'account_number.required' => 'Nomor rekening/nomor e-wallet wajib diisi.',
            'account_name.required' => 'Nama pemilik rekening wajib diisi.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        // Calculate available commission balance
        $totalCommissionEarned = ReferralCommission::where('referrer_id', $user->id)
            ->whereIn('status', ['approved', 'paid'])
            ->sum(DB::raw('COALESCE(final_commission_amount, commission_amount)'));

        $totalWithdrawn = Withdrawal::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved', 'completed'])
            ->sum('amount');

        $availableBalance = max(0, $totalCommissionEarned - $totalWithdrawn);

        if ($request->amount > $availableBalance) {
            return response()->json([
                'success' => false,
                'message' => 'Saldo komisi Anda tidak mencukupi. Saldo tersedia: Rp ' . number_format($availableBalance, 0, ',', '.'),
            ], 422);
        }

        $withdrawal = Withdrawal::create([
            'user_id' => $user->id,
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'account_number' => $request->account_number,
            'account_name' => $request->account_name,
            'status' => 'pending',
        ]);

        // Notify admins
        NotificationController::createNotification(
            $user->id,
            'withdrawal',
            'Pengajuan Tarik Saldo Terkirim',
            'Permintaan penarikan saldo komisi sebesar Rp ' . number_format($request->amount, 0, ',', '.') . ' sedang diproses admin.',
            ['withdrawal_id' => $withdrawal->id]
        );

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan penarikan komisi berhasil dikirim dan akan segera diproses oleh admin.',
            'data' => $withdrawal,
        ], 201);
    }

    /**
     * User gets their withdrawal history.
     */
    public function myWithdrawals(Request $request)
    {
        $user = $request->user();

        $withdrawals = Withdrawal::where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $withdrawals,
        ]);
    }

    /**
     * Admin gets all withdrawals.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = Withdrawal::with('user:id,name,email,avatar');

        if ($request->status && in_array($request->status, ['pending', 'approved', 'rejected', 'completed'])) {
            $query->where('status', $request->status);
        }

        $withdrawals = $query->latest()->paginate(25);

        return response()->json([
            'success' => true,
            'data' => $withdrawals,
        ]);
    }

    /**
     * Admin updates withdrawal status.
     */
    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'status' => 'required|in:pending,approved,rejected,completed',
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $withdrawal = Withdrawal::findOrFail($id);
        $withdrawal->status = $request->status;
        $withdrawal->admin_notes = $request->admin_notes;

        if (in_array($request->status, ['approved', 'completed'])) {
            $withdrawal->processed_at = now();
        }

        $withdrawal->save();

        // Notify user
        NotificationController::createNotification(
            $withdrawal->user_id,
            'withdrawal',
            'Status Penarikan Komisi Diperbarui',
            "Pengajuan penarikan Rp " . number_format($withdrawal->amount, 0, ',', '.') . " berstatus: " . strtoupper($withdrawal->status) . ".",
            ['withdrawal_id' => $withdrawal->id, 'status' => $withdrawal->status]
        );

        return response()->json([
            'success' => true,
            'message' => 'Status penarikan berhasil diperbarui.',
            'data' => $withdrawal,
        ]);
    }
}
