import { useEffect, useState } from "react";

/**
 * usePageLoading
 * -----------------------------------------------------------------------
 * Hook sederhana untuk menampilkan loading screen sesaat setiap kali
 * sebuah halaman pertama kali dibuka (mount), untuk halaman yang tidak
 * mengambil data dari API (halaman statis seperti About, Terms, dll).
 *
 * Untuk halaman yang SUDAH punya state `loading` sendiri dari hasil
 * fetch API (misalnya Home.jsx, Category.jsx, Dashboard.jsx), tidak perlu
 * pakai hook ini — cukup pakai state loading yang sudah ada.
 *
 * @param {number} delay - lama loading screen ditampilkan (ms)
 */
export function usePageLoading(delay = 500) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return loading;
}
