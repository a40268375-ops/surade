import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './AdminTable.css';

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

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users', {
                params: { search: searchQuery }
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Gagal mengambil data user", error);
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
        
        // Validate referral code uniqueness
        if (referralCode) {
            const isDuplicate = users.some(u => 
                u.referral_code === referralCode && u.id !== editingId
            );
            if (isDuplicate) {
                setErrors({ referral_code: ['Kode referral sudah digunakan oleh user lain'] });
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
                if (!password) { alert('Password wajib diisi untuk user baru!'); return; }
                await api.post('/admin/users', payload);
                alert('User berhasil ditambahkan!');
            }
            clearForm();
            fetchUsers();
        } catch (error) {
            if (error.response?.status === 422) setErrors(error.response.data.errors);
        }
    };

    const handleEdit = (user) => {
        setEditingId(user.id);
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
        setReferralCode(user.referral_code || '');
        setPassword('');
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
        setName(''); setEmail(''); setPassword(''); setRole('user'); setReferralCode(''); setEditingId(null);
    };

    return (
        <div className="admin-table-container">
            <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>Panel Admin: Manajemen Users</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
                Kelola akun pengguna dan peran akses mereka.
            </p>

            {/* Statistics Summary */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '12px', opacity: '0.9' }}>Total Users</div>
                    <div style={{ fontSize: '20px', fontWeight: '700' }}>
                        {users.length}
                    </div>
                </div>
                
                <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '12px', opacity: '0.9' }}>Reseller</div>
                    <div style={{ fontSize: '20px', fontWeight: '700' }}>
                        {users.filter(u => u.role === 'reseller').length}
                    </div>
                </div>
                
                <div style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '12px', opacity: '0.9' }}>Kode Referral Aktif</div>
                    <div style={{ fontSize: '20px', fontWeight: '700' }}>
                        {users.filter(u => u.referral_code).length}
                    </div>
                </div>
                
                <div style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '12px', opacity: '0.9' }}>Reseller Tanpa Kode</div>
                    <div style={{ fontSize: '20px', fontWeight: '700' }}>
                        {users.filter(u => u.role === 'reseller' && !u.referral_code).length}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
                <h3>{editingId ? 'Edit Akun User' : 'Buat Akun Baru'}</h3>
                
                <div style={{ marginBottom: '15px' }}>
                    <label>Nama:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        placeholder="Nama lengkap"
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder="email@example.com"
                    />
                    {errors.email && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.email[0]}</p>}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>{editingId ? "Password (kosongkan jika tidak diubah)" : "Password"}:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder={editingId ? "Kosongkan jika tidak diubah" : "Masukkan password"}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Role:</label>
                    <select
                        value={role}
                        onChange={e => setRole(e.target.value)}
                    >
                        <option value="user">User Biasa</option>
                        <option value="reseller">Reseller</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Kode Referral:</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            value={referralCode}
                            onChange={e => setReferralCode(e.target.value.toUpperCase())}
                            placeholder="Masukkan kode referral (opsional)"
                            style={{ flex: 1 }}
                        />
                        <button
                            type="button"
                            onClick={() => {
                                // Generate simple random code
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
                            style={{
                                padding: '8px 12px',
                                background: '#8b5cf6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                            }}
                        >
                            Generate
                        </button>
                    </div>
                    {errors.referral_code && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.referral_code[0]}</p>}
                    <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
                        {role === 'reseller' ? 'Reseller memerlukan kode referral untuk sistem komisi' : 'Kode referral hanya diperlukan untuk reseller'}
                    </p>
                </div>

                <button type="submit">
                    {editingId ? 'Update User' : 'Buat User'}
                </button>
                {editingId && (
                    <button
                        type="button"
                        onClick={clearForm}
                        className="action-btn cancel"
                        style={{ marginLeft: '10px' }}
                    >
                        Batal
                    </button>
                )}
            </form>

            {/* Search and Filter Section */}
            <div style={{ 
                display: 'flex', 
                gap: '16px', 
                marginBottom: '20px', 
                alignItems: 'center',
                flexWrap: 'wrap'
            }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <input
                        type="text"
                        placeholder="🔍 Cari berdasarkan nama atau email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    style={{
                        padding: '10px 12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        minWidth: '150px'
                    }}
                >
                    <option value="all">Semua Role</option>
                    <option value="user">User Biasa</option>
                    <option value="reseller">Reseller</option>
                    <option value="admin">Admin</option>
                </select>
                <button
                    onClick={fetchUsers}
                    style={{
                        padding: '10px 16px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    🔄 Refresh
                </button>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Kode Referral</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.length === 0 ? (
                        <tr><td colSpan="5" className="empty-state">
                            {roleFilter !== 'all' ? `Tidak ada ${roleFilter} ditemukan.` : 'Belum ada data user.'}
                        </td></tr>
                    ) : (
                        filteredUsers.map(u => (
                            <tr key={u.id}>
                                <td><strong>{u.name}</strong></td>
                                <td style={{ color: '#6b7280', fontSize: '14px' }}>{u.email}</td>
                                <td>
                                    <span className={`status-badge ${u.role}`}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td>
                                    {u.referral_code ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ 
                                                background: u.role === 'reseller' ? '#ecfdf5' : '#fef3c7', 
                                                color: u.role === 'reseller' ? '#059669' : '#d97706', 
                                                padding: '4px 8px', 
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                fontFamily: 'monospace'
                                            }}>
                                                {u.referral_code}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(u.referral_code);
                                                    alert('Kode referral disalin!');
                                                }}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    opacity: '0.7'
                                                }}
                                                title="Copy kode referral"
                                            >
                                                📋
                                            </button>
                                        </div>
                                    ) : (
                                        <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                                            {u.role === 'reseller' ? '⚠️ Belum ada kode' : '-'}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <button onClick={() => handleEdit(u)} className="action-btn edit">Edit</button>
                                    <button onClick={() => handleDelete(u.id)} className="action-btn delete">Hapus</button>
                                    {u.role === 'reseller' && (
                                        <button 
                                            onClick={async () => {
                                                if (window.confirm('Generate kode referral baru untuk reseller ini?')) {
                                                    try {
                                                        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                                                        let newCode = '';
                                                        for (let i = 0; i < 8; i++) {
                                                            newCode += chars.charAt(Math.floor(Math.random() * chars.length));
                                                        }
                                                        
                                                        await api.put(`/admin/users/${u.id}`, {
                                                            name: u.name,
                                                            email: u.email,
                                                            role: u.role,
                                                            referral_code: newCode
                                                        });
                                                        alert('Kode referral berhasil diperbarui!');
                                                        fetchUsers();
                                                    } catch (error) {
                                                        alert('Gagal memperbarui kode referral');
                                                        console.error(error);
                                                    }
                                                }
                                            }}
                                            className="action-btn"
                                            style={{ 
                                                background: '#8b5cf6', 
                                                color: 'white',
                                                fontSize: '12px',
                                                padding: '4px 8px'
                                            }}
                                        >
                                            🔄 Regen
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagement;