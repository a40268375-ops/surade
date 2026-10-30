<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Business;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

// Curated authentic product libraries with high-performance optimized images
function getContextualProductsForBusiness($biz) {
    $name = strtolower($biz->name);
    $cat = strtolower($biz->category?->name ?? '');
    $sub = strtolower($biz->sub_category ?? '');
    $desc = strtolower($biz->description ?? '');
    $all = "$name $cat $sub $desc";

    // 1. BANK / KEUANGAN
    if (str_contains($all, 'bank') || str_contains($all, 'bri') || str_contains($all, 'bsi') || str_contains($all, 'bjb') || str_contains($all, 'mandiri') || str_contains($all, 'bca')) {
        return [
            [
                'name' => 'Layanan Pembukaan Rekening Tabungan Simpanan',
                'description' => 'Buka rekening tabungan mudah dan cepat dengan setoran awal terjangkau, fasilitas kartu debit ATM, dan akses mobile banking modern.',
                'price' => 50000,
                'image' => 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Pengajuan Pinjaman Modal Usaha KUR UMKM',
                'description' => 'Fasilitas kredit modal kerja dengan suku bunga subsidi rendah khusus pelaku usaha mikro, kecil, dan menengah di wilayah Surade.',
                'price' => 0,
                'image' => 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Layanan Transaksi Setor & Tarik Tunai Counter',
                'description' => 'Pelayanan cepat dan ramah untuk setor tunai, tarik tunai, transfer antar bank, serta pembayaran tagihan resmi.',
                'price' => 0,
                'image' => 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 2. PEGADAIAN
    if (str_contains($all, 'pegadaian')) {
        return [
            [
                'name' => 'Gadai Emas & Barang Elektronik Bunga Ringan',
                'description' => 'Solusi dana cepat aman dengan jaminan emas perhiasan, logam mulia, atau barang elektronik dengan taksiran harga tinggi.',
                'price' => 0,
                'image' => 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Buka Rekening Tabungan Emas Pegadaian',
                'description' => 'Investasi emas aman mulai dari Rp 10.000 saja. Bisa dicetak menjadi emas batangan fisik bersertifikat SNI.',
                'price' => 10000,
                'image' => 'https://images.unsplash.com/photo-1624365169364-06836966f332?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Pembiayaan Usaha Mikro & Kendaraan Bermotor',
                'description' => 'Pinjaman modal usaha dan pembiayaan syariah untuk kepemilikan kendaraan dengan cicilan flat terjangkau.',
                'price' => 0,
                'image' => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 3. KANTOR POS
    if (str_contains($all, 'kantor pos') || str_contains($all, 'pos indonesia')) {
        return [
            [
                'name' => 'Jasa Pengiriman Paket & Dokumen Kilat Pos Express',
                'description' => 'Layanan pengiriman paket kilat menjangkau seluruh pelosok Indonesia dan luar negeri dengan nomor resi pelacakan online real-time.',
                'price' => 15000,
                'image' => 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Layanan Pembayaran Tagihan Listrik, PDAM & BPJS (PPOB)',
                'description' => 'Loket resmi pembayaran tagihan bulanan, cicilan finance, pajak, dan pengisian saldo dompet digital di kantor pos.',
                'price' => 2500,
                'image' => 'https://images.unsplash.com/photo-1556742049-0a67e557b63b?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Wesel Pos & Layanan Kirim Uang Tunai Instan',
                'description' => 'Kirim dan terima uang tunai tanpa perlu rekening bank secara aman dan cepat di seluruh jaringan kantor pos.',
                'price' => 10000,
                'image' => 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 4. PUSKESMAS & KLINIK & DOKTER
    if (str_contains($all, 'puskesmas') || str_contains($all, 'klinik') || str_contains($all, 'dokter') || str_contains($all, 'pustu') || str_contains($all, 'medika')) {
        return [
            [
                'name' => 'Pemeriksaan Kesehatan & Konsultasi Dokter Umum',
                'description' => 'Pelayanan pemeriksaan fisik lengkap, diagnosa dokter profesional, dan pemberian resep obat sesuai keluhan pasien.',
                'price' => 25000,
                'image' => 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Layanan Cek Laboratorium (Gula Darah, Asam Urat & Kolesterol)',
                'description' => 'Pemeriksaan cepat sampel darah dengan hasil akurat dalam hitungan menit untuk memantau kesehatan tubuh.',
                'price' => 50000,
                'image' => 'https://images.unsplash.com/photo-1583324113626-70df0f4deaab?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Pelayanan Rawat Inap & UGD Siaga 24 Jam',
                'description' => 'Fasilitas kamar perawatan bersih dan penanganan pertama darurat oleh tenaga medis berpengalaman.',
                'price' => 150000,
                'image' => 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 5. APOTEK & FARMASI
    if (str_contains($all, 'apotek') || str_contains($all, 'farma') || str_contains($all, 'kimia farma') || str_contains($all, 'obat')) {
        return [
            [
                'name' => 'Paket Vitamin C & Multivitamin Imunitas Tubuh',
                'description' => 'Suplemen daya tahan tubuh harian lengkap dengan vitamin C, D3, dan Zinc untuk menjaga stamina keluarga.',
                'price' => 35000,
                'image' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Obat Flu, Batuk, Demam & Nyeri Resep / OTC',
                'description' => 'Obat-obatan resmi terdaftar BPOM untuk mengatasi gejala flu, batuk, pilek, sakit kepala dan penurun panas.',
                'price' => 18000,
                'image' => 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Kotak P3K Lengkap & Perban Luka Steril',
                'description' => 'Paket pertolongan pertama pada kecelakaan berisi betadine antiseptik, kasa steril, plester, dan minyak kayu putih.',
                'price' => 45000,
                'image' => 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 6. TOKO EMAS & PERHIASAN
    if (str_contains($all, 'emas') || str_contains($all, 'jewelry') || str_contains($all, 'mulia abadi')) {
        return [
            [
                'name' => 'Cincin Emas Asli Kadar 700 / 24K Model Elegan',
                'description' => 'Cincin emas murni dengan ukiran halus dan sertifikat keaslian resmi, cocok untuk hadiah dan investasi.',
                'price' => 850000,
                'image' => 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Gelang & Rantai Tangan Emas Fashion Modern',
                'description' => 'Gelang emas model terkini dengan kilau menawan yang awet dan memiliki nilai jual kembali yang tinggi.',
                'price' => 1450000,
                'image' => 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Kalung Emas + Liontin Cantik Bersertifikat',
                'description' => 'Set kalung dan liontin emas asli dengan berat presisi, dilengkapi nota resmi dari toko.',
                'price' => 1950000,
                'image' => 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 7. SPBU & BBM
    if (str_contains($all, 'spbu') || str_contains($all, 'pertamina') || str_contains($all, 'bbm')) {
        return [
            [
                'name' => 'Bahan Bakar Pertalite & Pertamax Berkualitas',
                'description' => 'BBM resmi Pertamina dengan oktan tinggi untuk performa mesin kendaraan bertenaga dan bersih dari endapan.',
                'price' => 10000,
                'image' => 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Oli Mesin Pertamina Enduro & Fastron Original',
                'description' => 'Pelumas mesin motor dan mobil original untuk melindungi mesin dari gesekan ekstrem dan suhu tinggi.',
                'price' => 55000,
                'image' => 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Layanan Pengisian Angin Ban Nitrogen & Tambal Ban',
                'description' => 'Fasilitas isi angin nitrogen murni agar tekanan ban stabil dan perjalanan lebih aman.',
                'price' => 10000,
                'image' => 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 8. HOTEL / PENGINAPAN / VILLA / HOMESTAY
    if (str_contains($all, 'hotel') || str_contains($all, 'penginapan') || str_contains($all, 'villa') || str_contains($all, 'homestay') || str_contains($all, 'resort') || str_contains($all, 'yasa')) {
        return [
            [
                'name' => 'Sewa Kamar Standard AC + Free Wifi & Breakfast',
                'description' => 'Kamar tidur nyaman dilengkapi kasur springbed empuk, AC dingin, TV layar datar, kamar mandi dalam, dan sarapan pagi gratis.',
                'price' => 250000,
                'image' => 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Kamar VIP Deluxe King Bed Nyaman',
                'description' => 'Kamar luas untuk keluarga dengan fasilitas water heater air panas, kulkas mini, dan pemandangan asri.',
                'price' => 400000,
                'image' => 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Paket Sewa Homestay 1 Rumah Transit Wisata Surade',
                'description' => 'Sewa rumah penuh cocok untuk rombongan wisata pantai Geopark Ciletuh dan Curug Cikaso dengan dapur lengkap.',
                'price' => 750000,
                'image' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 9. SEKOLAH / BIMBEL / PENDIDIKAN
    if (str_contains($all, 'sman') || str_contains($all, 'smkn') || str_contains($all, 'sekolah') || str_contains($all, 'bimbel') || str_contains($all, 'bimbingan belajar') || str_contains($all, 'kursus')) {
        return [
            [
                'name' => 'Paket Bimbingan Belajar Intensif Mata Pelajaran',
                'description' => 'Program bimbel komprehensif Matematika, IPA, dan Bahasa Inggris dengan tentor berpengalaman dan modul lengkap.',
                'price' => 150000,
                'image' => 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Pelatihan Komputer & Keterampilan Digital Praktis',
                'description' => 'Kursus Microsoft Office, desain grafis, dan administrasi perkantoran bersertifikat resmi.',
                'price' => 200000,
                'image' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Pendaftaran Program Belajar & Konsultasi Akademik',
                'description' => 'Layanan pendaftaran siswa baru dan tes pemetaan minat bakat belajar siswa.',
                'price' => 50000,
                'image' => 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 10. MASJID / KEAGAMAAN
    if (str_contains($all, 'masjid') || str_contains($all, 'musholla') || str_contains($all, 'pesantren')) {
        return [
            [
                'name' => 'Kotak Infaq & Sedekah Kemakmuran Masjid',
                'description' => 'Penyaluran infaq untuk biaya operasional, kebersihan, dan kegiatan peribadatan jamaah masjid.',
                'price' => 20000,
                'image' => 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Penyaluran Zakat Mal & Zakat Fitrah Terpercaya',
                'description' => 'Penerimaan dan pendistribusian zakat secara amanah kepada para mustahik warga Surade yang berhak.',
                'price' => 45000,
                'image' => 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Layanan Fasilitas Akad Nikah & Bimbingan Ibadah',
                'description' => 'Pemanfaatan ruang utama masjid yang suci dan asri untuk pelaksanaan prosesi akad pernikahan syari.',
                'price' => 0,
                'image' => 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 11. ANYAMAN BAMBU & KERAJINAN TANGAN
    if (str_contains($all, 'anyaman') || str_contains($all, 'bambu') || str_contains($all, 'kerajinan')) {
        return [
            [
                'name' => 'Boboko Nasi Bambu Anyam Halus Khas Sunda',
                'description' => 'Tempat nasi tradisional dari bambu tali pilihan yang dianyam rapat dan rapi, membuat nasi tetap hangat dan pulen alami.',
                'price' => 35000,
                'image' => 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Besek Bambu Souvenir & Kotak Hantaran (Isi 10 Pcs)',
                'description' => 'Kotak besek anyaman bambu ramah lingkungan, cocok untuk wadah catering, oleh-oleh, dan bingkisan hajatan.',
                'price' => 25000,
                'image' => 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Tampah / Nyiru Bambu Tradisional Citanglar',
                'description' => 'Alat penampi beras dan penjemur makanan dari bilah bambu kokoh yang tahan lama dan tidak mudah patah.',
                'price' => 30000,
                'image' => 'https://images.unsplash.com/photo-1615865417491-9941019fbc00?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 12. BENGKEL LAS
    if (str_contains($all, 'las') || str_contains($all, 'teralis') || str_contains($all, 'pagar') || str_contains($all, 'kanopi')) {
        return [
            [
                'name' => 'Pembuatan Pagar Besi Minimalis Modern (Per Meter)',
                'description' => 'Pagar besi hollow galvanis anti karat dengan cat dasar primer dan finishing cat semprot halus nan kokoh.',
                'price' => 350000,
                'image' => 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Pemasangan Kanopi Baja Ringan & Atap Spandek',
                'description' => 'Konstruksi atap kanopi carport garasi tahan badai dengan rangka baja ringan presisi.',
                'price' => 250000,
                'image' => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Teralis Jendela Besi Tempa & Pintu Kawat Nyamuk',
                'description' => 'Pengaman jendela rumah bermotif estetik dengan bahan besi kokoh anti bobol.',
                'price' => 180000,
                'image' => 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 13. BIBIT BUAH & TANAMAN
    if (str_contains($all, 'bibit') || str_contains($all, 'durian') || str_contains($all, 'alpukat') || str_contains($all, 'buah') || str_contains($all, 'tanaman hias')) {
        return [
            [
                'name' => 'Bibit Durian Bawor Kaki Tiga Cepat Berbuah',
                'description' => 'Bibit durian bawor hasil sambung pucuk okulasi berkualitas, batang kokoh, akar kuat dan cepat panen.',
                'price' => 65000,
                'image' => 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Bibit Alpukat Mentega Super Jumbo Genjah',
                'description' => 'Pohon bibit alpukat daging tebal tanpa serat, rasa gurih legit, cocok ditanam di pekarangan maupun kebun.',
                'price' => 45000,
                'image' => 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Bibit Mangga Kiojay / Harum Manis Okulasi',
                'description' => 'Bibit buah mangga super manis dengan tinggi 60-80cm yang siap tanam langsung di lahan perkebunan.',
                'price' => 35000,
                'image' => 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 14. SATE & KAMBING & GULE
    if (str_contains($all, 'sate') || str_contains($all, 'gule') || str_contains($all, 'kambing dono') || str_contains($all, 'tongseng')) {
        return [
            [
                'name' => 'Sate Kambing Muda Bumbu Kecap Pedas (10 Tusuk)',
                'description' => 'Daging kambing muda empuk tanpa bau prengus, dibakar dengan kecap manis bumbu rempah dan taburan cabai rawit bawang merah.',
                'price' => 38000,
                'image' => 'https://images.unsplash.com/photo-1529563021893-cc83c914d73e?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Gule Kambing Kuah Santan Rempah Gurih',
                'description' => 'Olahan daging dan iga kambing berkuah santan kental dengan aroma kapulaga, cengkeh, dan kayu manis khas tradisional.',
                'price' => 28000,
                'image' => 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Sate Ayam Madura Bumbu Kacang Kental (10 Tusuk)',
                'description' => 'Daging ayam fillet gurih disiram bumbu kacang tanah sangrai yang manis dan gurih legit.',
                'price' => 20000,
                'image' => 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 15. PENGGILINGAN PADI & BERAS
    if (str_contains($all, 'penggilingan') || str_contains($all, 'padi') || (str_contains($all, 'beras') && str_contains($all, 'grosir'))) {
        return [
            [
                'name' => 'Beras Lokal Super Sosoh Pajampangan (Karung 25 Kg)',
                'description' => 'Beras putih pulen hasil gilingan gabah petani sawah Surade tanpa pemutih, tanpa pengawet, dan tanpa pewangi sintetis.',
                'price' => 340000,
                'image' => 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Jasa Giling Gabah Kering & Pemutih Beras',
                'description' => 'Layanan pemisahan sekam dan penggilingan gabah dengan mesin modern berkapasitas besar.',
                'price' => 500,
                'image' => 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Dedak / Bekatul Halus Pakan Ternak (Karung 50 Kg)',
                'description' => 'Dedak murni bergizi tinggi untuk campuran pakan ayam, bebek, dan sapi penggemukan.',
                'price' => 95000,
                'image' => 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 16. TOKO BANGUNAN & MEBEL
    if (str_contains($all, 'bangunan') || str_contains($all, 'semen') || str_contains($all, 'mebel') || str_contains($all, 'kayu jati')) {
        return [
            [
                'name' => 'Semen Portland Komposit Tiga Roda / Holcim (50 Kg)',
                'description' => 'Semen konstruksi mutu tinggi untuk plesteran, acian, dan cor beton kokoh tahan lama.',
                'price' => 68000,
                'image' => 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Pasir Cor Halus & Pasir Pasang Asli 1 Truk Colt',
                'description' => 'Pasir sungai pilihan bebas lumpur berlebih, siap kirim langsung ke lokasi proyek bangunan Anda di Surade.',
                'price' => 650000,
                'image' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Cat Tembok Rumah Interior & Eksterior (Galon 5 Kg)',
                'description' => 'Cat dinding dengan daya tutup prima, warna cerah tahan cuaca dan anti jamur.',
                'price' => 115000,
                'image' => 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 17. PETERNAKAN KAMBING / DOMBA / PAKAN
    if (str_contains($all, 'peternakan') || str_contains($all, 'domba') || str_contains($all, 'kambing') || str_contains($all, 'etawa') || str_contains($all, 'pakan ternak')) {
        return [
            [
                'name' => 'Domba & Kambing Pedaging Sehat Siap Aqiqah / Qurban',
                'description' => 'Ternak domba jantan sehat dengan bobot prima, cukup umur, dan dirawat secara higienis dengan pakan alami.',
                'price' => 2400000,
                'image' => 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Pakan Konsentrat Penggemuk Sapi & Domba (50 Kg)',
                'description' => 'Pakan formulasi tinggi protein dan energi untuk mempercepat pertumbuhan bobot ternak harian.',
                'price' => 185000,
                'image' => 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Susu Kambing Etawa Segar Murni Pasteurisasi (1 Liter)',
                'description' => 'Susu segar kaya kalsium dan nutrisi alami tanpa pemanis buatan, sangat baik untuk kesehatan pernapasan dan pencernaan.',
                'price' => 35000,
                'image' => 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 18. SALON & BARBERSHOP / PANGKAS RAMBUT
    if (str_contains($all, 'pangkas') || str_contains($all, 'barber') || str_contains($all, 'salon') || str_contains($all, 'rambut')) {
        return [
            [
                'name' => 'Potong Rambut Model Pria Modern + Cuci & Tonic',
                'description' => 'Gaya potongan rambut trendi (Fade, Undercut, Two-block) dikerjakan kapster handal dengan finishing hair tonic harum.',
                'price' => 20000,
                'image' => 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Cukur Jenggot, Kumis Rapi & Pijat Relaksasi Kepala',
                'description' => 'Perawatan cukur bersih dengan handuk hangat dan pijat leher relaksasi untuk menyegarkan badan.',
                'price' => 15000,
                'image' => 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Paket Creambath & Perawatan Rambut Rusak',
                'description' => 'Pemberian nutrisi krim lidah buaya/ginseng dan steam rambut agar rambut berkilau dan sehat.',
                'price' => 45000,
                'image' => 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 19. KONTER HP / PULSA / SERVIS LAPTOP & HP
    if (str_contains($all, 'cell') || str_contains($all, 'pulsa') || str_contains($all, 'konter') || str_contains($all, 'harddisk') || str_contains($all, 'komputer') || str_contains($all, 'laptop')) {
        return [
            [
                'name' => 'Voucher Kuota Data Internet Semua Operator (Telkomsel/Indosat/XL)',
                'description' => 'Paket kuota internet murah aktif 30 hari langsung masuk hitungan detik.',
                'price' => 35000,
                'image' => 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Jasa Ganti LCD Touchscreen HP & Servis Baterai',
                'description' => 'Perbaikan layar HP retak atau mati total dengan sparepart original bergaransi.',
                'price' => 165000,
                'image' => 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Aksesoris Charger Fast Charging & Tempered Glass',
                'description' => 'Adaptor charger type-C kuat tahan panas beserta pemasangan pelindung layar anti gores.',
                'price' => 45000,
                'image' => 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 20. PENJAHIT / BUTIK / FASHION
    if (str_contains($all, 'jahit') || str_contains($all, 'busana') || str_contains($all, 'tailor') || str_contains($all, 'konveksi')) {
        return [
            [
                'name' => 'Jasa Jahit Gamis, Kebaya & Gaun Pesta Custom',
                'description' => 'Pembuatan busana wanita dengan pola pas di badan, jahitan halus dan model sesuai permintaan.',
                'price' => 120000,
                'image' => 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Jahit Kemeja Batik & Celana Bahan Pria Formal',
                'description' => 'Jasa pembuatan kemeja kerja dan celana bahan dengan fitting presisi dan jahitan rapi.',
                'price' => 85000,
                'image' => 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Permak Pakaian Cepat (Potong Panjang & Kecilkan Ukuran)',
                'description' => 'Layanan permak celana jeans, baju, dan pasang resleting ganti baru siap dalam 1 hari.',
                'price' => 15000,
                'image' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 21. KOPI / ROASTERY / WARUNG KOPI
    if (str_contains($all, 'kopi') || str_contains($all, 'coffee') || str_contains($all, 'roastery') || str_contains($all, 'warkop')) {
        return [
            [
                'name' => 'Kopi Robusta Pajampangan Biji Sangrai (Pouch 250g)',
                'description' => 'Biji kopi pilihan petik merah khas pegunungan Buniwangi Surade disangrai fresh dengan cita rasa tebal dan aroma harum alami.',
                'price' => 35000,
                'image' => 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Kopi Bubuk Murni Giling Halus / Kasur Fresh (200g)',
                'description' => 'Kopi bubuk tanpa campuran jagung/kimia, cocok untuk seduhan kopi tubruk kental atau filter V60.',
                'price' => 28000,
                'image' => 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Es Kopi Susu Gula Aren Asli Khas Surade (Botol 250ml)',
                'description' => 'Perpaduan espresso robusta mantap dengan susu segar dan sirup gula kelapa aren murni.',
                'price' => 18000,
                'image' => 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 22. PUPUK & OBAT PERTANIAN
    if (str_contains($all, 'pupuk') || str_contains($all, 'hama') || str_contains($all, 'saprotan') || str_contains($all, 'organik')) {
        return [
            [
                'name' => 'Pupuk NPK Mutiara 16-16-16 Penyubur Tanaman (1 Kg)',
                'description' => 'Pupuk majemuk untuk mempercepat pertumbuhan tunas, bunga, dan memperbesar buah pada segala jenis tanaman.',
                'price' => 22000,
                'image' => 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Insektisida & Pembasmi Hama Ulat / Wereng Tanaman',
                'description' => 'Obat pengendali hama terbukti ampuh melindungi tanaman padi, cabai, dan sayuran dari serangan serangga perusak.',
                'price' => 45000,
                'image' => 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Pupuk Organik Kompos Matang Siap Pakai (Karung 10 Kg)',
                'description' => 'Penyubur tanah alami hasil fermentasi kotoran ternak dan mikroba menguntungkan.',
                'price' => 25000,
                'image' => 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 23. CUCI STEAM MOTOR & MOBIL
    if (str_contains($all, 'cuci motor') || str_contains($all, 'cuci steam') || str_contains($all, 'snow wash') || str_contains($all, 'cuci mobil')) {
        return [
            [
                'name' => 'Cuci Motor Snow Wash Salju + Semir Ban Mengkilap',
                'description' => 'Pencucian motor dengan sabun busa salju PH balance, membersihkan kolong mesin hingga rantai motor, plus semir ban hitam kinclong.',
                'price' => 15000,
                'image' => 'https://images.unsplash.com/photo-1520340356584-f9917d1eed6d?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Cuci Mobil Komplit Bodi + Kolong Hidrolik & Vacuum Interior',
                'description' => 'Pembersihan mobil menyeluruh dengan mesin hidrolik, sedot debu karpet interior, dan pengharum kabin mobil.',
                'price' => 50000,
                'image' => 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Paket Poles Bodi & Pengkilap Cat Kendaraan Anti Kusam',
                'description' => 'Pembersihan baret halus dan pemberian wax pelindung cat agar bodi kendaraan berkilau seperti baru.',
                'price' => 75000,
                'image' => 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 24. IKAN BAKAR & RESTORAN SEAFOOD
    if (str_contains($all, 'ikan bakar') || str_contains($all, 'seafood') || str_contains($all, 'nelayan') || str_contains($all, 'pelelangan ikan')) {
        return [
            [
                'name' => 'Paket Ikan Bakar Gurame / Kakap Cobek Khas Surade',
                'description' => 'Ikan segar laut langsung dibakar dengan bumbu rempah tradisional dan sambal cobek terasi segar pedas gurih mantap.',
                'price' => 45000,
                'image' => 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Cumi Goreng Tepung Renyah & Udang Bakar Madu',
                'description' => 'Olahan seafood segar laut selatan Sukabumi berbalut tepung renyah dengan saus asam manis pedas.',
                'price' => 38000,
                'image' => 'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Ikan Laut Segar Hasil Tangkapan Nelayan (Per Kg)',
                'description' => 'Ikan tongkol, bawal, cakalang dan kakap merah segar langsung dari dermaga pendaratan ikan.',
                'price' => 32000,
                'image' => 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 25. BIBIT IKAN AIR TAWAR
    if (str_contains($all, 'bibit ikan') || str_contains($all, 'nila') || str_contains($all, 'lele') || str_contains($all, 'kolam')) {
        return [
            [
                'name' => 'Bibit Ikan Nila Hitam / Merah Super (Isi 100 Ekor)',
                'description' => 'Benih bibit ikan nila sehat, lincah, tahan penyakit dan cepat besar untuk budidaya kolam tanah maupun terpal.',
                'price' => 40000,
                'image' => 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Bibit Ikan Lele Sangkuriang Ukuran 5-7 cm (Isi 200 Ekor)',
                'description' => 'Bibit lele unggul daya tahan tinggi siap tebar dengan tingkat pertumbuhan bobot merata.',
                'price' => 50000,
                'image' => 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Pelet Pakan Ikan Terapung Protein Tinggi (10 Kg)',
                'description' => 'Pakan pelet apung kaya nutrisi protein 30% untuk memacu pertumbuhan ikan air tawar secara maksimal.',
                'price' => 125000,
                'image' => 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 26. TOKO PANCING
    if (str_contains($all, 'pancing') || str_contains($all, 'umpan')) {
        return [
            [
                'name' => 'Joran Pancing Fiber Carbon Kuat Laut & Sungai',
                'description' => 'Joran pancing fleksibel dan tangguh mampu menahan tarikan ikan besar hingga 15 Kg.',
                'price' => 175000,
                'image' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Reel Pancing Spinning Smooth Bearing Anti Korosi',
                'description' => 'Reel pemutar senar dengan putaran halus dan sistem drag presisi untuk mancing kolam maupun laut.',
                'price' => 145000,
                'image' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Paket Mata Kail, Senar Kuat & Essen Umpan Pancing',
                'description' => 'Perlengkapan mancing komplit berisi kotak kail berbagai ukuran, timah pemberat, pelampung dan essen aroma pancing.',
                'price' => 35000,
                'image' => 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 27. WISATA / CURUG CIKASO / ALAM
    if (str_contains($all, 'curug') || str_contains($all, 'cikaso') || str_contains($all, 'pantai') || str_contains($all, 'wisata')) {
        return [
            [
                'name' => 'Tiket Masuk Kawasan Wisata Curug Cikaso Surade',
                'description' => 'Tiket resmi kunjungan menikmati keindahan pesona tiga air terjun megah Curug Cikaso yang masih sangat alami.',
                'price' => 15000,
                'image' => 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Sewa Perahu Tradisional Susur Sungai Cikaso (PP)',
                'description' => 'Sensasi naik perahu motor menyusuri keindahan sungai berair hijau toska menuju dasar air terjun.',
                'price' => 60000,
                'image' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Jasa Pemandu Wisata Lokal (Tour Guide) & Spot Foto',
                'description' => 'Pendampingan pemandu ramah yang mengetahui rute terbaik dan spot foto instagramable di sekitar wisata.',
                'price' => 75000,
                'image' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 28. MADU HUTAN
    if (str_contains($all, 'madu') || str_contains($all, 'odeng')) {
        return [
            [
                'name' => 'Madu Hutan Liar Odeng Asli Pajampangan (Botol 500ml)',
                'description' => 'Madu murni alami hasil unduh sarang lebah hutan liar pohon tinggi tanpa pemanasan kimia (raw honey) penuh enzim penyembuh.',
                'price' => 95000,
                'image' => 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Sarang Madu Asli Honeycomb Segar (Box 250g)',
                'description' => 'Potongan sarang lebah asli berisi madu kental manis yang lumer di mulut dan kaya propolis alami.',
                'price' => 65000,
                'image' => 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Madu Ternak Bunga Randu Murni (Botol 650ml)',
                'description' => 'Madu nektar bunga randu dengan rasa manis lembut yang sangat disukai anak-anak dan orang tua.',
                'price' => 75000,
                'image' => 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 29. SEDOT WC
    if (str_contains($all, 'sedot') || str_contains($all, 'septic') || str_contains($all, 'wc') || str_contains($all, 'mampet')) {
        return [
            [
                'name' => 'Layanan Sedot WC & Kuras Septic Tank Rumah Tangga',
                'description' => 'Jasa sedot tinja profesional bersih tanpa bau, armada tangki modern dengan selang panjang menjangkau hingga ke dalam gang.',
                'price' => 350000,
                'image' => 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Pelancaran Saluran Pipa Mampet & Wastafel Mesin Spiral',
                'description' => 'Solusi cepat pipa paralon tersumbat lemak / sampah tanpa perlu membongkar lantai rumah.',
                'price' => 200000,
                'image' => 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Kuras Limbah Septic Tank Restoran & Penginapan',
                'description' => 'Paket perawatan rutin kuras limbah grease trap usaha komersial di seluruh wilayah Surade.',
                'price' => 500000,
                'image' => 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 30. BAKSO & MIE AYAM & KULINER UMUM
    if (str_contains($all, 'bakso') || str_contains($all, 'mie ayam') || str_contains($all, 'makan') || str_contains($all, 'warung') || str_contains($all, 'resto') || str_contains($all, 'nasi liwet')) {
        return [
            [
                'name' => 'Bakso Sapi Urat Super Kuah Sumsum Gurih',
                'description' => 'Bakso daging sapi asli dengan urat kenyal dan kuah kaldu rempah gurih disajikan dengan mie, bihun, dan tahu.',
                'price' => 22000,
                'image' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Mie Ayam Bakso Pangsit Spesial',
                'description' => 'Mie kenyal gurih dengan topping ayam cincang bumbu kecap manis gurih, taburan daun bawang dan pangsit renyah.',
                'price' => 18000,
                'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Paket Nasi Timbel Komplit Ayam Goreng & Sambal Dadak',
                'description' => 'Nasi timbel wangi bungkus daun pisang, ayam goreng renyah, tahu tempe, lalapan segar dan sambal terasi pedas nampol.',
                'price' => 28000,
                'image' => 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 31. BENGKEL MOTOR & MOBIL
    if (str_contains($all, 'bengkel') || str_contains($all, 'motor') || str_contains($all, 'ahass') || str_contains($all, 'yamaha') || str_contains($all, 'honda')) {
        return [
            [
                'name' => 'Paket Servis Rutin Tune-Up & Ganti Oli Mesin',
                'description' => 'Pembersihan ruang bakar/injeksi, cek sistem pengereman, rantai, kelistrikan dan oli mesin berkualitas untuk motor tarikan enteng.',
                'price' => 65000,
                'image' => 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Ganti Ban Tubeless Motor Segala Ukuran + Pasang Hidrolik',
                'description' => 'Tersedia berbagai pilihan ban motor matic dan bebek (IRC, Maxxis, FDR) dengan pemasangan presisi.',
                'price' => 185000,
                'image' => 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=75',
            ],
            [
                'name' => 'Servis CVT Matic & Pembersihan Throttle Body Injeksi',
                'description' => 'Perawatan transmisi matic agar tarikan enteng bebas gredek dan konsumsi bensin hemat.',
                'price' => 75000,
                'image' => 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=75',
            ],
        ];
    }

    // 32. SEMBAKO / MINIMARKET / KELONTONG (DEFAULT RETAIL)
    return [
        [
            'name' => 'Paket Sembako Hemat Keluarga (Beras, Minyak & Gula)',
            'description' => 'Paket kebutuhan pokok harian berisi Beras 2.5kg, Minyak Goreng 1 Liter, Gula Pasir 1kg dan Teh Celup.',
            'price' => 65000,
            'image' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=75',
        ],
        [
            'name' => 'Minyak Goreng Kemasan Pouch (2 Liter)',
            'description' => 'Minyak goreng kelapa sawit jernih berkualitas tinggi untuk memasak renyah higienis.',
            'price' => 36000,
            'image' => 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=600&q=75',
        ],
        [
            'name' => 'Telur Ayam Ras Segar Peternakan Lokal (1 Kg)',
            'description' => 'Telur ayam fresh panen setiap hari dengan cangkang tebal dan kualitas gizi terjamin.',
            'price' => 29000,
            'image' => 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=75',
        ],
    ];
}

$businesses = Business::with('category')->get();
echo "Re-seeding and fixing products for " . $businesses->count() . " businesses...\n";

$updatedCount = 0;
$createdCount = 0;

foreach ($businesses as $biz) {
    $productsData = getContextualProductsForBusiness($biz);
    $existingProducts = Product::where('business_id', $biz->id)->get();

    for ($i = 0; $i < 3; $i++) {
        $pData = $productsData[$i];
        if (isset($existingProducts[$i])) {
            $prod = $existingProducts[$i];
            $prod->update([
                'name' => $pData['name'],
                'description' => $pData['description'],
                'price' => $pData['price'],
                'image' => $pData['image'],
                'is_active' => true,
                'status' => 'approved',
                'updated_at' => now(),
            ]);
            $updatedCount++;
        } else {
            Product::create([
                'business_id' => $biz->id,
                'name' => $pData['name'],
                'description' => $pData['description'],
                'price' => $pData['price'],
                'image' => $pData['image'],
                'is_active' => true,
                'status' => 'approved',
            ]);
            $createdCount++;
        }
    }

    // Delete any excess dummy products beyond 3
    if ($existingProducts->count() > 3) {
        Product::where('business_id', $biz->id)->whereNotIn('id', $existingProducts->take(3)->pluck('id'))->delete();
    }
}

echo "FINISHED! Updated $updatedCount products, created $createdCount products.\n";
