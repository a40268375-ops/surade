import React, { useState, useEffect } from 'react';
import api, { getImageUrl } from '../../utils/api';
import './AdminTable.css';

const BusinessManagement = () => {
    const [businesses, setBusinesses] = useState([]);

    // 1. Ambil semua data bisnis (Mengarah ke GET /api/admin/businesses)
    const fetchBusinesses = async () => {
        try {
            const businesses = await api.get('/admin/businesses');
            setBusinesses(businesses);
        } catch (error) {
            console.error("Gagal memuat data bisnis:", error);
        }
    };

    useEffect(() => {
        fetchBusinesses();
    }, []);

    // 2. Aksi Setujui Bisnis (POST /api/admin/businesses/{id}/approve)
    const handleApprove = async (id) => {
        try {
            await api.post(`/admin/businesses/${id}/approve`);
            alert('Bisnis berhasil disetujui!');
            fetchBusinesses();
        } catch (error) {
            alert('Gagal menyetujui bisnis.');
        }
    };

    // 3. Aksi Toggle Premium (POST /api/admin/businesses/{id}/toggle-premium)
    const handleTogglePremium = async (id) => {
        try {
            await api.post(`/admin/businesses/${id}/toggle-premium`);
            alert('Status kelas premium berhasil diperbarui!');
            fetchBusinesses();
        } catch (error) {
            alert('Gagal mengubah status premium.');
        }
    };

    // 4. Aksi Hapus Bisnis oleh Admin (DELETE /api/admin/businesses/{id})
    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus bisnis ini secara permanen?')) {
            try {
                await api.delete(`/admin/businesses/${id}`);
                alert('Bisnis berhasil dihapus.');
                fetchBusinesses();
            } catch (error) {
                alert('Gagal menghapus bisnis.');
            }
        }
    };

    return (
        <div className="admin-table-container">
            <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>Panel Admin: Moderasi & Manajemen Bisnis</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
                Kelola dan moderasi semua bisnis yang terdaftar di platform.
            </p>
            
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Gambar</th>
                        <th>Nama Bisnis</th>
                        <th>Kategori & Pemilik</th>
                        <th>Kontak & Alamat</th>
                        <th>Desa</th>
                        <th>Status</th>
                        <th>Tipe Akun</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {businesses.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="empty-state">Belum ada data bisnis terdaftar.</td>
                        </tr>
                    ) : (
                        businesses.map((b) => (
                            <tr key={b.id}>
                                <td style={{ textAlign: 'center' }}>
                                    {((b.images && b.images.length > 0) || b.image) ? (
                                        <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                                            <img
                                                src={b.images && b.images.length > 0 ? `http://surade.latihan.co.id${b.images[0]}` : `http://surade.latihan.co.id${b.image}`}
                                                alt={b.title}
                                                style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }}
                                            />
                                            {b.images && b.images.length > 1 && (
                                                <img
                                                    src={`http://surade.latihan.co.id${b.images[1]}`}
                                                    alt={`${b.title} gallery`}
                                                    style={{ width: '34px', height: '34px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <span style={{ color: '#9ca3af', fontSize: '12px' }}>No Image</span>
                                    )}
                                </td>
                                
                                <td><strong>{b.title}</strong></td>
                                
                                <td>
                                    <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                                        <span style={{ color: '#6b7280' }}>Kat:</span> <span style={{ fontWeight: '500' }}>{b.category?.name || '-'}</span>
                                    </div>
                                    <div style={{ fontSize: '13px' }}>
                                        <span style={{ color: '#6b7280' }}>Oleh:</span> {b.user?.name || 'User Terhapus'}
                                    </div>
                                </td>
                                
                                <td>
                                    <div style={{ fontSize: '13px', marginBottom: '4px' }}>📞 {b.phone}</div>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>📍 {b.address}</div>
                                </td>

                                <td>
                                    <span style={{ fontSize: '13px' }}>{b.village || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Belum diisi</span>}</span>
                                </td>

                                <td>
                                    <span className={`status-badge ${b.status}`}>
                                        {b.status.toUpperCase()}
                                    </span>
                                </td>
                                
                                <td>
                                    {b.is_premium ? (
                                        <div>
                                            <span className="status-badge premium">🌟 PREMIUM</span>
                                            {b.premium_expires_at && (
                                                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                                                    Exp: {new Date(b.premium_expires_at).toLocaleDateString('id-ID')}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span style={{ color: '#6b7280', fontSize: '13px' }}>Standar</span>
                                    )}
                                </td>
                                
                                <td>
                                    {b.status !== 'approved' && (
                                        <button onClick={() => handleApprove(b.id)} className="action-btn approve">
                                            Approve
                                        </button>
                                    )}
                                    
                                    <button onClick={() => handleTogglePremium(b.id)} className="action-btn edit">
                                        {b.is_premium ? 'Set Standar' : 'Set Premium'}
                                    </button>
                                    
                                    <button onClick={() => handleDelete(b.id)} className="action-btn delete">
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default BusinessManagement;