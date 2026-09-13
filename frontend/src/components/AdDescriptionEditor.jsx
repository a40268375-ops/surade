import { Editor } from "@tinymce/tinymce-react";

/**
 * Editor deskripsi iklan berbasis TinyMCE - dipakai di form
 * "Pasang Iklan Baru" pada Dashboard (menggantikan textarea polos yang
 * sebelumnya dipakai).
 *
 * Ini pakai TinyMCE versi SELF-HOSTED (bukan versi cloud tiny.cloud),
 * jadi TIDAK butuh API key dan TIDAK ada nag/watermark "This domain is
 * not registered". Supaya ini bisa jalan, ada 2 langkah setup yang wajib
 * dilakukan SEKALI SAJA (lihat PANDUAN-PERBAIKAN.md untuk detailnya):
 *
 *   1) Install package-nya:
 *        npm install tinymce @tinymce/tinymce-react
 *      (sudah otomatis tertulis di package.json yang saya kirimkan,
 *      tinggal jalankan `npm install` di folder frontend)
 *
 *   2) Pastikan vite.config.js memakai plugin vite-plugin-static-copy
 *      (sudah saya siapkan di file vite.config.js yang saya kirimkan)
 *      supaya folder node_modules/tinymce disalin otomatis ke
 *      /tinymce, dan baris tinymceScriptSrc di bawah ini bisa memuat
 *      /tinymce/tinymce.min.js.
 */
export default function AdDescriptionEditor({ value, onChange }) {
  return (
    <Editor
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      licenseKey="gpl"
      value={value}
      onEditorChange={(content) => onChange(content)}
      init={{
        height: 260,
        menubar: false,
        branding: false,
        statusbar: false,
        plugins: ["lists", "link", "autolink"],
        toolbar: "bold italic underline | bullist numlist | link | removeformat",
        placeholder: "Deskripsikan produk atau layanan Anda dengan menarik...",
        content_style: "body { font-family: Inter, system-ui, sans-serif; font-size: 14px; color: #1f2937; }",
      }}
    />
  );
}