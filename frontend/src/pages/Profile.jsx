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
} from "lucide-react";
import "./Home.css";
import "./Profile.css";
import "../components/Navbar.css";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { DEFAULT_AVATAR, DEFAULT_BANNER, getStorageUrl } from "../utils/constants";

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

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchUserProfile();
    fetchUserBusinesses();
    fetchUserBlogs();

    // Listen for user auth changes
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setAuthUser(parsed);
        } catch { }
      }
      fetchUserProfile();
      fetchUserBusinesses();
      fetchUserBlogs();
    };
    window.addEventListener("userAuthChanged", loadUser);

    return () => {
      window.removeEventListener("userAuthChanged", loadUser);
    };
  }, [id]);

  const isOwnProfile = !id || String(id) === String(authUser.id);

  const fetchUserBusinesses = async () => {
    try {
      setLoadingBusinesses(true);
      const endpoint = isOwnProfile ? '/my-businesses' : `/businesses?user_id=${id}`;
      const res = await api.get(endpoint);
      const businesses = res.data?.data || res.data || [];
      const list = Array.isArray(businesses) ? businesses : (businesses?.data || []);
      setUserBusinesses(list);
    } catch (err) {
      console.error("Failed to fetch businesses:", err);
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const fetchUserBlogs = async () => {
    try {
      setLoadingBlogs(true);
      const endpoint = isOwnProfile ? '/my-blogs' : `/blogs?user_id=${id}`;
      const res = await api.get(endpoint);
      const blogResponse = res.data?.data || res.data;
      const blogs = Array.isArray(blogResponse) ? blogResponse : (blogResponse?.data || []);
      setUserBlogs(blogs);
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
    } finally {
      setLoadingBlogs(false);
    }
  };

  const fetchUserProfile = async () => {
    setLoadingProfile(true);
    try {
      let userData = null;

      // If viewing own profile - use localStorage first, then try API
      if (isOwnProfile) {
        try {
          const stored = JSON.parse(localStorage.getItem("user") || "{}");
          userData = stored;
        } catch {
          userData = {};
        }
        
        // Try to fetch from API to get latest data
        try {
          const res = await api.get('/users/profile');
          const apiData = res.data?.data || res.data;
          if (apiData) {
            userData = apiData;
            const updatedUserObj = { ...userData, ...apiData };
            localStorage.setItem("user", JSON.stringify(updatedUserObj));
          }
        } catch (apiErr) {
          console.error("Failed to fetch own profile from API, using local data:", apiErr);
          // Continue with stored data
        }
      } else {
        // Viewing another user's public profile - fetch from API
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
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const getMediaUrl = (url, fallback) => {
    if (!url) return fallback || DEFAULT_AVATAR;
    return getStorageUrl(url);
  };

  if (loadingProfile) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="loading-spinner">
          <Loader2 size={32} className="animate-spin" />
          <span>Memuat profil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />

      {/* Profile Header */}
      <section className="profile-header">
        <div className="profile-header__inner">
          <div className="profile-header__cover">
            {seller.banner ? (
              <img
                src={getMediaUrl(seller.banner, defaultBanner)}
                alt="Banner"
                className="profile-header__cover-bg"
                style={{ backgroundImage: 'none' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'block'; }}
              />
            ) : null}
            <div className="profile-header__cover-bg" style={{ display: seller.banner ? 'none' : 'block' }} />
          </div>

          <div className="profile-header__content">
            <div className="profile-header__avatar-wrapper">
              <img
                src={getMediaUrl(seller.avatar)}
                alt={seller.name}
                className="profile-header__avatar"
                onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
              />
            </div>

            <div className="profile-header__info">
              <h1 className="profile-header__name">{seller.username || seller.name || "User"}</h1>
              {seller.name && seller.username !== seller.name && (
                <p className="profile-header__username" style={{ color: "#64748b", fontSize: "0.95rem", marginTop: "-4px", marginBottom: "8px", fontWeight: 500 }}>
                  {seller.name}
                </p>
              )}
              {seller.bio && <p className="profile-header__bio">{seller.bio}</p>}

              <div className="profile-header__meta">
                <div className="profile-header__meta-item">
                  <MapPin size={16} />
                  <span>{seller.location || "Lokasi tidak diatur"}</span>
                </div>
                <div className="profile-header__meta-item">
                  <Calendar size={16} />
                  <span>Bergabung {seller.joined}</span>
                </div>
                {seller.rating > 0 && (
                  <div className="profile-header__meta-item">
                    <Star size={16} fill="#fbbf24" stroke="#fbbf24" />
                    <span>{seller.rating} ({seller.reviews} ulasan)</span>
                  </div>
                )}
              </div>

              <div className="profile-header__stats">
                <div className="profile-header__stat">
                  <span className="profile-header__stat-value">{userBusinesses.length}</span>
                  <span className="profile-header__stat-label">Usaha</span>
                </div>
                <div className="profile-header__stat">
                  <span className="profile-header__stat-value">{userBlogs.length}</span>
                  <span className="profile-header__stat-label">Blog</span>
                </div>
                <div className="profile-header__stat">
                  <span className="profile-header__stat-value">{userBusinesses.reduce((acc, biz) => acc + (biz.views || 0), 0).toLocaleString()}</span>
                  <span className="profile-header__stat-label">Total Views</span>
                </div>
              </div>

              <div className="profile-header__actions">
                <button
                  className={`profile-header__btn profile-header__btn--primary ${saved ? "saved" : ""}`}
                  onClick={() => setSaved(!saved)}
                >
                  <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
                  {saved ? "Disimpan" : "Simpan"}
                </button>
                <button className="profile-header__btn profile-header__btn--secondary">
                  <Share2 size={18} />
                  Bagikan
                </button>
              </div>
            </div>
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
                  <p>Belum ada blog yang ditulis</p>
                  <Link to="/add-blog" className="btn-primary">
                    <Plus size={16} />
                    Tulis Blog
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

