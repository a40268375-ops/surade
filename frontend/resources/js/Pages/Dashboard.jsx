import React, { useState } from 'react';

export default function Dashboard() {
    const [view, setView] = useState('list');
    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">CRUD System - Surade.co.id</h1>
            <div className="flex gap-4 mb-6">
                <button onClick={() => setView('list')} className="bg-teal-800 text-white px-4 py-2 rounded">Lihat Data</button>
                <button onClick={() => setView('form')} className="bg-emerald-600 text-white px-4 py-2 rounded">+ Tambah</button>
            </div>
            {view === 'list' ? (
                <table className="w-full bg-white rounded shadow">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="p-3 text-left">Nama Bisnis</th>
                            <th className="p-3 text-left">Alamat</th>
                            <th className="p-3 text-left">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="p-3 font-semibold">Warung Makan Sederhana</td>
                            <td className="p-3">Kota Bogor</td>
                            <td className="p-3 space-x-2">
                                <button className="text-teal-600 font-bold">Edit</button>
                                <button className="text-red-600 font-bold">Hapus</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            ) : (
                <div className="bg-white p-6 rounded shadow max-w-lg">
                    <h2 className="text-lg font-bold mb-4">Tambah Bisnis</h2>
                    <input type="text" placeholder="Nama Bisnis" className="w-full border p-2 mb-3 rounded"/>
                    <input type="text" placeholder="Alamat" className="w-full border p-2 mb-3 rounded"/>
                    <button className="bg-emerald-600 text-white px-4 py-2 rounded">Simpan</button>
                </div>
            )}
        </div>
    );
}