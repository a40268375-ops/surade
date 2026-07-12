<?php
namespace App\Http\Controllers;
use App\Models\Business;
use Illuminate\Http\Request;

class BusinessController extends Controller {
    public function index() { return response()->json(Business::all()); }
    public function store(Request $request) {
        $data = $request->all();
        $data['user_id'] = auth()->id() ?? 1;
        return response()->json(Business::create($data), 201);
    }
    public function update(Request $request, Business $business) {
        $business->update($request->all());
        return response()->json($business);
    }
    public function destroy(Business $business) {
        $business->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}