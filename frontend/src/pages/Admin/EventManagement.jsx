import React, { useState, useEffect } from 'react';
import api from '../../utils/api'; // Pastikan path ke api.js benar

const EventManagement = () => {
    const [events, setEvents] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [image, setImage] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    // 1. Ambil data event (mengarah ke route public GET /api/events)
    // CATATAN PERBAIKAN: api.get(...) di sini SUDAH mengembalikan data JSON-nya
    // langsung (lihat utils/api.js), bukan objek response ala axios. Jadi
    // dulu "response.data" itu selalu undefined -> tabel di bawah kelihatan
    // kosong terus walau event-nya sebenarnya sudah tersimpan di database.
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

    // 2. Tambah / Update Event
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            title,
            description,
            location,
            event_date: eventDate || null,
            image,
        };

        try {
            if (editingId) {
                // Update ke: PUT /api/admin/events/{id}
                await api.put(`/admin/events/${editingId}`, payload);
                alert('Event berhasil diperbarui!');
            } else {
                // Tambah ke: POST /api/admin/events
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
        setEditingId(null);
    };

    // 3. Set data ke form untuk Edit
    const handleEdit = (event) => {
        setEditingId(event.id);
        setTitle(event.title);
        setDescription(event.description || '');
        setLocation(event.location || '');
        // event_date dari server formatnya "2026-08-01T00:00:00.000000Z",
        // input type="date" butuh persis "YYYY-MM-DD"
        setEventDate(event.event_date ? event.event_date.slice(0, 10) : '');
        setImage(event.image || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 4. Hapus Event
    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus event ini?')) {
            try {
                // Hapus ke: DELETE /api/admin/events/{id}
                await api.delete(`/admin/events/${id}`);
                alert('Event berhasil dihapus.');
                fetchEvents();
            } catch (error) {
                alert('Gagal menghapus event.');
            }
        }
    };

    return (
        <div style={{ padding: '10px' }}>
            <h2 style={{ color: '#2c3e50' }}>Manajemen Event & Kegiatan</h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '16px' }}>
                Event yang diterbitkan di sini otomatis tampil di halaman utama website
                (section "Event &amp; Promo"), langsung untuk semua pengunjung — tidak perlu
                langganan Premium atau persetujuan tambahan seperti Iklan.
            </p>
            <hr />

            {/* FORM INPUT */}
            <form onSubmit={handleSubmit} style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '30px'
            }}>
                <h3>{editingId ? '📝 Edit Event' : '➕ Tambah Event Baru'}</h3>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Judul Kegiatan:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="Contoh: Festival Budaya Surade"
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Deskripsi / Detail Acara:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="4"
                        placeholder="Jelaskan detail waktu, tempat, dan acara..."
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Lokasi:</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Contoh: Balai Desa Surade"
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Tanggal Acara:</label>
                        <input
                            type="date"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>URL Gambar (opsional):</label>
                    <input
                        type="text"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://... (tempel link gambar, misal dari Unsplash)"
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                        Kosongkan kalau belum punya gambar — nanti dipakaikan gambar contoh otomatis.
                    </p>
                    {image && (
                        <img
                            src={image}
                            alt="Pratinjau"
                            style={{ marginTop: '8px', width: '160px', height: '96px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '10px 25px',
                        backgroundColor: '#007570',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {loading ? 'Menyimpan...' : editingId ? 'Perbarui Event' : 'Terbitkan Event'}
                </button>

                {editingId && (
                    <button
                        type="button"
                        onClick={resetForm}
                        style={{ marginLeft: '10px', padding: '10px 15px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}
                    >
                        Batal
                    </button>
                )}
            </form>

            {/* TABEL DATA */}
            <table border="1" cellPadding="12" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
                        <th>ID</th>
                        <th>Judul Event</th>
                        <th>Lokasi</th>
                        <th>Tanggal</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {events.length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center' }}>Belum ada data event.</td></tr>
                    ) : (
                        events.map((ev) => (
                            <tr key={ev.id}>
                                <td>{ev.id}</td>
                                <td><strong>{ev.title}</strong></td>
                                <td style={{ color: '#666', fontSize: '14px' }}>{ev.location || '-'}</td>
                                <td style={{ color: '#666', fontSize: '14px' }}>
                                    {ev.event_date ? new Date(ev.event_date).toLocaleDateString('id-ID') : '-'}
                                </td>
                                <td>
                                    <button onClick={() => handleEdit(ev)} style={{ marginRight: '8px', padding: '5px 12px', cursor: 'pointer', backgroundColor: '#f1c40f', border: 'none', borderRadius: '3px' }}>Edit</button>
                                    <button onClick={() => handleDelete(ev.id)} style={{ padding: '5px 12px', cursor: 'pointer', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '3px' }}>Hapus</button>
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