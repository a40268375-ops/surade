import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './AdminTable.css';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error("Gagal memuat kategori:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationErrors({});

        const payload = { name, icon };

        try {
            if (editingId) {
                await api.put(`/admin/categories/${editingId}`, payload);
                alert('Kategori berhasil diperbarui!');
            } else {
                await api.post('/admin/categories', payload);
                alert('Kategori berhasil ditambahkan!');
            }
            
            setName('');
            setIcon('');
            setEditingId(null);
            fetchCategories();
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setValidationErrors(error.response.data.errors);
            } else {
                alert(error.response?.data?.message || 'Terjadi kesalahan sistem.');
            }
        }
    };

    const handleEdit = (category) => {
        setEditingId(category.id);
        setName(category.name);
        setIcon(category.icon || '');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            try {
                await api.delete(`/admin/categories/${id}`);
                alert('Kategori berhasil dihapus.');
                fetchCategories();
            } catch (error) {
                alert('Gagal menghapus data.');
            }
        }
    };

    return (
        <div className="admin-table-container">
            <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>Panel Admin: Manajemen Kategori Bisnis</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
                Kelola kategori untuk mengelompokkan bisnis di platform.
            </p>

            <form onSubmit={handleSubmit} className="admin-form">
                <h3>{editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h3>
                
                <div style={{ marginBottom: '15px' }}>
                    <label>Nama Kategori:</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Contoh: Kuliner, Wisata, dll"
                    />
                    {validationErrors.name && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{validationErrors.name[0]}</p>}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Icon Class (Opsional):</label>
                    <input 
                        type="text" 
                        placeholder="Contoh: fa-store, fa-utensils"
                        value={icon} 
                        onChange={(e) => setIcon(e.target.value)}
                    />
                </div>

                <button type="submit">
                    {editingId ? 'Perbarui' : 'Simpan Kategori'}
                </button>
                {editingId && (
                    <button
                        type="button"
                        onClick={() => { setEditingId(null); setName(''); setIcon(''); }}
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
                        <th>ID</th>
                        <th>Nama Kategori</th>
                        <th>Icon</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="empty-state">Belum ada data kategori.</td>
                        </tr>
                    ) : (
                        categories.map((cat) => (
                            <tr key={cat.id}>
                                <td style={{ color: '#6b7280', fontSize: '14px' }}>{cat.id}</td>
                                <td><strong>{cat.name}</strong></td>
                                <td style={{ color: '#6b7280', fontSize: '14px' }}>{cat.icon || '-'}</td>
                                <td>
                                    <button onClick={() => handleEdit(cat)} className="action-btn edit">Edit</button>
                                    <button onClick={() => handleDelete(cat.id)} className="action-btn delete">Hapus</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default CategoryManagement;