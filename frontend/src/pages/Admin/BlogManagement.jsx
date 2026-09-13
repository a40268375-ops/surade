import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './AdminTable.css';

const BlogManagement = () => {
    const [blogs, setBlogs] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [author, setAuthor] = useState('');
    const [category, setCategory] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchBlogs = async () => {
        try {
            const response = await api.get('/admin/blogs');
            setBlogs(response.data || response);
        } catch (error) {
            console.error("Gagal memuat blog:", error);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            title,
            content,
            author,
            category,
            image_url: imageUrl,
        };

        try {
            if (editingId) {
                await api.put(`/admin/blogs/${editingId}`, payload);
                alert('Blog berhasil diperbarui!');
            } else {
                await api.post('/admin/blogs', payload);
                alert('Blog baru berhasil diterbitkan!');
            }

            resetForm();
            fetchBlogs();
        } catch (error) {
            alert(error?.data?.message || 'Terjadi kesalahan saat menyimpan blog.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setContent('');
        setAuthor('');
        setCategory('');
        setImageUrl('');
        setEditingId(null);
    };

    const handleEdit = (blog) => {
        setEditingId(blog.id);
        setTitle(blog.title);
        setContent(blog.content || '');
        setAuthor(blog.author || '');
        setCategory(blog.category || '');
        setImageUrl(blog.image_url || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus blog ini?')) {
            try {
                await api.delete(`/admin/blogs/${id}`);
                alert('Blog berhasil dihapus.');
                fetchBlogs();
            } catch (error) {
                alert('Gagal menghapus blog.');
            }
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.post(`/admin/blogs/${id}/approve`);
            alert('Blog berhasil disetujui!');
            fetchBlogs();
        } catch (error) {
            alert('Gagal menyetujui blog.');
        }
    };

    return (
        <div className="admin-table-container">
            <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>Panel Admin: Manajemen Blog</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
                Kelola konten blog yang tampil di website.
            </p>

            <form onSubmit={handleSubmit} className="admin-form">
                <h3>{editingId ? '📝 Edit Blog' : '➕ Tambah Blog Baru'}</h3>

                <div style={{ marginBottom: '15px' }}>
                    <label>Judul Blog:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="Contoh: Panduan Wisata ke Curug Cikaso"
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Konten / Isi Blog:</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows="6"
                        placeholder="Tulis konten blog di sini..."
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                        <label>Penulis:</label>
                        <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            placeholder="Nama penulis"
                        />
                    </div>
                    <div>
                        <label>Kategori:</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">Pilih Kategori</option>
                            <option value="wisata">Wisata</option>
                            <option value="kuliner">Kuliner</option>
                            <option value="budaya">Budaya</option>
                            <option value="berita">Berita</option>
                            <option value="tips">Tips</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>URL Gambar Banner (opsional):</label>
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://... (tempel link gambar)"
                    />
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt="Pratinjau"
                            style={{ marginTop: '8px', width: '200px', height: '120px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Menyimpan...' : editingId ? 'Perbarui Blog' : 'Terbitkan Blog'}
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
                        <th>Judul Blog</th>
                        <th>Penulis</th>
                        <th>Kategori</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {blogs.length === 0 ? (
                        <tr><td colSpan="6" className="empty-state">Belum ada data blog.</td></tr>
                    ) : (
                        blogs.map((blog) => (
                            <tr key={blog.id}>
                                <td style={{ textAlign: 'center' }}>
                                    {blog.image_url ? (
                                        <img src={blog.image_url} alt={blog.title} style={{ width: '80px', height: '50px' }} />
                                    ) : (
                                        <span style={{ color: '#9ca3af', fontSize: '12px' }}>No Image</span>
                                    )}
                                </td>
                                <td><strong>{blog.title}</strong></td>
                                <td style={{ color: '#6b7280', fontSize: '14px' }}>{blog.author || '-'}</td>
                                <td style={{ color: '#6b7280', fontSize: '14px' }}>{blog.category || '-'}</td>
                                <td>
                                    <span className={`status-badge ${blog.status || 'draft'}`}>
                                        {(blog.status || 'DRAFT').toUpperCase()}
                                    </span>
                                </td>
                                <td>
                                    {blog.status !== 'published' && (
                                        <button 
                                            onClick={() => handleApprove(blog.id)} 
                                            className="action-btn approve"
                                        >
                                            Approve
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleEdit(blog)} 
                                        className="action-btn edit"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(blog.id)} 
                                        className="action-btn delete"
                                    >
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

export default BlogManagement;
