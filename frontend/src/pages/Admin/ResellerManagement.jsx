import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const ResellerManagement = () => {
    const [resellers, setResellers] = useState([]);

    const fetchResellers = async () => {
        try {
            const response = await api.get('/admin/resellers');
            setResellers(response.data);
        } catch (error) {
            console.error("Gagal memuat data reseller", error);
        }
    };

    useEffect(() => { fetchResellers(); }, []);

    const handleToggleStatus = async (id) => {
        try {
            await api.post(`/admin/resellers/${id}/toggle-status`);
            alert('Status keanggotaan berhasil diubah!');
            fetchResellers();
        } catch (error) {
            alert('Gagal mengubah status');
        }
    };

    return (
        <div style={{ padding: '25px', fontFamily: 'sans-serif' }}>
            <h2>Panel Admin: Manajemen Reseller Khusus</h2>
            <hr />
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f4f4f4' }}>
                        <th>Nama Reseller</th>
                        <th>Email</th>
                        <th>Jumlah Bisnis Terdaftar</th>
                        <th>Aksi Kontrol</th>
                    </tr>
                </thead>
                <tbody>
                    {resellers.length === 0 ? (
                        <tr><td colSpan="4" style={{ textAlign: 'center' }}>Tidak ada reseller aktif.</td></tr>
                    ) : (
                        resellers.map(r => (
                            <tr key={r.id}>
                                <td>{r.name}</td>
                                <td>{r.email}</td>
                                <td>{r.businesses_count || 0} Bisnis</td>
                                <td>
                                    <button 
                                        onClick={() => handleToggleStatus(r.id)} 
                                        style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px' }}
                                    >
                                        Cabut Status Reseller
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

export default ResellerManagement;