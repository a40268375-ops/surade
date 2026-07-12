import React from 'react';

export default function MainLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <nav className="bg-teal-950 text-white p-4 flex justify-between items-center border-b-4 border-amber-400">
                <div className="flex items-center space-x-2">
                    <span className="font-black text-2xl text-amber-300">Surade<span className="text-white">.co.id</span></span>
                </div>
                <div className="space-x-4 font-semibold text-sm">
                    <a href="#" className="hover:text-amber-300">Home</a>
                    <a href="#" className="hover:text-amber-300">Informasi</a>
                    <a href="#" className="bg-emerald-500 px-3 py-2 rounded shadow">+ Add Bisnis</a>
                </div>
            </nav>
            <main>{children}</main>
        </div>
    );
}