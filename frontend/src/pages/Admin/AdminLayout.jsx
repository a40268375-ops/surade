import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminTable.css';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const sidebarStyle = {
        width: '280px',
        background: 'linear-gradient(180deg, #0b4a44, #12766c 85%)',
        color: '#eafaf6',
        padding: '26px 18px 24px',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: '0',
        height: '100vh',
        boxSizing: 'border-box'
    };

    const brandStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '4px 10px 26px'
    };

    const logoStyle = {
        width: '38px',
        height: '38px',
        borderRadius: '10px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '800',
        color: '#12766c',
        fontSize: '18px'
    };

    const nameStyle = {
        fontWeight: '800',
        fontSize: '16.5px',
        letterSpacing: '0.2px',
        color: '#fff'
    };

    const tagStyle = {
        display: 'block',
        fontSize: '10px',
        letterSpacing: '1.4px',
        color: '#a9d9cf',
        fontWeight: '600',
        marginTop: '1px'
    };

    const navStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
        marginTop: '6px',
        flex: '1',
        overflowY: 'auto'
    };

    const navItemStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '11px 14px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#cfe9e2',
        textDecoration: 'none',
        transition: 'background 0.15s ease, color 0.15s ease',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left'
    };

    const sidebarFootStyle = {
        marginTop: '14px',
        paddingTop: '14px',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)'
    };

    const userChipStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '10px 12px'
    };

    const logoutStyle = {
        marginTop: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        fontSize: '13.5px',
        fontWeight: '600',
        color: '#f3c9c9',
        borderRadius: '12px',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        width: '100%'
    };

    const mainStyle = {
        flex: '1',
        minWidth: '0',
        padding: '26px 34px 60px',
        background: '#f2f9f8'
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
            {/* SIDEBAR NAVIGASI */}
            <aside style={sidebarStyle}>
                <div style={brandStyle}>
                    <div style={logoStyle}>S</div>
                    <div>
                        <div style={nameStyle}>Surade.co.id</div>
                        <span style={tagStyle}>ADMIN PANEL</span>
                    </div>
                </div>

                <nav style={navStyle}>
                    <Link to="/dashboard" style={navItemStyle}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                            <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                            <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                            <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                        </svg>
                        Dashboard Utama
                    </Link>
                    <Link to="/admin/categories" style={navItemStyle}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                            <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                            <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                            <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                        </svg>
                        Manajemen Kategori
                    </Link>
                    <Link to="/admin/users" style={navItemStyle}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        Manajemen Users
                    </Link>
                    <Link to="/admin/resellers" style={navItemStyle}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="8.5" cy="7" r="4"/>
                            <path d="M20 8v6"/>
                            <path d="M23 11h-6"/>
                        </svg>
                        Manajemen Reseller
                    </Link>
                    <Link to="/admin/referrals" style={navItemStyle}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
                            <path d="M17 21h-5a2 2 0 0 1-2-2V7l5-5h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2z"/>
                            <polyline points="9,9 9,17 13,13 17,17 17,13"/>
                        </svg>
                        Referral
                    </Link>
                    <Link to="/admin/businesses" style={navItemStyle}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="7" width="18" height="13" rx="2"/>
                            <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Moderasi Bisnis
                    </Link>
                    <Link to="/admin/events" style={navItemStyle}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Manajemen Event
                    </Link>
                    <Link to="/admin/blogs" style={navItemStyle}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                        </svg>
                        Manajemen Blog
                    </Link>
                    <Link to="/admin/reports" style={navItemStyle}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        Laporan Report
                    </Link>
                </nav>

                <div style={sidebarFootStyle}>
                    <div style={userChipStyle}>
                        <img 
                            src={`https://i.pravatar.cc/80?img=${user?.id || 12}`} 
                            alt="" 
                            style={{ width: '34px', height: '34px', borderRadius: '9px', objectFit: 'cover' }}
                        />
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', lineHeight: '1.2' }}>
                                {user?.name || 'Admin'}
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#a9d9cf', fontWeight: '600' }}>
                                {user?.role || 'Administrator'}
                            </div>
                        </div>
                    </div>
                    <button style={logoutStyle} onClick={handleLogout}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Keluar
                    </button>
                </div>
            </aside>

            {/* KONTEN UTAMA */}
            <main style={mainStyle}>
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;