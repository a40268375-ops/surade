import React, { useState, useEffect } from 'react';
import api, { getImageUrl } from '../../utils/api';
import './AdminTable.css';

const STATUS_LABEL = {
    baru: 'Baru',
    diproses: 'Diproses',
    selesai: 'Selesai',
    ditolak: 'Ditolak',
};

const ReportManagement = () => {
    const [reports, setReports] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeDetail, setActiveDetail] = useState(null); // report object shown in detail modal

    const fetchReports = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (statusFilter !== 'all') query.set('status', statusFilter);
            if (search.trim()) query.set('search', search.trim());
            const data = await api.get(`/admin/business-reports?${query.toString()}`);
            setReports(data);
        } catch (error) {
            console.error('Gagal memuat laporan:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    // Cari pakai debounce sederhana supaya tidak nembak API tiap ketikan.
    useEffect(() => {
        const timer = setTimeout(() => fetchReports(), 400);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const totalReports = reports.length;
    const totalBaru = reports.filter((r) => r.status === 'baru').length;
    const totalDiproses = reports.filter((r) => r.status === 'diproses').length;
    const totalSelesai = reports.filter((r) => r.status === 'selesai').length;

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/admin/business-reports/${id}`, { status });
            fetchReports();
            if (activeDetail?.id === id) setActiveDetail((prev) => ({ ...prev, status }));
        } catch (error) {
            alert('Gagal memperbarui status laporan.');
        }
    };

    const handleDeleteReport = async (id) => {
        if (!window.confirm('Hapus laporan ini?')) return;
        try {
            await api.delete(`/admin/business-reports/${id}`);
            fetchReports();
        } catch (error) {
            alert('Gagal menghapus laporan.');
        }
    };

    const handleRemoveContent = async (report) => {
        if (!window.confirm(`Hapus konten bisnis "${report.business?.title}" secara permanen? Tindakan ini tidak dapat dibatalkan.`)) return;
        try {
            await api.post(`/admin/business-reports/${report.id}/remove-content`);
            alert('Konten bisnis berhasil dihapus.');
            fetchReports();
        } catch (error) {
            alert('Gagal menghapus konten bisnis.');
        }
    };

    return (
        <div className="admin-table-container">
            <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>Laporan Report Pelanggaran</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
                Kelola dan tindak lanjuti laporan pengaduan dari pengguna mengenai pelanggaran konten Usaha.
            </p>

            {/* KARTU RINGKASAN */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '22px' }}>
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', letterSpacing: '0.5px' }}>TOTAL REPORT</div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#111827' }}>{totalReports}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>Semua laporan</div>
                </div>
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#d97706', letterSpacing: '0.5px' }}>REPORT BARU</div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#111827' }}>{totalBaru}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>Belum diproses</div>
                </div>
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', letterSpacing: '0.5px' }}>SEDANG DIPROSES</div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#111827' }}>{totalDiproses}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>Dalam pengawasan</div>
                </div>
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', letterSpacing: '0.5px' }}>SELESAI</div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#111827' }}>{totalSelesai}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>Telah ditindak</div>
                </div>
            </div>

            {/* FILTER */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Cari pelapor, judul konten, alasan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ flex: '1 1 260px', padding: '9px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13.5px' }}
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13.5px' }}
                >
                    <option value="all">Semua Status</option>
                    <option value="baru">Baru</option>
                    <option value="diproses">Diproses</option>
                    <option value="selesai">Selesai</option>
                    <option value="ditolak">Ditolak</option>
                </select>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID & Pelapor</th>
                        <th>Konten</th>
                        <th>Pemilik Konten</th>
                        <th>Alasan Report</th>
                        <th>Tanggal</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="7" className="empty-state">Memuat laporan...</td></tr>
                    ) : reports.length === 0 ? (
                        <tr><td colSpan="7" className="empty-state">Belum ada laporan pelanggaran.</td></tr>
                    ) : (
                        reports.map((r) => (
                            <tr key={r.id}>
                                <td>
                                    <div style={{ fontWeight: 700, fontSize: '12.5px', color: '#12766c' }}>#REP-{String(r.id).padStart(3, '0')}</div>
                                    <div style={{ fontSize: '12.5px', color: '#6b7280' }}>{r.reporter_name || r.reporter?.name || 'Anonim'}</div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {r.business?.image && (
                                            <img src={getImageUrl(r.business.image)} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px' }} />
                                        )}
                                        <strong>{r.business?.title || 'Bisnis telah dihapus'}</strong>
                                    </div>
                                </td>
                                <td>{r.business?.user?.name || '-'}</td>
                                <td>
                                    <div style={{ fontWeight: 600, color: '#dc2626', fontSize: '13px' }}>{r.reason}</div>
                                    {r.description && (
                                        <div style={{ fontSize: '12px', color: '#6b7280', maxWidth: '220px' }}>
                                            {r.description.length > 60 ? `${r.description.slice(0, 60)}...` : r.description}
                                        </div>
                                    )}
                                </td>
                                <td style={{ fontSize: '12.5px' }}>{new Date(r.created_at).toLocaleDateString('id-ID')}</td>
                                <td>
                                    <span className={`status-badge ${r.status}`}>{STATUS_LABEL[r.status].toUpperCase()}</span>
                                </td>
                                <td>
                                    <button onClick={() => setActiveDetail(r)} className="action-btn edit">Detail</button>
                                    {r.business && (
                                        <button onClick={() => handleRemoveContent(r)} className="action-btn delete">Hapus Konten</button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* MODAL DETAIL */}
            {activeDetail && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
                    onClick={() => setActiveDetail(null)}
                >
                    <div
                        style={{ background: '#fff', borderRadius: '14px', padding: '26px', width: '440px', maxWidth: '92vw' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ marginTop: 0 }}>Detail Laporan #REP-{String(activeDetail.id).padStart(3, '0')}</h3>
                        <p style={{ fontSize: '13.5px', color: '#374151' }}>
                            <strong>Bisnis:</strong> {activeDetail.business?.title || 'Telah dihapus'}<br />
                            <strong>Pelapor:</strong> {activeDetail.reporter_name || activeDetail.reporter?.name || 'Anonim'}<br />
                            <strong>Alasan:</strong> {activeDetail.reason}<br />
                            <strong>Deskripsi:</strong> {activeDetail.description || '-'}
                        </p>

                        <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#374151' }}>Ubah Status</label>
                        <select
                            value={activeDetail.status}
                            onChange={(e) => handleUpdateStatus(activeDetail.id, e.target.value)}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', margin: '6px 0 18px' }}
                        >
                            <option value="baru">Baru</option>
                            <option value="diproses">Diproses</option>
                            <option value="selesai">Selesai</option>
                            <option value="ditolak">Ditolak</option>
                        </select>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleDeleteReport(activeDetail.id)} className="action-btn delete">Hapus Laporan</button>
                            <button onClick={() => setActiveDetail(null)} className="action-btn edit">Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportManagement;