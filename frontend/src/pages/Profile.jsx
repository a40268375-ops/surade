import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Plus,
  MapPin,
  Star,
  Share2,
  UserPlus,
  UserCheck,
  Store,
  Calendar,
  Eye,
  Tag,
  Loader2,
  FileText,
  CheckCircle2,
  Package,
  Search,
  ChevronRight,
  MessageCircle,
  TrendingUp,
  Clock,
  ExternalLink,
} from "lucide-react";
import "./Home.css";
import "./Profile.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SuradeLoader from "../components/SuradeLoader";
import api from "../services/api";
import { DEFAULT_AVATAR, DEFAULT_BANNER, getStorageUrl } from "../utils/constants";
import { requireAuth } from "../utils/authCheck";

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [authUser, setAuthUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const initialSeller = {
    id: storedUser.id || null,
    name: storedUser.name || "",
    username: storedUser.username || localStorage.getItem("displayName") || "",
    avatar: storedUser.avatar || DEFAULT_AVATAR,
    banner: storedUser.banner || DEFAULT_BANNER,
    bio: storedUser.bio || "",
    location: storedUser.location || "",
    email: storedUser.email || "",
    phone: storedUser.phone || "",
    joined: storedUser.created_at
      ? new Date(storedUser.created_at).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
      : "",
    rating: 0,
    reviews: 0,
  };

  const [seller, setSeller] = useState(initialSeller);
  const [activeTab, setActiveTab] = useState("ads");
  const [followed, setFollowed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    if (seller?.name) {
      document.title = `${seller.name} - Surade.com`;
    } else {
      document.title = "Profil Pengguna - Surade.com";
    }
  }, [seller?.name]);

  const [userBusinesses, setUserBusinesses] = useState([]);
  const [userBlogs, setUserBlogs] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const isOwnProfile = !id || String(id) === String(authUser.id);

  const fetchUserData = async () => {
    setLoadingProfile(true);
    try {
      let userData = null;

      if (isOwnProfile) {
        try {
          const stored = JSON.parse(localStorage.getItem("user") || "{}");
          userData = stored;
        } catch {
          userData = {};
        }

        try {
          const res = await api.get("/users/profile");
          const apiData = res.data?.data || res.data;
          if (apiData) {
            userData = apiData;
            localStorage.setItem("user", JSON.stringify({ ...userData, ...apiData }));
          }
        } catch (apiErr) {
          console.error("Failed to fetch own profile from API:", apiErr);
        }
      } else {
        try {
          const res = await api.get(`/users/${id}`);
          userData = res.data?.data || res.data;
        } catch (apiErr) {
          console.error("Failed to fetch other user's profile:", apiErr);
          setLoadingProfile(false);
          return;
        }
      }

      if (userData) {
        setSeller({
          id: userData.id || null,
          name: userData.name || "",
          username: userData.username || "",
          avatar: userData.avatar || DEFAULT_AVATAR,
          banner: userData.banner || DEFAULT_BANNER,
          bio: userData.bio || "",
          location: userData.location || "",
          email: userData.email || "",
          phone: userData.phone || "",
          joined: userData.created_at
            ? new Date(userData.created_at).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
            : "",
          rating: 0,
          reviews: 0,
        });

        const targetId = userData.id || (isOwnProfile ? authUser.id : id);
        fetchUserBusinesses(targetId, isOwnProfile);
        fetchUserBlogs(targetId, isOwnProfile);
        fetchUserProducts(targetId, isOwnProfile);
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchUserBusinesses = async (targetId, own) => {
    try {
      setLoadingBusinesses(true);
      if (!targetId && !own) {
        setUserBusinesses([]);
        return;
      }
      const endpoint = own ? "/my-businesses" : `/businesses?user_id=${targetId}&all=true`;
      const res = await api.get(endpoint);
      const businesses = res.data?.data || res.data || [];
      const rawList = Array.isArray(businesses) ? businesses : (businesses?.data || []);
      const list = rawList.filter((b) => {
        if (own) return true;
        return targetId && String(b.user_id || b.user?.id) === String(targetId);
      });
      setUserBusinesses(list);
    } catch (err) {
      console.error("Failed to fetch businesses:", err);
      setUserBusinesses([]);
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const fetchUserBlogs = async (targetId, own) => {
    try {
      setLoadingBlogs(true);
      if (!targetId && !own) {
        setUserBlogs([]);
        return;
      }
      const endpoint = own ? "/my-blogs" : `/blogs?user_id=${targetId}&all=true`;
      const res = await api.get(endpoint);
      const blogResponse = res.data?.data || res.data;
      const rawBlogs = Array.isArray(blogResponse) ? blogResponse : (blogResponse?.data || []);
      const blogs = rawBlogs.filter((b) => {
        if (own) return true;
        const matchesUser = targetId && String(b.user_id || b.user?.id) === String(targetId);
        return matchesUser && b.status === "published";
      });
      setUserBlogs(blogs);
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      setUserBlogs([]);
    } finally {
      setLoadingBlogs(false);
    }
  };

  const fetchUserProducts = async () => {
    setUserProducts([]);
    setLoadingProducts(false);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchUserData();

    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setAuthUser(JSON.parse(storedUser));
        } catch {}
      }
      fetchUserData();
    };
    window.addEventListener("userAuthChanged", loadUser);

    return () => {
      window.removeEventListener("userAuthChanged", loadUser);
    };
  }, [id]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Profil ${seller.name || seller.username} - Surade.com`,
          url: url,
        });
        return;
      } catch {}
    }
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getMediaUrl = (url, fallback) => {
    if (!url) return fallback || DEFAULT_AVATAR;
    return getStorageUrl(url);
  };

  const totalViews = userBusinesses.reduce((acc, biz) => acc + (biz.views || 0), 0);
  const isSeller = userBusinesses.length > 0;

  const tabs = [
    { key: "ads", label: "Usaha", icon: Store, count: userBusinesses.length },
    ...(userBlogs.length > 0 || isSeller ? [{ key: "blogs", label: "Info & Event", icon: FileText, count: userBlogs.length }] : []),
  ];

  if (loadingProfile) {
    return (
      <div className="profile-page profile-page--loading min-h-screen flex flex-col bg-[#f8fafc]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <SuradeLoader
            variant="section"
            text="Memuat profil pengguna"
            subtext="Mengambil data profil dan direktori usaha di Surade"
            showBrand
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-container">
        {/* ── PROFILE HEADER CARD ── */}
        <section className="profile-card-header">
          {/* Top: Avatar + Info */}
          <div className="profile-card-header__top">
            {/* Avatar */}
            <div className="profile-avatar-box">
              <img
                src={getMediaUrl(seller.avatar)}
                alt={seller.name || "User"}
                className="profile-avatar-img"
                onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
              />
              <span className="profile-avatar-badge" title="Pengguna Terverifikasi">
                <CheckCircle2 size={16} />
              </span>
            </div>

            {/* Details */}
            <div className="profile-details">
              <div className="profile-details__role-row">
                <span className={`profile-role-badge ${isSeller ? "profile-role-badge--seller" : ""}`}>
                  {isSeller ? "✦ Verified Business Owner" : "Pengguna Terverifikasi"}
                </span>
                {seller.username && (
                  <span className="profile-username-pill">@{seller.username}</span>
                )}
              </div>

              <h1 className="profile-display-name">
                {seller.name || seller.username || "Pengguna Surade.com"}
              </h1>

              {seller.bio && (
                <p className="profile-bio-text">"{seller.bio}"</p>
              )}

              <div className="profile-meta-chips">
                <div className="profile-meta-chip">
                  <MapPin size={14} className="text-[#007570]" />
                  <span>{seller.location || "Indonesia"}</span>
                </div>
                <div className="profile-meta-chip">
                  <Calendar size={14} className="text-[#007570]" />
                  <span>Bergabung {seller.joined || "Baru saja"}</span>
                </div>
                {isSeller && (
                  <div className="profile-meta-chip profile-meta-chip--verified">
                    <TrendingUp size={14} className="text-emerald-600" />
                    <span className="text-emerald-700 font-bold">{totalViews.toLocaleString("id-ID")} total pengunjung</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="profile-card-header__divider" />

          {/* Bottom: Stats + Actions */}
          <div className="profile-card-header__bottom">
            {/* Stats */}
            <div className="profile-stats-grid">
              <div className="profile-stat-card">
                <div className="profile-stat-icon profile-stat-icon--teal">
                  <Store size={18} />
                </div>
                <div className="profile-stat-info">
                  <span className="profile-stat-number">{userBusinesses.length}</span>
                  <span className="profile-stat-label">Usaha Aktif</span>
                </div>
              </div>

              <div className="profile-stat-card">
                <div className="profile-stat-icon profile-stat-icon--purple">
                  <FileText size={18} />
                </div>
                <div className="profile-stat-info">
                  <span className="profile-stat-number">{userBlogs.length}</span>
                  <span className="profile-stat-label">Info & Event</span>
                </div>
              </div>

              <div className="profile-stat-card">
                <div className="profile-stat-icon profile-stat-icon--amber">
                  <Eye size={18} />
                </div>
                <div className="profile-stat-info">
                  <span className="profile-stat-number">{totalViews.toLocaleString("id-ID")}</span>
                  <span className="profile-stat-label">Total Pengunjung</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="profile-actions-row">
              {!isOwnProfile ? (
                <button
                  type="button"
                  className={`profile-action-btn ${followed ? "profile-action-btn--followed" : "profile-action-btn--follow"}`}
                  onClick={() => requireAuth(() => setFollowed(!followed))}
                >
                  {followed ? <UserCheck size={16} /> : <UserPlus size={16} />}
                  <span>{followed ? "Mengikuti" : "Ikuti Profil"}</span>
                </button>
              ) : (
                <Link
                  to="/dashboard?tab=profile"
                  className="profile-action-btn profile-action-btn--edit"
                >
                  <span>Edit Profil Saya</span>
                  <ExternalLink size={15} />
                </Link>
              )}

              <button
                type="button"
                className="profile-action-btn profile-action-btn--share"
                onClick={handleShare}
                title="Bagikan Tautan Profil"
              >
                <Share2 size={16} />
                <span>{copied ? "Link Disalin!" : "Bagikan"}</span>
              </button>

              {!isOwnProfile && isSeller && (
                <button
                  type="button"
                  className="profile-action-btn profile-action-btn--chat"
                  onClick={() => requireAuth(() => navigate(`/dashboard?tab=inbox`))}
                >
                  <MessageCircle size={15} />
                  <span>Kirim Pesan</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── CONTENT TABS ── */}
        <section className="profile-content">
          <div className="profile-content__inner">
            <div className="profile-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`profile-tab ${activeTab === tab.key ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <tab.icon size={17} />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`profile-tab-badge ${activeTab === tab.key ? "profile-tab-badge--active" : ""}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── TAB: USAHA AKTIF ── */}
            {activeTab === "ads" && (
              <div className="profile-section">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="profile-section__title">Usaha Aktif</h2>
                    <p className="profile-section__subtitle">
                      {userBusinesses.length > 0
                        ? `${userBusinesses.length} usaha terdaftar di portal Surade.com`
                        : "Belum ada usaha terdaftar"}
                    </p>
                  </div>
                  {isOwnProfile && (
                    <Link
                      to="/add-business"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-sm transition-all shadow-sm"
                    >
                      <Plus size={16} />
                      <span className="hidden sm:block">Tambah Usaha</span>
                    </Link>
                  )}
                </div>

                {loadingBusinesses ? (
                  <SuradeLoader variant="section" size="sm" text="Memuat daftar usaha" minHeight="180px" />
                ) : userBusinesses.length > 0 ? (
                  <div className="profile-grid">
                    {userBusinesses.map((business) => (
                      <Link key={business.id} to={`/business/${business.id}`} className="profile-card">
                        <div className="profile-card__img-wrap">
                          <img
                            src={getMediaUrl(business.thumbnail || business.logo || business.images?.[0])}
                            alt={business.name}
                            className="profile-card__img"
                            onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                          />
                          <div className="profile-card__overlay">
                            <div className="profile-card__views">
                              <Eye size={13} />
                              <span>{(business.views || 0).toLocaleString()}</span>
                            </div>
                          </div>
                          {business.is_verified && (
                            <div className="profile-card__verified-badge">
                              <CheckCircle2 size={12} />
                              <span>Terverifikasi</span>
                            </div>
                          )}
                        </div>
                        <div className="profile-card__body">
                          <h3 className="profile-card__name">{business.name}</h3>
                          <p className="profile-card__category">
                            {typeof business.category === "object"
                              ? business.category?.name
                              : business.category || "Bisnis"}
                          </p>
                          <div className="profile-card__meta">
                            <div className="profile-card__rating">
                              <Star size={13} fill="#fbbf24" stroke="#fbbf24" />
                              <span>{business.rating || "5.0"}</span>
                              <span className="text-slate-400 font-normal text-[11px]">
                                ({business.reviews_count || 0})
                              </span>
                            </div>
                            <span className="profile-card__status open">Aktif</span>
                          </div>
                          {business.address && (
                            <div className="profile-card__address">
                              <MapPin size={11} className="text-slate-400 shrink-0" />
                              <span className="truncate">{business.address}</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <Store size={48} />
                    <p>Belum ada usaha yang terdaftar</p>
                    {isOwnProfile && (
                      <Link to="/add-business" className="btn-primary">
                        <Plus size={16} />
                        Daftarkan Usaha Sekarang
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: INFO & EVENT ── */}
            {activeTab === "blogs" && (
              <div className="profile-section">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="profile-section__title">Artikel Info & Event</h2>
                    <p className="profile-section__subtitle">
                      {userBlogs.length > 0
                        ? `${userBlogs.length} konten yang dipublikasikan`
                        : "Belum ada artikel atau event"}
                    </p>
                  </div>
                  {isOwnProfile && (
                    <Link
                      to="/add-blog"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-sm transition-all shadow-sm"
                    >
                      <Plus size={16} />
                      <span className="hidden sm:block">Tulis Konten</span>
                    </Link>
                  )}
                </div>

                {loadingBlogs ? (
                  <SuradeLoader variant="section" size="sm" text="Memuat data info & event" minHeight="180px" />
                ) : userBlogs.length > 0 ? (
                  <div className="profile-grid">
                    {userBlogs.map((blog) => (
                      <Link key={blog.id} to={`/blog/${blog.id}`} className="profile-card profile-card--blog">
                        <div className="profile-card__img-wrap">
                          <img
                            src={getMediaUrl(blog.thumbnail || blog.banner || blog.image)}
                            alt={blog.title}
                            className="profile-card__img"
                            onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                          />
                          <div className="profile-card__overlay">
                            <div className="profile-card__views">
                              <Eye size={13} />
                              <span>{(blog.views || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="profile-card__body">
                          <span className="profile-card__blog-category">
                            {typeof blog.category === "object" ? blog.category?.name : blog.category || "Blog"}
                          </span>
                          <h3 className="profile-card__name">{blog.title}</h3>
                          <p className="profile-card__excerpt">
                            {blog.excerpt || blog.description || "Artikel info & event"}
                          </p>
                          <div className="profile-card__date">
                            <Calendar size={12} />
                            <span>
                              {blog.created_at
                                ? new Date(blog.created_at).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })
                                : "Info"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FileText size={48} />
                    <p>Belum ada artikel atau event yang ditulis.</p>
                    {isOwnProfile && (
                      <Link to="/add-blog" className="btn-primary">
                        <Plus size={16} />
                        Tulis Artikel Pertama
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
