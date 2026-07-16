<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Business;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    // Public: anyone visiting a business page can submit a booking request,
    // no login required (same spirit as contacting via WhatsApp).
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'business_id' => 'required|exists:businesses,id',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:30',
            'customer_email' => 'nullable|email',
            'booking_date' => 'required|date',
            'booking_time' => 'nullable',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $booking = Booking::create([
            'business_id' => $request->business_id,
            'customer_name' => $request->customer_name,
            'customer_phone' => $request->customer_phone,
            'customer_email' => $request->customer_email,
            'booking_date' => $request->booking_date,
            'booking_time' => $request->booking_time,
            'notes' => $request->notes,
            'status' => 'pending',
        ]);

        return response()->json($booking, 201);
    }

    // Auth required: business owners see bookings for their own businesses,
    // admins see every booking.
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Booking::with('business');

        if ($user->role !== 'admin') {
            $query->whereHas('business', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        return response()->json($query->latest()->get());
    }

    // Auth required: only the owning business's user, or an admin, may
    // change a booking's status.
    public function update(Request $request, $id)
    {
        $booking = Booking::with('business')->find($id);

        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $booking->business->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $booking->update(['status' => $request->status]);

        return response()->json($booking->fresh('business'));
    }

    public function destroy(Request $request, $id)
    {
        $booking = Booking::with('business')->find($id);

        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $booking->business->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $booking->delete();

        return response()->json(['message' => 'Booking deleted']);
    }
}