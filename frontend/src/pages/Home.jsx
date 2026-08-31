import { useState, useRef, useEffect } from "react";
  import { Link, useNavigate } from "react-router-dom";
  import api, { getImageUrl } from "../utils/api";
  import { useAuth } from "../context/AuthContext";
  import { DEFAULT_CATEGORY_TABS, iconForCategory } from "../utils/categoryIcons.jsx";
  import "./Home.css";
  import Navbar from "../components/Navbar";
  import SearchBar from "../components/SearchBar";
  import { SMART_CITIES } from "../data/smartCities";
  import { DESA_LIST } from "../data/desaList";
  import logoImg from "../assets/logo.png";
  import waterfallImg from "../assets/waterfall.jpg";
  import Loading from "../components/Loading";
  import {
    Store,
    Coffee,
    Smartphone,
    Shirt,
    Wrench,
    Building2,
    Camera,
    Fuel,
    Car,
    GraduationCap,
    Heart,
    Music,
    Users,
    Info,
    MapPin,
    Search,
    ChevronDown,
    Bookmark,
    Eye,
    BadgeCheck,
    Tag,
    Star,
    ChevronDown as ChevronDownIcon,
    ChevronLeft,
    ChevronRight,
    Pointer,
    Rocket,
    BookOpen,
    User,
    Calendar,
    Sparkles,
    ArrowUpRight,
  } from "lucide-react";

  /* ── Daftar Desa/Kelurahan Kecamatan Surade (dropdown Lokasi) ── */
  const KOTA_INDONESIA = DESA_LIST;

  /* ── Category tabs ── */
  const CATEGORIES = DEFAULT_CATEGORY_TABS;

  /* ── Jumlah kartu "Temukan Tempat Baru" yang tampil di beranda sebelum
        tombol "Lihat Semua Usaha" (sisanya ada di halaman /category/all) ── */
  const TEMUKAN_DISPLAY_LIMIT = 6;

  /* ── Mock business data ── */
  const BISNIS_DATA = [
    {
      id: 1, name: "Amel Irwanto cake", category: "Pertokoan",
      tags: ["Amel irwanto cake"], location: "Kabupaten Bogor",
      views: "Pratinjau", status: "Buka Sekarang",
      img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=250&fit=crop",
      seller: { id: 1, name: "Amel Irwanto", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face", rating: 4.8 },
    },
    {
      id: 2, name: "Warung Makan Sederhana", category: "Cafe & Restaurant",
      tags: ["Warung makan", "Nasi padang"], location: "Kota Bogor",
      views: "Pratinjau", status: "Buka Sekarang",
      img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=250&fit=crop",
      seller: { id: 2, name: "Budi Santoso", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face", rating: 4.6 },
    },
    {
      id: 3, name: "Toko Elektronik Jaya", category: "Elektronik & Gadget",
      tags: ["Handphone", "Aksesoris"], location: "Kabupaten Bogor",
      views: "Pratinjau", status: "Buka Sekarang",
      img: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=400&h=250&fit=crop",
      seller: { id: 3, name: "Jaya Electronic", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face", rating: 4.7 },
    },
    {
      id: 4, name: "Salon & Spa Cantik", category: "Pertokoan",
      tags: ["Salon", "Perawatan"], location: "Kota Depok",
      views: "Pratinjau", status: "Buka Sekarang",
      img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=250&fit=crop",
      seller: { id: 4, name: "Sari Cantika", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face", rating: 4.9 },
    },
    {
      id: 5, name: "Bengkel Motor Makmur", category: "Servis & Tukang",
      tags: ["Bengkel", "Motor", "Oli"], location: "Kabupaten Bekasi",
      views: "Pratinjau", status: "Buka Sekarang",
      img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
      seller: { id: 5, name: "Pak Makmur", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=32&h=32&fit=crop&crop=face", rating: 4.5 },
    },
    {
      id: 6, name: "Wisata Alam Puncak", category: "Wisata",
      tags: ["Wisata", "Alam", "Liburan"], location: "Kabupaten Bogor",
      views: "Pratinjau", status: "Buka Sekarang",
      img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
      seller: { id: 6, name: "Tour Puncak", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face", rating: 4.4 },
    },
  ];

  /* ── Data kota Smart City sekarang diimpor dari src/data/smartCities.js
     supaya selalu sinkron dengan halaman SmartCity.jsx ── */


  /* ── Ads/Iklan data ── */
  const ADS_DATA = [
    {
      id: 1, businessId: 1, img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=400&fit=crop",
      name: "Amel Irwanto cake", desc: "Kue lezat berkualitas tinggi untuk momen istimewa Anda"
    },
    {
      id: 2, businessId: 2, img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop",
      name: "Warung Makan Sederhana", desc: "Masakan Padang autentik dengan cita rasa tradisional"
    },
    {
      id: 3, businessId: 3, img: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&h=400&fit=crop",
      name: "Toko Elektronik Jaya", desc: "Gadget terbaru dan aksesoris terlengkap bergaransi"
    },
    {
      id: 4, businessId: 4, img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=400&fit=crop",
      name: "Salon & Spa Cantik", desc: "Perawatan kecantikan premium dan spa relaksasi terbaik"
    },
  ];

  /* ── How it works steps ── */
  const QUICK_STEPS = [
    { num: "1", title: "Ketik Kata Kunci", desc: "Pemilihan kata kunci akan mempercepat dalam pencarian." },
    { num: "2", title: "Ketik Lokasi", desc: "Anda dapat menemukan lokasi secara mudah dengan mengetik daerah yang Anda cari." },
    { num: "3", title: "Temukan Pencarian", desc: "Penuhi semua keperluan dan kebutuhan Anda." },
  ];

  /* ── Temukan Tempat Baru data ── */
  const TEMUKAN_DATA = [
    {
      id: 101, name: "Global Bakery Leuwiliang", category: "Pertokoan", categoryColor: "#10b981",
      tags: ["Global Bakery Leuwiliang"], location: "Kabupaten Bogor", open: true,
      img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=240&fit=crop",
    },
    {
      id: 102, name: "TK Triwala", category: "Yayasan", categoryColor: "#f59e0b",
      tags: ["Tk Triwala"], location: "Kuningan", open: false,
      img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=240&fit=crop",
    },
    {
      id: 103, name: "Bunda Diana", category: "Pertokoan", categoryColor: "#10b981",
      tags: ["Bunda Diana"], location: "Kabupaten Bogor", open: true,
      img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=240&fit=crop",
    },
    {
      id: 104, name: "Rumah Makan Athiam", category: "Cafe & Restaurant", categoryColor: "#0ea5e9",
      tags: ["Rumah Makan Athiam"], location: "Sukabumi", open: true,
      img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=240&fit=crop",
    },
    {
      id: 105, name: "Rumah Makan Cikole Sukabumi", category: "Cafe & Restaurant", categoryColor: "#0ea5e9",
      tags: ["Rumah Makan Cikole Sukabumi"], location: "Sukabumi", open: true,
      img: "https://images.unsplash.com/photo-1550966871-3ed3cbe818b5?w=400&h=240&fit=crop",
    },
    {
      id: 106, name: "Toko Kue Ibu Nanih", category: "Pertokoan", categoryColor: "#10b981",
      tags: ["Toko Kue Ibu Nanih"], location: "Kabupaten Bogor", open: true,
      img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=240&fit=crop",
    },
    {
      id: 107, name: "Kantor Kecamatan Sawangan", category: "Kantor Pemerintah", categoryColor: "#10b981",
      tags: ["Kantor Kecamatan Sawangan"], location: "Depok", open: true,
      img: "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=400&h=240&fit=crop",
    },
    {
      id: 108, name: "Kantor Kecamatan Sawangan", category: "Kantor Pemerintah", categoryColor: "#10b981",
      tags: ["Kantor Kecamatan Sawangan"], location: "Depok", open: true,
      img: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=240&fit=crop",
    },
    {
      id: 109, name: "Amel Irwanto cake", category: "Pertokoan", categoryColor: "#10b981",
      tags: ["Amel irwanto cake"], location: "Kabupaten Bogor", open: true,
      img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=240&fit=crop",
    },
  ];

  /* ── Testimonials data ── */
  const TESTIMONIALS_DATA = [
    {
      id: 1,
      name: "Nindi Afrilia",
      role: "Marketing Executive",
      text: "Dengan adanya Surade.co.id cukup membantu untuk memudahkan melakukan pencarian yang ada di Indonesia",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop",
    },
    {
      id: 2,
      name: "Putri Indah lestari",
      role: "Research and Development",
      text: "What i liked most about the service was the consistent high quality service, which was excelent and friendly. Overall very satusfied with the programs.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop",
    },
    {
      id: 3,
      name: "Algi Triana",
      role: "Design Freelancer",
      text: "Keren... baru sehari dicek di google analytic sudah masuk beberapa session referal dari satujutalink.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
    },
    {
      id: 4,
      name: "Fajar Septiawan",
      role: "Bussines Development",
      text: "Excellent !! This web-based information system helps the user in finding a variety of information, especially travel information with......Selengkapnya",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop",
    },
  ];

  /* ── Key Features data ── */
  const FEATURES_DATA = [
    {
      id: 1,
      title: "Pencarian Akurat",
      text: "Memudahkan pencarian pelaku usaha dan UMKM dengan pencarian yang akurat",
      icon: <MapPin size={24} />,
    },
    {
      id: 2,
      title: "Hanya Satu Kali Klik",
      text: "Hanya dengan satu kali klik 'One Click Service' langsung terhubung dengan Whatsapp pelaku usaha",
      icon: <Pointer size={24} />,
    },
    {
      id: 3,
      title: "Cepat dan Mudah",
      text: "Mudah didaftarkan hanya melalui whatsapp, cepat dalam penayangan iklan usaha",
      icon: <Rocket size={24} />,
    },
    {
      id: 4,
      title: "Kontak Langsung",
      text: "Anda dapat menghubungi dan mendatangi pelaku usaha secara langsung tanpa perantara",
      icon: <BookOpen size={24} />,
    },
  ];

  /* ── Blog/Experience data ── */
  const BLOG_DATA = [
    {
      id: 1,
      category: "Umum",
      title: "Cucurak Khas Bogor, sambut Bulan Ramadhan",
      author: "Hikmah Yusila",
      date: "15 Agustus 2017",
      img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=260&fit=crop",
    },
    {
      id: 2,
      category: "Budaya",
      title: "Tradisi Grebeg Gethuk di Kota Magelang",
      author: "Hikmah Yusila",
      date: "16 Februari 2017",
      img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=260&fit=crop",
    },
    {
      id: 3,
      category: "Kuliner",
      title: "Pasar Tiban Pahingan Magelang, Destinasi Wisata Kuliner Sambil Mendengarkan Pengajian",
      author: "Hikmah Yusila",
      date: "16 Februari 2017",
      img: "https://images.unsplash.com/photo-1572285870954-7b08e56f4c58?w=400&h=260&fit=crop",
    },
  ];

  export default function Home() {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const [selectedKota, setSelectedKota] = useState(DESA_LIST[0] || "Kelurahan Surade");
    const [kotaSearch, setKotaSearch] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState("all");
    const [saved, setSaved] = useState({}); // { [businessId]: savedRecordId }
    const [savingIds, setSavingIds] = useState({});
    const [bounceCounts, setBounceCounts] = useState({});
    const [selectedCity, setSelectedCity] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedSearchCategory, setSelectedSearchCategory] = useState("all");
    const [keywordDropdownOpen, setKeywordDropdownOpen] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    // PERBAIKAN: carousel iklan ditulis ulang jadi "peek carousel" satu
    // slide besar per tampilan (seperti banner KIOSGAMER contoh gambar) -
    // sebelumnya 3 kartu kecil sekaligus per tampilan, jadi kurang mirip
    // dengan animasi banner besar yang diminta. currentAdIndex sekarang
    // adalah index di ARRAY YANG SUDAH DIPERPANJANG (extendedAds, lihat di
    // bawah): dimulai dari 1 supaya slide pertama yang asli langsung
    // tampil, dengan 1 kloning di awal & 1 kloning di akhir supaya animasi
    // geser kiri/kanan terasa "tak berujung" (infinite loop), bukan
    // berhenti mentok di ujung.
    const [currentAdIndex, setCurrentAdIndex] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    // Dipakai untuk mematikan animasi transform SEBENTAR SAJA pas carousel
    // "melompat diam-diam" dari kloning terakhir/pertama kembali ke slide
    // asli - kalau tidak, lompatan itu akan kelihatan sebagai slide yang
    // tiba-tiba geser jauh ke arah berlawanan.
    const [adTransitionEnabled, setAdTransitionEnabled] = useState(true);
    const carouselTrackRef = useRef(null);
    // Carousel Bisnis Premium: lebih sederhana dari carousel iklan di
    // atas - cuma scroll horizontal biasa yang digeser tombol panah
    // kiri/kanan (atau digeser jari/kursor langsung di HP/trackpad),
    // bukan animasi "peek slide" 1-per-1 seperti iklan.
    const premiumScrollRef = useRef(null);
    const dropdownRef = useRef(null);
    const keywordDropdownRef = useRef(null);

    // Dynamic API state
    const [dbBusinesses, setDbBusinesses] = useState([]);
    const [dbCategories, setDbCategories] = useState([]);
    const [dbAds, setDbAds] = useState([]);
    const [dbEvents, setDbEvents] = useState([]);
    const [dbBlogs, setDbBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(false);

    // Muat daftar bisnis yang sudah disimpan user, supaya ikon "Simpan"
    // langsung kelihatan aktif untuk bisnis yang sebelumnya sudah disimpan.
    useEffect(() => {
      if (!authUser) {
        setSaved({});
        return;
      }
      let cancelled = false;
      api.get("/my-saved-businesses")
        .then((rows) => {
          if (cancelled) return;
          const map = {};
          (rows || []).forEach((row) => {
            const bizId = row.business_id || row.business?.id;
            if (bizId) map[bizId] = row.id;
          });
          setSaved(map);
        })
        .catch(() => {});
      return () => { cancelled = true; };
    }, [authUser]);

    useEffect(() => {
      window.scrollTo(0, 0);
      const history = JSON.parse(localStorage.getItem("search_history") || "[]");
      setSearchHistory(history);

      async function loadData() {
        try {
          const feed = await api.get('/home-feed');
          if (feed) {
            if (feed.businesses) setDbBusinesses(feed.businesses);
            if (feed.categories) setDbCategories(feed.categories);
            if (feed.advertisements) setDbAds(feed.advertisements);
            if (feed.events) setDbEvents(feed.events);
            if (feed.blogs) setDbBlogs(Array.isArray(feed.blogs) ? feed.blogs : []);
            setApiError(false);
            setLoading(false);
            api.post('/track-view', { path: '/' }).catch(() => {});
            return;
          }
        } catch (feedErr) {
          console.warn("Home feed endpoint fallback:", feedErr);
        }

        // Fallback if home-feed is unavailable
        const [busRes, catRes, adsRes, eventsRes, blogRes] = await Promise.allSettled([
          api.get('/businesses'),
          api.get('/categories'),
          api.get('/advertisements'),
          api.get('/events'),
          api.get('/blogs'),
        ]);

        if (busRes.status === 'fulfilled') setDbBusinesses(busRes.value);
        if (catRes.status === 'fulfilled') setDbCategories(catRes.value);
        if (adsRes.status === 'fulfilled') setDbAds(adsRes.value);
        if (eventsRes.status === 'fulfilled') setDbEvents(eventsRes.value);
        if (blogRes.status === 'fulfilled') {
          setDbBlogs(Array.isArray(blogRes.value) ? blogRes.value : []);
        }

        const failed = [busRes, catRes, adsRes, eventsRes, blogRes].filter(
          (r) => r.status === 'rejected'
        );
        failed.forEach((r) => console.error("Gagal memuat data dari API", r.reason));

        const hasNetworkError = failed.some((r) => r.reason?.isNetworkError);
        setApiError(hasNetworkError);

        api.post('/track-view', { path: '/' }).catch(() => {});
        setLoading(false);
      }
      loadData();
    }, []);

    useEffect(() => {
      function handleClickOutside(e) {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
          setDropdownOpen(false); setKotaSearch("");
        }
        if (keywordDropdownRef.current && !keywordDropdownRef.current.contains(e.target)) {
          setKeywordDropdownOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchHistory]);

    useEffect(() => {
      const interval = setInterval(() => {
        setAdTransitionEnabled(true);
        setCurrentAdIndex((prev) => prev + 1);
      }, 5000);
      return () => clearInterval(interval);
    }, [dbAds, dbBusinesses]);

    // Kalau transisi baru saja dimatikan (habis "lompat diam-diam" di
    // onTransitionEnd track), nyalakan lagi di frame render berikutnya
    // supaya pergerakan slide SESUDAHNYA tetap animasi halus seperti biasa.
    useEffect(() => {
      if (adTransitionEnabled) return;
      const raf = requestAnimationFrame(() => setAdTransitionEnabled(true));
      return () => cancelAnimationFrame(raf);
    }, [adTransitionEnabled]);

    // Small UI effects: reveal timeline items and video, and typing heading
    // PERBAIKAN: sebelumnya efek ini nyari elemen ".tl-item"/".video-col"
    // pakai document.querySelectorAll di dalam useEffect ber-dependency
    // kosong ([]). Masalahnya, komponen Home ini punya "if (loading) return
    // <Loading />" SEBELUM bagian JSX yang berisi section ini - jadi pas
    // render PERTAMA kali (masih loading), section timeline & video-nya
    // belum ada sama sekali di DOM (yang tampil cuma <Loading/>).
    // querySelectorAll otomatis dapat HASIL KOSONG, dan karena
    // dependency-nya [], efeknya TIDAK PERNAH JALAN LAGI walau nanti
    // loading selesai dan section aslinya baru muncul - alhasil class "in"
    // yang bikin item & video kelihatan (opacity:1) tidak pernah
    // ditambahkan, jadi timeline & video-nya tetap kosong/tidak kelihatan
    // selamanya. Sekarang pakai ref React (bukan query DOM manual) dan
    // efeknya diberi dependency [loading], supaya otomatis dicoba ulang
    // begitu loading selesai dan elemennya benar-benar sudah ada.
    const tlItemRefs = useRef([]);
    const videoColRef = useRef(null);
    const typedRef = useRef(false);
    useEffect(() => {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in');
        });
      }, { threshold: 0.25 });

      tlItemRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.transitionDelay = (i * 0.12) + 's';
        io.observe(el);
      });

      if (videoColRef.current) io.observe(videoColRef.current);

      return () => io.disconnect();
    }, [loading]);

    useEffect(() => {
      const fullText = "Cepat dan Memudahkan Pencarian";
      const typedEl = document.getElementById('typedText');
      const cursorEl = document.querySelector('.type-cursor');
      if (!typedEl) return;

      const headingIo = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !typedRef.current) {
            typedRef.current = true;
            let i = 0;
            typedEl.textContent = '';
            const timer = setInterval(() => {
              typedEl.textContent += fullText.charAt(i);
              i++;
              if (i >= fullText.length) {
                clearInterval(timer);
                if (cursorEl) {
                  setTimeout(() => { cursorEl.style.opacity = '0'; cursorEl.style.transition = 'opacity .5s ease'; }, 900);
                }
              }
            }, 45);
          }
        });
      }, { threshold: 0.5 });

      const headingEl = document.getElementById('typedHeading');
      if (headingEl) headingIo.observe(headingEl);
      return () => headingIo.disconnect();
    }, [loading]);


    // PERBAIKAN: sebelumnya kalau belum ada iklan resmi (/advertisements)
    // di database, carousel ini langsung jatuh ke ADS_DATA - daftar contoh
    // yang ditulis manual di kode ("Amel Irwanto cake", "Warung Makan
    // Sederhana", dst). Data contoh itu TIDAK PERNAH ada di database, jadi
    // pengunjung melihatnya tampil di beranda tapi Admin/pemilik usaha
    // tidak akan pernah menemukannya di menu "Iklan" pada Dashboard untuk
    // dikelola/dihapus - kelihatan seperti bug "iklan di website tidak ada
    // di dashboard".
    //
    // Sekarang urutannya:
    //   1) Iklan asli yang sudah disetujui Admin (/advertisements) - ini
    //      persis yang muncul & bisa dikelola di Dashboard > Iklan.
    //   2) Kalau belum ada iklan resmi, tampilkan bisnis Premium aktif -
    //      ini juga bisa dilihat/dikelola pemiliknya lewat Dashboard >
    // ── KATEGORI MAPPING ──
    const normalizeLabel = (s) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
    const defaultLabels = new Set(DEFAULT_CATEGORY_TABS.map((tab) => normalizeLabel(tab.label)));
    const seenExtraLabels = new Set();
    const categoriesList = [
      ...DEFAULT_CATEGORY_TABS,
      ...dbCategories
        // PERBAIKAN: sama seperti di halaman Category - endpoint
        // "/categories" isinya flat semua (kategori utama + subkategori),
        // jadi difilter dulu cuma yang tidak punya induk (parent_id kosong)
        // yang boleh nambah jadi kotak kategori utama.

        .filter((c) => !c.parent_id)
        .filter((c) => {
          const norm = normalizeLabel(c.name);
          if (DEFAULT_CATEGORY_TABS.some((tab) => tab.id === c.slug)) return false;
          if (defaultLabels.has(norm)) return false;
          if (seenExtraLabels.has(norm)) return false;
          seenExtraLabels.add(norm);
          return true;
        })
        .map((c) => ({
          id: c.slug,
          label: c.name,
          icon: iconForCategory(c.name, { size: 26, strokeWidth: 1.7, iconKey: c.icon }),

        })),
    ];

    // ── PREMIUM & STANDARD ADS MAPPING ──
    // Mapping businesses list
    const businessesList = dbBusinesses.length > 0 ? dbBusinesses.map(b => ({
      id: b.id,
      // PERBAIKAN: kartu iklan (premium-ad-card & standard-ad-card) di
      // bawah membaca field "businessId" untuk bikin link ke halaman
      // bisnis (/business/:id). Field ini sebelumnya TIDAK ADA di sini -
      // cuma ada "id" - jadi link-nya selalu jadi "/business/undefined"
      // (rusak, tidak pernah nyambung ke bisnis aslinya). Sekarang
      // ditambahkan supaya selalu terhubung ke bisnis yang benar.
      businessId: b.id,
      name: b.title,
      category: b.category?.name || "Lainnya",
      tags: [b.title],
      location: b.village || b.address || "Surade",
      views: "Pratinjau",
      status: b.is_open_now ? "Buka Sekarang" : "Tutup Sekarang",
      img: b.image ? getImageUrl(b.image) : "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=250&fit=crop",
      is_premium: b.is_premium_active,
      package: b.package,
      open: !!b.is_open_now,
      categoryColor: "#159c60",
      rating: "4.8"
    })) : (apiError ? [...TEMUKAN_DATA, ...BISNIS_DATA].map(b => ({ ...b, businessId: b.id, is_premium: true, rating: "4.8" })) : []);

    const premiumAds = businessesList.filter(b => b.package === 'premium' && b.is_premium);
    const standardAds = businessesList.filter(b => b.package === 'standard' && b.is_premium);
    
    // Fallback logic if explicit packages are not set
    const displayPremiumAds = premiumAds.length > 0 ? premiumAds : businessesList.filter(b => b.is_premium).slice(0, 3);
    const displayStandardAds = standardAds.length > 0 ? standardAds : businessesList.filter(b => b.is_premium).slice(3, 10);
    
    // If still empty (e.g. no premium businesses at all), fallback to ADS_DATA for layout testing
    const finalPremiumAds = displayPremiumAds.length > 0 ? displayPremiumAds : ADS_DATA.map(ad => ({ ...ad, businessId: ad.businessId || ad.id, img: ad.img, name: ad.name, rating: "4.8", location: "Surade" }));
    const finalStandardAds = displayStandardAds.length > 0 ? displayStandardAds : BISNIS_DATA.map(b => ({ ...b, businessId: b.id, rating: "4.8", location: b.location }));

    // Extended array for infinite carousel
    const extendedPremiumAds = finalPremiumAds.length > 0
      ? [finalPremiumAds[finalPremiumAds.length - 1], ...finalPremiumAds, finalPremiumAds[0]]
      : [];

    // Removed old carousel scroll function

    // Smart Village adalah angka STATIS yang ditulis manual di
    // smartCities.js (mis. selalu "48" untuk Desa Buniwangi, tidak pernah
    // berubah walau ada bisnis baru daftar/dihapus). Sekarang dihitung
    // ASLI dari data bisnis yang sudah dimuat, dicocokkan lewat kolom
    // `village` (bukan menebak-nebak dari teks alamat) - karena pilihan
    // desa di form Tambah Bisnis memang diambil dari nama SMART_CITIES
    // yang sama persis, jadi pencocokannya exact match, bukan fuzzy.
    const villageBusinessCounts = Array.isArray(dbBusinesses) 
      ? dbBusinesses.reduce((acc, b) => {
          if (b.village) acc[b.village] = (acc[b.village] || 0) + 1;
          return acc;
        }, {})
      : {};

    const filteredKota = KOTA_INDONESIA.filter((k) =>
      k.toLowerCase().includes(kotaSearch.toLowerCase())
    );

    const filteredBisnis = activeCategory === "all"
      ? businessesList
      : businessesList.filter((b) =>
        b.category.toLowerCase().includes(
          categoriesList.find((c) => c.id === activeCategory)?.label.split(" ")[0].toLowerCase() ?? ""
        )
      );

    const cityFilteredBisnis = selectedCity
      ? businessesList.filter((b) => b.location.includes(selectedCity))
      : businessesList;

    const searchFilteredBisnis = searchKeyword
      ? businessesList.filter((b) =>
          b.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          b.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          b.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase())) ||
          b.location.toLowerCase().includes(searchKeyword.toLowerCase())
        )
      : businessesList;

    // Combine all filters
    const finalFilteredBisnis = businessesList.filter((b) => {
      const matchesCategory = activeCategory === "all" ||
        b.category.toLowerCase().includes(
          categoriesList.find((c) => c.id === activeCategory)?.label.split(" ")[0].toLowerCase() ?? ""
        );
      const matchesCity = !selectedCity || b.location.includes(selectedCity);
      const matchesSearch = !searchKeyword ||
        b.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        b.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        b.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        b.location.toLowerCase().includes(searchKeyword.toLowerCase());
      
      return matchesCategory && matchesCity && matchesSearch;
    });

    // Filter TEMUKAN_DATA based on search
    const filteredTemukanData = businessesList.filter((b) => {
      const matchesSearch = !searchKeyword ||
        b.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        b.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        b.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        b.location.toLowerCase().includes(searchKeyword.toLowerCase());
      
      return matchesSearch;
    });

    function toggleSave(id) {
      if (!authUser) {
        window.location.href = "/login";
        return;
      }
      if (savingIds[id]) return;
      setSavingIds((prev) => ({ ...prev, [id]: true }));
      const existingRecordId = saved[id];
      const request = existingRecordId
        ? api.delete(`/saved-businesses/${existingRecordId}`).then(() => {
            setSaved((prev) => {
              const next = { ...prev };
              delete next[id];
              return next;
            });
          })
        : api.post("/saved-businesses", { business_id: id }).then((result) => {
            setSaved((prev) => ({ ...prev, [id]: result.id }));
            // PERBAIKAN: menekan "Simpan" sebelumnya hanya menyimpan data di
            // background tanpa kepastian apa-apa buat penggunanya - dia
            // harus buka Dashboard sendiri lalu klik menu "Favorit" untuk
            // tahu apakah tersimpan atau tidak. Sekarang begitu berhasil
            // disimpan, otomatis diarahkan ke Dashboard > Favorit supaya
            // langsung kelihatan bisnisnya sudah masuk daftar.
            setTimeout(() => navigate("/dashboard?tab=saved"), 500);

          });

      request
        .catch((err) => {
          alert(err?.data?.message || "Gagal memperbarui daftar favorit. Silakan coba lagi.");
        })
        .finally(() => {
          setSavingIds((prev) => ({ ...prev, [id]: false }));
        });
    }

    const handleSearchSubmit = () => {
      if (searchKeyword.trim()) {
        const newHistoryItem = { keyword: searchKeyword.trim(), category: selectedSearchCategory };
        const updatedHistory = [
          newHistoryItem,
          ...searchHistory.filter(h => h.keyword.toLowerCase() !== searchKeyword.trim().toLowerCase())
        ].slice(0, 5);
        localStorage.setItem("search_history", JSON.stringify(updatedHistory));
        setSearchHistory(updatedHistory);
      }
      navigate(`/category/${selectedSearchCategory}?q=${encodeURIComponent(searchKeyword)}&location=${encodeURIComponent(selectedKota)}`);
    };

    if (loading) {
      return <Loading />;
    }

    return (
      <div className="home-page">
        {/* ── NAVBAR (animasi angin+daun ada di dalam komponen ini) ── */}
        <Navbar />

        {apiError && (
          <div style={{
            background: "#fff7ed", color: "#9a3412", border: "1px solid #fdba74",
            padding: "10px 24px", fontSize: "0.9rem", textAlign: "center",
          }}>
            ⚠️ Tidak bisa terhubung ke server backend. Menampilkan data contoh sementara.
            Pastikan backend Laravel berjalan (<code>php artisan serve</code>) di http://127.0.0.1:8000.
          </div>
        )}

        {/* ── HERO BANNER ── */}
        <section className="home-hero">
          <div className="home-hero__bg" style={{ backgroundImage: `url(${waterfallImg})` }} />
          <div className="home-hero__content">
            <h1
              className="home-hero__title"
              style={{
                background: 'linear-gradient(100deg, #ffffff 0%, #ffffff 40%, #a7f3d0 50%, #ffffff 60%, #ffffff 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: '#ffffff',
                backgroundSize: '200% 100%',
                animation: 'home-hero-shimmer 7s ease-in-out infinite'
              }}
            >
              Surade.co.id
            </h1>
            <p className="home-hero__subtitle">Semua Ada Disini</p>

            {/* Search Bar */}
            <SearchBar
              categoriesList={categoriesList}
              initialKeyword={searchKeyword}
              initialLocation={selectedKota}
              onKeywordChange={setSearchKeyword}
              onLocationChange={setSelectedKota}
            />
          </div>
        </section>
        
        {/* ── PREMIUM ADS SECTION ── */}
        <section className="premium-ads-section">
          <div className="premium-ads-carousel">
            <button
              type="button"
              className="premium-ads-carousel__nav premium-ads-carousel__nav--prev"
              onClick={() => { setAdTransitionEnabled(true); setCurrentAdIndex((prev) => prev - 1); }}
              aria-label="Iklan sebelumnya"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            
            <div className="premium-ads-carousel__viewport">
              <div
                ref={carouselTrackRef}
                className="premium-ads-carousel__track"
                style={{
                  transform: `translateX(-${currentAdIndex * 100}%)`,
                  transition: adTransitionEnabled
                    ? "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)"
                    : "none",
                }}
                onTransitionEnd={() => {
                  if (currentAdIndex >= extendedPremiumAds.length - 1) {
                    setAdTransitionEnabled(false);
                    setCurrentAdIndex(1);
                  } else if (currentAdIndex <= 0) {
                    setAdTransitionEnabled(false);
                    setCurrentAdIndex(finalPremiumAds.length);
                  }
                }}
              >
                {extendedPremiumAds.map((ad, index) => (
                  <div key={`${ad.businessId || ad.id}-${index}`} className="premium-ad-card">
                    <div className="premium-ad-card__img-wrap">
                      <img src={ad.img} alt={ad.name} className="premium-ad-card__img" loading="lazy" />
                      <div className="premium-ad-card__gradient" />
                      
                      <div className="premium-ad-card__content">
                        <div className="premium-ad-card__badge">
                          <Sparkles size={14} fill="currentColor" />
                          <span>Sponsored • Premium</span>
                        </div>
                        
                        <h2 className="premium-ad-card__name">{ad.name}</h2>
                        
                        <div className="premium-ad-card__meta">
                          <span className="premium-ad-card__rating">
                            <Star size={16} fill="#f59e0b" color="#f59e0b" /> {ad.rating} <span className="meta-dim">(2 ulasan)</span>
                          </span>
                          <span className="premium-ad-card__location">
                            <MapPin size={16} /> {ad.location}
                          </span>
                        </div>
                        
                        <Link to={`/business/${ad.businessId}`} className="premium-ad-card__btn">
                          Lihat Profil Usaha <ArrowUpRight size={18} />
                        </Link>

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button
              type="button"
              className="premium-ads-carousel__nav premium-ads-carousel__nav--next"
              onClick={() => { setAdTransitionEnabled(true); setCurrentAdIndex((prev) => prev + 1); }}
              aria-label="Iklan berikutnya"
            >
              <ChevronRight size={24} strokeWidth={2.5} />
            </button>
            
            {/* Minimal Indicators (Lines) */}
            {finalPremiumAds.length > 1 && (
              <div className="premium-ads-carousel__dots">
                {finalPremiumAds.map((ad, i) => (
                  <button
                    type="button"
                    key={`dot-${i}`}
                    className={`premium-ads-carousel__dot ${((currentAdIndex - 1 + finalPremiumAds.length) % finalPremiumAds.length) === i ? "active" : ""}`}
                    onClick={() => { setAdTransitionEnabled(true); setCurrentAdIndex(i + 1); }}
                    aria-label={`Ke iklan ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── STANDARD ADS SECTION ── */}
        <section className="standard-ads-section">
          <div className="standard-ads-header">
            <div className="standard-ads-title">
              <Sparkles size={16} fill="currentColor" />
              <span>IKLAN TERVERIFIKASI</span>
            </div>
            <div className="standard-ads-subtitle">Mitra Surade.co.id</div>
          </div>
          
          <div className="standard-ads-marquee">
            <div className="standard-ads-marquee__track">
              {/* Duplicated multiple times to ensure seamless infinite scrolling */}
              {[...finalStandardAds, ...finalStandardAds, ...finalStandardAds, ...finalStandardAds].map((ad, index) => (
                <Link key={`std-${ad.businessId || ad.id}-${index}`} to={`/business/${ad.businessId}`} className="standard-ad-card">
                  <div className="standard-ad-card__img-wrap">
                    <img src={ad.img} alt={ad.name} className="standard-ad-card__img" loading="lazy" />
                    <div className="standard-ad-card__badge">Iklan</div>
                  </div>
                  <div className="standard-ad-card__content">
                    <h4 className="standard-ad-card__name">{ad.name}</h4>
                    <div className="standard-ad-card__meta">
                      <span className="standard-ad-card__rating"><Star size={12} fill="#f59e0b" color="#f59e0b"/> {ad.rating}</span>
                      <span className="standard-ad-card__dot">•</span>
                      <span className="standard-ad-card__location"><MapPin size={12}/> {ad.location}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── KATEGORI SECTION ── */}
        <section className="category-section">
          <div className="category-inner">
            {/* Category tabs */}
            {loading && categoriesList.length === 0 ? null : (
              <div className="reko-tabs">
                {categoriesList.map((cat, index) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.id}`}
                    className="reko-tab reko-tab--link"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animation: 'fadeInUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                    }}
                  >
                    <span className="reko-tab__icon">{cat.icon}</span>
                    <span className="reko-tab__label">{cat.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>



        {/* ── KATEGORI SECTION ── */}
        <section className="smart-section">
          <div className="smart-inner">
            <h2 className="smart-title">Smart City &amp; Smart Village</h2>
            <p className="smart-subtitle">Surade.co.id Mendorong Percepatan Program Pemerintah Smart City &amp; Smart Village</p>

            <div className="smart-grid">
              {SMART_CITIES.map((city) => {
                // Kalau data bisnis asli sudah dimuat, pakai hitungan asli
                // (termasuk yang sah bernilai 0 kalau desanya memang belum
                // punya bisnis terdaftar). Selama masih memuat, tampilkan
                // dulu angka placeholder dari smartCities.js supaya kartu
                // tidak "berkedip" ke 0 sesaat sebelum data API selesai.
                const realCount = villageBusinessCounts[city.name];
                const displayCount = dbBusinesses.length > 0 ? (realCount || 0) : city.bisnis;
                return (
                <Link 
                  key={city.id} 
                  to={`/smart-city/${city.id}`}
                  className="smart-card-link"
                >
                  <div 
                    className={`smart-card${selectedCity === city.name ? " active" : ""}`} 
                    tabIndex={0}
                    onClick={() => setSelectedCity(selectedCity === city.name ? null : city.name)}
                  >
                    <img src={city.img} alt={city.name} className="smart-card__img" loading="lazy" />
                    <div className="smart-card__overlay" />
                    <span className="smart-card__name">{city.name}</span>
                    <div className="smart-card__tooltip">
                      <span className="smart-card__tooltip-count">{displayCount.toLocaleString("id-ID")}</span>
                      <span className="smart-card__tooltip-label"> bisnis terdaftar</span>
                    </div>
                  </div>
                </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* PERMINTAAN: "Event & Promo" section yang tadinya berdiri
            sendiri terpisah dari "Berbagi Pengalaman" (Blog) sekarang
            digabung jadi SATU section "Blog & Event" di bawah, sesuai
            menu navbar yang juga sudah "Blog & Event" (satu topik, bukan
            dua section terpisah). Grid event-nya dipindah ke situ. */}

        {/* ── FOTO CURUG CIKASO / KECAMATAN SURADE (animasi gelombang di tepi) ── */}
        <section className="kenapa-section">
          <div className="kenapa-overlay" />

          {/* Gelombang atas — teknik "gentle-wave" (dibalik biar solidnya di atas) */}
          <div className="kenapaWaves kenapaWaves--top">
            <svg className="kenapaWavesSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto" aria-hidden="true">
              <defs>
                <path id="kenapa-gentle-wave-top" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
              </defs>
              <g className="kenapaParallax">
                <use href="#kenapa-gentle-wave-top" xlinkHref="#kenapa-gentle-wave-top" x="48" y="0" fill="rgba(255,255,255,0.7)" />
                <use href="#kenapa-gentle-wave-top" xlinkHref="#kenapa-gentle-wave-top" x="48" y="3" fill="rgba(255,255,255,0.5)" />
                <use href="#kenapa-gentle-wave-top" xlinkHref="#kenapa-gentle-wave-top" x="48" y="5" fill="rgba(255,255,255,0.3)" />
                <use href="#kenapa-gentle-wave-top" xlinkHref="#kenapa-gentle-wave-top" x="48" y="7" fill="#fff" />
              </g>
            </svg>
          </div>

          {/* Gelombang bawah — sama, posisi normal */}
          <div className="kenapaWaves kenapaWaves--bottom">
            <svg className="kenapaWavesSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto" aria-hidden="true">
              <defs>
                <path id="kenapa-gentle-wave-bottom" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
              </defs>
              <g className="kenapaParallax">
                <use href="#kenapa-gentle-wave-bottom" xlinkHref="#kenapa-gentle-wave-bottom" x="48" y="0" fill="rgba(255,255,255,0.7)" />
                <use href="#kenapa-gentle-wave-bottom" xlinkHref="#kenapa-gentle-wave-bottom" x="48" y="3" fill="rgba(255,255,255,0.5)" />
                <use href="#kenapa-gentle-wave-bottom" xlinkHref="#kenapa-gentle-wave-bottom" x="48" y="5" fill="rgba(255,255,255,0.3)" />
                <use href="#kenapa-gentle-wave-bottom" xlinkHref="#kenapa-gentle-wave-bottom" x="48" y="7" fill="#fff" />
              </g>
            </svg>
          </div>
        </section>

        {/* ── TEMUKAN TEMPAT BARU SECTION ── */}
        <section className="howit">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>

          <div className="howit-inner">
            <div className="text-col">
              <h2 id="typedHeading"><span id="typedText"></span><span className="type-cursor"></span></h2>
              <p className="lead">Mudah menemukan pelaku usaha skala terkecil di sekitar Anda, hanya dalam tiga langkah sederhana.</p>

              <div className="timeline" id="timeline">
                {QUICK_STEPS.map((step, i) => (
                  <div
                    key={step.num}
                    className="tl-item"
                    ref={(el) => (tlItemRefs.current[i] = el)}
                    style={{ transitionDelay: `${i * 0.12}s` }}
                  >
                    <div className="tl-num">{step.num}</div>
                    <div className="tl-body">
                      <h3>{step.title}</h3>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="video-col" ref={videoColRef}>
              <div className="video-frame">
                <video autoPlay muted loop playsInline poster="https://picsum.photos/seed/suradehero/900/700">
                  <source src="/assets/surade-aerial.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </section>
        <section className="temukan-section">
          <div className="temukan-inner">
            <h2 className="temukan-title">Temukan Tempat Baru</h2>
            <p className="temukan-subtitle">
              Temukan Dihalaman Kami Untuk Dapat Membantu Dalam Menemukan Pelaku Usaha Hingga Skala Terkecil
            </p>

            <div className="temukan-grid">
              {/* PERBAIKAN: section ini sebelumnya menumpahkan SEMUA bisnis
                  sekaligus tanpa batas dan tanpa tombol "lihat semua" -
                  sekarang dibatasi TEMUKAN_DISPLAY_LIMIT kartu saja di
                  beranda (pola sama seperti tombol "Lihat Semua Blog &
                  Event" di section Blog di bawah), sisanya dilihat lewat
                  halaman /category/all yang sudah punya pencarian, filter,
                  & pagination lengkap. */}
              {filteredTemukanData.slice(0, TEMUKAN_DISPLAY_LIMIT).map((bisnis) => (
                <Link key={bisnis.id} to={`/business/${bisnis.id}`} className="biz-card biz-card--link">
                  {/* Image */}
                  <div className="biz-card__img-wrap">
                    <img src={bisnis.img} alt={bisnis.name} className="biz-card__img" loading="lazy" />
                    <div className="biz-card__img-overlay">
                      <button
                        type="button"
                        className={`biz-card__save${saved[bisnis.id] ? " saved" : ""}`}
                        onClick={(e) => { e.preventDefault(); toggleSave(bisnis.id); }}
                        disabled={!!savingIds[bisnis.id]}
                        aria-label="Simpan"
                      >
                        <Bookmark size={13} fill={saved[bisnis.id] ? "currentColor" : "none"} />
                        <span>{saved[bisnis.id] ? "Tersimpan" : "Simpan"}</span>
                      </button>
                      <span className="biz-card__views">
                        <Eye size={13} />
                        <span>Pratinjau</span>
                      </span>
                    </div>
                    {/* Verification Badge - HANYA muncul kalau bisnisnya premium,
                        sebelumnya selalu muncul tanpa syarat di semua kartu. */}
                    {bisnis.is_premium && (
                      <div className="biz-card__premium-badge">
                        <BadgeCheck size={13} fill="#fff" stroke="#059669" />
                        <span>Terverifikasi</span>
                      </div>
                    )}

                  </div>

                  {/* Body */}
                  <div className="biz-card__body">
                    <h3 className="biz-card__name">{bisnis.name}</h3>
                    <p className="biz-card__category">
                      <span className="biz-card__cat-dot" style={{ background: bisnis.categoryColor }} />
                      {bisnis.category}
                    </p>
                    <div className="biz-card__tags">
                      {bisnis.tags.map((tag) => (
                        <span key={tag} className="biz-card__tag">
                          <Tag size={11} />{tag}
                        </span>
                      ))}
                    </div>
                    <div className="biz-card__footer">
                      <span className="biz-card__location">
                        <MapPin size={12} />{bisnis.location}
                      </span>
                      <span className={`biz-card__cta${bisnis.open ? "" : " closed"}`}>
                        {bisnis.open ? "Buka Sekarang →" : "Tutup Sekarang!"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredTemukanData.length > TEMUKAN_DISPLAY_LIMIT && (
              <div className="blog-section__cta">
                <Link to="/category/all" className="blog-section__cta-btn">Lihat Semua Usaha</Link>
              </div>
            )}
          </div>
        </section>

        {/* ── TESTIMONIALS SECTION ── */}
        <section className="testi-section">
          <div className="testi-inner">
            <h2 className="testi-title">Apa Yang Mereka Katakan</h2>

            <div className="testi-grid">
              {TESTIMONIALS_DATA.map((testi) => (
                <div key={testi.id} className="testi-card">
                  <div className="testi-card__avatar-wrap">
                    <img src={testi.avatar} alt={testi.name} className="testi-card__avatar" loading="lazy" />
                  </div>
                  <div className="testi-card__content">
                    <h3 className="testi-card__name">{testi.name}</h3>
                    <div className="testi-card__role-container">
                      <div className="testi-card__role-line" />
                      <span className="testi-card__role">{testi.role}</span>
                    </div>
                    <p className="testi-card__text">{testi.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── KEY FEATURES SECTION ── */}
        <section className="features-section">
          <div className="features-inner">
            <div className="features-grid">
              {FEATURES_DATA.map((feat) => (
                <div key={feat.id} className="feat-card">
                  <div
                    key={`icon-${feat.id}-${bounceCounts[feat.id] || 0}`}
                    className="feat-card__icon-wrap feat-card__icon-wrap--bounce"
                    onClick={() =>
                      setBounceCounts((prev) => ({ ...prev, [feat.id]: (prev[feat.id] || 0) + 1 }))
                    }
                  >
                    {feat.icon}
                  </div>
                  <h3 className="feat-card__title">{feat.title}</h3>
                  <p className="feat-card__text">{feat.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BLOG & EVENT SECTION (digabung, satu section saja) ── */}
        {/* ── BLOG & EVENT SECTION (satu grid gabungan, badge penanda tipe
             di tiap kartu) ── */}

        <section className="blog-section">
          <div className="blog-inner">
            <h2 className="blog-title">Blog &amp; Event</h2>
            <p className="blog-subtitle">Info acara, promo, dan cerita pengalaman terbaru dari Surade.co.id</p>

            {dbEvents.length > 0 && (
              <>
                <h3 className="blog-subsection-title">📅 Event &amp; Promo</h3>
                <div className="event-grid">
                  {dbEvents.map((ev) => (
                    <div key={ev.id} className="event-card">
                      <div className="event-card__img-wrap">
                        <img
                          src={ev.image ? getImageUrl(ev.image) : "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500&h=300&fit=crop"}
                          alt={ev.title}
                          className="event-card__img"
                          loading="lazy"
                        />
                        {ev.event_date && (
                          <span className="event-card__date">
                            {new Date(ev.event_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        )}
                      </div>
                      <div className="event-card__body">
                        <h3 className="event-card__title">{ev.title}</h3>
                        {ev.location && (
                          <p className="event-card__location">
                            <MapPin size={13} />
                            {ev.location}
                          </p>
                        )}
                        <p className="event-card__desc">{ev.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <h3 className="blog-subsection-title">✍️ Berbagi Pengalaman Mereka</h3>
            <div className="blog-grid">
              {(() => {
                const mappedEvents = dbEvents.map((ev) => ({
                  type: "event",
                  id: ev.id,
                  category: ev.category || "Event",
                  title: ev.title,
                  location: ev.location || "-",
                  sortDate: ev.event_date ? new Date(ev.event_date) : new Date(0),
                  date: ev.event_date
                    ? new Date(ev.event_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                    : "-",
                  img: ev.image && !ev.image.startsWith("blob:")
                    ? getImageUrl(ev.image)
                    : "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500&h=300&fit=crop",
                }));

                const mappedBlogs = dbBlogs.map((b) => ({
                  type: "blog",
                  id: b.id,
                  category: b.category || "Umum",
                  title: b.title,
                  author: b.author?.name || "Admin Surade",
                  sortDate: b.created_at ? new Date(b.created_at) : new Date(0),
                  date: b.created_at
                    ? new Date(b.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                    : "-",
                  // PERBAIKAN: kalau image-nya kosong ATAU ternyata "blob:..."
                  // (sisa data lama sebelum upload gambar benar-benar
                  // diperbaiki - link sementara itu cuma valid di tab
                  // browser waktu itu, jadi rusak/patah kalau dibuka lagi),
                  // pakai gambar contoh generik supaya kartunya tetap rapi,
                  // bukan malah kelihatan pecah/tumpang tindih dengan judul.
                  img: b.image && !b.image.startsWith("blob:")
                    ? getImageUrl(b.image)
                    : "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=260&fit=crop",
                }));

                const combined = (mappedEvents.length + mappedBlogs.length) > 0
                  ? [...mappedEvents, ...mappedBlogs].sort((a, b) => b.sortDate - a.sortDate).slice(0, 6)
                  : BLOG_DATA.map((b) => ({ ...b, type: "blog" }));

                return combined.map((post) => (
                  <Link
                    key={`${post.type}-${post.id}`}
                    to={post.type === "blog" ? `/blog/${post.id}` : `/events/${post.id}`}
                    className="blog-card blog-card--link"
                  >
                    <div className="blog-card__img-wrap">
                      <img
                        src={post.img}
                        alt={post.title}
                        className="blog-card__img"
                        loading="lazy"
                        onError={(e) => {
                          // Jaring pengaman terakhir: apa pun sebab gambarnya
                          // gagal dimuat (link rusak, blob: kadaluarsa, dll),
                          // otomatis ganti ke gambar generik supaya kartunya
                          // tidak pernah lagi kelihatan pecah/tumpang tindih
                          // dengan judul.
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = post.type === "blog"
                            ? "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=260&fit=crop"
                            : "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500&h=300&fit=crop";
                        }}
                      />
                      {/* Badge penanda tipe konten (Blog/Event), ditaruh di
                          kanan atas biar tidak numpuk sama badge kategori
                          yang sudah ada di kiri atas. */}
                      <span className={`home-blog-type-badge home-blog-type-badge--${post.type}`}>
                        {post.type === "blog" ? "Blog" : "Event"}

                      </span>
                      <span className="blog-card__category">{post.category}</span>
                    </div>
                    <div className="blog-card__body">
                      <h3 className="blog-card__title">{post.title}</h3>
                      <div className="blog-card__footer">
                        {post.type === "blog" ? (
                          <span className="blog-card__meta">
                            <User size={13} />
                            <span>{post.author}</span>
                          </span>
                        ) : (
                          <span className="blog-card__meta">
                            <MapPin size={13} />
                            <span>{post.location}</span>
                          </span>
                        )}
                        <span className="blog-card__meta">
                          <Calendar size={13} />
                          <span>{post.date}</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                ));
              })()}
            </div>

            <div className="blog-section__cta">
              <Link to="/blog" className="blog-section__cta-btn">Lihat Semua Blog &amp; Event</Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-cols">
              {/* Brand/Logo Col */}
              <div className="footer-col footer-col--brand">
                <Link to="/" className="footer-logo">
                  <img src={logoImg} alt="Surade.co.id" className="footer-logo__img" />
                </Link>
                <p className="footer-desc">
                  Surade.co.id adalah portal informasi yang menyajikan data dan berita terpercaya dari berbagai sumber resmi di Indonesia.
                </p>
                <div className="footer-social">
                  <a href="#" className="footer-social__link" aria-label="Instagram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a href="#" className="footer-social__link" aria-label="Twitter">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  </a>
                  <a href="#" className="footer-social__link" aria-label="Facebook">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                  <a href="#" className="footer-social__link" aria-label="WhatsApp">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                  </a>
                  <a href="#" className="footer-social__link" aria-label="YouTube">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Col 1 - Tentang Kami */}
              <div className="footer-col">
                <h4 className="footer-heading">Tentang Kami</h4>
                <ul className="footer-links">
                  <li><Link to="/about">Tentang Surade.co.id</Link></li>
                  <li><Link to="/vision-mission">Visi &amp; Misi</Link></li>
                  <li><Link to="/partnership-career">Kerjasama &amp; Karir</Link></li>
                </ul>
              </div>

              {/* Col 2 - Bantuan */}
              <div className="footer-col">
                <h4 className="footer-heading">Bantuan</h4>
                <ul className="footer-links">
                  <li><Link to="/faq">FAQ</Link></li>
                  <li><Link to="/terms">Syarat &amp; Ketentuan</Link></li>
                  <li><Link to="/contact">Hubungi Kami</Link></li>
                </ul>
              </div>

              {/* Col 3 - Kontak Kami */}
              <div className="footer-col">
                <h4 className="footer-heading">Kontak Kami</h4>
                <ul className="footer-links">
                  <li><a href="mailto:admin@Surade.co.id">admin@Surade.co.id</a></li>
                  <li><span className="footer-text">Call Center 0807 - 100 - 1500</span></li>
                  <li><span className="footer-text">WhatsApp: +62 811-1919-711</span></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom">
            <div className="footer-bottom__inner">
              <p className="footer-copyright">
                &copy; 2026 Surade.co.id. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }