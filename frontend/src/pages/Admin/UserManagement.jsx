import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './AdminTable.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [editingId, setEditingId] = useState(null);
    const [errors, setErrors] = useState({});

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Gagal mengambil data user", error);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        const payload = { name, email, role };
        if (password) payload.password = password;

        try {
            if (editingId) {
                await api.put(`/admin/users/${editingId}`, payload);
                alert('User berhasil diupdate!');
            } else {
                if (!password) { alert('Password wajib diisi untuk user baru!'); return; }
                await api.post('/admin/users', payload);
                alert('User berhasil ditambahkan!');
            }
            clearForm();
            fetchUsers();
        } catch (error) {
            if (error.response?.status === 422) setErrors(error.response.data.errors);
        }
    };

    const handleEdit = (user) => {
        setEditingId(user.id);
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
        setPassword('');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Hapus user ini?')) {
            try {
                await api.delete(`/admin/users/${id}`);
                fetchUsers();
            } catch (error) { alert('Gagal menghapus user'); }
        }
    };

    const clearForm = () => {
        setName(''); setEmail(''); setPassword(''); setRole('user'); setEditingId(null);
    };

    return (
        <div className="admin-table-container">
            <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>Panel Admin: Manajemen Users</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
                Kelola akun pengguna dan peran akses mereka.
            </p>

            <form onSubmit={handleSubmit} className="admin-form">
                <h3>{editingId ? 'Edit Akun User' : 'Buat Akun Baru'}</h3>
                
                <div style={{ marginBottom: '15px' }}>
                    <label>Nama:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        placeholder="Nama lengkap"
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder="email@example.com"
                    />
                    {errors.email && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.email[0]}</p>}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>{editingId ? "Password (kosongkan jika tidak diubah)" : "Password"}:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder={editingId ? "Kosongkan jika tidak diubah" : "Masukkan password"}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Role:</label>
                    <select
                        value={role}
                        onChange={e => setRole(e.target.value)}
                    >
                        <option value="user">User Biasa</option>
                        <option value="reseller">Reseller</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <button type="submit">
                    {editingId ? 'Update User' : 'Buat User'}
                </button>
                {editingId && (
                    <button
                        type="button"
                        onClick={clearForm}
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
                        <th>Nama</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Kode Referral</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr><td colSpan="5" className="empty-state">Belum ada data user.</td></tr>
                    ) : (
                        users.map(u => (
                            <tr key={u.id}>
                                <td><strong>{u.name}</strong></td>
                                <td style={{ color: '#6b7280', fontSize: '14px' }}>{u.email}</td>
                                <td>
                                    <span className={`status-badge ${u.role}`}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td>
                                    {u.referral_code ? (
                                        <div style={{ 
                                            background: '#ecfdf5', 
                                            color: '#059669', 
                                            padding: '4px 8px', 
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            fontFamily: 'monospace'
                                        }}>
                                            {u.referral_code}
                                        </div>
                                    ) : (
                                        <span style={{ color: '#9ca3af', fontSize: '12px' }}>-</span>
                                    )}
                                </td>
                                <td>
                                    <button onClick={() => handleEdit(u)} className="action-btn edit">Edit</button>
                                    <button onClick={() => handleDelete(u.id)} className="action-btn delete">Hapus</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagement;