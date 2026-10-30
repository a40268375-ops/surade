<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Business;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

// Helper to determine exact products for each business
function getAuthenticProductsForBusiness($biz) {
    $name = strtolower($biz->name);
    $cat = strtolower($biz->category?->name ?? '');
    $sub = strtolower($biz->sub_category ?? '');

    // 1. DEALER & BENGKEL RESMI HONDA AHASS
    if (str_contains($name, 'ahass') || str_contains($name, 'honda')) {
        return [
            [
                'name' => 'Paket Servis Tune Up & Ganti Oli Mesin Honda (AHASS)',
                'description' => 'Servis berkala standar pabrikan Astra Honda Motor, pembersihan injeksi PGM-FI, cek pengereman, kelistrikan, dan oli mesin resmi AHM Oil.',
                'price' => 65000,
                'image' => '/images/businesses/otomotif_motor.jpg',
            ],
            [
                'name' => 'Ganti Kampas Rem & Servis CVT Matic BeAT / Vario / Scoopy',
                'description' => 'Pembersihan transmisi CVT, roller, v-belt, kampas ganda serta penggantian kampas rem depan/belakang original Honda.',
                'price' => 75000,
                'image' => '/images/businesses/otomotif_sparepart.jpg',
            ],
            [
                'name' => 'Suku Cadang Asli (AHM Genuine Parts) & Aki Motor Bebek/Matic',
                'description' => 'Suku cadang resmi bergaransi Honda, aki kering bebas perawatan, busi original, dan filter udara siap pasang.',
                'price' => 185000,
                'image' => '/images/businesses/otomotif_ban.jpg',
            ],
        ];
    }

    // 2. DEALER & BENGKEL RESMI YAMAHA
    if (str_contains($name, 'yamaha')) {
        return [
            [
                'name' => 'Paket Servis Berkala & Ganti Oli Yamalube Mesin Motor',
                'description' => 'Pengecekan sistem injeksi Blue Core Yamaha, tune up mesin presisi, ganti oli mesin resmi Yamalube dan kuras oli gardan.',
                'price' => 65000,
                'image' => '/images/businesses/otomotif_motor.jpg',
            ],
            [
                'name' => 'Servis CVT Matic & Pembersihan Throttle Body Injeksi',
                'description' => 'Perawatan transmisi matic NMAX, Aerox, Mio, Fazzio agar tarikan halus, bebas getaran gredek dan bensin hemat.',
                'price' => 75000,
                'image' => '/images/businesses/otomotif_sparepart.jpg',
            ],
            [
                'name' => 'Suku Cadang Asli Yamaha Genuine Parts (YGP) & Aki Kering',
                'description' => 'Sparepart asli Yamaha, kampas rem, v-belt original, busi dan aki kering dengan jaminan keaslian 100%.',
                'price' => 195000,
                'image' => '/images/businesses/otomotif_ban.jpg',
            ],
        ];
    }

    // 3. BENGKEL LAS / TERALIS / KANOPI (STRICT CHECK)
    if (preg_match('/\b(las|teralis|kanopi|pagar besi)\b/i', $name) || str_contains($cat, 'las')) {
        return [
            [
                'name' => 'Pembuatan Pagar Besi Minimalis Modern (Per Meter)',
                'description' => 'Pagar besi hollow galvanis tebal anti karat dengan cat dasar primer dan finishing cat semprot halus nan kokoh.',
                'price' => 350000,
                'image' => '/images/businesses/otomotif_las.jpg',
            ],
            [
                'name' => 'Pemasangan Kanopi Baja Ringan & Atap Spandek Carport',
                'description' => 'Konstruksi atap kanopi carport garasi tahan badai dengan rangka baja ringan presisi dan atap spandek peredam.',
                'price' => 250000,
                'image' => '/images/businesses/jasa_bangunan.jpg',
            ],
            [
                'name' => 'Teralis Jendela Besi Tempa & Pintu Kawat Nyamuk',
                'description' => 'Pengaman jendela rumah bermotif estetik dengan bahan besi kokoh anti bobol dan finishing rapi.',
                'price' => 180000,
                'image' => '/images/businesses/retail_material.jpg',
            ],
        ];
    }

    // 4. BENGKEL MOTOR UMUM / TAMBAL BAN / OTOMOTIF
    if (str_contains($cat, 'bengkel') || str_contains($cat, 'motor') || str_contains($cat, 'otomotif') || str_contains($name, 'bengkel') || str_contains($name, 'ban') || str_contains($name, 'motor')) {
        return [
            [
                'name' => 'Paket Servis Tune Up Rutin & Ganti Oli Mesin',
                'description' => 'Tune up lengkap, pembersihan karbu/injeksi, cek sistem rem, kelistrikan, dan oli mesin berkualitas.',
                'price' => 55000,
                'image' => '/images/businesses/otomotif_motor.jpg',
            ],
            [
                'name' => 'Ganti Ban Tubeless Motor Matic / Bebek & Pasang Hidrolik',
                'description' => 'Tersedia pilihan ban resmi (IRC, Maxxis, FDR, Zeneos) dengan pemasangan presisi tanpa lecet velg.',
                'price' => 185000,
                'image' => '/images/businesses/otomotif_ban.jpg',
            ],
            [
                'name' => 'Jasa Tambal Ban Tip-Top & Ganti Sparepart Cepat',
                'description' => 'Layanan tambal ban tubeless tahan lama, ganti tali rem, busi baru, dan bohlam lampu kendaraan.',
                'price' => 20000,
                'image' => '/images/businesses/otomotif_sparepart.jpg',
            ],
        ];
    }

    // 5. CUCI MOTOR & MOBIL (SNOW WASH)
    if (str_contains($name, 'steam') || str_contains($name, 'cuci motor') || str_contains($name, 'cuci mobil') || str_contains($sub, 'cuci')) {
        return [
            [
                'name' => 'Cuci Motor Snow Wash Salju + Semir Ban Kinclong',
                'description' => 'Pencucian busa salju pH seimbang, semprot kolong mesin bertekanan tinggi dan semir ban hitam mengkilap.',
                'price' => 15000,
                'image' => '/images/businesses/otomotif_cuci.jpg',
            ],
            [
                'name' => 'Cuci Mobil Komplit Bodi + Kolong Hidrolik & Vacuum Interior',
                'description' => 'Pembersihan mobil menyeluruh dengan lift hidrolik, sedot debu karpet interior, dan semprot pewangi kabin.',
                'price' => 50000,
                'image' => '/images/businesses/otomotif_cuci.jpg',
            ],
            [
                'name' => 'Paket Poles Bodi & Pengkilap Cat Kendaraan',
                'description' => 'Penghilang jamur kaca, poles baret halus dan pemberian wax pelindung agar cat kendaraan berkilau.',
                'price' => 75000,
                'image' => '/images/businesses/otomotif_variasi.jpg',
            ],
        ];
    }

    // 6. BANK / KEUANGAN / POS / PEGADAIAN
    if (str_contains($cat, 'bank') || str_contains($cat, 'keuangan') || str_contains($name, 'bank') || str_contains($name, 'bri') || str_contains($name, 'bsi') || str_contains($name, 'bjb') || str_contains($name, 'mandiri') || str_contains($name, 'pegadaian') || str_contains($name, 'pos indonesia')) {
        if (str_contains($name, 'pos')) {
            return [
                [
                    'name' => 'Jasa Pengiriman Paket & Dokumen Kilat Pos Express',
                    'description' => 'Layanan kirim paket cepat ke seluruh pelosok Indonesia dan mancanegara dengan nomor resi pelacakan online real-time.',
                    'price' => 15000,
                    'image' => '/images/businesses/ekspedisi_logistik.jpg',
                ],
                [
                    'name' => 'Layanan Pembayaran Tagihan Listrik, PDAM & BPJS (PPOB)',
                    'description' => 'Loket resmi pembayaran tagihan bulanan PLN, PDAM, cicilan finance, pajak dan top up e-wallet.',
                    'price' => 2500,
                    'image' => '/images/businesses/bank_brilink.jpg',
                ],
                [
                    'name' => 'Wesel Pos & Layanan Kirim Uang Tunai Instan',
                    'description' => 'Pengiriman uang tunai aman tanpa perlu rekening bank, bisa langsung dicairkan di kantor pos tujuan.',
                    'price' => 10000,
                    'image' => '/images/businesses/bank_brilink.jpg',
                ],
            ];
        }
        if (str_contains($name, 'pegadaian')) {
            return [
                [
                    'name' => 'Gadai Emas & Logam Mulia Bunga Ringan',
                    'description' => 'Solusi dana cepat aman dengan jaminan emas perhiasan dan emas batangan bernilai taksir tinggi.',
                    'price' => 0,
                    'image' => '/images/businesses/retail_toko_emas.jpg',
                ],
                [
                    'name' => 'Buka Rekening Tabungan Emas Pegadaian',
                    'description' => 'Investasi emas aman dan mudah mulai dari Rp 10.000 dengan cetak fisik bersertifikat resmi.',
                    'price' => 10000,
                    'image' => '/images/businesses/retail_toko_emas.jpg',
                ],
                [
                    'name' => 'Pembiayaan Modal Usaha Mikro Syariah',
                    'description' => 'Fasilitas pinjaman modal kerja untuk pengembangan UMKM dengan cicilan tetap dan syarat mudah.',
                    'price' => 0,
                    'image' => '/images/businesses/bank_brilink.jpg',
                ],
            ];
        }
        return [
            [
                'name' => 'Layanan Pembukaan Rekening Tabungan Simpanan',
                'description' => 'Buka rekening tabungan mudah dengan setoran awal terjangkau, kartu debit ATM dan fasilitas mobile banking modern.',
                'price' => 50000,
                'image' => '/images/businesses/bank_brilink.jpg',
            ],
            [
                'name' => 'Pengajuan Pinjaman Modal Usaha KUR UMKM',
                'description' => 'Kredit usaha rakyat bunga subsidi pemerintah khusus pelaku UMKM di wilayah Kecamatan Surade.',
                'price' => 0,
                'image' => '/images/businesses/bank_brilink.jpg',
            ],
            [
                'name' => 'Layanan Transaksi Setor & Tarik Tunai Counter',
                'description' => 'Pelayanan ramah untuk setor tunai, tarik tunai, transfer antar bank dan kliring transaksi bisnis.',
                'price' => 0,
                'image' => '/images/businesses/bank_brilink.jpg',
            ],
        ];
    }

    // 7. APOTEK / TOKO OBAT
    if (str_contains($cat, 'apotek') || str_contains($name, 'apotek') || str_contains($name, 'farma') || str_contains($sub, 'apotek')) {
        return [
            [
                'name' => 'Paket Vitamin C & Multivitamin Imunitas Tubuh',
                'description' => 'Suplemen daya tahan tubuh harian lengkap dengan vitamin C, D3, dan Zinc untuk menjaga stamina keluarga.',
                'price' => 35000,
                'image' => '/images/businesses/medis_apotek.jpg',
            ],
            [
                'name' => 'Obat Flu, Batuk, Demam & Nyeri Resep / OTC',
                'description' => 'Obat-obatan resmi terdaftar BPOM untuk mengatasi gejala flu, batuk, pilek, sakit kepala dan penurun panas.',
                'price' => 18000,
                'image' => '/images/businesses/medis_apotek.jpg',
            ],
            [
                'name' => 'Kotak P3K Lengkap & Perban Luka Steril',
                'description' => 'Paket pertolongan pertama berisi antiseptik, perban kasa steril, plester, dan minyak kayu putih.',
                'price' => 45000,
                'image' => '/images/businesses/medis_apotek.jpg',
            ],
        ];
    }

    // 8. PUSKESMAS & KLINIK & DOKTER
    if (str_contains($cat, 'puskesmas') || str_contains($cat, 'klinik') || str_contains($name, 'puskesmas') || str_contains($name, 'klinik') || str_contains($name, 'dokter')) {
        return [
            [
                'name' => 'Pemeriksaan Kesehatan & Konsultasi Dokter Umum',
                'description' => 'Pelayanan pemeriksaan fisik lengkap, diagnosa dokter profesional, dan pemberian resep obat sesuai keluhan pasien.',
                'price' => 25000,
                'image' => '/images/businesses/puskesmas.jpg',
            ],
            [
                'name' => 'Layanan Cek Laboratorium (Gula Darah, Kolesterol & Asam Urat)',
                'description' => 'Pemeriksaan cepat sampel darah dengan hasil akurat dalam hitungan menit untuk memantau kesehatan tubuh.',
                'price' => 50000,
                'image' => '/images/businesses/medis_klinik.jpg',
            ],
            [
                'name' => 'Pelayanan Rawat Inap & UGD Siaga 24 Jam',
                'description' => 'Fasilitas kamar perawatan bersih dan penanganan pertama darurat oleh tenaga medis siaga.',
                'price' => 150000,
                'image' => '/images/businesses/medis_klinik.jpg',
            ],
        ];
    }

    // 9. BIDAN & PERSALINAN
    if (str_contains($cat, 'bidan') || str_contains($name, 'bidan')) {
        return [
            [
                'name' => 'Pemeriksaan Kehamilan (ANC) & USG Dasar',
                'description' => 'Pemeriksaan rutin kesehatan ibu hamil dan tumbuh kembang janin oleh bidan berpengalaman.',
                'price' => 45000,
                'image' => '/images/businesses/medis_bidan.jpg',
            ],
            [
                'name' => 'Paket Persalinan Normal Bidan Siaga',
                'description' => 'Pelayanan proses persalinan normal dengan ruang bersalin bersih, nyaman dan penanganan penuh kasih sayang.',
                'price' => 950000,
                'image' => '/images/businesses/medis_bidan.jpg',
            ],
            [
                'name' => 'Imunisasi Bayi Lengkap & Konsultasi KB',
                'description' => 'Pemberian vaksin imunisasi wajib balita, suntik KB, pil KB dan pemasangan IUD/implan.',
                'price' => 35000,
                'image' => '/images/businesses/medis_bidan.jpg',
            ],
        ];
    }

    // 10. BAKSO & MIE AYAM
    if (str_contains($cat, 'bakso') || str_contains($name, 'bakso') || str_contains($name, 'mie ayam') || str_contains($sub, 'bakso')) {
        return [
            [
                'name' => 'Bakso Sapi Urat Super Kuah Kaldu Gurih',
                'description' => 'Bakso daging sapi segar dengan tekstur urat kenyal dan kuah kaldu rempah gurih disajikan dengan mie dan bihun.',
                'price' => 22000,
                'image' => '/images/businesses/kuliner_bakso.jpg',
            ],
            [
                'name' => 'Mie Ayam Bakso Pangsit Spesial',
                'description' => 'Mie kenyal dengan topping ayam cincang gurih bumbu manis, taburan daun bawang dan pangsit renyah.',
                'price' => 18000,
                'image' => '/images/businesses/kuliner_mie_ayam.jpg',
            ],
            [
                'name' => 'Es Teh Manis & Es Jeruk Peras Segar',
                'description' => 'Minuman segar pelepas dahaga dari teh seduh wangi melati dan jeruk peras alami.',
                'price' => 6000,
                'image' => '/images/businesses/kuliner_jus_buah.jpg',
            ],
        ];
    }

    // 11. SATE & KAMBING
    if (str_contains($cat, 'sate') || str_contains($name, 'sate') || str_contains($name, 'kambing') || str_contains($sub, 'sate')) {
        return [
            [
                'name' => 'Sate Kambing Muda Bumbu Kecap Pedas (10 Tusuk)',
                'description' => 'Daging kambing muda empuk dibakar dengan olesan bumbu rempah dan kecap manis khas, disajikan dengan irisan cabai rawit.',
                'price' => 38000,
                'image' => '/images/businesses/kuliner_sate.jpg',
            ],
            [
                'name' => 'Gule Kambing Kuah Santan Rempah Gurih',
                'description' => 'Olahan daging dan iga kambing empuk berkuah santan kental dengan aroma kapulaga dan cengkeh khas nusantara.',
                'price' => 28000,
                'image' => '/images/businesses/kuliner_sate.jpg',
            ],
            [
                'name' => 'Sate Ayam Madura Bumbu Kacang Kental (10 Tusuk)',
                'description' => 'Sate daging ayam fillet lembut disiram bumbu kacang gurih legit dan taburan bawang goreng harum.',
                'price' => 20000,
                'image' => '/images/businesses/kuliner_sate.jpg',
            ],
        ];
    }

    // 12. SEAFOOD & IKAN BAKAR
    if (str_contains($cat, 'ikan bakar') || str_contains($cat, 'seafood') || str_contains($name, 'ikan bakar') || str_contains($name, 'seafood') || str_contains($sub, 'seafood')) {
        return [
            [
                'name' => 'Paket Ikan Bakar Gurame / Laut Cobek Khas Surade',
                'description' => 'Ikan segar pesisir selatan dibakar dengan bumbu rempah dan sambal cobek terasi goang pedas nampol.',
                'price' => 45000,
                'image' => '/images/businesses/kuliner_ikan_bakar.jpg',
            ],
            [
                'name' => 'Cumi Goreng Tepung Renyah & Udang Saus Padang',
                'description' => 'Cumi tepung krispi dan udang segar laut dengan saus padang pedas manis kental nan lezat.',
                'price' => 38000,
                'image' => '/images/businesses/kuliner_seafood.jpg',
            ],
            [
                'name' => 'Ikan Laut Segar Hasil Tangkapan Pesisir (Per Kg)',
                'description' => 'Ikan tongkol, bawal, cakalang dan kakap merah segar langsung dari dermaga pendaratan ikan pesisir.',
                'price' => 32000,
                'image' => '/images/businesses/kuliner_ikan_asin.jpg',
            ],
        ];
    }

    // 13. NASI PADANG
    if (str_contains($cat, 'padang') || str_contains($name, 'padang') || str_contains($name, 'ampera')) {
        return [
            [
                'name' => 'Nasi Padang Rendang Daging Sapi Empuk',
                'description' => 'Nasi hangat disajikan dengan rendang daging sapi bumbu rempah kelapa hitam pekat, daun singkong dan sambal hijau.',
                'price' => 25000,
                'image' => '/images/businesses/kuliner_nasi_padang.jpg',
            ],
            [
                'name' => 'Paket Nasi Padang Ayam Pop / Gulai Cincang',
                'description' => 'Pilihan lauk ayam pop gurih atau cincang daging sapi kuah gulai gurih kental beraroma rempah Minang.',
                'price' => 22000,
                'image' => '/images/businesses/padang_rendang.jpg',
            ],
            [
                'name' => 'Gulai Kepala Kakap & Dendeng Balado Renyah',
                'description' => 'Gulai kepala ikan kakap segar dan dendeng sapi batokok renyah berlumur cabai merah uleg.',
                'price' => 35000,
                'image' => '/images/businesses/kuliner_ayam_goreng.jpg',
            ],
        ];
    }

    // 14. KOPI & ROASTERY & CAFE
    if (str_contains($cat, 'kopi') || str_contains($cat, 'cafe') || str_contains($name, 'kopi') || str_contains($name, 'coffee') || str_contains($name, 'roastery') || str_contains($name, 'cafe')) {
        return [
            [
                'name' => 'Kopi Robusta Pajampangan Biji Sangrai (Pouch 250g)',
                'description' => 'Biji kopi pilihan petik merah khas pegunungan Buniwangi Surade disangrai fresh dengan aroma cokelat karamel tebal.',
                'price' => 35000,
                'image' => '/images/businesses/kuliner_kopi.jpg',
            ],
            [
                'name' => 'Kopi Bubuk Murni Giling Halus Khas Buniwangi (200g)',
                'description' => 'Bubuk kopi murni giling segar tanpa campuran jagung, sangat nikmat diseduh tubruk kental.',
                'price' => 28000,
                'image' => '/images/businesses/coffee_shop.jpg',
            ],
            [
                'name' => 'Es Kopi Susu Gula Aren Asli Khas Surade (Botol 250ml)',
                'description' => 'Espresso robusta mantap dipadukan dengan susu segar dan sirup gula kelapa aren asli pesisir selatan.',
                'price' => 18000,
                'image' => '/images/businesses/manual_brew.jpg',
            ],
        ];
    }

    // 15. KULINER SUNDA / AYAM GORENG / WARUNG MAKAN UMUM
    if (str_contains($cat, 'kuliner') || str_contains($cat, 'makan') || str_contains($cat, 'resto') || str_contains($name, 'warung') || str_contains($name, 'ayam') || str_contains($name, 'resto') || str_contains($name, 'makan') || str_contains($name, 'seblak')) {
        return [
            [
                'name' => 'Paket Nasi Timbel Komplit Ayam Goreng Kampung & Sambal Lalap',
                'description' => 'Nasi timbel harum bungkus daun pisang, ayam goreng gurih empuk, tahu tempe, lalapan segar dan sambal terasi goang.',
                'price' => 28000,
                'image' => '/images/businesses/kuliner_ayam_goreng.jpg',
            ],
            [
                'name' => 'Paket Ayam Geprek Sambal Bawang Pedas Mantap',
                'description' => 'Ayam goreng krispi digeprek dengan sambal bawang segar bercita rasa pedas gurih disajikan dengan nasi hangat.',
                'price' => 18000,
                'image' => '/images/businesses/kuliner_ayam_geprek.jpg',
            ],
            [
                'name' => 'Nasi Liwet Komplit Panci Kastrol Khas Pajampangan',
                'description' => 'Nasi liwet wangi daun salam sereh dengan topping teri medan gurih, cocok dinikmati bersama keluarga.',
                'price' => 35000,
                'image' => '/images/businesses/sunda_timbel.jpg',
            ],
        ];
    }

    // 16. TOKO EMAS
    if (str_contains($cat, 'emas') || str_contains($name, 'emas') || str_contains($name, 'perhiasan')) {
        return [
            [
                'name' => 'Cincin Emas Asli Kadar 700 / 24K Model Elegan',
                'description' => 'Cincin emas murni dengan ukiran halus dan surat nota resmi bergaransi, cocok untuk mahar dan investasi.',
                'price' => 850000,
                'image' => '/images/businesses/retail_toko_emas.jpg',
            ],
            [
                'name' => 'Gelang & Rantai Tangan Emas Fashion Modern',
                'description' => 'Gelang emas model terkini berkilau menawan, kuat dan mudah dijual kembali di seluruh toko emas.',
                'price' => 1450000,
                'image' => '/images/businesses/retail_toko_emas.jpg',
            ],
            [
                'name' => 'Kalung Emas + Liontin Cantik Bersertifikat',
                'description' => 'Set kalung dan liontin emas asli dengan berat presisi dilengkapi dompet cantik dari toko.',
                'price' => 1950000,
                'image' => '/images/businesses/retail_toko_emas.jpg',
            ],
        ];
    }

    // 17. TOKO BANGUNAN / MATERIAL
    if (str_contains($cat, 'bangunan') || str_contains($cat, 'material') || str_contains($name, 'material') || str_contains($name, 'bangunan') || str_contains($name, 'semen')) {
        return [
            [
                'name' => 'Semen Portland Komposit Tiga Roda / Holcim (50 Kg)',
                'description' => 'Semen konstruksi mutu tinggi untuk plesteran dinding, acian halus, dan cor beton kokoh tahan lama.',
                'price' => 68000,
                'image' => '/images/businesses/retail_material.jpg',
            ],
            [
                'name' => 'Pasir Cor Halus & Pasir Pasang Asli 1 Truk Colt',
                'description' => 'Pasir kali pilihan bebas lumpur berlebih, siap kirim langsung ke lokasi proyek bangunan Anda di Surade.',
                'price' => 650000,
                'image' => '/images/businesses/jasa_bangunan.jpg',
            ],
            [
                'name' => 'Cat Tembok Rumah Interior & Eksterior (Galon 5 Kg)',
                'description' => 'Cat dinding dengan daya tutup tinggi, warna cerah tahan cuaca dan formula anti jamur.',
                'price' => 115000,
                'image' => '/images/businesses/retail_material.jpg',
            ],
        ];
    }

    // 18. PERTANIAN / PUPUK / BIBIT / GULA / MADU
    if (str_contains($cat, 'tani') || str_contains($cat, 'pertanian') || str_contains($name, 'tani') || str_contains($name, 'pupuk') || str_contains($name, 'bibit') || str_contains($name, 'gula') || str_contains($name, 'madu')) {
        if (str_contains($name, 'gula') || str_contains($name, 'kelapa')) {
            return [
                [
                    'name' => 'Gula Merah Kelapa Cetak Asli Pajampangan (1 Kg)',
                    'description' => 'Gula kelapa murni nira segar tanpa campuran kimia, beraroma wangi legit untuk bumbu masak dan kue.',
                    'price' => 24000,
                    'image' => '/images/businesses/gula_kelapa.jpg',
                ],
                [
                    'name' => 'Gula Semut Aren Kristal Organik (Pouch 500g)',
                    'description' => 'Gula semut kering halus dari nira aren pohon hutan alami, praktis untuk pemanis kopi dan teh herbal.',
                    'price' => 28000,
                    'image' => '/images/businesses/kuliner_gula_aren.jpg',
                ],
                [
                    'name' => 'Kelapa Butir Tua Pilihan Segar (Per Butir)',
                    'description' => 'Kelapa tua daging tebal banyak santan hasil panen kebun kelapa pesisir Surade.',
                    'price' => 8000,
                    'image' => '/images/businesses/tani_kelapa.jpg',
                ],
            ];
        }
        if (str_contains($name, 'madu')) {
            return [
                [
                    'name' => 'Madu Hutan Liar Odeng Asli Pajampangan (Botol 500ml)',
                    'description' => 'Madu murni alami hasil panen sarang lebah pohon tinggi hutan liar Pajampangan tanpa proses masak kimiawi.',
                    'price' => 95000,
                    'image' => '/images/businesses/madu_hutan.jpg',
                ],
                [
                    'name' => 'Sarang Madu Honeycomb Segar Asli (Box 250g)',
                    'description' => 'Potongan sarang lebah asli berisi madu kental manis yang lumer di mulut dan kaya propolis alami.',
                    'price' => 65000,
                    'image' => '/images/businesses/tani_madu.jpg',
                ],
                [
                    'name' => 'Madu Murni Nektar Randu Lebah Ternak (650ml)',
                    'description' => 'Madu ternak nektar randu bercita rasa manis lembut untuk menjaga imunitas tubuh sehari-hari.',
                    'price' => 75000,
                    'image' => '/images/businesses/madu_hutan.jpg',
                ],
            ];
        }
        return [
            [
                'name' => 'Pupuk NPK Mutiara 16-16-16 Penyubur Tanaman (1 Kg)',
                'description' => 'Pupuk majemuk untuk mempercepat tunas, memacu pembungaan dan memperbesar buah tanaman kebun.',
                'price' => 22000,
                'image' => '/images/businesses/tani_pupuk.jpg',
            ],
            [
                'name' => 'Insektisida & Pembasmi Hama Tanaman Padi / Sayur',
                'description' => 'Obat pengendali hama ulat dan wereng terbukti ampuh melindungi tanaman pertanian petani.',
                'price' => 45000,
                'image' => '/images/businesses/tani_pupuk.jpg',
            ],
            [
                'name' => 'Pupuk Organik Kompos Fermentasi (Karung 10 Kg)',
                'description' => 'Penyubur tanah alami siap pakai hasil fermentasi kotoran ternak dan mikroba penyubur tanah.',
                'price' => 25000,
                'image' => '/images/businesses/tani_pupuk.jpg',
            ],
        ];
    }

    // 19. IKAN AIR TAWAR / BIBIT IKAN / PANCING
    if (str_contains($cat, 'ikan') || str_contains($cat, 'pancing') || str_contains($name, 'ikan') || str_contains($name, 'pancing') || str_contains($name, 'lele') || str_contains($name, 'nila')) {
        if (str_contains($name, 'pancing')) {
            return [
                [
                    'name' => 'Joran Pancing Fiber Carbon Kuat Laut & Sungai',
                    'description' => 'Joran pancing fleksibel tangguh mampu menahan tarikan ikan besar hingga 15 Kg.',
                    'price' => 175000,
                    'image' => '/images/businesses/pancing.jpg',
                ],
                [
                    'name' => 'Reel Pancing Spinning Smooth Bearing Anti Korosi',
                    'description' => 'Reel pemutar senar dengan putaran halus dan drag presisi untuk mancing kolam maupun laut.',
                    'price' => 145000,
                    'image' => '/images/businesses/retail_pancing.jpg',
                ],
                [
                    'name' => 'Paket Mata Kail, Senar Kuat & Essen Umpan Pancing',
                    'description' => 'Perlengkapan mancing komplit berisi kotak kail, timah pemberat, pelampung dan essen aroma pemikat.',
                    'price' => 35000,
                    'image' => '/images/businesses/retail_pancing.jpg',
                ],
            ];
        }
        return [
            [
                'name' => 'Bibit Ikan Nila Hitam / Merah Super (Isi 100 Ekor)',
                'description' => 'Benih bibit ikan nila sehat, lincah, tahan penyakit dan cepat besar untuk budidaya kolam tanah maupun terpal.',
                'price' => 40000,
                'image' => '/images/businesses/tani_ikan.jpg',
            ],
            [
                'name' => 'Bibit Ikan Lele Sangkuriang 5-7 cm (Isi 200 Ekor)',
                'description' => 'Bibit lele unggul siap tebar dengan daya tahan tinggi dan pertumbuhan bobot cepat panen.',
                'price' => 50000,
                'image' => '/images/businesses/tani_ikan_lele.jpg',
            ],
            [
                'name' => 'Pelet Pakan Ikan Terapung Protein Tinggi (10 Kg)',
                'description' => 'Pakan pelet apung kaya protein 30% untuk memacu pertumbuhan ikan air tawar secara maksimal.',
                'price' => 125000,
                'image' => '/images/businesses/tani_ikan.jpg',
            ],
        ];
    }

    // 20. HOTEL & VILLA & HOMESTAY & WISATA
    if (str_contains($cat, 'villa') || str_contains($cat, 'hotel') || str_contains($cat, 'wisata') || str_contains($name, 'hotel') || str_contains($name, 'penginapan') || str_contains($name, 'villa') || str_contains($name, 'curug') || str_contains($name, 'pantai')) {
        if (str_contains($name, 'curug') || str_contains($name, 'cikaso')) {
            return [
                [
                    'name' => 'Tiket Masuk Kawasan Wisata Curug Cikaso Surade',
                    'description' => 'Tiket resmi kunjungan menikmati keindahan pesona tiga air terjun megah Curug Cikaso yang masih sangat asri.',
                    'price' => 15000,
                    'image' => '/images/businesses/curug_cikaso.jpg',
                ],
                [
                    'name' => 'Sewa Perahu Tradisional Susur Sungai Cikaso (PP)',
                    'description' => 'Sensasi naik perahu motor menyusuri keindahan sungai berair hijau toska menuju dasar air terjun.',
                    'price' => 60000,
                    'image' => '/images/businesses/curug_cikaso.jpg',
                ],
                [
                    'name' => 'Jasa Pemandu Wisata Lokal (Tour Guide) & Spot Foto',
                    'description' => 'Pendampingan pemandu ramah yang mengetahui rute terbaik dan spot foto menarik di sekitar curug.',
                    'price' => 75000,
                    'image' => '/images/businesses/curug_cikaso.jpg',
                ],
            ];
        }
        if (str_contains($name, 'pantai') || str_contains($name, 'minajaya')) {
            return [
                [
                    'name' => 'Tiket Masuk Wisata Pantai Minajaya Surade',
                    'description' => 'Akses wisata pesisir pantai berpasir luas dengan ombak tenang dan pemandangan matahari terbenam memukau.',
                    'price' => 10000,
                    'image' => '/images/businesses/pantai_minajaya.jpg',
                ],
                [
                    'name' => 'Sewa Saung Santai Pinggir Pantai Pesisir Minajaya',
                    'description' => 'Tempat istirahat nyaman teduh tepat di tepi pantai untuk berkumpul santai bersama keluarga.',
                    'price' => 30000,
                    'image' => '/images/businesses/wisata_pantai.jpg',
                ],
                [
                    'name' => 'Kelapa Muda Segar Pinggir Pantai Pesisir Selatan',
                    'description' => 'Air kelapa murni dingin dipetik langsung dari pohon pesisir lengkap dengan gula merah aren.',
                    'price' => 12000,
                    'image' => '/images/businesses/pantai_minajaya.jpg',
                ],
            ];
        }
        return [
            [
                'name' => 'Sewa Kamar Standard AC + Free Wifi & Breakfast',
                'description' => 'Kamar tidur nyaman dilengkapi kasur springbed empuk, AC dingin, TV layar datar, kamar mandi dalam dan sarapan.',
                'price' => 250000,
                'image' => '/images/businesses/wisata_homestay.jpg',
            ],
            [
                'name' => 'Kamar VIP Deluxe King Bed Nyaman Keluarga',
                'description' => 'Kamar luas untuk keluarga dengan fasilitas water heater air panas, pembuat teh dan pemandangan asri.',
                'price' => 400000,
                'image' => '/images/businesses/wisata_homestay.jpg',
            ],
            [
                'name' => 'Paket Sewa Homestay 1 Rumah Transit Wisata Surade',
                'description' => 'Sewa rumah penuh cocok untuk rombongan wisata pantai Geopark dan Curug Cikaso dengan dapur lengkap.',
                'price' => 750000,
                'image' => '/images/businesses/wisata_homestay.jpg',
            ],
        ];
    }

    // 21. HP / ELEKTRONIK / KOMPUTER / SERVIS
    if (str_contains($cat, 'elektronik') || str_contains($name, 'cell') || str_contains($name, 'hp') || str_contains($name, 'komputer') || str_contains($name, 'laptop') || str_contains($name, 'pulsa')) {
        return [
            [
                'name' => 'Voucher Kuota Data Internet Semua Operator (30 Hari)',
                'description' => 'Paket kuota internet Telkomsel, Indosat, XL dan Smartfren aktif 30 hari langsung terisi cepat.',
                'price' => 35000,
                'image' => '/images/businesses/elektronik_hp.jpg',
            ],
            [
                'name' => 'Jasa Ganti LCD Touchscreen HP & Servis Baterai',
                'description' => 'Perbaikan layar ponsel retak, baterai drop, atau ganti konektor charger dengan garansi servis.',
                'price' => 165000,
                'image' => '/images/businesses/servis_hp.jpg',
            ],
            [
                'name' => 'Aksesoris Fast Charging & Tempered Glass HP',
                'description' => 'Charger cepat 33W-67W Type-C dan pemasangan pelindung layar anti gores berkualitas.',
                'price' => 45000,
                'image' => '/images/businesses/elektronik_hp.jpg',
            ],
        ];
    }

    // 22. LAUNDRY
    if (str_contains($cat, 'laundry') || str_contains($name, 'laundry') || str_contains($sub, 'laundry')) {
        return [
            [
                'name' => 'Jasa Laundry Kiloan Cuci Komplit Setrika Wangi',
                'description' => 'Pencucian pakaian terpisah per pelanggan dengan deterjen premium wangi dan setrika uap rapi.',
                'price' => 7000,
                'image' => '/images/businesses/laundry_kiloan.jpg',
            ],
            [
                'name' => 'Paket Cuci Bedcover & Selimut Tebal Higienis',
                'description' => 'Perawatan bahan kain tebal dan selimut agar tetap lembut, harum tahan lama dan bebas tungau.',
                'price' => 25000,
                'image' => '/images/businesses/laundry_kiloan.jpg',
            ],
            [
                'name' => 'Cuci Sepatu & Helm Deep Clean Anti Bakteri',
                'description' => 'Pembersihan mendalam noda sepatu dan helm dengan sabun khusus dan parfum anti apek.',
                'price' => 30000,
                'image' => '/images/businesses/cuci_sepatu.jpg',
            ],
        ];
    }

    // 23. BARBERSHOP / PANGKAS RAMBUT / SALON
    if (str_contains($cat, 'barber') || str_contains($cat, 'salon') || str_contains($name, 'barber') || str_contains($name, 'pangkas') || str_contains($name, 'salon') || str_contains($name, 'cukur')) {
        return [
            [
                'name' => 'Potong Rambut Pria Modern + Cuci & Hair Tonic',
                'description' => 'Model potongan rambut trendi (Fade, Undercut, Two-block) dikerjakan kapster handal dengan finishing tonic harum.',
                'price' => 20000,
                'image' => '/images/businesses/barbershop.jpg',
            ],
            [
                'name' => 'Cukur Jenggot, Kumis Rapi & Pijat Relaksasi',
                'description' => 'Cukur bersih dengan handuk hangat relaksasi dan pijat leher penyegar badan.',
                'price' => 15000,
                'image' => '/images/businesses/barbershop.jpg',
            ],
            [
                'name' => 'Paket Creambath & Perawatan Rambut Rusak',
                'description' => 'Pemberian nutrisi krim lidah buaya/ginseng dan steam rambut agar rambut tetap lembut berkilau.',
                'price' => 45000,
                'image' => '/images/businesses/jasa_salon.jpg',
            ],
        ];
    }

    // 24. PENJAHIT / BUTIK / KONVEKSI
    if (str_contains($cat, 'jahit') || str_contains($name, 'jahit') || str_contains($name, 'tailor') || str_contains($name, 'busana') || str_contains($name, 'konveksi')) {
        return [
            [
                'name' => 'Jasa Jahit Gamis, Kebaya & Gaun Pesta Custom',
                'description' => 'Pembuatan busana wanita dengan pola pas di badan, jahitan halus dan model sesuai permintaan.',
                'price' => 120000,
                'image' => '/images/businesses/jahit_konveksi.jpg',
            ],
            [
                'name' => 'Jahit Kemeja Batik & Celana Bahan Pria Formal',
                'description' => 'Jasa pembuatan kemeja kerja dan celana bahan dengan fitting presisi dan jahitan rapi.',
                'price' => 85000,
                'image' => '/images/businesses/jasa_jahit.jpg',
            ],
            [
                'name' => 'Permak Pakaian Cepat (Potong & Kecilkan Ukuran)',
                'description' => 'Layanan permak celana jeans, baju, dan pasang resleting ganti baru siap dalam 1 hari.',
                'price' => 15000,
                'image' => '/images/businesses/jahit_konveksi.jpg',
            ],
        ];
    }

    // 25. SEDOT WC
    if (str_contains($cat, 'sedot') || str_contains($name, 'sedot') || str_contains($name, 'wc') || str_contains($sub, 'sedot')) {
        return [
            [
                'name' => 'Layanan Sedot WC & Kuras Septic Tank Rumah Tangga',
                'description' => 'Jasa kuras septic tank bersih tanpa bau, armada tangki modern dengan selang panjang hingga ke dalam gang.',
                'price' => 350000,
                'image' => '/images/businesses/jasa_ledeng.jpg',
            ],
            [
                'name' => 'Pelancaran Pipa Mampet & Wastafel Mesin Spiral',
                'description' => 'Solusi cepat pipa paralon tersumbat lemak / kotoran tanpa perlu membongkar lantai rumah.',
                'price' => 200000,
                'image' => '/images/businesses/tukang_ledeng.jpg',
            ],
            [
                'name' => 'Kuras Limbah Septic Tank Restoran & Ruko Usaha',
                'description' => 'Paket perawatan rutin kuras limbah grease trap usaha komersial di seluruh wilayah Surade.',
                'price' => 500000,
                'image' => '/images/businesses/jasa_ledeng.jpg',
            ],
        ];
    }

    // 26. DEFAULT SEMBAKO / KELONTONG / TOKO UMUM
    return [
        [
            'name' => 'Paket Sembako Hemat Keluarga (Beras, Minyak & Gula)',
            'description' => 'Paket kebutuhan pokok harian berisi Beras 2.5kg, Minyak Goreng 1 Liter, Gula Pasir 1kg dan Teh Celup.',
            'price' => 65000,
            'image' => '/images/businesses/sembako.jpg',
        ],
        [
            'name' => 'Minyak Goreng Kemasan Pouch (2 Liter)',
            'description' => 'Minyak goreng kelapa sawit jernih berkualitas tinggi untuk memasak renyah higienis.',
            'price' => 36000,
            'image' => '/images/businesses/retail_sembako.jpg',
        ],
        [
            'name' => 'Telur Ayam Ras Segar Peternakan Lokal (1 Kg)',
            'description' => 'Telur ayam fresh panen setiap hari dengan cangkang tebal dan kualitas gizi terjamin.',
            'price' => 29000,
            'image' => '/images/businesses/retail_sembako.jpg',
        ],
    ];
}

$businesses = Business::with('category')->get();
echo "Memulai update produk autentik lokal untuk {$businesses->count()} usaha di Surade...\n";

$updatedTotal = 0;
$createdTotal = 0;

foreach ($businesses as $biz) {
    $products = getAuthenticProductsForBusiness($biz);
    $existing = Product::where('business_id', $biz->id)->orderBy('id')->get();

    for ($i = 0; $i < 3; $i++) {
        $p = $products[$i];
        if (isset($existing[$i])) {
            $existing[$i]->update([
                'name' => $p['name'],
                'description' => $p['description'],
                'price' => $p['price'],
                'image' => $p['image'],
                'is_active' => true,
                'status' => 'approved',
                'updated_at' => now(),
            ]);
            $updatedTotal++;
        } else {
            Product::create([
                'business_id' => $biz->id,
                'name' => $p['name'],
                'description' => $p['description'],
                'price' => $p['price'],
                'image' => $p['image'],
                'is_active' => true,
                'status' => 'approved',
            ]);
            $createdTotal++;
        }
    }

    // Hapus dummy berlebih jika ada
    if ($existing->count() > 3) {
        Product::where('business_id', $biz->id)->whereNotIn('id', $existing->take(3)->pluck('id'))->delete();
    }
}

echo "BERHASIL! $updatedTotal produk diupdate, $createdTotal produk baru dibuat.\n";
