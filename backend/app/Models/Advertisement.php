<?php

namespace App\Http\Controllers;

use App\Models\Advertisement;
use Illuminate\Http\Request;

class AdvertisementController extends Controller
{
    public function index()
    {
        return Advertisement::all();
    }

    public function store(Request $request)
    {
        $advertisement = Advertisement::create($request->all());

        return response()->json($advertisement, 201);
    }

    public function show($id)
    {
        return Advertisement::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $advertisement = Advertisement::findOrFail($id);

        $advertisement->update($request->all());

        return $advertisement;
    }

    public function destroy($id)
    {
        Advertisement::destroy($id);

        return response()->json([
            'message' => 'Data berhasil dihapus'
        ]);
    }
}