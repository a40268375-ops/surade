import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import { usePageLoading } from "../hooks/usePageLoading";
import {
  MapPin,
  Phone,
  Mail,
  Star,
  Share2,
  Bookmark,
  MessageCircle,
  Send,
  DollarSign,
  Clock,
  X,
  ChevronDown,
} from "lucide-react";
import "./Home.css";
import "./BusinessDetail.css";

const DEFAULT_SELLER = {
  name: "Nicko Lay",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
};

/* ── Weekly opening-hours schedule ── */
const DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
// Categories that stay open every day of the week, including Sunday
const OPEN_ALL_WEEK_CATEGORIES = ["Cafe & Restaurant", "Wisata"];

function buildWeeklySchedule(business) {
  const openAllWeek = OPEN_ALL_WEEK_CATEGORIES.includes(business.category);
  // JS getDay(): 0 = Minggu ... 6 = Sabtu → convert to index in DAY_NAMES (Senin-first)
  const jsToday = new Date().getDay();
  const todayIndex = jsToday === 0 ? 6 : jsToday - 1;

  return DAY_NAMES.map((day, idx) => {
    const isSunday = idx === 6;
    const closed = isSunday && !openAllWeek;
    return {
      day,
      hours: closed ? "Tutup" : business.hours,
      closed,
      isToday: idx === todayIndex,
    };
  });
}

const BISNIS_DATA = [
  {
    id: 1, name: "Amel Irwanto cake", category: "Pertokoan",
    tags: ["Amel irwanto cake"], location: "Kabupaten Bogor",
    views: "Pratinjau", status: "Buka Sekarang",
    img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=250&fit=crop",
    description: "Amel Irwanto Cake adalah toko kue yang menyediakan berbagai macam kue lezat dengan kualitas terbaik. Kami melayani pesanan untuk berbagai acara seperti ulang tahun, pernikahan, dan acara lainnya.",
    phone: "+62 812 3456 7890",
    email: "amelcake@gmail.com",
    address: "Jalan Raya Leuwiliang No. 123, Kabupaten Bogor, Jawa Barat",
    rating: 4.5,
    reviews: 128,
    hours: "08:00 - 20:00",
    images: [
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200&h=600&fit=crop",
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-baking-cake-in-an-oven-13101-large.mp4",
    seller: DEFAULT_SELLER,
  },
  {
    id: 2, name: "Warung Makan Sederhana", category: "Cafe & Restaurant",
    tags: ["Warung makan", "Nasi padang"], location: "Kota Bogor",
    views: "Pratinjau", status: "Buka Sekarang",
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=250&fit=crop",
    description: "Warung Makan Sederhana menyajikan masakan nusantara dengan cita rasa otentik. Spesialis dalam masakan Padang dan masakan tradisional Indonesia lainnya.",
    phone: "+62 812 3456 7891",
    email: "warungsederhana@gmail.com",
    address: "Jalan Kapten Muslihat No. 45, Kota Bogor, Jawa Barat",
    rating: 4.7,
    reviews: 256,
    hours: "10:00 - 22:00",
    images: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=600&fit=crop",
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-cooking-in-a-professional-kitchen-4767-large.mp4",
    seller: DEFAULT_SELLER,
  },
  {
    id: 3, name: "Toko Elektronik Jaya", category: "Elektronik & Gadget",
    tags: ["Handphone", "Aksesoris"], location: "Kabupaten Bogor",
    views: "Pratinjau", status: "Buka Sekarang",
    img: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=400&h=250&fit=crop",
    description: "Toko Elektronik Jaya menyediakan berbagai macam elektronik dan gadget dengan harga terjangkau dan kualitas terjamin. Kami juga menyediakan layanan servis.",
    phone: "+62 812 3456 7892",
    email: "elektronikjaya@gmail.com",
    address: "Jalan Mercurius 16680 Dramaga, Kabupaten Bogor, Jawa Barat",
    rating: 4.3,
    reviews: 89,
    hours: "09:00 - 21:00",
    images: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=1200&h=600&fit=crop",
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-40742-large.mp4",
    seller: DEFAULT_SELLER,
  },
  {
    id: 4, name: "Salon & Spa Cantik", category: "Pertokoan",
    tags: ["Salon", "Perawatan"], location: "Kota Depok",
    views: "Pratinjau", status: "Buka Sekarang",
    img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=250&fit=crop",
    description: "Salon & Spa Cantik menawarkan berbagai layanan kecantikan dan perawatan tubuh dengan profesional. Dapatkan pengalaman relaksasi terbaik di sini.",
    phone: "+62 812 3456 7893",
    email: "saloncantik@gmail.com",
    address: "Jalan Margonda Raya No. 56, Kota Depok, Jawa Barat",
    rating: 4.6,
    reviews: 167,
    hours: "09:00 - 20:00",
    images: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=600&fit=crop",
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-spa-treatment-with-stones-and-flowers-close-up-42861-large.mp4",
    seller: DEFAULT_SELLER,
  },
  {
    id: 5, name: "Bengkel Motor Makmur", category: "Servis & Tukang",
    tags: ["Bengkel", "Motor", "Oli"], location: "Kabupaten Bekasi",
    views: "Pratinjau", status: "Buka Sekarang",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
    description: "Bengkel Motor Makmur adalah bengkel motor terpercaya dengan mekanik berpengalaman. Kami melayani servis, ganti oli, dan perbaikan motor berbagai merek.",
    phone: "+62 812 3456 7894",
    email: "bengkelmakmur@gmail.com",
    address: "Jalan Cikarang Barat No. 90, Kabupaten Bekasi, Jawa Barat",
    rating: 4.4,
    reviews: 134,
    hours: "08:00 - 18:00",
    images: [
      "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1508974239320-0a029497e820?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop",
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-car-mechanic-hands-repairing-an-engine-42777-large.mp4",
    seller: DEFAULT_SELLER,
  },
  {
    id: 6, name: "Wisata Alam Puncak", category: "Wisata",
    tags: ["Wisata", "Alam", "Liburan"], location: "Kabupaten Bogor",
    views: "Pratinjau", status: "Buka Sekarang",
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
    description: "Wisata Alam Puncak menawarkan keindahan alam yang menakjubkan dengan udara sejuk dan pemandangan yang memukau. Tempat yang sempurna untuk liburan keluarga.",
    phone: "+62 812 3456 7895",
    email: "wisatapuncak@gmail.com",
    address: "Jalan Raya Puncak No. 234, Kabupaten Bogor, Jawa Barat",
    rating: 4.8,
    reviews: 312,
    hours: "06:00 - 18:00",
    images: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1472214222541-d510753a8707?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop",
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-landscape-of-green-mountains-in-a-foggy-day-34301-large.mp4",
    seller: DEFAULT_SELLER,
  },
  {
    id: 101, name: "Global Bakery Leuwiliang", category: "Pertokoan",
    tags: ["Global Bakery Leuwiliang"], location: "Kabupaten Bogor",
    views: "Pratinjau", status: "Buka Sekarang",
    img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=240&fit=crop",
    description: "Global Bakery Leuwiliang menyediakan berbagai roti dan kue segar setiap hari dengan bahan berkualitas tinggi.",
    phone: "+62 812 3456 7801",
    email: "globalbakery@gmail.com",
    address: "Jalan Raya Leuwiliang No. 88, Kabupaten Bogor, Jawa Barat",
    rating: 4.4, reviews: 67, hours: "07:00 - 19:00",
    images: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200&h=600&fit=crop",
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-baking-cake-in-an-oven-13101-large.mp4",
    seller: DEFAULT_SELLER,
  },
  {
    id: 102, name: "TK Triwala", category: "Yayasan",
    tags: ["Tk Triwala"], location: "Kuningan",
    views: "Pratinjau", status: "Tutup",
    img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=240&fit=crop",
    description: "TK Triwala adalah taman kanak-kanak yang menyediakan pendidikan anak usia dini dengan lingkungan belajar yang nyaman dan aman.",
    phone: "+62 812 3456 7802",
    email: "tktriwala@gmail.com",
    address: "Jalan Pendidikan No. 12, Kuningan, Jawa Barat",
    rating: 4.6, reviews: 42, hours: "07:30 - 15:00",
    images: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=600&fit=crop",
    ],
    video: null,
    seller: DEFAULT_SELLER,
  },
  {
    id: 103, name: "Bunda Diana", category: "Pertokoan",
    tags: ["Bunda Diana"], location: "Kabupaten Bogor",
    views: "Pratinjau", status: "Buka Sekarang",
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=240&fit=crop",
    description: "Bunda Diana menyajikan masakan rumahan dengan cita rasa autentik dan porsi yang mengenyangkan.",
    phone: "+62 812 3456 7803",
    email: "bundadiana@gmail.com",
    address: "Jalan Dramaga Raya No. 34, Kabupaten Bogor, Jawa Barat",
    rating: 4.5, reviews: 98, hours: "09:00 - 21:00",
    images: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&h=600&fit=crop",
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-cooking-in-a-professional-kitchen-4767-large.mp4",
    seller: DEFAULT_SELLER,
  },
  {
    id: 104, name: "Rumah Makan Athiam", category: "Cafe & Restaurant",
    tags: ["Rumah Makan Athiam"], location: "Sukabumi",
    views: "Pratinjau", status: "Buka Sekarang",
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=240&fit=crop",
    description: "Rumah Makan Athiam menghadirkan hidangan nusantara dengan suasana yang hangat dan pelayanan ramah.",
    phone: "+62 812 3456 7804",
    email: "athiam@gmail.com",
    address: "Jalan Raya Sukabumi No. 56, Sukabumi, Jawa Barat",
    rating: 4.3, reviews: 112, hours: "10:00 - 22:00",
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1550966871-3ed3cbe818b5?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=600&fit=crop",
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-cooking-in-a-professional-kitchen-4767-large.mp4",
    seller: DEFAULT_SELLER,
  },
  {
    id: 105, name: "Rumah Makan Cikole Sukabumi", category: "Cafe & Restaurant",
    tags: ["Rumah Makan Cikole Sukabumi"], location: "Sukabumi",
    views: "Pratinjau", status: "Buka Sekarang",
    img: "https://images.unsplash.com/photo-1550966871-3ed3cbe818b5?w=400&h=240&fit=crop",
    description: "Rumah Makan Cikole Sukabumi menawarkan masakan tradisional Sunda dengan pemandangan alam yang indah.",
    phone: "+62 812 3456 7805",
    email: "cikole@gmail.com",
    address: "Jalan Cikole No. 78, Sukabumi, Jawa Barat",
    rating: 4.7, reviews: 203, hours: "08:00 - 20:00",
    images: [
      "https://images.unsplash.com/photo-1550966871-3ed3cbe818b5?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=600&fit=crop",
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-cooking-in-a-professional-kitchen-4767-large.mp4",
    seller: DEFAULT_SELLER,
  },
  {
    id: 106, name: "Toko Kue Ibu Nanih", category: "Pertokoan",
    tags: ["Toko Kue Ibu Nanih"], location: "Kabupaten Bogor",
    views: "Pratinjau", status: "Buka Sekarang",
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=240&fit=crop",
    description: "Toko Kue Ibu Nanih menyediakan kue tradisional dan modern untuk berbagai acara spesial Anda.",
    phone: "+62 812 3456 7806",
    email: "ibunanih@gmail.com",
    address: "Jalan Cibinong Raya No. 45, Kabupaten Bogor, Jawa Barat",
    rating: 4.8, reviews: 156, hours: "08:00 - 18:00",
    images: [
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=600&fit=crop",
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-baking-cake-in-an-oven-13101-large.mp4",
    seller: DEFAULT_SELLER,
  },
  {
    id: 107, name: "Kantor Kecamatan Sawangan", category: "Kantor Pemerintah",
    tags: ["Kantor Kecamatan Sawangan"], location: "Depok",
    views: "Pratinjau", status: "Buka Sekarang",
    img: "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=400&h=240&fit=crop",
    description: "Kantor Kecamatan Sawangan melayani administrasi kependudukan dan pelayanan publik untuk masyarakat Depok.",
    phone: "+62 812 3456 7807",
    email: "kecsawangan@gmail.com",
    address: "Jalan Raya Sawangan No. 1, Depok, Jawa Barat",
    rating: 4.1, reviews: 34, hours: "08:00 - 16:00",
    images: [
      "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=600&fit=crop",
    ],
    video: null,
    seller: DEFAULT_SELLER,
  },
  {
    id: 108, name: "Kantor Kecamatan Sawangan", category: "Kantor Pemerintah",
    tags: ["Kantor Kecamatan Sawangan"], location: "Depok",
    views: "Pratinjau", status: "Buka Sekarang",
    img: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=240&fit=crop",
    description: "Kantor Kecamatan Sawangan melayani administrasi kependudukan dan pelayanan publik untuk masyarakat Depok.",
    phone: "+62 812 3456 7808",
    email: "kecsawangan2@gmail.com",
    address: "Jalan Margonda Raya No. 100, Depok, Jawa Barat",
    rating: 4.1, reviews: 28, hours: "08:00 - 16:00",
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=600&fit=crop",
    ],
    video: null,
    seller: DEFAULT_SELLER,
  },
  {
    id: 109, name: "Amel Irwanto cake", category: "Pertokoan",
    tags: ["Amel irwanto cake"], location: "Kabupaten Bogor",
    views: "Pratinjau", status: "Buka Sekarang",
    img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=240&fit=crop",
    description: "Amel Irwanto Cake adalah toko kue yang menyediakan berbagai macam kue lezat dengan kualitas terbaik. Kami melayani pesanan untuk berbagai acara seperti ulang tahun, pernikahan, dan acara lainnya.",
    phone: "+62 812 3456 7890",
    email: "amelcake@gmail.com",
    address: "Jalan Raya Leuwiliang No. 123, Kabupaten Bogor, Jawa Barat",
    rating: 4.5, reviews: 128, hours: "08:00 - 20:00",
    images: [
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200&h=600&fit=crop",
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-baking-cake-in-an-oven-13101-large.mp4",
    seller: DEFAULT_SELLER,
  },
];

function maskPhone() {
  return "** *** **** ";
}

export default function BusinessDetail() {
  const pageLoading = usePageLoading();
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [saved, setSaved] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showHours, setShowHours] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [priceCategory, setPriceCategory] = useState(2); // 1: cheap, 2: medium, 3: expensive
  const [showWeeklyHours, setShowWeeklyHours] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const foundBusiness = BISNIS_DATA.find((b) => b.id === parseInt(id));
    setBusiness(foundBusiness);
    setCurrentImageIndex(0);
    setShowPhone(false);
    setShowHours(false);
  }, [id]);

  useEffect(() => {
    if (!business) return;
    const imagesList = business.images?.length > 0 ? business.images : [business.img];
    if (imagesList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % imagesList.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [business]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: business.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link berhasil disalin!");
    }
  };

  const handleWhatsApp = () => {
    const phone = business.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}`, "_blank");
  };

  const handleDirections = () => {
    const query = encodeURIComponent(business.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  if (pageLoading) {
    return <Loading />;
  }

  if (!business) {
    return (
      <div className="business-detail-page">
        <Navbar />
        <div className="business-detail__not-found">
          <h2>Bisnis tidak ditemukan</h2>
          <Link to="/" className="business-detail__back-link">Kembali ke Home</Link>
        </div>
      </div>
    );
  }

  const imagesList = business.images?.length > 0 ? business.images : [business.img];
  const seller = business.seller || DEFAULT_SELLER;
  const weeklySchedule = buildWeeklySchedule(business);

  return (
    <div className="business-detail-page">
      <Navbar />

      {/* HERO */}
      <section className="bd-hero">
        <div className="bd-hero__bg">
          <div
            className="bd-hero__slides-container"
            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
          >
            {imagesList.map((src, i) => (
              <img key={i} src={src} alt="" className="bd-hero__slide-img" />
            ))}
          </div>
        </div>
        <div className="bd-hero__overlay" />
        <div className="bd-hero__content">
          <div className="bd-hero__inner">
            <div className="bd-hero__breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>{business.category}</span>
              <span>/</span>
              <span>{business.name}</span>
            </div>
            <h1 className="bd-hero__title">{business.name}</h1>
            <p className="bd-hero__category">{business.category}</p>
            <div className="bd-hero__meta">
              <div className="bd-hero__rating">
                <Star size={18} fill="#fbbf24" stroke="#fbbf24" />
                <span>{business.rating}</span>
                <span>({business.reviews} ulasan)</span>
              </div>
              <div className="bd-hero__status">
                <span className={`bd-hero__status-dot ${business.status === "Buka Sekarang" ? "open" : "closed"}`} />
                <span>{business.status}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="bd-content">
        <div className="bd-content__inner">
          <div className="bd-content__main">
            {/* Quick Action Icons */}
            <div className="bd-quick-actions">
              {/* Price Category Dropdown */}
              <div className="bd-price-dropdown-wrapper">
                <button
                  type="button"
                  className={`bd-quick-action ${showPriceDropdown ? "active" : ""}`}
                  title="Kategori Harga"
                  onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                >
                  <DollarSign size={22} strokeWidth={1.8} />
                  <span className="bd-price-count">{priceCategory}</span>
                </button>
                {showPriceDropdown && (
                  <div className="bd-price-dropdown">
                    <button
                      type="button"
                      className={`bd-price-option ${priceCategory === 1 ? "active" : ""}`}
                      onClick={() => { setPriceCategory(1); setShowPriceDropdown(false); }}
                    >
                      <DollarSign size={16} />
                      <span>Murah</span>
                    </button>
                    <button
                      type="button"
                      className={`bd-price-option ${priceCategory === 2 ? "active" : ""}`}
                      onClick={() => { setPriceCategory(2); setShowPriceDropdown(false); }}
                    >
                      <div className="bd-price-dollars">
                        <DollarSign size={16} />
                        <DollarSign size={16} />
                      </div>
                      <span>Sedang</span>
                    </button>
                    <button
                      type="button"
                      className={`bd-price-option ${priceCategory === 3 ? "active" : ""}`}
                      onClick={() => { setPriceCategory(3); setShowPriceDropdown(false); }}
                    >
                      <div className="bd-price-dollars">
                        <DollarSign size={16} />
                        <DollarSign size={16} />
                        <DollarSign size={16} />
                      </div>
                      <span>Mahal</span>
                    </button>
                  </div>
                )}
              </div>

              <a href={`mailto:${business.email}`} className="bd-quick-action" title="Email">
                <Mail size={22} strokeWidth={1.8} />
              </a>

              {/* Phone - Left blank as requested */}
              <button type="button" className="bd-quick-action bd-quick-action--disabled" title="Telepon" disabled>
                <Phone size={22} strokeWidth={1.8} />
              </button>

              {/* WhatsApp - replacing Telegram */}
              <button type="button" className="bd-quick-action" title="WhatsApp" onClick={handleWhatsApp}>
                <MessageCircle size={22} strokeWidth={1.8} />
              </button>

              {/* Directions - Maps */}
              <button type="button" className="bd-quick-action" title="Dapatkan Arah" onClick={handleDirections}>
                <Send size={22} strokeWidth={1.8} />
              </button>

              <button
                type="button"
                className={`bd-quick-action ${saved ? "active" : ""}`}
                title={saved ? "Disimpan" : "Simpan"}
                onClick={() => setSaved(!saved)}
              >
                <Bookmark size={22} strokeWidth={1.8} fill={saved ? "currentColor" : "none"} />
              </button>
              <button type="button" className="bd-quick-action" title="Bagikan" onClick={handleShare}>
                <Share2 size={22} strokeWidth={1.8} />
              </button>
            </div>

            {showHours && (
              <div className="bd-hours-banner">
                <Clock size={18} />
                <span>Jam Operasional: <strong>{business.hours}</strong></span>
              </div>
            )}

            {/* About */}
            <div className="bd-about-card">
              <h2 className="bd-about-card__title">Tentang {business.name}</h2>
              <p className="bd-about-card__text">{business.description}</p>
            </div>

            {/* Gallery */}
            <div className="bd-gallery-section">
              <h2 className="bd-gallery-section__title">Galeri Foto &amp; Video</h2>
              <div className="bd-photo-grid">
                {imagesList.map((src, i) => (
                  <div key={i} className="bd-photo-item">
                    <img src={src} alt={`${business.name} ${i + 1}`} loading="lazy" />
                  </div>
                ))}
              </div>
              {business.video && (
                <div className="bd-video-container">
                  <h3 className="bd-video-title">Video Profil</h3>
                  <div className="bd-video-player-wrapper">
                    <video controls src={business.video} poster={business.img} className="bd-video-player">
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="bd-tags">
              <h3 className="bd-tags__title">Tags</h3>
              <div className="bd-tags__list">
                {business.tags.map((tag) => (
                  <span key={tag} className="bd-tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="bd-content__sidebar">
            {/* Hours */}
            <div className="bd-hours-card">
              <button
                type="button"
                className="bd-hours-card__toggle"
                onClick={() => setShowWeeklyHours(!showWeeklyHours)}
                aria-expanded={showWeeklyHours}
              >
                <h3 className="bd-hours-card__title">Jam Buka</h3>
                <ChevronDown
                  size={18}
                  className={`bd-hours-card__caret${showWeeklyHours ? " open" : ""}`}
                />
              </button>
              <div className="bd-hours-card__content">
                <Clock size={20} className="bd-hours-card__icon" />
                <span className="bd-hours-card__time">
                  {business.status === "Buka Sekarang" ? "Buka Sekarang · " : ""}{business.hours}
                </span>
              </div>

              {showWeeklyHours && (
                <ul className="bd-hours-card__week">
                  {weeklySchedule.map((d) => (
                    <li
                      key={d.day}
                      className={`bd-hours-card__week-row${d.isToday ? " today" : ""}${d.closed ? " closed" : ""}`}
                    >
                      <span className="bd-hours-card__week-day">
                        {d.day}
                        {d.isToday && <span className="bd-hours-card__today-badge">Hari ini</span>}
                      </span>
                      <span className="bd-hours-card__week-time">{d.hours}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Location */}
            <div className="bd-location-card">
              <h3 className="bd-location-card__title">Lokasi</h3>
              <button type="button" className="bd-location-card__map" onClick={handleDirections}>
                <div className="bd-location-card__map-placeholder">
                  <MapPin size={32} />
                  <p>Peta lokasi akan ditampilkan di sini</p>
                </div>
              </button>
            </div>

            {/* Address */}
            <div className="bd-address-card">
              <h3 className="bd-address-card__title">Alamat</h3>
              <p className="bd-address-card__text">{business.address}</p>
              <div className="bd-address-card__actions">
                <button type="button" className="bd-address-action" onClick={handleDirections} aria-label="Dapatkan Arah">
                  <Send size={22} strokeWidth={1.8} />
                </button>
                <button type="button" className="bd-address-action" onClick={handleWhatsApp} aria-label="WhatsApp">
                  <MessageCircle size={22} strokeWidth={1.8} />
                </button>
              </div>
            </div>

            {/* Seller Profile */}
            <div className="bd-seller-card">
              <Link to={`/profile/${seller.id || 1}`} className="bd-seller-card__profile">
                <img src={seller.avatar} alt={seller.name} className="bd-seller-card__avatar" />
                <span className="bd-seller-card__name">{seller.name}</span>
              </Link>
              <button type="button" className="bd-seller-btn" onClick={handleWhatsApp}>
                <MessageCircle size={18} />
                <span>WhatsApp</span>
              </button>
              <button type="button" className="bd-seller-btn" onClick={handleWhatsApp}>
                <MessageCircle size={18} />
                <span>Chat Dengan Penjual</span>
              </button>
              <button
                type="button"
                className="bd-seller-phone"
                onClick={() => setShowPhone(!showPhone)}
              >
                <Phone size={16} />
                <span>{showPhone ? business.phone : `${maskPhone(business.phone)}Tampilkan nomor`}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
