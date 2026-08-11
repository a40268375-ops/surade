import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './AdminTable.css';

const EventManagement = () => {
    const [events, setEvents] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [image, setImage] = useState('');
    const [category, setCategory] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events');
            setEvents(response);
        } catch (error) {
            console.error("Gagal memuat event:", error);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            title,
            description,
            location,
            event_date: eventDate || null,
            image,
            category,
            image_url: imageUrl,
        };

        try {
            if (editingId) {
                await api.put(`/admin/events/${editingId}`, payload);
                alert('Event berhasil diperbarui!');
            } else {
                await api.post('/admin/events', payload);
                alert('Event baru berhasil diterbitkan!');
            }

            resetForm();
            fetchEvents();
        } catch (error) {
            alert(error?.data?.message || 'Terjadi kesalahan saat menyimpan event.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setLocation('');
        setEventDate('');
        setImage('');
        setCategory('');
        setImageUrl('');
        setEditingId(null);
    };

    const handleEdit = (event) => {
        setEditingId(event.id);
        setTitle(event.title);
        setDescription(event.description || '');
        setLocation(event.location || '');
        setEventDate(event.event_date ? event.event_date.slice(0, 10) : '');
        setImage(event.image || '');
        setCategory(event.category || '');
        setImageUrl(event.image_url || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus event ini?')) {
            try {
                await api.delete(`/admin/events/${id}`);
                alert('Event berhasil dihapus.');
                fetchEvents();
            } catch (error) {
                alert('Gagal menghapus event.');
            }
        }
    };

    return (
        <div className="admin-table-container">
            <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>Manajemen Event & Kegiatan</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
                Event yang diterbitkan di sini otomatis tampil di halaman utama website
                (section "Event &amp; Promo"), langsung untuk semua pengunjung — tidak perlu
                langganan Premium atau persetujuan tambahan seperti Iklan.
            </p>

            <form onSubmit={handleSubmit} className="admin-form">
                <h3>{editingId ? '📝 Edit Event' : '➕ Tambah Event Baru'}</h3>

                <div style={{ marginBottom: '15px' }}>
                    <label>Judul Kegiatan:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="Contoh: Festival Budaya Surade"
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Deskripsi / Detail Acara:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="4"
                        placeholder="Jelaskan detail waktu, tempat, dan acara..."
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                        <label>Lokasi:</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Contoh: Balai Desa Surade"
                        />
                    </div>
                    <div>
                        <label>Tanggal Acara:</label>
                        <input
                            type="date"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Kategori:</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">Pilih Kategori</option>
                        <option value="budaya">Budaya</option>
                        <option value="kuliner">Kuliner</option>
                        <option value="wisata">Wisata</option>
                        <option value="teknologi">Teknologi</option>
                        <option value="umum">Umum</option>
                        <option value="informasi">Informasi</option>
                    </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>URL Gambar (opsional):</label>
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://... (tempel link gambar, misal dari Unsplash)"
                    />
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                        Kosongkan kalau belum punya gambar — nanti dipakaikan gambar contoh otomatis.
                    </p>
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt="Pratinjau"
                            style={{ marginTop: '8px', width: '160px', height: '96px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Menyimpan...' : editingId ? 'Perbarui Event' : 'Terbitkan Event'}
                </button>

                {editingId && (
                    <button
                        type="button"
                        onClick={resetForm}
                        className="action-btn cancel"
                        style={{ marginLeft: '10px' }}
                    >
                        Batal
                    </button>
                )}
            </form>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Gambar</th>
                        <th>Judul Event</th>
                        <th>Kategori</th>
                        <th>Lokasi</th>
                        <th>Tanggal</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {events.length === 0 ? (
                        <tr><td colSpan="6" className="empty-state">Belum ada data event.</td></tr>
                    ) : (
                        events.map((ev) => (
                            <tr key={ev.id}>
                                <td style={{ textAlign: 'center' }}>
                                    {ev.image_url || ev.image ? (
                                        <img src={ev.image_url || ev.image} alt={ev.title} style={{ width: '80px', height: '50px' }} />
                                    ) : (
                                        <span style={{ color: '#9ca3af', fontSize: '12px' }}>No Image</span>
                                    )}
                                </td>
                                <td><strong>{ev.title}</strong></td>
                                <td style={{ color: '#6b7280', fontSize: '14px' }}>{ev.category || '-'}</td>
                                <td style={{ color: '#6b7280', fontSize: '14px' }}>{ev.location || '-'}</td>
                                <td style={{ color: '#6b7280', fontSize: '14px' }}>
                                    {ev.event_date ? new Date(ev.event_date).toLocaleDateString('id-ID') : '-'}
                                </td>
                                <td>
                                    <button onClick={() => handleEdit(ev)} className="action-btn edit">Edit</button>
                                    <button onClick={() => handleDelete(ev.id)} className="action-btn delete">Hapus</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default EventManagement;