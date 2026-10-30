<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Struktur 16 kategori & subkategori resmi — 100% sinkron antara menu Informasi di navbar,
     * filter halaman kategori, dan form pendaftaran/edit bisnis di dashboard frontend.
     */
    private array $tree = [
        'Jasa' => [
            'Asisten Rumah Tangga', 'Sedot WC', 'Pindahan Rumah', 'Tukang Bangunan', 'Potong Rumput',
            'Sumur Bor', 'Perbaikan Rumah Bocor', 'Wedding Organizer', 'Satpam & Security', 'Pengasuh Lansia',
            'Notaris & PPAT', 'Bantuan Hukum', 'Pengurusan Izin Usaha', 'Sewa Kamera & Drone', 'Pengasuh Anak',
            'Cuci Kasur & Sofa', 'Basmi Rayap & Hama', 'Jasa Angkut Barang', 'Poles Lantai', 'Kuras Toren Air',
            'Plafon Gypsum & PVC', 'Tebang Pohon', 'Duplikat Kunci', 'Bengkel Las', 'Bengkel Bubut',
            'Tukang Kayu', 'Tukang Listrik', 'Tukang Ledeng', 'Laundry Kiloan', 'Salon & Barbershop'
        ],
        'Servis' => [
            'Tambal Ban 24 Jam', 'Servis AC', 'Servis Kulkas', 'Servis Mesin Cuci', 'Servis Listrik & MCB',
            'Servis Pompa Air', 'Servis Kompor Gas', 'Servis TV & Elektronik', 'Servis Dispenser & Magic Com',
            'Servis Dinamo Mesin', 'Servis Genset', 'Servis Sound System', 'Servis Mesin Rumput',
            'Servis Mesin Steam', 'Servis Microwave & Oven', 'Servis Kipas Angin'
        ],
        'Otomotif' => [
            'Bengkel Mobil', 'Bengkel Motor', 'Audio Mobil', 'Jahit Cover Jok', 'Cat Oven & Body Repair',
            'Poles & Auto Detailing', 'Cuci Helm & Sepatu', 'Cuci Motor & Mobil', 'Sewa Motor', 'Rental Mobil',
            'Rental Truk & Pick Up', 'Aki & Kelistrikan Mobil', 'Servis Radiator', 'Knalpot Motor & Mobil',
            'Toko Ban & Velg', 'Shockbreaker & Kaki Kaki', 'Restorasi Motor Lawas'
        ],
        'Kesehatan' => [
            'Praktek Dokter Umum', 'Praktek Dokter Spesialis', 'Bidan & Persalinan', 'Dokter & Mantri Khitan',
            'Pijat Urut Tradisional', 'Toko Obat Herbal', 'Jamu Tradisional', 'Terapi Bekam & Ruqyah',
            'Perawat Home Care', 'Apotek 24 Jam', 'Fisioterapi', 'Pijat Refleksi', 'Praktek Dokter Gigi',
            'Pengobatan Patah Tulang', 'Laboratorium Darah', 'Klinik Kesehatan', 'Puskesmas', 'Rumah Sakit'
        ],
        'Properti' => [
            'Kontrakan Rumah', 'Kost Karyawan & Mahasiswa', 'Sewa Ruko & Kios', 'Sewa Kantor & Coworking',
            'Sewa Ruang Pertemuan', 'Interior & Kitchen Set', 'Kusen Kayu & Aluminium', 'Mebel & Kursi Kayu',
            'Pagar Besi & Tralis', 'Toko Kasur & Mebel', 'Villa & Penginapan', 'Homestay & Cottage',
            'Aspal Hotmix Jalan', 'Saluran Air & Gorong Gorong', 'Tukang Taman & Rumput', 'Kolam Koi & Air Mancur',
            'Pembuatan Kolam Renang', 'Kanopi Baja Ringan', 'Toko Material Bangunan', 'Tanah Kavling Dijual',
            'Rumah Dijual', 'Ruko & Kios Dijual', 'Wallpaper & Vinyl Lantai', 'Rolling Door & Folding Gate',
            'Toko Keramik & Granit', 'Toko Cat Bangunan'
        ],
        'Musik & Seni' => [
            'Guru Les Musik', 'Servis Alat Musik', 'Rental Alat Musik Band', 'Rental Sound System', 'Organ Tunggal',
            'Studio Musik & Recording', 'Penyanyi & Vokalis', 'Grup Band Wedding', 'Servis Speaker Aktif',
            'Alat Musik Tradisional', 'Rebana Hadroh & Marawis', 'Sanggar Seni & Tari Sunda', 'MC Acara & Pernikahan',
            'Sewa Kostum Adat & Kebaya', 'Aransemen & Jingle Musik'
        ],
        'Olahraga' => [
            'Sewa Lapangan Futsal', 'Sewa Lapangan Badminton', 'Sekolah Sepak Bola', 'Pelatih Bela Diri',
            'Sewa Alat Olahraga', 'Konveksi Jersey Tim', 'Kursus Renang', 'Instruktur Senam & Fitness',
            'Sewa Alat Camping', 'Servis Sepeda', 'Toko Alat Pancing', 'Pemandu Gowes & Trail'
        ],
        'Elektronik' => [
            'Pasang CCTV', 'Servis Laptop & Komputer', 'Servis Printer', 'Servis Kamera & Lensa',
            'Servis HP Android & iPhone', 'Toko Laptop & Komputer', 'Toko HP & Aksesoris',
            'Toko Elektronik Rumah Tangga', 'Pasang WiFi & Jaringan', 'Recovery Data Harddisk', 'Running Text LED Display'
        ],
        'Fashion' => [
            'Tukang Jahit Pakaian', 'Konveksi Seragam', 'Make Up Artist', 'Salon Kecantikan', 'Barbershop Pria',
            'Sewa Kebaya & Gaun Pengantin', 'Bordir & Sablon Kaos', 'Toko Busana Muslim & Hijab', 'Toko Sepatu & Tas',
            'Cuci Sepatu', 'Henna Art Pengantin'
        ],
        'Multimedia' => [
            'Video Dokumentasi Acara', 'Foto Wedding & Prewedding', 'Video Iklan & Promosi', 'Sewa Drone & Pilot',
            'Live Streaming Acara', 'Desain Grafis & Logo', 'Cetak Foto & Frame', 'Pembuatan Website', 'Undangan Digital'
        ],
        'Kuliner' => [
            'Warung Tegal', 'Angkringan & Sate', 'Warkop & Kedai Kopi', 'Cafe & Resto', 'Toko Buah Segar',
            'Rumah Makan Sunda', 'Restoran Ikan Bakar', 'Jajanan Pasar Tradisional', 'Toko Roti & Bakery',
            'Oleh Oleh Khas Surade', 'Katering Nasi Kotak', 'Warung Bakso & Mie', 'Rumah Makan Padang',
            'Ayam Geprek & Bebek Goreng', 'Sentra Ikan Asin'
        ],
        'Pendidikan' => [
            'Fotocopy & Pengetikan', 'Bimbingan Belajar', 'Les Privat ke Rumah', 'Kursus Komputer & Desain',
            'Kursus Bahasa Asing', 'Kursus Mengemudi', 'Kursus Menjahit', 'Pondok Pesantren',
            'Lembaga Pelatihan Kerja', 'Toko Buku & Alat Tulis'
        ],
        'Pertanian & Ternak' => [
            'Tanaman Hias & Polybag', 'Buket Bunga & Parsel', 'Bibit Buah Unggul', 'Hewan Qurban & Aqiqah',
            'Madu Murni Hutan', 'Susu Murni Sapi & Kambing', 'Pupuk Organik & Obat Hama', 'Bibit Ikan Air Tawar',
            'Pakan Ternak & Pelet', 'Toko Ikan Hias & Akuarium', 'Pengrajin Gula Kelapa', 'Distributor Telur Ayam',
            'Pengepul Hasil Bumi'
        ],
        'Wisata & Destinasi' => [
            'Wisata Pantai Minajaya', 'Wisata Curug Cikaso', 'Pemandu Wisata Geopark', 'Paket Tour Surade',
            'Spot Foto & Camping Ground', 'Wisata Agro Petik Buah', 'Wisata Sejarah & Gua Sungging',
            'Kolam Renang Waterboom', 'Taman Bermain & Sewa ATV'
        ],
        'Komunitas' => [
            'Komunitas Lari & Gowes', 'Komunitas Seni & Silat Sunda', 'Komunitas Relawan Bencana',
            'Komunitas Motor & Mobil', 'Karang Taruna Pemuda', 'Komunitas UMKM Naik Kelas',
            'Komunitas Pecinta Alam', 'Komunitas Fotografer'
        ],
        'Retail & Belanja' => [
            'Grosir Sembako & Beras', 'Minimarket & Kelontong', 'Pasar Tradisional', 'Kerajinan Anyaman Bambu',
            'Toko Pakaian Jadi', 'Perlengkapan Bayi & Anak', 'Toko Mainan Edukatif', 'Toko Jam Tangan & Optik',
            'Perabot Dapur & Plastik', 'Plastik Kemasan & Dus Nasi'
        ],
    ];

    public function run(): void
    {
        $order = 1;
        foreach ($this->tree as $parentName => $children) {
            $parent = Category::updateOrCreate(
                ['slug' => Str::slug($parentName)],
                [
                    'name' => $parentName,
                    'parent_id' => null,
                    'icon' => 'tag',
                    'order' => $order++,
                    'is_active' => true,
                ]
            );

            $cOrder = 1;
            foreach ($children as $childName) {
                Category::updateOrCreate(
                    ['slug' => Str::slug($parentName . '-' . $childName)],
                    [
                        'name' => $childName,
                        'parent_id' => $parent->id,
                        'icon' => 'tag',
                        'order' => $cOrder++,
                        'is_active' => true,
                    ]
                );
            }
        }
    }
}
