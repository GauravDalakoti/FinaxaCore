import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar.jsx';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">

      <div className="hidden lg:flex lg:w-60 flex-shrink-0">
        <div className="w-full">
          <Sidebar />
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0" style={{ background: 'rgba(10,15,30,0.7)' }} onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 z-50 animate-slide-in-right">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
       
        <div className="lg:hidden flex items-center px-4 py-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg" style={{ color: 'var(--text-secondary)' }}>
            <Menu size={20} />
          </button>
          <span className="ml-3 font-display font-bold" style={{ color: 'var(--text-primary)' }}>FinaxaCore</span>
        </div>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}