import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { getImageUrl } from "../utils/api";
import Navbar from "../components/Navbar";
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  MessageCircle, 
  Heart,
  Share2,
  Camera,
  Globe,
  Clock,
  ThumbsUp,
  Send,
  Bookmark,
  BookmarkCheck,
  Eye,
  Store,
  CheckCircle2,
  AlertCircle,
  Info,
  X
} from "lucide-react";
import "./SellerProfile.css";

const DEFAULT_SELLER = {
  id: 1,
  name: "Budi Utomo",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  bio: "Pengusaha lokal yang berpengalaman lebih dari 10 tahun dalam bidang kuliner dan perdagangan.",
  phone: "08123456789",
  email: "budi.utomo@example.com",
  location: "Kabupaten Sukabumi, Jawa Barat",
  joined: "Maret 2020",
  rating: 4.8,
  reviewCount: 124,
  businessCount: 3,
  totalViews: 15240
};

export default function SellerProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("businesses");
  const [saved, setSaved] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  
  // Review form states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Chat states
  const [chatMessage, setChatMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatThread, setChatThread] = useState([]);
  const [loadingChatThread, setLoadingChatThread] = useState(false);
  
  // UI states
  const [savingToggle, setSavingToggle] = useState(false);
  const [toasts, setToasts] = useState([]);
  // Menyimpan review id yang sudah di-like sesi ini di browser ini supaya
  // tombol "Berguna" langsung kelihatan aktif tanpa nunggu reload; angka
  // helpful_count yang sesungguhnya tetap datang dari server.
  const [helpfulVoted, setHelpfulVoted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("helpful_votes_seller") || "{}");
    } catch {
      return {};
    }
  });

  // Kalau ulasan lebih dari 3, awalnya cuma 3 yang ditampilkan - sisanya
  // baru muncul setelah klik "Lihat Semua Ulasan" (gaya Google Play Store).
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    loadSellerData();
  }, [id]);

  // Update page title and meta tags when seller data loads
  useEffect(() => {
    if (seller) {
      document.title = `${seller.name} - Profile Penjual | Surade.co.id`;
      
      // Update meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', `Profile ${seller.name} dengan ${seller.businessCount} bisnis di Surade.co.id. Rating ${seller.rating}/5 dari ${seller.reviewCount} ulasan.`);
      }
    }
    
    return () => {
      // Reset title when component unmounts
      document.title = "Surade.co.id - Platform Bisnis Lokal";
    };
  }, [seller]);

  // Notifikasi custom (pojok kanan atas, hilang otomatis) - menggantikan
  // alert() bawaan browser yang terlihat mentah/kurang matang.
  const showNotification = (message, type = 'info') => {
    const toastId = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id: toastId, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 4000);
  };

  const dismissToast = (toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  // Toggle like/"berguna" pada satu ulasan seller. Butuh login - kalau
  // belum login, arahkan buka modal ulasan (yang akan minta login juga).
  const handleToggleHelpful = async (reviewId) => {
    if (!user) {
      showNotification("Silakan login dulu untuk menandai ulasan ini berguna.", "info");
      return;
    }
    try {
      const result = await api.post(`/reviews/seller/${reviewId}/helpful`);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, helpful_count: result.helpful_count } : r))
      );
      setHelpfulVoted((prev) => {
        const next = { ...prev, [reviewId]: result.helpful_by_me };
        localStorage.setItem("helpful_votes_seller", JSON.stringify(next));
        return next;
      });
    } catch (err) {
      console.warn("Gagal toggle helpful:", err);
      showNotification("Gagal menandai ulasan ini berguna. Coba lagi.", "error");
    }
  };

  const loadSellerData = async () => {
    try {
      setLoading(true);
      
      // Load seller info with better error handling
      try {
        const sellerData = await api.get(`/sellers/${id}`);
        setSeller(sellerData);
      } catch (sellerErr) {
        console.warn("Failed to load seller info, using default:", sellerErr);
        setSeller({ ...DEFAULT_SELLER, id: parseInt(id) });
      }
      
      // Load seller's businesses with fallback
      try {
        const businessData = await api.get(`/sellers/${id}/businesses`);
        setBusinesses(Array.isArray(businessData) ? businessData : []);
      } catch (businessErr) {
        console.warn("Failed to load businesses:", businessErr);
        // Jangan tampilkan data dummy di sini - itu yang bikin daftar bisnis
        // kelihatan "aneh" (bisnis yang muncul bukan punya penjual ini).
        // Kalau API benar-benar gagal, lebih baik tampilkan daftar kosong
        // yang jujur (lihat empty-state di bawah) daripada bisnis palsu.
        setBusinesses([]);
      }
      
      // Load reviews with fallback
      try {
        const reviewData = await api.get(`/sellers/${id}/reviews`);
        setReviews(Array.isArray(reviewData) ? reviewData : []);
      } catch (reviewErr) {
        console.warn("Failed to load reviews:", reviewErr);
        setReviews([]);
      }
      
      // Check if saved (optional)
      if (user) {
        try {
          const savedData = await api.get(`/sellers/${id}/is-saved`);
          setSaved(savedData?.is_saved || false);
        } catch (savedErr) {
          console.warn("Failed to check saved status:", savedErr);
          setSaved(false);
        }
      }
      
    } catch (err) {
      console.error("Critical error in loadSellerData:", err);
      // Set default data to prevent blank page
      setSeller({ ...DEFAULT_SELLER, id: parseInt(id) });
      setBusinesses([]);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    setSavingToggle(true);
    try {
      if (saved) {
        await api.delete(`/sellers/${id}/unsave`);
        setSaved(false);
        showNotification("Penjual dihapus dari favorit", 'success');
      } else {
        await api.post(`/sellers/${id}/save`);
        setSaved(true);  
        showNotification("Penjual ditambahkan ke favorit", 'success');
      }
    } catch (err) {
      const message = err?.data?.message || "Gagal menyimpan penjual.";
      showNotification(message, 'error');
    } finally {
      setSavingToggle(false);
    }
  };

  const handleWhatsApp = () => {
    if (!seller?.phone) {
      showNotification("Nomor WhatsApp tidak tersedia untuk penjual ini", 'error');
      return;
    }
    
    const phone = seller.phone.replace(/\D/g, "");
    let formattedPhone = phone;
    
    // Ensure Indonesian phone format
    if (phone.startsWith("0")) {
      formattedPhone = "62" + phone.substring(1);
    } else if (!phone.startsWith("62")) {
      formattedPhone = "62" + phone;
    }
    
    const message = `Halo ${seller.name}, saya tertarik dengan bisnis Anda di Surade.co.id`;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = `Profile ${seller.name} - Surade.co.id`;
    const text = `Lihat profile ${seller.name} dan ${seller.businessCount} bisnisnya di Surade.co.id`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        // User cancelled share or error occurred
        if (err.name !== 'AbortError') {
          // Fallback to clipboard
          await copyToClipboard(url);
        }
      }
    } else {
      await copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification("Link profile disalin ke clipboard!", 'success');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showNotification("Link profile disalin ke clipboard!", 'success');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (reviewComment.trim().length < 10) {
      showNotification("Komentar harus minimal 10 karakter", 'error');
      return;
    }
    
    if (reviewComment.trim().length > 1000) {
      showNotification("Komentar maksimal 1000 karakter", 'error');
      return;
    }
    
    setSubmittingReview(true);
    try {
      const newReview = await api.post(`/sellers/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment.trim()
      });
      
      setReviews(prev => [newReview, ...prev]);
      setReviewComment("");
      setReviewRating(5);
      setShowReviewModal(false);
      showNotification("Ulasan berhasil dikirim!", 'success');
      
      // Update seller rating
      loadSellerData();
      
    } catch (err) {
      const rawMessage = err?.data?.message;
      
      // Fallback: jika API gagal (server mati), simpan ulasan secara lokal
      // agar user tetap bisa melihat ulasannya muncul di halaman penjual.
      if (err?.isNetworkError || err?.status === 0) {
        const tempReview = {
          id: Date.now(),
          user_name: user?.name || "Anda",
          user_avatar: user?.avatar || null,
          rating: reviewRating,
          comment: reviewComment.trim(),
          created_at: new Date().toISOString(),
          helpful_count: 0,
        };
        setReviews(prev => [tempReview, ...prev]);
        setReviewComment("");
        setReviewRating(5);
        setShowReviewModal(false);
        showNotification("Ulasan berhasil dikirim (disimpan lokal)!", 'success');
      } else {
        const message =
          rawMessage === "Cannot review yourself"
            ? "Anda tidak bisa memberi ulasan untuk profil Anda sendiri."
            : rawMessage || "Gagal mengirim ulasan.";
        showNotification(message, 'error');
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  // Ambil riwayat percakapan dengan penjual ini (dua arah) dari inbox
  // pribadi kita sendiri, lalu saring khusus untuk bisnis milik penjual ini.
  // "/my-messages" untuk akun yang sedang login sebagai pelanggan otomatis
  // hanya berisi pesan yang ia kirim + balasan yang ia terima.
  const loadChatThread = async () => {
    if (!user) return;
    setLoadingChatThread(true);
    try {
      const sellerBusinessIds = businesses.map((b) => b.id);
      const data = await api.get("/my-messages");
      const thread = (Array.isArray(data) ? data : [])
        .filter((m) => sellerBusinessIds.includes(m.business_id))
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setChatThread(thread);

      // Tandai balasan penjual yang belum dibaca jadi dibaca begitu dibuka.
      thread
        .filter((m) => !m.is_read && m.sender_role === "seller")
        .forEach((m) => {
          api.put(`/messages/${m.id}`).catch(() => {});
        });
    } catch (err) {
      console.warn("Gagal memuat riwayat chat:", err);
      setChatThread([]);
    } finally {
      setLoadingChatThread(false);
    }
  };

  const handleOpenChatModal = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setShowChatModal(true);
    loadChatThread();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (chatMessage.trim().length < 5) {
      showNotification("Pesan harus minimal 5 karakter", 'error');
      return;
    }
    
    if (chatMessage.trim().length > 1000) {
      showNotification("Pesan maksimal 1000 karakter", 'error');
      return;
    }
    
    setSendingMessage(true);
    try {
      const res = await api.post(`/sellers/${id}/messages`, {
        message: chatMessage.trim()
      });

      // Tampilkan langsung pesan yang baru dikirim di dalam thread chat,
      // tanpa perlu menutup modal - supaya kelihatan seperti chat beneran.
      if (res?.data) {
        setChatThread((prev) => [...prev, res.data]);
      }
      setChatMessage("");
      showNotification("Pesan berhasil dikirim!", 'success');
      
    } catch (err) {
      const message = err?.data?.message || "Gagal mengirim pesan.";
      showNotification(message, 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long", 
      year: "numeric"
    });
  };

  const renderStars = (rating, interactive = false, onRate = null) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={interactive ? 24 : 16}
            className={`star ${star <= rating ? 'filled' : 'empty'} ${interactive ? 'interactive' : ''}`}
            onClick={interactive ? () => onRate(star) : undefined}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="seller-profile-page">
        <Navbar />
        <div className="seller-loading">
          <div className="spinner"></div>
          <p>Memuat profile penjual...</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="seller-profile-page">
        <Navbar />
        <div className="seller-error">
          <h2>Penjual tidak ditemukan</h2>
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={18} />
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-profile-page">
      <Navbar />

      {toasts.length > 0 && (
        <div className="seller-toast-wrap">
          {toasts.map((t) => (
            <div key={t.id} className={`seller-toast seller-toast--${t.type}`}>
              <span className="seller-toast__icon">
                {t.type === "success" && <CheckCircle2 size={18} />}
                {t.type === "error" && <AlertCircle size={18} />}
                {t.type === "info" && <Info size={18} />}
              </span>
              <span className="seller-toast__text">{t.message}</span>
              <button className="seller-toast__close" onClick={() => dismissToast(t.id)} aria-label="Tutup">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Header Section */}
      <section
        className={`seller-header ${seller.cover_photo ? "seller-header--has-cover" : ""}`}
        style={seller.cover_photo ? { backgroundImage: `url(${getImageUrl(seller.cover_photo)})` } : undefined}
      >
        <div className="seller-header__inner">
          <button 
            onClick={() => {
              // Smart back navigation
              if (document.referrer && document.referrer.includes(window.location.origin)) {
                navigate(-1);
              } else {
                navigate('/');
              }
            }} 
            className="seller-back-btn"
          >
            <ArrowLeft size={20} />
            Kembali
          </button>
          
          <div className="seller-info">
            <div className="seller-avatar-container">
              {seller.avatar ? (
                <img
                  src={getImageUrl(seller.avatar)}
                  alt={seller.name}
                  className="seller-avatar"
                />
              ) : (
                <div className="seller-avatar seller-avatar--placeholder">
                  {(seller.name || "?").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="seller-status-indicator"></div>
            </div>
            
            <div className="seller-details">
              <h1 className="seller-name">{seller.name}</h1>
              {seller.bio && (
                <div className="seller-bio" dangerouslySetInnerHTML={{ __html: seller.bio }} />
              )}
              
              <div className="seller-meta">
                <div className="seller-meta-item">
                  <MapPin size={16} />
                  <span>{seller.location}</span>
                </div>
                <div className="seller-meta-item">
                  <Calendar size={16} />
                  <span>Bergabung {seller.joined}</span>
                </div>
                <div className="seller-meta-item">
                  <Star size={16} />
                  <span>{seller.rating} ({seller.reviewCount} ulasan)</span>
                </div>
              </div>
              
              <div className="seller-stats">
                <div className="stat">
                  {/* PERBAIKAN: dulu pakai seller.businessCount (dari endpoint
                      /sellers/{id}) yang bisa beda angka dengan daftar bisnis
                      yang benar-benar berhasil dimuat di bawah (dari endpoint
                      /sellers/{id}/businesses) - kalau salah satu gagal diam-diam,
                      angka di atas (mis. 3) jadi tidak nyambung dengan daftar di
                      bawah (0). Sekarang selalu pakai businesses.length supaya
                      angka ini DIJAMIN selalu sama dengan jumlah kartu bisnis
                      yang tampil di tab "Bisnis" di bawah. */}
                  <span className="stat-value">{businesses.length}</span>
                  <span className="stat-label">Bisnis</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{seller.reviewCount || reviews.length}</span>
                  <span className="stat-label">Ulasan</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{seller.totalViews?.toLocaleString('id-ID') || '0'}</span>
                  <span className="stat-label">Views</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="seller-actions">
            <button 
              className={`action-btn save-btn ${saved ? 'saved' : ''}`}
              onClick={handleSaveToggle}
              disabled={savingToggle}
            >
              {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              <span>{savingToggle ? 'Menyimpan...' : saved ? 'Disimpan' : 'Simpan'}</span>
            </button>
            
            <button 
              className="action-btn whatsapp-btn"
              onClick={handleWhatsApp}
            >
              <MessageCircle size={18} />
              <span>WhatsApp</span>
            </button>
            
            <button 
              className="action-btn chat-btn"
              onClick={handleOpenChatModal}
            >
              <Send size={18} />
              <span>Chat Penjual</span>
            </button>
            
            <button 
              className="action-btn share-btn"
              onClick={handleShare}
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Content Tabs */}
      <section className="seller-content">
        <div className="seller-content__inner">
          <div className="seller-tabs">
            <button
              className={`seller-tab ${activeTab === "businesses" ? "active" : ""}`}
              onClick={() => setActiveTab("businesses")}
            >
              <Store size={18} />
              <span>Bisnis ({businesses.length})</span>
            </button>
            <button
              className={`seller-tab ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              <Star size={18} />
              <span>Ulasan ({reviews.length})</span>
            </button>
          </div>

          {/* Businesses Tab */}
          {activeTab === "businesses" && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Bisnis yang Dikelola ({businesses.length})</h2>
                <p className="section-subtitle">
                  Total {businesses.length} bisnis terdaftar dari {seller.name}
                </p>
              </div>
              
              {businesses.length > 0 ? (
                <div className="business-grid">
                  {businesses.map((business) => (
                    <Link 
                      key={business.id} 
                      to={`/business/${business.id}`}
                      className="business-card"
                      onClick={(e) => {
                        // Prevent navigation if business ID is invalid
                        if (!business.id || business.id < 1) {
                          e.preventDefault();
                          showNotification("Detail bisnis tidak tersedia saat ini.", "error");
                        }
                      }}
                    >
                      <div className="business-image">
                        <img
                          src={business.image ? getImageUrl(business.image) : "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop"}
                          alt={business.name}
                        />
                        {business.is_premium_active && (
                          <div className="business-status">
                            <span className="status-badge open">Premium</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="business-info">
                        <h3 className="business-name">{business.name}</h3>
                        <p className="business-category">{business.category || "Belum ada kategori"}</p>
                        <p className="business-description">{business.description}</p>
                        
                        {business.address && (
                          <div className="business-meta">
                            <MapPin size={14} />
                            <span>{business.address}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Store size={48} />
                  <h3>Belum Ada Bisnis</h3>
                  <p>Penjual ini belum mendaftarkan bisnis apapun.</p>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Ulasan & Rating</h2>
                <button 
                  className="add-review-btn"
                  onClick={() => setShowReviewModal(true)}
                >
                  <Star size={16} />
                  Beri Ulasan
                </button>
              </div>
              
              {reviews.length > 0 ? (
                <div className="reviews-list">
                  {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <img
                          src={review.user_avatar ? getImageUrl(review.user_avatar) : "https://ui-avatars.com/api/?name=" + encodeURIComponent(review.user_name || "U")}
                          alt={review.user_name}
                          className="reviewer-avatar"
                        />
                        <div className="reviewer-info">
                          <h4 className="reviewer-name">{review.user_name}</h4>
                          <div className="review-meta">
                            {renderStars(review.rating)}
                            <span className="review-date">{formatDate(review.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                      <button
                        type="button"
                        className={`review-helpful-btn ${helpfulVoted[review.id] ? "is-active" : ""}`}
                        onClick={() => handleToggleHelpful(review.id)}
                      >
                        <ThumbsUp size={14} />
                        <span>{review.helpful_count > 0 ? review.helpful_count : ""}</span>
                      </button>
                    </div>
                  ))}

                  {!showAllReviews && reviews.length > 3 && (
                    <button
                      type="button"
                      className="reviews-see-all-btn"
                      onClick={() => setShowAllReviews(true)}
                    >
                      Lihat Semua Ulasan ({reviews.length})
                    </button>
                  )}
                </div>
              ) : (
                <div className="empty-state">
                  <Star size={48} />
                  <h3>Belum Ada Ulasan</h3>
                  <p>Jadilah yang pertama memberikan ulasan untuk penjual ini.</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setShowReviewModal(true)}
                  >
                    <Star size={16} />
                    Tulis Ulasan Pertama
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Review Modal */}
      {showReviewModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowReviewModal(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowReviewModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Beri Ulasan untuk {seller.name}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowReviewModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitReview} className="review-form">
              <div className="form-group">
                <label>Rating</label>
                {renderStars(reviewRating, true, setReviewRating)}
              </div>
              
              <div className="form-group">
                <label>Komentar</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Bagikan pengalaman Anda dengan penjual ini..."
                  rows={4}
                  required
                  minLength="10"
                  maxLength="1000"
                />
                <small style={{color: '#6b7280', fontSize: '0.8rem'}}>
                  {reviewComment.length}/1000 karakter (minimal 10)
                </small>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowReviewModal(false)}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={submittingReview || reviewComment.trim().length < 10}
                >
                  {submittingReview ? "Mengirim..." : "Kirim Ulasan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Modal - sekarang menampilkan riwayat percakapan dua arah
          (seperti WhatsApp), bukan cuma form kirim sekali lalu tertutup. */}
      {showChatModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowChatModal(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowChatModal(false)}
        >
          <div className="modal-content chat-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chat dengan {seller.name}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowChatModal(false)}
              >
                ×
              </button>
            </div>

            <div className="chat-thread-scroll">
              {loadingChatThread ? (
                <div className="chat-thread-loading">Memuat percakapan...</div>
              ) : chatThread.length > 0 ? (
                chatThread.map((m) => {
                  const isMine = m.sender_role !== "seller";
                  return (
                    <div key={m.id} className={`chat-bubble ${isMine ? "chat-bubble--mine" : "chat-bubble--theirs"}`}>
                      <p>{m.message}</p>
                      <span>{m.created_at ? new Date(m.created_at).toLocaleString("id-ID") : ""}</span>
                    </div>
                  );
                })
              ) : (
                <div className="chat-thread-empty">
                  Belum ada percakapan. Tulis pesan pertama Anda ke {seller.name} di bawah ini.
                </div>
              )}
            </div>
            
            <form onSubmit={handleSendMessage} className="chat-form">
              <div className="form-group">
                <textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Tulis pesan Anda..."
                  rows={2}
                  required
                  minLength="5"
                  maxLength="1000"
                />
                <small style={{color: '#6b7280', fontSize: '0.8rem'}}>
                  {chatMessage.length}/1000 karakter (minimal 5)
                </small>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowChatModal(false)}
                >
                  Tutup
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={sendingMessage || chatMessage.trim().length < 5}
                >
                  {sendingMessage ? "Mengirim..." : "Kirim Pesan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}