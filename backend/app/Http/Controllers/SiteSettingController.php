<?php

namespace App\Http\Controllers;

use App\Models\SiteSetting;
use Illuminate\Http\Request;

class SiteSettingController extends Controller
{
    /**
     * Admin: ambil semua pengaturan situs sebagai satu object
     * { site_name: "...", contact_email: "...", ... }.
     */
    public function index()
    {
        $settings = SiteSetting::pluck('value', 'key');
        return response()->json($settings);
    }

    /**
     * Admin: simpan/perbarui beberapa pengaturan sekaligus.
     * Body: { site_name: "...", contact_email: "...", contact_phone: "...", whatsapp_admin: "...", address: "..." }
     */
    public function update(Request $request)
    {
        $allowedKeys = ['site_name', 'contact_email', 'contact_phone', 'whatsapp_admin', 'address', 'meta_description'];

        foreach ($request->all() as $key => $value) {
            if (in_array($key, $allowedKeys, true)) {
                SiteSetting::updateOrCreate(['key' => $key], ['value' => $value]);
            }
        }

        return response()->json(SiteSetting::pluck('value', 'key'));
    }
}