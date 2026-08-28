<?php

namespace App\Console\Commands;

use App\Models\Category;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * PENYEBAB BUG "kategori beda-beda antar halaman":
 * Project ini pernah menjalankan 2 seeder kategori yang berbeda
 * (CategorySeeder.php dan CategoriesWithSubcategoriesSeeder.php), yang
 * masing-masing punya daftar kategori utama yang tumpang tindih tapi tidak
 * identik (mis. "Rekreasi & Hiburan" vs "Hiburan & Rekreasi",
 * "Kesehatan & Kecantikan" vs "Kesehatan", dst). Karena nama & slug-nya
 * beda, keduanya tersimpan sebagai baris kategori yang TERPISAH di
 * database - bukan 1 sumber data yang konsisten seperti yang seharusnya.
 * Semua halaman (Navbar, halaman Kategori, Dashboard, Search) sebenarnya
 * SUDAH mengambil dari API /categories yang sama, jadi bug-nya bukan di
 * kode frontend, tapi di data-nya sendiri yang bercampur.
 *
 * Command ini menyatukan kategori "kembar" itu ke 1 kategori kanonik
 * (daftar 13 kategori utama dari CategorySeeder.php, yang dipakai menu
 * Informasi & form Daftar Bisnis), TANPA menghapus data - subkategori dan
 * bisnis yang tadinya nempel di kategori duplikat, dipindah (bukan
 * dihapus) ke kategori kanonik yang sepadan.
 */
class ReconcileCategoriesCommand extends Command
{
    protected $signature = 'categories:reconcile {--dry-run : Cuma tampilkan apa yang AKAN dilakukan, tanpa mengubah database}';

    protected $description = 'Menyatukan kategori utama yang dobel/tidak konsisten (akibat 2 seeder berbeda) ke 1 daftar kategori kanonik, tanpa kehilangan data bisnis/subkategori.';

    /**
     * Peta "nama kategori duplikat yang pernah ke-seed" => "nama kategori
     * kanonik yang benar (dari CategorySeeder.php)". Kalau ada kategori
     * utama di database dengan nama persis salah satu KEY di sini, semua
     * subkategori & bisnis di bawahnya dipindah ke kategori kanonik yang
     * jadi VALUE-nya, lalu baris duplikatnya dihapus.
     */
    private array $aliasMap = [
        'Hiburan & Rekreasi' => 'Rekreasi & Hiburan',
        'Hotel & Penginapan' => 'Rekreasi & Hiburan',
        'Kesehatan & Kecantikan' => 'Kesehatan',
        'Keuangan & Asuransi' => 'Perkantoran',
        'Makanan & Minuman' => 'Bisnis & Market',
        'Retail & Belanja' => 'Bisnis & Market',
        'Properti & Konstruksi' => 'Bisnis & Market',
        'Transportasi' => 'Otomotif',
    ];

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $mode = $dryRun ? '[DRY RUN - tidak ada perubahan disimpan]' : '[LIVE - perubahan akan disimpan]';
        $this->info("Mulai reconcile kategori... $mode");

        $movedBusinesses = 0;
        $movedChildren = 0;
        $deletedDuplicates = 0;

        foreach ($this->aliasMap as $duplicateName => $canonicalName) {
            $duplicate = Category::where('name', $duplicateName)->whereNull('parent_id')->first();
            if (!$duplicate) {
                continue; // duplikat ini memang tidak ada di database - aman, lanjut
            }

            $canonical = Category::where('name', $canonicalName)->whereNull('parent_id')->first();
            if (!$canonical) {
                // Kategori kanoniknya sendiri belum ada - buat dulu (harusnya
                // sudah ada dari CategorySeeder, tapi jaga-jaga).
                $this->warn("Kategori kanonik \"$canonicalName\" belum ada, membuatnya dulu.");
                if (!$dryRun) {
                    $canonical = Category::create([
                        'name' => $canonicalName,
                        'slug' => Str::slug($canonicalName),
                        'icon' => 'tag',
                        'status' => 'active',
                    ]);
                }
            }

            $this->line("- \"$duplicateName\" (id={$duplicate->id}) -> digabung ke \"$canonicalName\"" . ($canonical ? " (id={$canonical->id})" : ''));

            // Pindahkan subkategori (anak) milik kategori duplikat.
            $children = Category::where('parent_id', $duplicate->id)->get();
            foreach ($children as $child) {
                $this->line("    subkategori \"{$child->name}\" dipindah ke bawah \"$canonicalName\"");
                $movedChildren++;
                if (!$dryRun && $canonical) {
                    $child->update(['parent_id' => $canonical->id]);
                }
            }

            // Pindahkan bisnis yang pakai kategori duplikat ini langsung.
            $businessCount = DB::table('businesses')->where('category_id', $duplicate->id)->count();
            if ($businessCount > 0) {
                $this->line("    $businessCount bisnis dipindah ke \"$canonicalName\"");
                $movedBusinesses += $businessCount;
                if (!$dryRun && $canonical) {
                    DB::table('businesses')->where('category_id', $duplicate->id)->update(['category_id' => $canonical->id]);
                }
            }

            if (!$dryRun) {
                $duplicate->delete();
            }
            $deletedDuplicates++;
        }

        $this->newLine();
        $this->info("Selesai. Kategori duplikat digabung: $deletedDuplicates, subkategori dipindah: $movedChildren, bisnis dipindah: $movedBusinesses.");

        if ($dryRun) {
            $this->comment('Ini baru simulasi. Jalankan tanpa --dry-run untuk benar-benar menerapkan perubahan.');
        }

        return self::SUCCESS;
    }
}