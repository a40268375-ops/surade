import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

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
        setPassword(''); // Kosongkan password saat edit kecuali ingin diganti
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
        <div style={{ padding: '25px', fontFamily: 'sans-serif' }}>
            <h2>Panel Admin: Manajemen Users</h2>
            <hr />
            <form onSubmit={handleSubmit} style={{ marginBottom: '25px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px' }}>
                <h3>{editingId ? 'Edit Akun User' : 'Buat Akun Baru'}</h3>
                <input type="text" placeholder="Nama" value={name} onChange={e => setName(e.target.value)} required style={{ marginRight: '10px', padding: '6px' }} />
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ marginRight: '10px', padding: '6px' }} />
                <input type="password" placeholder={editingId ? "Kosongkan jika tidak diubah" : "Password"} value={password} onChange={e => setPassword(e.target.value)} style={{ marginRight: '10px', padding: '6px' }} />
                <select value={role} onChange={e => setRole(e.target.value)} style={{ marginRight: '10px', padding: '6px' }}>
                    <option value="user">User Biasa</option>
                    <option value="reseller">Reseller</option>
                    <option value="admin">Admin</option>
                </select>
                <button type="submit" style={{ padding: '7px 15px', backgroundColor: '#28a745', color: '#white', border: 'none', cursor: 'pointer' }}>Simpan</button>
                {editingId && <button type="button" onClick={clearForm} style={{ marginLeft: '5px' }}>Batal</button>}
                {errors.email && <p style={{ color: 'red' }}>{errors.email[0]}</p>}
            </form>

            <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#eee' }}>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id}>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td><span style={{ fontWeight: 'bold', color: u.role === 'admin' ? 'red' : 'blue' }}>{u.role.toUpperCase()}</span></td>
                            <td>
                                <button onClick={() => handleEdit(u)} style={{ marginRight: '5px' }}>Edit</button>
                                <button onClick={() => handleDelete(u.id)} style={{ backgroundColor: '#dc3545', color: '#fff' }}>Hapus</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagement;