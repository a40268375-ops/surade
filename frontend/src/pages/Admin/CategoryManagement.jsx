import React, { useState, useEffect } from 'react';
import api from '../../utils/api'; // Mengarah ke utils/api.js kamu

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    // 1. Ambil data kategori dari API public
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

    // 2. Tambah atau Edit Kategori
    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationErrors({});

        const payload = { name, icon };

        try {
            if (editingId) {
                // Update ke: PUT /api/admin/categories/{id}
                await api.put(`/admin/categories/${editingId}`, payload);
                alert('Kategori berhasil diperbarui!');
            } else {
                // Tambah ke: POST /api/admin/categories
                await api.post('/admin/categories', payload);
                alert('Kategori berhasil ditambahkan!');
            }
            
            setName('');
            setIcon('');
            setEditingId(null);
            fetchCategories(); // Refresh data di tabel
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setValidationErrors(error.response.data.errors);
            } else {
                alert(error.response?.data?.message || 'Terjadi kesalahan sistem.');
            }
        }
    };

    // 3. Set data ke form untuk diedit
    const handleEdit = (category) => {
        setEditingId(category.id);
        setName(category.name);
        setIcon(category.icon || '');
    };

    // 4. Hapus Kategori
    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            try {
                // Hapus ke: DELETE /api/admin/categories/{id}
                await api.delete(`/admin/categories/${id}`);
                alert('Kategori berhasil dihapus.');
                fetchCategories();
            } catch (error) {
                alert('Gagal menghapus data.');
            }
        }
    };

    return (
        <div style={{ padding: '25px', fontFamily: 'sans-serif' }}>
            <h2>Panel Admin: Manajemen Kategori Bisnis</h2>
            <hr />

            {/* FORM INPUT */}
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px' }}>
                <h3>{editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h3>
                
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Nama Kategori:</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                    {validationErrors.name && <span style={{ color: 'red', fontSize: '13px' }}>{validationErrors.name[0]}</span>}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Icon Class (Opsional):</label>
                    <input 
                        type="text" 
                        placeholder="Contoh: fa-store, fa-utensils"
                        value={icon} 
                        onChange={(e) => setIcon(e.target.value)} 
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>

                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {editingId ? 'Perbarui' : 'Simpan Kategori'}
                </button>
                {editingId && (
                    <button type="button" onClick={() => { setEditingId(null); setName(''); setIcon(''); }} style={{ marginLeft: '10px', padding: '10px 15px' }}>
                        Batal
                    </button>
                )}
            </form>

            {/* TABEL DATA */}
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ backgroundColor: '#e9ecef' }}>
                        <th>ID</th>
                        <th>Nama Kategori</th>
                        <th>Icon</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.length === 0 ? (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center' }}>Belum ada data kategori.</td>
                        </tr>
                    ) : (
                        categories.map((cat) => (
                            <tr key={cat.id}>
                                <td>{cat.id}</td>
                                <td><strong>{cat.name}</strong></td>
                                <td>{cat.icon || '-'}</td>
                                <td>
                                    <button onClick={() => handleEdit(cat)} style={{ marginRight: '10px', padding: '5px 10px', cursor: 'pointer' }}>Edit</button>
                                    <button onClick={() => handleDelete(cat.id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Hapus</button>
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