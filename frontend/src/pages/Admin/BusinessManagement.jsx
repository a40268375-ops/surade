import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const BusinessManagement = () => {
    const [businesses, setBusinesses] = useState([]);

    // 1. Ambil semua data bisnis (Mengarah ke GET /api/admin/businesses)
    const fetchBusinesses = async () => {
        try {
            const response = await api.get('/admin/businesses');
            setBusinesses(response.data);
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
        <div style={{ padding: '25px', fontFamily: 'sans-serif' }}>
            <h2>Panel Admin: Moderasi & Manajemen Bisnis</h2>
            <hr />
            
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', textAlign: 'left' }}>
                <thead>
                    <tr style={{ backgroundColor: '#e9ecef' }}>
                        <th>Gambar</th>
                        <th>Nama Bisnis (Title)</th>
                        <th>Kategori & Pemilik</th>
                        <th>Kontak & Alamat</th>
                        <th>Status</th>
                        <th>Tipe Akun</th>
                        <th>Aksi Kontrol</th>
                    </tr>
                </thead>
                <tbody>
                    {businesses.length === 0 ? (
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center' }}>Belum ada data bisnis terdaftar.</td>
                        </tr>
                    ) : (
                        businesses.map((b) => (
                            <tr key={b.id}>
                                {/* Menampilkan gambar jika ada */}
                                <td style={{ textAlign: 'center' }}>
                                    {b.image ? (
                                        <img src={`http://localhost:8000${b.image}`} alt={b.title} style={{ width: '70px', height: '5px', objectFit: 'cover', borderRadius: '4px' }} />
                                    ) : (
                                        <span style={{ color: '#ccc', fontSize: '12px' }}>No Image</span>
                                    )}
                                </td>
                                
                                {/* Menggunakan b.title sesuai dengan controller backend kamu */}
                                <td><strong>{b.title}</strong></td>
                                
                                <td>
                                    <span style={{ fontSize: '13px', display: 'block' }}>Kat: <i>{b.category?.name || '-'}</i></span>
                                    <span style={{ fontSize: '13px', display: 'block' }}>Oleh: {b.user?.name || 'User Terhapus'}</span>
                                </td>
                                
                                <td>
                                    <span style={{ fontSize: '13px', display: 'block' }}>📞 {b.phone}</span>
                                    <span style={{ fontSize: '12px', color: '#555', display: 'block' }}>📍 {b.address}</span>
                                </td>
                                
                                <td>
                                    <span style={{ 
                                        padding: '4px 8px', 
                                        borderRadius: '4px', 
                                        fontSize: '12px', 
                                        fontWeight: 'bold',
                                        backgroundColor: b.status === 'approved' ? '#d4edda' : '#fff3cd',
                                        color: b.status === 'approved' ? '#155724' : '#856404'
                                    }}>
                                        {b.status.toUpperCase()}
                                    </span>
                                </td>
                                
                                <td>
                                    {b.is_premium ? (
                                        <div>
                                            <span style={{ color: '#ffc107', fontWeight: 'bold' }}>🌟 PREMIUM</span>
                                            {b.premium_expires_at && (
                                                <span style={{ display: 'block', fontSize: '11px', color: '#6c757d' }}>
                                                    Exp: {new Date(b.premium_expires_at).toLocaleDateString('id-ID')}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span style={{ color: '#6c757d' }}>Standar</span>
                                    )}
                                </td>
                                
                                <td>
                                    {/* Tombol Approve hanya muncul jika status masih pending */}
                                    {b.status !== 'approved' && (
                                        <button onClick={() => handleApprove(b.id)} style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '5px 10px', marginRight: '5px', borderRadius: '3px', cursor: 'pointer' }}>
                                            Approve
                                        </button>
                                    )}
                                    
                                    <button onClick={() => handleTogglePremium(b.id)} style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '5px 10px', marginRight: '5px', borderRadius: '3px', cursor: 'pointer' }}>
                                        {b.is_premium ? 'Set Standar' : 'Set Premium'}
                                    </button>
                                    
                                    <button onClick={() => handleDelete(b.id)} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>
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