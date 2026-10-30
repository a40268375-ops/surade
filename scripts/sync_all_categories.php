<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;
use App\Models\NavbarCategory;
use App\Models\Business;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

echo "=== UNIFYING NAVBAR CATEGORIES AND CATEGORIES TABLE WITH CLEAN CONCISE 1-BY-1 SUB-CATEGORIES ===\n\n";

$categoryStructure = [
    [
        'name' => 'Jasa',
        'slug' => 'jasa',
        'icon' => 'wrench',
        'description' => 'Layanan jasa panggilan, keahlian khusus, rumah tangga, acara, dan perorangan terpercaya',
        'order' => 1,
        'children' => [
            ['name' => 'Asisten Rumah Tangga', 'slug' => 'jasa-art-asisten-rumah-tangga'],
            ['name' => 'Sedot WC', 'slug' => 'jasa-sedot-wc-kuras-septic-tank'],
            ['name' => 'Saluran Mampet', 'slug' => 'jasa-saluran-mampet'],
            ['name' => 'Cuci Motor', 'slug' => 'jasa-cuci-motor'],
            ['name' => 'Cuci Mobil', 'slug' => 'jasa-cuci-mobil'],
            ['name' => 'Badut & Sulap', 'slug' => 'jasa-badut-ulang-tahun-sulap-hiburan'],
            ['name' => 'Pindahan Rumah', 'slug' => 'jasa-pindahan-rumah-kantor'],
            ['name' => 'Pindahan Kost & Toko', 'slug' => 'jasa-pindahan-kost-toko'],
            ['name' => 'Tukang Bangunan', 'slug' => 'jasa-tukang-bangunan'],
            ['name' => 'Renovasi Bangunan', 'slug' => 'jasa-renovasi-bangunan'],
            ['name' => 'Potong Rumput', 'slug' => 'jasa-potong-rumput-bersih-halaman'],
            ['name' => 'Bersih Halaman', 'slug' => 'jasa-bersih-lahan-halaman'],
            ['name' => 'Sumur Bor', 'slug' => 'jasa-sumur-bor-geolistrik'],
            ['name' => 'Tukang Las', 'slug' => 'jasa-bengkel-las'],
            ['name' => 'Perbaikan Rumah Bocor', 'slug' => 'jasa-perbaikan-rumah-bocor-waterproofing'],
            ['name' => 'Waterproofing', 'slug' => 'jasa-waterproofing-atap'],
            ['name' => 'Wedding Organizer', 'slug' => 'jasa-wedding-organizer-event-planner'],
            ['name' => 'Sanggar Rias', 'slug' => 'jasa-sanggar-rias-pengantin'],
            ['name' => 'Satpam & Security', 'slug' => 'jasa-satpam-security-penjagaan'],
            ['name' => 'Pengawal Pribadi', 'slug' => 'jasa-bodyguard-pengawal-pribadi'],
            ['name' => 'Pengasuh Lansia', 'slug' => 'jasa-pengasuh-orang-tua-caregiver-lansia'],
            ['name' => 'Notaris & PPAT', 'slug' => 'jasa-notaris-ppat'],
            ['name' => 'Bantuan Hukum & Advokat', 'slug' => 'jasa-bantuan-hukum-advokat-pengacara'],
            ['name' => 'Pengurusan Izin Usaha', 'slug' => 'jasa-pengurusan-izin-usaha-legalitas'],
            ['name' => 'Sewa Kamera & Drone', 'slug' => 'jasa-sewa-hp-kamera-drone'],
            ['name' => 'Pengasuh Anak', 'slug' => 'jasa-pengasuh-anak-babysitter-nanny'],
            ['name' => 'Cuci Kasur & Sofa', 'slug' => 'jasa-cuci-kasur-sofa-hydro-vacuum'],
            ['name' => 'Basmi Rayap & Hama', 'slug' => 'jasa-basmi-rayap-pest-control'],
            ['name' => 'Angkut Barang', 'slug' => 'jasa-angkut-barang-sewa-pick-up'],
            ['name' => 'Poles Lantai', 'slug' => 'jasa-poles-lantai-marmer'],
            ['name' => 'Kuras Toren Air', 'slug' => 'jasa-gali-sumur-kuras-toren-air'],
            ['name' => 'Plafon Gypsum & PVC', 'slug' => 'jasa-pasang-plafon-gypsum-partisi'],
            ['name' => 'Tebang Pohon', 'slug' => 'jasa-tebang-pohon-pangkas-dahan'],
            ['name' => 'Gali Sumur Manual', 'slug' => 'jasa-gali-sumur-manual-resapan'],
            ['name' => 'Poles Kaca', 'slug' => 'jasa-poles-kaca-kerak-kamar-mandi'],
            ['name' => 'Duplikat Kunci', 'slug' => 'jasa-tukang-duplikat-kunci-brankas'],
            ['name' => 'Kolam Terpal & Bioflok', 'slug' => 'jasa-pembuatan-kolam-terpal-bioflok'],
            ['name' => 'Bengkel Bubut', 'slug' => 'jasa-bengkel-bubut'],
            ['name' => 'Tukang Kayu', 'slug' => 'jasa-tukang-kayu'],
            ['name' => 'Tukang Listrik', 'slug' => 'jasa-tukang-listrik'],
            ['name' => 'Tukang Ledeng', 'slug' => 'jasa-tukang-ledeng'],
            ['name' => 'Laundry Kiloan', 'slug' => 'jasa-laundry'],
            ['name' => 'Salon & Barbershop', 'slug' => 'jasa-salon-barbershop'],
        ]
    ],
    [
        'name' => 'Servis',
        'slug' => 'servis',
        'icon' => 'wrench',
        'description' => 'Servis perbaikan, instalasi, dan reparasi perangkat elektronik, AC, pompa air, dan kelistrikan',
        'order' => 2,
        'children' => [
            ['name' => 'Tambal Ban Panggilan', 'slug' => 'servis-tambal-ban-panggilan-24jam'],
            ['name' => 'Servis AC', 'slug' => 'servis-ac-cuci-pasang-freon'],
            ['name' => 'Servis Kulkas & Freezer', 'slug' => 'servis-elektronik-kulkas-mesin-cuci'],
            ['name' => 'Servis Mesin Cuci', 'slug' => 'servis-mesin-cuci-otomatis-manual'],
            ['name' => 'Servis Kelistrikan Rumah', 'slug' => 'servis-lampu-saklar-kelistrikan-rumah'],
            ['name' => 'Servis Pompa Air', 'slug' => 'servis-pompa-air-sumur'],
            ['name' => 'Servis Kompor Gas', 'slug' => 'servis-kompor-gas-water-heater'],
            ['name' => 'Servis TV LED & LCD', 'slug' => 'servis-tv-led-sound'],
            ['name' => 'Servis Magic Com & Dispenser', 'slug' => 'servis-dispenser-magic-com-blender'],
            ['name' => 'Servis Dinamo Mesin', 'slug' => 'servis-dinamo-genset'],
            ['name' => 'Servis Genset', 'slug' => 'servis-genset-mesin-penggerak'],
            ['name' => 'Servis Speaker Aktif', 'slug' => 'servis-speaker-aktif-power-amplifier'],
            ['name' => 'Servis Mesin Rumput', 'slug' => 'servis-mesin-potong-rumput-chainsaw'],
            ['name' => 'Servis Mesin Steam', 'slug' => 'servis-mesin-cuci-steam-jet-cleaner'],
            ['name' => 'Servis Microwave & Oven', 'slug' => 'servis-microwave-oven-air-fryer'],
            ['name' => 'Servis Kipas Angin', 'slug' => 'servis-kipas-angin-exhaust-blower'],
        ]
    ],
    [
        'name' => 'Otomotif',
        'slug' => 'otomotif',
        'icon' => 'car',
        'description' => 'Bengkel motor & mobil, cuci steam, audio, coating, sewa kendaraan, dan suku cadang',
        'order' => 3,
        'children' => [
            ['name' => 'Bengkel Mobil Panggilan', 'slug' => 'otomotif-servis-motor-mobil-panggilan'],
            ['name' => 'Bengkel Motor Panggilan', 'slug' => 'otomotif-bengkel-motor-panggilan-injeksi'],
            ['name' => 'Audio & Variasi Mobil', 'slug' => 'otomotif-audio-variasi-mobil'],
            ['name' => 'Jahit Jok Mobil & Motor', 'slug' => 'otomotif-servis-jok-interior-kendaraan'],
            ['name' => 'Cat Body & Body Repair', 'slug' => 'otomotif-cat-body-nano-coating-detailing'],
            ['name' => 'Ketok Magic', 'slug' => 'otomotif-ketok-magic-body-repair'],
            ['name' => 'Nano Ceramic Coating', 'slug' => 'otomotif-nano-ceramic-coating-detailing'],
            ['name' => 'Cuci Helm & Sepatu', 'slug' => 'otomotif-cuci-helm-sepatu-bikers'],
            ['name' => 'Cuci Interior Mobil', 'slug' => 'otomotif-cuci-jok-interior-kendaraan'],
            ['name' => 'Cuci Steam Motor & Mobil', 'slug' => 'otomotif-cuci-steam-motor-mobil'],
            ['name' => 'Cuci Motor', 'slug' => 'otomotif-cuci-motor'],
            ['name' => 'Cuci Mobil', 'slug' => 'otomotif-cuci-mobil'],
            ['name' => 'Sewa Motor', 'slug' => 'otomotif-sewa-motor-rental-motor'],
            ['name' => 'Sewa Mobil', 'slug' => 'otomotif-sewa-mobil-rental-pick-up'],
            ['name' => 'Rental Pick Up & Truk', 'slug' => 'otomotif-rental-pickup-truk-angkutan'],
            ['name' => 'Bengkel Dinamo & Aki', 'slug' => 'otomotif-bengkel-dinamo-kelistrikan-mobil'],
            ['name' => 'Servis Radiator', 'slug' => 'otomotif-servis-radiator-knalpot'],
            ['name' => 'Servis Knalpot', 'slug' => 'otomotif-servis-ganti-knalpot'],
            ['name' => 'Toko Ban & Velg', 'slug' => 'otomotif-toko-ban-velg-spooring'],
            ['name' => 'Bengkel Shockbreaker', 'slug' => 'otomotif-shockbreaker-kaki-kaki-understeel'],
            ['name' => 'Restorasi Motor Lawas', 'slug' => 'otomotif-speedometer-restorasi-motor-lawas'],
            ['name' => 'Toko Aki Panggilan', 'slug' => 'otomotif-toko-aki-jumper-panggilan'],
            ['name' => 'Bengkel Mobil', 'slug' => 'otomotif-bengkel-mobil'],
            ['name' => 'Bengkel Motor', 'slug' => 'otomotif-bengkel-motor'],
            ['name' => 'Toko Ban', 'slug' => 'otomotif-toko-ban'],
            ['name' => 'Tambal Ban', 'slug' => 'otomotif-tambal-ban'],
            ['name' => 'Toko Aki', 'slug' => 'otomotif-toko-aki'],
            ['name' => 'Toko Oli', 'slug' => 'otomotif-toko-oli'],
        ]
    ],
    [
        'name' => 'Kesehatan',
        'slug' => 'kesehatan',
        'icon' => 'heart-pulse',
        'description' => 'Layanan medis, dokter, bidan, sunat, terapi pijat tradisional, obat herbal, jamu, dan ruqyah',
        'order' => 4,
        'children' => [
            ['name' => 'Praktek Dokter Umum', 'slug' => 'kesehatan-praktek-dokter-umum-spesialis'],
            ['name' => 'Praktek Bidan Mandiri', 'slug' => 'kesehatan-bidan-praktek-mandiri-persalinan'],
            ['name' => 'Mantri & Sunat Modern', 'slug' => 'kesehatan-dokter-mantri-sunat-modern'],
            ['name' => 'Pijat Urut Tradisional', 'slug' => 'kesehatan-terapi-pijat-tradisional-urut'],
            ['name' => 'Toko Obat Herbal', 'slug' => 'kesehatan-obat-herbal-thibbun-nabawi'],
            ['name' => 'Jamu Tradisional', 'slug' => 'kesehatan-jamu-tradisional-jamu-gendong'],
            ['name' => 'Ruqyah Syar\'iyyah', 'slug' => 'kesehatan-ruqyah-syariyyah'],
            ['name' => 'Terapi Bekam', 'slug' => 'kesehatan-bekam-hijamah-akupresur'],
            ['name' => 'Home Care Perawat', 'slug' => 'kesehatan-home-care-perawat-panggilan'],
            ['name' => 'Apotek 24 Jam', 'slug' => 'kesehatan-apotek-toko-obat'],
            ['name' => 'Fisioterapi', 'slug' => 'kesehatan-fisioterapi-terapi-tulang-sendi'],
            ['name' => 'Pijat Refleksi', 'slug' => 'kesehatan-refleksi-totok-syaraf'],
            ['name' => 'Praktek Dokter Gigi', 'slug' => 'kesehatan-dokter-gigi-tambal-behel'],
            ['name' => 'Pengobatan Patah Tulang', 'slug' => 'kesehatan-patah-tulang-sangkal-putung'],
            ['name' => 'Laboratorium Darah', 'slug' => 'kesehatan-laboratorium-darah-cek-gula'],
            ['name' => 'Rumah Sakit', 'slug' => 'kesehatan-rumah-sakit'],
            ['name' => 'Puskesmas', 'slug' => 'kesehatan-puskesmas'],
            ['name' => 'Klinik Umum', 'slug' => 'kesehatan-klinik-umum'],
            ['name' => 'Apotek', 'slug' => 'kesehatan-apotek'],
            ['name' => 'Toko Obat', 'slug' => 'kesehatan-toko-obat'],
            ['name' => 'Praktek Dokter', 'slug' => 'kesehatan-praktek-dokter'],
            ['name' => 'Terapi Pijat', 'slug' => 'kesehatan-terapi-pijat'],
        ]
    ],
    [
        'name' => 'Properti',
        'slug' => 'properti',
        'icon' => 'building',
        'description' => 'Kontrakan, kost, sewa ruko/kantor, mebel, kusen, pagar, kanopi, pengaspalan, tukang kunci & bahan bangunan',
        'order' => 5,
        'children' => [
            ['name' => 'Kontrakan Rumah', 'slug' => 'properti-kontrakan-rumah'],
            ['name' => 'Kost Karyawan & Mahasiswa', 'slug' => 'properti-kost-kostan'],
            ['name' => 'Sewa Ruko & Kios', 'slug' => 'properti-sewa-ruko-kios'],
            ['name' => 'Sewa Apartemen', 'slug' => 'properti-sewa-apartemen'],
            ['name' => 'Sewa Kantor & Coworking', 'slug' => 'properti-sewa-kantor-virtual-office'],
            ['name' => 'Sewa Ruang Rapat', 'slug' => 'properti-sewa-ruang-rapat-coworking'],
            ['name' => 'Interior & Kitchen Set', 'slug' => 'properti-desain-pembuatan-interior'],
            ['name' => 'Kusen Kayu & Aluminium', 'slug' => 'properti-pembuatan-kusen-kayu-aluminium'],
            ['name' => 'Meja Kursi & Mebel', 'slug' => 'properti-pembuatan-meja-kursi-mebel-custom'],
            ['name' => 'Pagar Besi & Tralis', 'slug' => 'properti-pembuatan-pagar-tralis-railing'],
            ['name' => 'Toko Mebel & Spring Bed', 'slug' => 'properti-toko-mebel-furniture'],
            ['name' => 'Villa & Resort', 'slug' => 'properti-villa-resort'],
            ['name' => 'Homestay & Cottage', 'slug' => 'properti-homestay-penginapan-lokal'],
            ['name' => 'Pengaspalan Jalan', 'slug' => 'properti-pengaspalan-jalan-halaman-rumah'],
            ['name' => 'Saluran Air & Drainase', 'slug' => 'properti-pembuatan-drainase-saluran-bronjong'],
            ['name' => 'Tukang Taman & Rumput', 'slug' => 'properti-pembuatan-taman-lanskap-rumah'],
            ['name' => 'Tebang Pohon & Bersih Kebun', 'slug' => 'properti-tukang-kebun-tebang-pohon-panggilan'],
            ['name' => 'Kolam Koi & Air Mancur', 'slug' => 'properti-pembuatan-kolam-ikan-koi-minimalis'],
            ['name' => 'Pembuatan Kolam Renang', 'slug' => 'properti-pembuatan-perawatan-kolam-renang'],
            ['name' => 'Kanopi Baja Ringan', 'slug' => 'properti-pembuatan-kanopi-baja-ringan-awning'],
            ['name' => 'Tukang Pipa Ledeng', 'slug' => 'properti-tukang-pipa-air-plumbing-pipisi'],
            ['name' => 'Toko Material Bangunan', 'slug' => 'properti-toko-bangunan-material-konstruksi'],
            ['name' => 'Toko Bangunan', 'slug' => 'properti-toko-bangunan'],
            ['name' => 'Perbaikan Genteng Bocor', 'slug' => 'properti-perbaikan-kebocoran-atap-talang'],
            ['name' => 'Duplikat Kunci & Brankas', 'slug' => 'properti-tukang-duplikat-kunci-ahli-brankas'],
            ['name' => 'Jual Tanah Kavling', 'slug' => 'properti-tanah-dijual'],
            ['name' => 'Jual Rumah Siap Huni', 'slug' => 'properti-rumah-dijual'],
            ['name' => 'Jual Ruko & Kios', 'slug' => 'properti-ruko-dijual'],
            ['name' => 'Pasang Wallpaper & Vinyl', 'slug' => 'properti-pasang-wallpaper-lantai-vinyl'],
            ['name' => 'Pasang Rolling Door', 'slug' => 'properti-pasang-folding-gate-rolling-door'],
            ['name' => 'Toko Keramik & Granit', 'slug' => 'properti-toko-keramik'],
            ['name' => 'Toko Cat Bangunan', 'slug' => 'properti-toko-cat'],
            ['name' => 'Toko Furniture', 'slug' => 'properti-toko-furniture'],
            ['name' => 'Agen Properti', 'slug' => 'properti-agen-properti'],
            ['name' => 'Kontraktor Bangunan', 'slug' => 'properti-kontraktor'],
            ['name' => 'Arsitek', 'slug' => 'properti-arsitek'],
            ['name' => 'Desain Interior', 'slug' => 'properti-interior-design'],
        ]
    ],
    [
        'name' => 'Musik & Seni',
        'slug' => 'musik',
        'icon' => 'music',
        'description' => 'Guru musik privat, servis alat musik, rental sound, organ tunggal, studio rekaman, biduan, band, rebana & sanggar seni',
        'order' => 6,
        'children' => [
            ['name' => 'Guru Les Musik Privat', 'slug' => 'musik-guru-musik-privat'],
            ['name' => 'Servis Alat Musik', 'slug' => 'musik-servis-alat-musik'],
            ['name' => 'Rental Alat Musik', 'slug' => 'musik-rental-alat-musik'],
            ['name' => 'Rental Sound System', 'slug' => 'musik-rental-sound-system-lighting'],
            ['name' => 'Organ Tunggal', 'slug' => 'musik-organ-tunggal-solo-organ'],
            ['name' => 'Studio Musik & Recording', 'slug' => 'musik-studio-musik-rekaman-recording'],
            ['name' => 'Penyanyi & Vokalis', 'slug' => 'musik-penyanyi-biduan-acara-resepsi'],
            ['name' => 'Band Akustik & Wedding', 'slug' => 'musik-band-akustik-grup-musik'],
            ['name' => 'Servis Speaker Audio', 'slug' => 'musik-servis-sound-audio-system'],
            ['name' => 'Alat Musik Tradisional', 'slug' => 'musik-alat-musik-tradisional'],
            ['name' => 'Pengrajin Rebana & Hadroh', 'slug' => 'musik-pengrajin-servis-rebana-bedug'],
            ['name' => 'Sanggar Seni Tari Sunda', 'slug' => 'musik-sanggar-seni-tari-teater'],
            ['name' => 'MC Acara & Pernikahan', 'slug' => 'musik-mc-master-of-ceremony-acara'],
            ['name' => 'Pengrajin Kendang Jaipong', 'slug' => 'musik-pengrajin-reparasi-kendang-gendang'],
            ['name' => 'Sewa Kostum & Baju Adat', 'slug' => 'musik-sewa-kostum-tari-baju-adat'],
            ['name' => 'Pembuatan Jingle & Musik', 'slug' => 'musik-pembuatan-backsound-aransemen-jingle'],
        ]
    ],
    [
        'name' => 'Olahraga & Outdoor',
        'slug' => 'olahraga',
        'icon' => 'trophy',
        'description' => 'Sewa lapangan, pelatih olahraga, sablon jersey, guru renang privat, instruktur senam & sewa alat camping',
        'order' => 7,
        'children' => [
            ['name' => 'Sewa Lapangan Futsal', 'slug' => 'olahraga-sewa-lapangan-futsal-badminton'],
            ['name' => 'Sewa Lapangan Badminton', 'slug' => 'olahraga-sewa-lapangan-badminton-tenis'],
            ['name' => 'Pelatih Sepak Bola & SSB', 'slug' => 'olahraga-pelatih-olahraga'],
            ['name' => 'Pelatih Bela Diri & Silat', 'slug' => 'olahraga-pelatih-bela-diri-silat'],
            ['name' => 'Sewa Alat Olahraga', 'slug' => 'olahraga-sewa-alat-olahraga'],
            ['name' => 'Sablon & Konveksi Jersey', 'slug' => 'olahraga-sablon-konveksi-jersey-olahraga'],
            ['name' => 'Guru Privat Renang', 'slug' => 'olahraga-guru-les-renang-privat'],
            ['name' => 'Instruktur Senam & Zumba', 'slug' => 'olahraga-instruktur-senam-zumba-fitness'],
            ['name' => 'Instruktur Yoga & Bela Diri', 'slug' => 'olahraga-guru-instruktur-bela-diri-yoga'],
            ['name' => 'Sewa Perlengkapan Camping', 'slug' => 'olahraga-sewa-perlengkapan-camping-hiking'],
            ['name' => 'Servis Sepeda', 'slug' => 'olahraga-bengkel-servis-sepeda'],
            ['name' => 'Toko Alat Pancing', 'slug' => 'olahraga-toko-alat-pancing-umpan'],
            ['name' => 'Pemandu Gowes & Trail', 'slug' => 'olahraga-pemandu-gowes-trekking-trail'],
        ]
    ],
    [
        'name' => 'Elektronik & Gadget',
        'slug' => 'elektronik',
        'icon' => 'smartphone',
        'description' => 'Pemasangan & servis CCTV, servis laptop/komputer, servis printer, servis kamera, dan toko gadget',
        'order' => 8,
        'children' => [
            ['name' => 'Pasang & Servis CCTV', 'slug' => 'elektronik-pemasangan-servis-cctv'],
            ['name' => 'Servis Komputer & Laptop', 'slug' => 'elektronik-servis-komputer-pc-laptop'],
            ['name' => 'Servis Printer', 'slug' => 'elektronik-servis-printer-infus-tinta'],
            ['name' => 'Servis Kamera DSLR & Lensa', 'slug' => 'elektronik-servis-kamera-dslr-mirrorless'],
            ['name' => 'Servis HP Android & iPhone', 'slug' => 'elektronik-servis-hp-ganti-lcd'],
            ['name' => 'Toko Komputer & Laptop', 'slug' => 'elektronik-toko-laptop-komputer-printer'],
            ['name' => 'Toko HP & Aksesoris', 'slug' => 'elektronik-toko-hp-aksesoris-gadget'],
            ['name' => 'Toko Elektronik Rumah', 'slug' => 'elektronik-toko-elektronik-rumah-tangga'],
            ['name' => 'Pasang WiFi & Jaringan', 'slug' => 'elektronik-jasa-pasang-wifi-jaringan'],
            ['name' => 'Recovery Data Harddisk', 'slug' => 'elektronik-recovery-data-harddisk-flashdisk'],
            ['name' => 'Running Text LED Display', 'slug' => 'elektronik-running-text-led-jam-masjid'],
            ['name' => 'Servis HP', 'slug' => 'teknologi-service-hp'],
            ['name' => 'Servis Komputer', 'slug' => 'teknologi-service-komputer'],
            ['name' => 'Servis TV', 'slug' => 'teknologi-service-tv'],
            ['name' => 'Toko HP', 'slug' => 'teknologi-toko-hp'],
            ['name' => 'Toko Komputer', 'slug' => 'teknologi-toko-komputer'],
            ['name' => 'Toko Elektronik', 'slug' => 'teknologi-toko-elektronik'],
        ]
    ],
    [
        'name' => 'Fashion & Kecantikan',
        'slug' => 'fashion',
        'icon' => 'shirt',
        'description' => 'Tukang jahit pakaian, konveksi seragam sekolah, make up artist (MUA), salon, barbershop, dan sewa baju',
        'order' => 9,
        'children' => [
            ['name' => 'Tukang Jahit & Permak', 'slug' => 'fashion-tukang-jahit-pakaian-permak'],
            ['name' => 'Konveksi Seragam Sekolah', 'slug' => 'fashion-konveksi-seragam-sekolah-kantor'],
            ['name' => 'Make Up Artist (MUA)', 'slug' => 'fashion-make-up-artist-mua-rias'],
            ['name' => 'Salon Kecantikan', 'slug' => 'fashion-salon-kecantikan-perawatan-spa'],
            ['name' => 'Barbershop Pria', 'slug' => 'fashion-barbershop-pangkas-rambut-pria'],
            ['name' => 'Sewa Kebaya & Gaun', 'slug' => 'fashion-sewa-kebaya-jas-busana-adat'],
            ['name' => 'Bordir Komputer & Sablon', 'slug' => 'fashion-bordir-komputer-sablon-kaos'],
            ['name' => 'Toko Busana Muslim', 'slug' => 'fashion-toko-busana-muslim-jilbab'],
            ['name' => 'Toko Sepatu & Tas', 'slug' => 'fashion-toko-sepatu-sandal-tas'],
            ['name' => 'Cuci Sepatu', 'slug' => 'fashion-cuci-sepatu-shoe-laundry'],
            ['name' => 'Henna Art Pengantin', 'slug' => 'fashion-pasang-henna-art-inai'],
            ['name' => 'Toko Pakaian', 'slug' => 'retail-toko-pakaian'],
            ['name' => 'Butik Fashion', 'slug' => 'retail-butik'],
            ['name' => 'Toko Sepatu', 'slug' => 'retail-toko-sepatu'],
            ['name' => 'Toko Tas', 'slug' => 'retail-toko-tas'],
        ]
    ],
    [
        'name' => 'Multimedia & Kreatif',
        'slug' => 'multimedia',
        'icon' => 'camera',
        'description' => 'Jasa videografer, fotografer acara wedding/dokumentasi, desain grafis, sewa drone, live streaming & cetak album',
        'order' => 10,
        'children' => [
            ['name' => 'Video Dokumentasi Acara', 'slug' => 'multimedia-jasa-pembuat-video-videografer'],
            ['name' => 'Fotografer Acara', 'slug' => 'multimedia-jasa-foto-acara-fotografer'],
            ['name' => 'Video Iklan & Promosi', 'slug' => 'multimedia-video-iklan-promosi-produk'],
            ['name' => 'Sewa Drone & Pilot', 'slug' => 'multimedia-sewa-drone-pilot-drone-acara'],
            ['name' => 'Live Streaming Acara', 'slug' => 'multimedia-jasa-live-streaming-podcast'],
            ['name' => 'Desain Grafis & Banner', 'slug' => 'multimedia-jasa-desain-grafis-logo-banner'],
            ['name' => 'Cetak Foto & Frame', 'slug' => 'multimedia-jasa-cetak-foto-canvas-album'],
            ['name' => 'Pembuatan Website Usaha', 'slug' => 'multimedia-jasa-pembuatan-website-digital'],
            ['name' => 'Undangan Digital & Video', 'slug' => 'multimedia-undangan-digital-website-video'],
        ]
    ],
    [
        'name' => 'Kuliner',
        'slug' => 'kuliner',
        'icon' => 'coffee',
        'description' => 'Warteg, angkringan, warkop, cafe, toko buah, rumah makan khas Sunda, seafood, jajanan pasar & katering',
        'order' => 11,
        'children' => [
            ['name' => 'Warung Tegal (Warteg)', 'slug' => 'kuliner-warteg-warung-tegal'],
            ['name' => 'Angkringan Khas', 'slug' => 'kuliner-angkringan-khas'],
            ['name' => 'Warkop & Kedai Kopi', 'slug' => 'kuliner-warkop-kedai-kopi'],
            ['name' => 'Warung Kopi', 'slug' => 'kuliner-warung-kopi'],
            ['name' => 'Cafe & Tempat Nongkrong', 'slug' => 'kuliner-cafe-tempat-nongkrong'],
            ['name' => 'Toko Buah Segar', 'slug' => 'kuliner-toko-buah-segar-jus-buah'],
            ['name' => 'Rumah Makan Sunda', 'slug' => 'kuliner-rumah-makan-khas-sunda-nusantara'],
            ['name' => 'Rumah Makan', 'slug' => 'kuliner-rumah-makan'],
            ['name' => 'Warung Makan', 'slug' => 'kuliner-warung-makan'],
            ['name' => 'Restoran Seafood', 'slug' => 'kuliner-restoran-ikan-bakar-seafood'],
            ['name' => 'Seafood', 'slug' => 'kuliner-seafood'],
            ['name' => 'Jajanan Pasar', 'slug' => 'kuliner-jajanan-pasar-tradisional'],
            ['name' => 'Toko Roti & Bakery', 'slug' => 'kuliner-toko-roti-kue-bakery'],
            ['name' => 'Toko Roti', 'slug' => 'kuliner-toko-roti'],
            ['name' => 'Sentra Oleh-oleh Surade', 'slug' => 'kuliner-oleh-oleh-khas-surade-keripik'],
            ['name' => 'Oleh-oleh Khas', 'slug' => 'kuliner-oleh-oleh-khas'],
            ['name' => 'Produk Olahan', 'slug' => 'kuliner-produk-olahan'],
            ['name' => 'Katering & Prasmanan', 'slug' => 'kuliner-katering-harian-prasmanan'],
            ['name' => 'Catering', 'slug' => 'kuliner-catering'],
            ['name' => 'Warung Bakso & Mie Ayam', 'slug' => 'kuliner-warung-bakso-mie-ayam-soto'],
            ['name' => 'Warung Nasi Padang', 'slug' => 'kuliner-warung-nasi-padang-minang'],
            ['name' => 'Ayam Geprek & Bebek', 'slug' => 'kuliner-ayam-goreng-bebek-sambal-geprek'],
            ['name' => 'Olahan Ikan Asin', 'slug' => 'kuliner-olahan-ikan-asin-jambal-peda'],
            ['name' => 'Fast Food', 'slug' => 'kuliner-fast-food'],
            ['name' => 'Frozen Food', 'slug' => 'kuliner-frozen-food'],
            ['name' => 'Perikanan', 'slug' => 'kuliner-perikanan'],
        ]
    ],
    [
        'name' => 'Pendidikan',
        'slug' => 'pendidikan',
        'icon' => 'graduation-cap',
        'description' => 'Fotocopy, bimbel, les privat, kursus komputer, kursus mengemudi, sekolah, LPK, dan toko buku/ATK',
        'order' => 12,
        'children' => [
            ['name' => 'Fotocopy & Pengetikan', 'slug' => 'pendidikan-fotocopy-pengetikan-jilid'],
            ['name' => 'Bimbingan Belajar (Bimbel)', 'slug' => 'pendidikan-bimbel-les-privat'],
            ['name' => 'Les Privat Guru ke Rumah', 'slug' => 'pendidikan-les-privat-guru-ke-rumah'],
            ['name' => 'Les Privat Jenjang Sekolah', 'slug' => 'pendidikan-les-privat'],
            ['name' => 'Kursus Komputer & Desain', 'slug' => 'pendidikan-kursus-komputer-desain'],
            ['name' => 'Kursus Komputer', 'slug' => 'pendidikan-kursus-komputer'],
            ['name' => 'Kursus Bahasa Asing', 'slug' => 'pendidikan-kursus-bahasa-asing'],
            ['name' => 'Kursus Bahasa Inggris', 'slug' => 'pendidikan-kursus-bahasa-inggris'],
            ['name' => 'Kursus Mengemudi Mobil', 'slug' => 'pendidikan-kursus-mengemudi-sim'],
            ['name' => 'Kursus Mengemudi', 'slug' => 'pendidikan-kursus-mengemudi'],
            ['name' => 'Kursus Menjahit Busana', 'slug' => 'pendidikan-kursus-menjahit-tata-busana'],
            ['name' => 'Sekolah & Pesantren', 'slug' => 'pendidikan-sekolah-madrasah-pesantren'],
            ['name' => 'Sekolah', 'slug' => 'pendidikan-sekolah'],
            ['name' => 'Lembaga Pelatihan Kerja (LPK)', 'slug' => 'pendidikan-pelatihan-kerja'],
            ['name' => 'Toko Buku & ATK', 'slug' => 'pendidikan-toko-buku-kitab-atk'],
            ['name' => 'Toko Buku', 'slug' => 'pendidikan-toko-buku'],
        ]
    ],
    [
        'name' => 'Pertanian & Peternakan',
        'slug' => 'pertanian',
        'icon' => 'leaf',
        'description' => 'Pot bunga, bibit tanaman, hewan qurban/aqiqah, madu murni, susu murni, pupuk, benih ikan & pelet, gula aren, dan telur',
        'order' => 13,
        'children' => [
            ['name' => 'Tanaman Hias & Pot Bunga', 'slug' => 'pertanian-toko-pot-bunga-tanaman-hias'],
            ['name' => 'Parsel Buah & Buket Bunga', 'slug' => 'pertanian-toko-parsel-buket-bunga-souvenir'],
            ['name' => 'Bibit Tanaman Buah', 'slug' => 'pertanian-bibit-tanaman-buah-sayur'],
            ['name' => 'Hewan Qurban & Aqiqah', 'slug' => 'pertanian-hewan-qurban-aqiqah-sapi-kambing'],
            ['name' => 'Madu Murni Asli Odeng', 'slug' => 'pertanian-madu-murni-asli-hutan'],
            ['name' => 'Susu Sapi & Kambing Murni', 'slug' => 'pertanian-susu-murni-sapi-kambing-etawa'],
            ['name' => 'Pupuk & Obat Pertanian', 'slug' => 'pertanian-pupuk-organik-kimia-obat-hama'],
            ['name' => 'Benih Ikan Air Tawar', 'slug' => 'pertanian-benih-ikan-air-tawar-bibit'],
            ['name' => 'Pakan Ternak & Pelet Ikan', 'slug' => 'pertanian-pakan-ternak-pelet-ikan-vitamin'],
            ['name' => 'Toko Ikan Hias & Akuarium', 'slug' => 'pertanian-toko-ikan-hias-akuarium'],
            ['name' => 'Pengrajin Gula Kelapa', 'slug' => 'pertanian-pengrajin-gula-kelapa-merah-aren'],
            ['name' => 'Distributor Telur Ayam', 'slug' => 'pertanian-distributor-telur-ayam-bebek'],
            ['name' => 'Pengepul Hasil Bumi', 'slug' => 'pertanian-pengepul-hasil-bumi-sayur-kelapa'],
            ['name' => 'Pertanian & Hasil Bumi', 'slug' => 'retail-pertanian-hasil-bumi'],
            ['name' => 'Peternakan Ayam', 'slug' => 'retail-peternakan-ayam'],
            ['name' => 'Peternakan Kambing', 'slug' => 'retail-peternakan-kambing'],
        ]
    ],
    [
        'name' => 'Hiburan & Wisata',
        'slug' => 'hiburan',
        'icon' => 'map-pin',
        'description' => 'Destinasi wisata alam pantai, curug, goa karst, pemandu wisata, paket tour, spot foto, camping & rekreasi',
        'order' => 14,
        'children' => [
            ['name' => 'Wisata Pantai Minajaya', 'slug' => 'hiburan-wisata-pantai-muara-pesisir'],
            ['name' => 'Wisata Curug Luhur & Cikaso', 'slug' => 'hiburan-wisata-curug-geosite-alami'],
            ['name' => 'Pemandu Wisata (Tour Guide)', 'slug' => 'hiburan-pemandu-wisata-lokal-tour-guide'],
            ['name' => 'Paket Wisata & Sewa Perahu', 'slug' => 'hiburan-paket-tour-wisata-surade-geopark'],
            ['name' => 'Spot Foto & Camping Ground', 'slug' => 'hiburan-spot-foto-area-camping-ground'],
            ['name' => 'Wisata Edukasi & Agro Buah', 'slug' => 'hiburan-wisata-edukasi-agro-pertanian'],
            ['name' => 'Situs Sejarah & Gua Sungging', 'slug' => 'hiburan-wisata-budaya-situs-sejarah-gua'],
            ['name' => 'Waterboom & Kolam Renang', 'slug' => 'hiburan-kolam-renang-waterboom-keluarga'],
            ['name' => 'Taman Bermain & Sewa ATV', 'slug' => 'hiburan-taman-bermain-atv-odong'],
            ['name' => 'Wisata Alam', 'slug' => 'hiburan-wisata-alam'],
            ['name' => 'Wisata Pantai', 'slug' => 'hiburan-pantai'],
            ['name' => 'Kolam Renang', 'slug' => 'hiburan-kolam-renang'],
            ['name' => 'Taman Bermain', 'slug' => 'hiburan-taman-bermain'],
            ['name' => 'Pusat Hiburan Keluarga', 'slug' => 'hiburan-pusat-hiburan-keluarga'],
            ['name' => 'Karaoke Keluarga', 'slug' => 'hiburan-karaoke'],
            ['name' => 'Museum', 'slug' => 'hiburan-museum'],
        ]
    ],
    [
        'name' => 'Komunitas',
        'slug' => 'komunitas',
        'icon' => 'users',
        'description' => 'Komunitas olahraga, seni budaya lokal, relawan sosial, otomotif, karang taruna, dan pegiat lingkungan Surade',
        'order' => 15,
        'children' => [
            ['name' => 'Komunitas Runners & Sepeda', 'slug' => 'komunitas-olahraga-running-gowes'],
            ['name' => 'Komunitas Seni Tradisional', 'slug' => 'komunitas-seni-tradisional-kebudayaan'],
            ['name' => 'Relawan Sosial & Kemanusiaan', 'slug' => 'komunitas-relawan-sosial-kemanusiaan'],
            ['name' => 'Komunitas Motor & Mobil', 'slug' => 'komunitas-motor-mobil-hobi-otomotif'],
            ['name' => 'Karang Taruna & Pemuda', 'slug' => 'komunitas-karang-taruna-forum-pemuda'],
            ['name' => 'Forum UMKM Surade', 'slug' => 'komunitas-umkm-wirausaha-muda'],
            ['name' => 'Komunitas Pecinta Alam', 'slug' => 'komunitas-pecinta-alam-lingkungan'],
            ['name' => 'Komunitas Fotografi & Kreator', 'slug' => 'komunitas-fotografi-kreator-konten'],
        ]
    ],
    [
        'name' => 'Retail',
        'slug' => 'retail',
        'icon' => 'store',
        'description' => 'Pusat perbelanjaan, warung sembako, minimarket, pasar tradisional, toko pakaian, dan perlengkapan rumah',
        'order' => 16,
        'children' => [
            ['name' => 'Toko Sembako Grosir', 'slug' => 'retail-warung-sembako-grosir-kelontong'],
            ['name' => 'Minimarket 24 Jam', 'slug' => 'retail-minimarket-kelontong-24jam'],
            ['name' => 'Pasar Tradisional Surade', 'slug' => 'retail-pasar-tradisional-sayur-subuh'],
            ['name' => 'Pengrajin Anyaman Bambu', 'slug' => 'retail-kerajinan-tangan-anyaman-bambu'],
            ['name' => 'Toko Pakaian & Sandang', 'slug' => 'retail-toko-pakaian-sandang'],
            ['name' => 'Toko Perlengkapan Bayi', 'slug' => 'retail-toko-perlengkapan-bayi'],
            ['name' => 'Toko Mainan Anak', 'slug' => 'retail-toko-mainan-anak-kado'],
            ['name' => 'Toko Jam Tangan & Optik', 'slug' => 'retail-toko-jam-tangan-kacamata'],
            ['name' => 'Toko Perabot Dapur', 'slug' => 'retail-toko-perabot-plastik-rumah-tangga'],
            ['name' => 'Toko Plastik & Kemasan', 'slug' => 'retail-toko-plastik-kemasan-dus'],
            ['name' => 'Warung Sembako', 'slug' => 'retail-warung-sembako'],
            ['name' => 'Minimarket', 'slug' => 'retail-minimarket'],
            ['name' => 'Pasar Tradisional', 'slug' => 'retail-pasar-tradisional'],
            ['name' => 'Kerajinan Tangan', 'slug' => 'retail-kerajinan-tangan'],
            ['name' => 'Toko Aksesoris', 'slug' => 'retail-toko-aksesoris'],
            ['name' => 'Toko Alat Tulis', 'slug' => 'retail-toko-alat-tulis'],
            ['name' => 'Toko Bunga', 'slug' => 'retail-toko-bunga'],
        ]
    ],
];

// 0. Clean obsolete parent categories (such as 'teknologi' or 'umkm' or 'nomor-penting' from navbar_categories)
$validParentSlugs = array_map(fn($c) => $c['slug'], $categoryStructure);
NavbarCategory::whereNull('parent_id')->whereNotIn('slug', $validParentSlugs)->delete();
Category::whereNull('parent_id')->whereNotIn('slug', $validParentSlugs)->delete();

// Delete obsolete children in navbar_categories
$allValidChildSlugs = [];
foreach ($categoryStructure as $p) {
    foreach ($p['children'] as $c) {
        $allValidChildSlugs[] = $c['slug'];
    }
}
NavbarCategory::whereNotNull('parent_id')->whereNotIn('slug', $allValidChildSlugs)->delete();

// 1. Sync into navbar_categories table
echo "1. Syncing navbar_categories...\n";
foreach ($categoryStructure as $pIndex => $pData) {
    $parent = NavbarCategory::updateOrCreate(
        ['slug' => $pData['slug']],
        [
            'name' => $pData['name'],
            'icon' => $pData['icon'],
            'description' => $pData['description'],
            'order' => $pData['order'],
            'is_active' => true,
            'parent_id' => null,
        ]
    );

    foreach ($pData['children'] as $cIndex => $cData) {
        NavbarCategory::updateOrCreate(
            ['slug' => $cData['slug']],
            [
                'name' => $cData['name'],
                'parent_id' => $parent->id,
                'order' => $cIndex + 1,
                'is_active' => true,
            ]
        );
    }
}

// 2. Sync into categories table (identical structure)
echo "2. Syncing categories table...\n";
foreach ($categoryStructure as $pIndex => $pData) {
    $parent = Category::updateOrCreate(
        ['slug' => $pData['slug']],
        [
            'name' => $pData['name'],
            'icon' => $pData['icon'],
            'description' => $pData['description'],
            'order' => $pData['order'],
            'is_active' => true,
            'parent_id' => null,
        ]
    );

    foreach ($pData['children'] as $cIndex => $cData) {
        Category::updateOrCreate(
            ['slug' => $cData['slug']],
            [
                'name' => $cData['name'],
                'parent_id' => $parent->id,
                'order' => $cIndex + 1,
                'is_active' => true,
            ]
        );
    }
}

// 3. Clear category caches
Cache::flush();
Cache::forget('categories_public_v1');
Cache::forget('categories_all');
Cache::forget('categories_tree');
Cache::forget('home_feed_public');

echo "\n3. Remapping 30 businesses to exact synced category IDs...\n";
$bizMappings = [
    1 => 'kuliner-warung-kopi',         // Let's Coffee Cafe Surade
    2 => 'kesehatan-puskesmas',         // Puskesmas Surade
    3 => 'retail-pasar-tradisional',    // Pasar Tradisional Surade
    4 => 'pendidikan-sekolah',          // SMAN 1 Surade
    5 => 'kesehatan-apotek',            // Apotek Surade
    6 => 'otomotif-bengkel-motor',      // Bengkel Wa Ebong Surade
    7 => 'kuliner-warung-makan',        // Lesehan H. Ali Pasiripis
    8 => 'otomotif-cuci-motor',         // Pasdot Steam & Poles Motor Pasiripis
    9 => 'kuliner-warung-makan',        // Bakso Asli Pasiripis
    10 => 'jasa-bengkel-las',           // Bengkel Las Putra Pasiripis
    11 => 'kuliner-warung-makan',       // Saung Lesehan & Kuliner Teh Yulan
    12 => 'kesehatan-puskesmas',        // Puskesmas Buniwangi
    13 => 'otomotif-bengkel-motor',     // AHASS Selamat Motor Buniwangi
    14 => 'properti-toko-bangunan',     // Toko Bangunan Berkah Buniwangi
    15 => 'properti-toko-bangunan',     // Toko Besi Mekar Baja Citanglar
    16 => 'kuliner-seafood',            // Warung Seafood Bahari Citanglar
    17 => 'pendidikan-sekolah',         // SMPN 3 Surade Citanglar
    18 => 'kuliner-produk-olahan',      // Sentra Gula Kelapa & Gula Semut Jampang
    19 => 'retail-pertanian-hasil-bumi',// Toko Pertanian Tani Jaya Kademangan
    20 => 'retail-kerajinan-tangan',    // Sentra Kerajinan Anyaman Bambu Jagamukti
    21 => 'retail-pertanian-hasil-bumi',// Penggilingan Padi Sri Rejeki Jagamukti
    22 => 'hiburan-wisata-alam',        // Wisata Alam & Homestay Gua Sungging
    23 => 'jasa-tukang-kayu',           // Mebel & Pengrajin Kayu Jati Sungging
    24 => 'retail-pertanian-hasil-bumi',// Kelompok Tani Nira Kelapa Kadaleman
    25 => 'otomotif-bengkel-motor',     // Bengkel Motor Kadaleman Service
    26 => 'kuliner-warung-makan',       // Warung Nasi Ikan Bakar Cipeundeuy
    27 => 'retail-warung-sembako',      // Toko Sembako Barokah Cipeundeuy
    28 => 'retail-pertanian-hasil-bumi',// Koperasi Tani Makmur Sukatani
    29 => 'kuliner-produk-olahan',      // Sentra Olahan Kerupuk & Opak Sirnasari
    30 => 'retail-peternakan-ayam',     // Peternakan Ayam Petelur Wanasari Farm
];

foreach ($bizMappings as $bizId => $subSlug) {
    $cat = Category::where('slug', $subSlug)->first();
    if ($cat) {
        Business::where('id', $bizId)->update(['category_id' => $cat->id]);
        $parent = $cat->parent ? $cat->parent->name : "";
        echo "Business #{$bizId} remapped to {$parent} > {$cat->name} (id={$cat->id}, slug={$subSlug})\n";
    } else {
        echo "WARNING: Slug {$subSlug} not found in categories table!\n";
    }
}

echo "\nCategories synchronization completed successfully!\n";
