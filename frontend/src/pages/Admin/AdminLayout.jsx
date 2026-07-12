import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Hapus token login kamu (sesuaikan dengan sistem auth kamu, misal localStorage)
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert('Berhasil logout!');
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            {/* SIDEBAR NAVIGASI */}
            <div style={{ width: '250px', backgroundColor: '#2c3e50', color: '#fff', padding: '20px', boxSizing: 'border-box' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '30px' }}>📢 PANEL ADMIN</h3>
                <hr style={{ borderColor: '#34495e' }} />
                
                <ul style={{ listStyleType: 'none', padding: 0, lineHeight: '2.5' }}>
                    <li>
                        <Link to="/dashboard" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>🏠 Dashboard Utama</Link>
                    </li>
                    <li>
                        <Link to="/admin/categories" style={{ color: '#fff', textDecoration: 'none' }}>📁 Manajemen Kategori</Link>
                    </li>
                    <li>
                        <Link to="/admin/users" style={{ color: '#fff', textDecoration: 'none' }}>👥 Manajemen Users</Link>
                    </li>
                    <li>
                        <Link to="/admin/resellers" style={{ color: '#fff', textDecoration: 'none' }}>🤝 Manajemen Reseller</Link>
                    </li>
                    <li>
                        <Link to="/admin/businesses" style={{ color: '#fff', textDecoration: 'none' }}>🏢 Moderasi Bisnis</Link>
                    </li>
                    <li>
                        <Link to="/admin/events" style={{ color: '#fff', textDecoration: 'none' }}>📅 Manajemen Event</Link>
                    </li>
                </ul>

                <hr style={{ borderColor: '#34495e', marginTop: '30px' }} />
                <button 
                    onClick={handleLogout} 
                    style={{ width: '100%', padding: '10px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Log Out
                </button>
            </div>

            {/* KONTEN UTAMA */}
            <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa' }}>
                {children}
            </div>
        </div>
    );
};

export default AdminLayout;