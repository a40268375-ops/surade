import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Plus,
  MapPin,
  Star,
  Share2,
  Bookmark,
  Store,
  Calendar,
  Eye,
  Tag,
  Loader2,
  FileText,
  CheckCircle2,
} from "lucide-react";
import "./Home.css";
import "./Profile.css";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { DEFAULT_AVATAR, DEFAULT_BANNER, getStorageUrl } from "../utils/constants";
import { requireAuth } from "../utils/authCheck";

export default function Profile() {
  const { id } = useParams();

  // Get auth user from localStorage
  const [authUser, setAuthUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

  // Initialize seller from localStorage user data
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
      ? new Date(storedUser.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      : "",
    rating: 0,
    reviews: 0,
  };

  const [seller, setSeller] = useState(initialSeller);
  const [activeTab, setActiveTab] = useState("ads");
  const [saved, setSaved] = useState(false);

  // User's businesses and blogs
  const [userBusinesses, setUserBusinesses] = useState([]);
  const [userBlogs, setUserBlogs] = useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
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
          const res = await api.get('/users/profile');
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
            ? new Date(userData.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
            : "",
          rating: 0,
          reviews: 0,
        });

        const targetId = isOwnProfile ? (userData.id || authUser.id) : (userData.id || id);
        fetchUserBusinesses(targetId, isOwnProfile);
        fetchUserBlogs(targetId, isOwnProfile);
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
      const endpoint = own ? '/my-businesses' : `/businesses?user_id=${targetId}&all=true`;
      const res = await api.get(endpoint);
      const businesses = res.data?.data || res.data || [];
      const list = Array.isArray(businesses) ? businesses : (businesses?.data || []);
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
      const endpoint = own ? '/my-blogs' : `/blogs?user_id=${targetId}&all=true`;
      const res = await api.get(endpoint);
      const blogResponse = res.data?.data || res.data;
      const blogs = Array.isArray(blogResponse) ? blogResponse : (blogResponse?.data || []);
      setUserBlogs(blogs);
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      setUserBlogs([]);
    } finally {
      setLoadingBlogs(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchUserData();

    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setAuthUser(JSON.parse(storedUser));
        } catch { }
      }
      fetchUserData();
    };
    window.addEventListener("userAuthChanged", loadUser);

    return () => {
      window.removeEventListener("userAuthChanged", loadUser);
    };
  }, [id]);

  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Profil ${seller.name || seller.username} - Surade.co.id`,
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

  if (loadingProfile) {
    return (
      <div className="profile-page profile-page--loading">
        <Navbar />
        <div className="loading-spinner">
          <Loader2 size={36} className="animate-spin text-[#007570]" />
          <span>Memuat profil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />

      {/* Main Profile Container with proper navbar offset */}
      <div className="profile-container">
        {/* Profile Card Header */}
        <section className="profile-card-header">
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

            {/* User Main Details */}
            <div className="profile-details">
              <div className="profile-details__role-row">
                <span className="profile-role-badge">
                  {userBusinesses.length > 0 ? "Verified Business Owner" : "Pengguna Terverifikasi"}
                </span>
                {seller.username && (
                  <span className="profile-username-pill">
                    @{seller.username}
                  </span>
                )}
              </div>

              <h1 className="profile-display-name">
                {seller.name || seller.username || "Pengguna Surade.co.id"}
              </h1>

              {seller.name && seller.username && seller.name !== seller.username && (
                <p className="profile-alias-name">
                  {seller.username}
                </p>
              )}

              {seller.bio && (
                <p className="profile-bio-text">
                  "{seller.bio}"
                </p>
              )}

              {/* Meta Chips */}
              <div className="profile-meta-chips">
                <div className="profile-meta-chip">
                  <MapPin size={14} className="text-[#007570]" />
                  <span>{seller.location || "Indonesia"}</span>
                </div>

                <div className="profile-meta-chip">
                  <Calendar size={14} className="text-[#007570]" />
                  <span>Bergabung {seller.joined || "Baru saja"}</span>
                </div>

                {seller.rating > 0 && (
                  <div className="profile-meta-chip profile-meta-chip--rating">
                    <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                    <span className="font-bold text-slate-800">{seller.rating}</span>
                    <span className="text-slate-400">({seller.reviews} ulasan)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="profile-card-header__divider" />

          {/* Stats and Action Buttons Row */}
          <div className="profile-card-header__bottom">
            {/* Stats Cards */}
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
                  <span className="profile-stat-label">Blog & Event</span>
                </div>
              </div>

              <div className="profile-stat-card">
                <div className="profile-stat-icon profile-stat-icon--amber">
                  <Eye size={18} />
                </div>
                <div className="profile-stat-info">
                  <span className="profile-stat-number">
                    {userBusinesses.reduce((acc, biz) => acc + (biz.views || 0), 0).toLocaleString("id-ID")}
                  </span>
                  <span className="profile-stat-label">Total Pengunjung</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="profile-actions-row">
              <button
                type="button"
                className={`profile-action-btn profile-action-btn--save ${saved ? "is-saved" : ""}`}
                onClick={() => requireAuth(() => setSaved(!saved))}
              >
                <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
                <span>{saved ? "Disimpan" : "Simpan Profil"}</span>
              </button>

              <button
                type="button"
                className="profile-action-btn profile-action-btn--share"
                onClick={handleShare}
                title="Bagikan Tautan Profil"
              >
                <Share2 size={16} />
                <span>{copied ? "Link Disalin!" : "Bagikan"}</span>
              </button>
            </div>
          </div>
        </section>

      {/* Content Tabs */}
      <section className="profile-content">
        <div className="profile-content__inner">
          <div className="profile-tabs">
            <button
              className={`profile-tab ${activeTab === "ads" ? "active" : ""}`}
              onClick={() => setActiveTab("ads")}
            >
              <Store size={18} />
              <span>Usaha</span>
            </button>
            <button
              className={`profile-tab ${activeTab === "blogs" ? "active" : ""}`}
              onClick={() => setActiveTab("blogs")}
            >
              <Tag size={18} />
              <span>Blog</span>
            </button>
          </div>

          {/* Ads Content */}
          {activeTab === "ads" && (
            <div className="profile-section">
              <h2 className="profile-section__title">Usaha Aktif</h2>
              {loadingBusinesses ? (
                <div className="loading-spinner">Memuat usaha...</div>
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
                            <Eye size={14} />
                            <span>{(business.views || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="profile-card__body">
                        <h3 className="profile-card__name">{business.name}</h3>
                        <p className="profile-card__category">
                          {typeof business.category === 'object' ? business.category?.name : business.category || "Bisnis"}
                        </p>
                        <div className="profile-card__meta">
                          <div className="profile-card__rating">
                            <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                            <span>{business.rating || 4.5}</span>
                          </div>
                          <span className={`profile-card__status open`}>
                            Buka Sekarang
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Store size={48} />
                  <p>Belum ada usaha yang diupload</p>
                  <Link to="/add-business" className="btn-primary">
                    <Plus size={16} />
                    Tambah Usaha
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Blogs Content */}
          {activeTab === "blogs" && (
            <div className="profile-section">
              <h2 className="profile-section__title">Artikel Blog</h2>
              {loadingBlogs ? (
                <div className="loading-spinner">Memuat blog...</div>
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
                            <Eye size={14} />
                            <span>{(blog.views || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="profile-card__body">
                        <span className="profile-card__blog-category">
                          {typeof blog.category === 'object' ? blog.category?.name : blog.category || "Blog"}
                        </span>
                        <h3 className="profile-card__name">{blog.title}</h3>
                        <p className="profile-card__excerpt">{blog.excerpt || blog.description || "Artikel blog"}</p>
                        <div className="profile-card__date">
                          <Calendar size={14} />
                          <span>{blog.created_at ? new Date(blog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "Blog"}</span>
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
                      Tulis Blog
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
          </div>
        </section>
      </div>
    </div>
  );
}

