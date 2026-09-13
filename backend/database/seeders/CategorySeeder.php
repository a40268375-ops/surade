<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Struktur kategori & subkategori — sama dengan menu Informasi di navbar
     * dan form daftar bisnis di dashboard frontend.
     */
    private array $tree = [
        'Perkantoran' => [
            'Kantor Pemerintah', 'Lembaga', 'Bank & ATM', 'Finance', 'Kantor Pos',
            'Konsultan', 'Kontraktor', 'Notaris', 'Koperasi', 'Asuransi',
            'Media Berita', 'Media Televisi',
        ],
        'Bisnis & Market' => [
            'Cafe & Restaurant', 'Furniture', 'Makanan & Minuman', 'Minimarket', 'Pasar',
            'Pertokoan', 'Peternakan', 'Printing', 'Produk', 'Produk Lain', 'Properti',
            'Super Market', 'Warung',
        ],
        'Rekreasi & Hiburan' => [
            'Film', 'Guide', 'Hotel', 'Karaoke', 'Organ Tunggal', 'Penginapan',
            'Photography', 'Travel Agent', 'Wisata',
        ],
        'Jasa & Servis' => [
            'Ahli Professional', 'Baby Sister', 'Event Organizer', 'Guru Privat',
            'Jasa Pengiriman', 'Pembantu RT', 'Pengiriman TKI', 'Pijat & Bekam',
            'Servis & Tukang', 'Wedding Organizer',
        ],
        'Fasilitas' => ['Pom Bensin', 'Sarana Ibadah', 'Terminal'],
        'Otomotif' => [
            'Aksesoris Kendaraan', 'Cuci Kendaraan', 'Mobil', 'Motor',
            'Perbaikan & Servis', 'Rental', 'Spare Part',
        ],
        'Pendidikan' => ['Kampus', 'Kebudayaan', 'Kursus', 'Perpustakaan', 'Sekolah', 'Yayasan'],
        'Kesehatan' => [
            'Apotik', 'Bidan', 'Dokter Hewan', 'Dokter Praktek', 'Kecantikan', 'Klinik',
            'Massage & Spa', 'Petshop', 'Puskesmas', 'Rumah Sakit', 'Sport Center', 'Terapi',
        ],
        'Elektronik & Gadget' => ['Cctv', 'Handphone', 'Home Elektronik', 'Komputer', 'Listrik'],
        'Fashion' => ['Barbershop', 'Butik', 'Distro', 'Factory Outlet', 'Perhiasan', 'Salon'],
        'Musik' => [
            'Band', 'Engineer Music', 'Event Musik', 'Event Organizer Musik',
            'Jual Beli Alat Musik', 'Kursus Private', 'Lembaga Kursus', 'Studio Musik',
            'Studio Recording', 'Toko Musik',
        ],
        'Komunitas' => ['Gamer', 'Otomotif', 'Pecinta Alam', 'Sepeda'],
        'Informasi Umum' => [
            'Berita & Event', 'Info Tol', 'Lowongan Kerja', 'Pencari Kerja', 'Surveyor', 'Titik Evakuasi',
        ],
    ];

    public function run(): void
    {
        foreach ($this->tree as $parentName => $children) {
            $parent = Category::updateOrCreate(
                ['slug' => Str::slug($parentName)],
                ['name' => $parentName, 'parent_id' => null, 'icon' => 'tag', 'status' => 'active']
            );

            foreach ($children as $childName) {
                Category::updateOrCreate(
                    ['slug' => Str::slug($childName)],
                    ['name' => $childName, 'parent_id' => $parent->id, 'icon' => 'tag', 'status' => 'active']
                );
            }
        }
    }
}
