import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './AdminTable.css';
import '../Dashboard.css'; // Import our enhanced form styles

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [referralCode, setReferralCode] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [errors, setErrors] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users', {
                params: { search: searchQuery }
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Gagal mengambil data user", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter users based on role filter
    const filteredUsers = users.filter(user => {
        if (roleFilter === 'all') return true;
        return user.role === roleFilter;
    });

    useEffect(() => { fetchUsers(); }, []);
    
    // Realtime search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);
        
        // Validate referral code uniqueness
        if (referralCode) {
            const isDuplicate = users.some(u => 
                u.referral_code === referralCode && u.id !== editingId
            );
            if (isDuplicate) {
                setErrors({ referral_code: ['Kode referral sudah digunakan oleh user lain'] });
                setSubmitting(false);
                return;
            }
        }
        
        const payload = { name, email, role };
        if (password) payload.password = password;
        if (referralCode) payload.referral_code = referralCode;

        try {
            if (editingId) {
                await api.put(`/admin/users/${editingId}`, payload);
                alert('User berhasil diupdate!');
            } else {
                if (!password) { 
                    alert('Password wajib diisi untuk user baru!'); 
                    setSubmitting(false);
                    return; 
                }
                await api.post('/admin/users', payload);
                alert('User berhasil ditambahkan!');
            }
            clearForm();
            fetchUsers();
        } catch (error) {
            if (error.response?.status === 422) setErrors(error.response.data.errors);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (user) => {
        setEditingId(user.id);
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
        setReferralCode(user.referral_code || '');
        setPassword('');
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Hapus user ini?')) {
            try {
                await api.delete(`/admin/users/${id}`);
                fetchUsers();
            } catch (error) { alert('Gagal menghapus user'); }
        }
    };

    const clearForm = () => {
        setName(''); 
        setEmail(''); 
        setPassword(''); 
        setRole('user'); 
        setReferralCode(''); 
        setEditingId(null);
        setShowForm(false);
        setErrors({});
    };

    return (
        <div className="db-form-wrapper">
            {/* Header Section */}
            <div className="db-form-hero">
                <div className="db-form-hero-content">
                    <div className="db-form-hero-text">
                        <h1>👥 Manajemen Pengguna</h1>
                        <p>Kelola akun pengguna, peran akses, dan sistem referral dengan mudah</p>
                    </div>
                    <div className="db-form-hero-actions">
                        <button 
                            className={`db-btn ${viewMode === 'table' ? 'db-btn-primary' : 'db-btn-outline'}`}
                            onClick={() => setViewMode('table')}
                        >
                            📋 Tabel
                        </button>
                        <button 
                            className={`db-btn ${viewMode === 'cards' ? 'db-btn-primary' : 'db-btn-outline'}`}
                            onClick={() => setViewMode('cards')}
                        >
                            🎴 Kartu
                        </button>
                        <button 
                            className="db-btn db-btn-success"
                            onClick={() => setShowForm(true)}
                        >
                            ➕ Tambah User
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics Section */}
            <div className="db-stats-grid">
                <div className="db-stat-card db-stat-primary">
                    <div className="db-stat-icon">👥</div>
                    <div className="db-stat-content">
                        <div className="db-stat-number">{users.length}</div>
                        <div className="db-stat-label">Total Pengguna</div>
                    </div>
                </div>
                
                <div className="db-stat-card db-stat-success">
                    <div className="db-stat-icon">🏪</div>
                    <div className="db-stat-content">
                        <div className="db-stat-number">{users.filter(u => u.role === 'reseller').length}</div>
                        <div className="db-stat-label">Reseller</div>
                    </div>
                </div>
                
                <div className="db-stat-card db-stat-warning">
                    <div className="db-stat-icon">🎫</div>
                    <div className="db-stat-content">
                        <div className="db-stat-number">{users.filter(u => u.referral_code).length}</div>
                        <div className="db-stat-label">Kode Referral Aktif</div>
                    </div>
                </div>
                
                <div className="db-stat-card db-stat-danger">
                    <div className="db-stat-icon">⚠️</div>
                    <div className="db-stat-content">
                        <div className="db-stat-number">{users.filter(u => u.role === 'reseller' && !u.referral_code).length}</div>
                        <div className="db-stat-label">Reseller Tanpa Kode</div>
                    </div>
                </div>
            </div>

            {/* User Form Modal */}
            {showForm && (
                <div className="db-modal-overlay" onClick={(e) => e.target === e.currentTarget && clearForm()}>
                    <div className="db-modal-content">
                        <div className="db-modal-header">
                            <h3>
                                {editingId ? '✏️ Edit Pengguna' : '➕ Tambah Pengguna Baru'}
                            </h3>
                            <button className="db-modal-close" onClick={clearForm}>✕</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="db-form">
                            <div className="db-form-grid">
                                <div className="db-form-section">
                                    <h4>📝 Informasi Dasar</h4>
                                    
                                    <div className="db-input-group">
                                        <label className="db-input-label">
                                            <span>👤 Nama Lengkap</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="db-input"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="Masukkan nama lengkap"
                                            required
                                        />
                                    </div>

                                    <div className="db-input-group">
                                        <label className="db-input-label">
                                            <span>📧 Email</span>
                                        </label>
                                        <input
                                            type="email"
                                            className="db-input"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="email@example.com"
                                            required
                                        />
                                        {errors.email && (
                                            <div className="db-input-error">{errors.email[0]}</div>
                                        )}
                                    </div>

                                    <div className="db-input-group">
                                        <label className="db-input-label">
                                            <span>🔒 {editingId ? 'Password (kosongkan jika tidak diubah)' : 'Password'}</span>
                                        </label>
                                        <input
                                            type="password"
                                            className="db-input"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder={editingId ? "Kosongkan jika tidak diubah" : "Masukkan password"}
                                            required={!editingId}
                                        />
                                    </div>
                                </div>

                                <div className="db-form-section">
                                    <h4>👔 Pengaturan Akses</h4>
                                    
                                    <div className="db-input-group">
                                        <label className="db-input-label">
                                            <span>🎭 Peran Pengguna</span>
                                        </label>
                                        <select
                                            className="db-select"
                                            value={role}
                                            onChange={e => setRole(e.target.value)}
                                        >
                                            <option value="user">👤 User Biasa</option>
                                            <option value="reseller">🏪 Reseller</option>
                                            <option value="admin">👑 Administrator</option>
                                        </select>
                                    </div>

                                    <div className="db-input-group">
                                        <label className="db-input-label">
                                            <span>🎫 Kode Referral</span>
                                            <small>{role === 'reseller' ? 'Wajib untuk reseller' : 'Opsional untuk user biasa'}</small>
                                        </label>
                                        <div className="db-input-with-button">
                                            <input
                                                type="text"
                                                className="db-input"
                                                value={referralCode}
                                                onChange={e => setReferralCode(e.target.value.toUpperCase())}
                                                placeholder="Masukkan kode referral"
                                            />
                                            <button
                                                type="button"
                                                className="db-btn db-btn-outline"
                                                onClick={() => {
                                                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                                                    let result = '';
                                                    do {
                                                        result = '';
                                                        for (let i = 0; i < 8; i++) {
                                                            result += chars.charAt(Math.floor(Math.random() * chars.length));
                                                        }
                                                    } while (users.some(u => u.referral_code === result && u.id !== editingId));
                                                    
                                                    setReferralCode(result);
                                                }}
                                            >
                                                🎲 Generate
                                            </button>
                                        </div>
                                        {errors.referral_code && (
                                            <div className="db-input-error">{errors.referral_code[0]}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="db-form-actions">
                                <button 
                                    type="button" 
                                    className="db-btn db-btn-secondary"
                                    onClick={clearForm}
                                >
                                    ❌ Batal
                                </button>
                                <button 
                                    type="submit" 
                                    className="db-btn db-btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>⏳ Menyimpan...</>
                                    ) : (
                                        editingId ? '💾 Update User' : '➕ Tambah User'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Search and Filter Section */}
            <div className="db-toolbar">
                <div className="db-search-section">
                    <div className="db-search-wrapper">
                        <input
                            type="text"
                            className="db-search-input"
                            placeholder="🔍 Cari berdasarkan nama atau email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="db-filter-select"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">Semua Role</option>
                        <option value="user">👤 User Biasa</option>
                        <option value="reseller">🏪 Reseller</option>
                        <option value="admin">👑 Admin</option>
                    </select>
                    <button
                        className="db-btn db-btn-outline"
                        onClick={fetchUsers}
                        disabled={loading}
                    >
                        {loading ? '⏳' : '🔄'} Refresh
                    </button>
                </div>
            </div>

            {/* Users Display */}
            {loading ? (
                <div className="db-loading-state">
                    <div className="db-spinner"></div>
                    <p>Memuat data pengguna...</p>
                </div>
            ) : viewMode === 'table' ? (
                <UserTable 
                    users={filteredUsers}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onRefreshCode={fetchUsers}
                />
            ) : (
                <UserCards 
                    users={filteredUsers}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onRefreshCode={fetchUsers}
                />
            )}
        </div>
    );
};

export default UserManagement;

// UserTable Component
const UserTable = ({ users, onEdit, onDelete, onRefreshCode }) => {
    const handleRegenerateCode = async (user) => {
        if (window.confirm('Generate kode referral baru untuk reseller ini?')) {
            try {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                let newCode = '';
                do {
                    newCode = '';
                    for (let i = 0; i < 8; i++) {
                        newCode += chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                } while (users.some(u => u.referral_code === newCode));
                
                await api.put(`/admin/users/${user.id}`, {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    referral_code: newCode
                });
                alert('Kode referral berhasil diperbarui!');
                onRefreshCode();
            } catch (error) {
                alert('Gagal memperbarui kode referral');
                console.error(error);
            }
        }
    };

    if (users.length === 0) {
        return (
            <div className="db-empty-state">
                <div className="db-empty-icon">👥</div>
                <h3>Tidak ada pengguna ditemukan</h3>
                <p>Belum ada data pengguna atau hasil pencarian kosong</p>
            </div>
        );
    }

    return (
        <div className="db-table-wrapper">
            <table className="db-table">
                <thead>
                    <tr>
                        <th>👤 Pengguna</th>
                        <th>📧 Email</th>
                        <th>🎭 Peran</th>
                        <th>🎫 Kode Referral</th>
                        <th>⚙️ Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>
                                <div className="db-table-user">
                                    <div className="db-user-avatar">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="db-user-info">
                                        <div className="db-user-name">{user.name}</div>
                                        <div className="db-user-meta">ID: {user.id}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span className="db-email">{user.email}</span>
                            </td>
                            <td>
                                <span className={`db-badge db-badge-${user.role}`}>
                                    {user.role === 'admin' && '👑'}
                                    {user.role === 'reseller' && '🏪'}
                                    {user.role === 'user' && '👤'}
                                    {user.role.toUpperCase()}
                                </span>
                            </td>
                            <td>
                                {user.referral_code ? (
                                    <div className="db-referral-code">
                                        <span className={`db-code ${user.role === 'reseller' ? 'db-code-active' : 'db-code-normal'}`}>
                                            {user.referral_code}
                                        </span>
                                        <button
                                            className="db-btn-copy"
                                            onClick={() => {
                                                navigator.clipboard.writeText(user.referral_code);
                                                alert('Kode referral disalin!');
                                            }}
                                            title="Salin kode referral"
                                        >
                                            📋
                                        </button>
                                    </div>
                                ) : (
                                    <span className="db-no-code">
                                        {user.role === 'reseller' ? '⚠️ Belum ada kode' : '➖'}
                                    </span>
                                )}
                            </td>
                            <td>
                                <div className="db-table-actions">
                                    <button 
                                        className="db-btn db-btn-sm db-btn-primary"
                                        onClick={() => onEdit(user)}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button 
                                        className="db-btn db-btn-sm db-btn-danger"
                                        onClick={() => onDelete(user.id)}
                                    >
                                        🗑️ Hapus
                                    </button>
                                    {user.role === 'reseller' && (
                                        <button 
                                            className="db-btn db-btn-sm db-btn-warning"
                                            onClick={() => handleRegenerateCode(user)}
                                        >
                                            🔄 Regen
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// UserCards Component
const UserCards = ({ users, onEdit, onDelete, onRefreshCode }) => {
    const handleRegenerateCode = async (user) => {
        if (window.confirm('Generate kode referral baru untuk reseller ini?')) {
            try {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                let newCode = '';
                do {
                    newCode = '';
                    for (let i = 0; i < 8; i++) {
                        newCode += chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                } while (users.some(u => u.referral_code === newCode));
                
                await api.put(`/admin/users/${user.id}`, {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    referral_code: newCode
                });
                alert('Kode referral berhasil diperbarui!');
                onRefreshCode();
            } catch (error) {
                alert('Gagal memperbarui kode referral');
                console.error(error);
            }
        }
    };

    if (users.length === 0) {
        return (
            <div className="db-empty-state">
                <div className="db-empty-icon">👥</div>
                <h3>Tidak ada pengguna ditemukan</h3>
                <p>Belum ada data pengguna atau hasil pencarian kosong</p>
            </div>
        );
    }

    return (
        <div className="db-cards-grid">
            {users.map(user => (
                <div key={user.id} className="db-user-card">
                    <div className="db-user-card-header">
                        <div className="db-user-card-avatar">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="db-user-card-info">
                            <h4>{user.name}</h4>
                            <p>{user.email}</p>
                        </div>
                        <span className={`db-badge db-badge-${user.role}`}>
                            {user.role === 'admin' && '👑'}
                            {user.role === 'reseller' && '🏪'}
                            {user.role === 'user' && '👤'}
                            {user.role.toUpperCase()}
                        </span>
                    </div>
                    
                    <div className="db-user-card-body">
                        <div className="db-user-detail">
                            <span className="db-detail-label">🆔 User ID:</span>
                            <span className="db-detail-value">{user.id}</span>
                        </div>
                        
                        <div className="db-user-detail">
                            <span className="db-detail-label">🎫 Kode Referral:</span>
                            {user.referral_code ? (
                                <div className="db-referral-code">
                                    <span className={`db-code ${user.role === 'reseller' ? 'db-code-active' : 'db-code-normal'}`}>
                                        {user.referral_code}
                                    </span>
                                    <button
                                        className="db-btn-copy"
                                        onClick={() => {
                                            navigator.clipboard.writeText(user.referral_code);
                                            alert('Kode referral disalin!');
                                        }}
                                        title="Salin kode referral"
                                    >
                                        📋
                                    </button>
                                </div>
                            ) : (
                                <span className="db-no-code">
                                    {user.role === 'reseller' ? '⚠️ Belum ada kode' : '➖ Tidak ada'}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="db-user-card-actions">
                        <button 
                            className="db-btn db-btn-sm db-btn-primary"
                            onClick={() => onEdit(user)}
                        >
                            ✏️ Edit
                        </button>
                        <button 
                            className="db-btn db-btn-sm db-btn-danger"
                            onClick={() => onDelete(user.id)}
                        >
                            🗑️ Hapus
                        </button>
                        {user.role === 'reseller' && (
                            <button 
                                className="db-btn db-btn-sm db-btn-warning"
                                onClick={() => handleRegenerateCode(user)}
                            >
                                🔄 Regen
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};