import React from 'react';
import { NavLink } from 'react-router-dom';
import { Map, Eye, Shield, BookOpen, X, Activity } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

export const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useUIStore();

  if (!isSidebarOpen) return null;

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
      isActive
        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
        : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={closeSidebar} />
      <div className="relative w-72 max-w-[80vw] bg-ocean-900 border-r border-slate-800 h-full p-5 flex flex-col z-10">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-100">NIO Cyclone Intel</span>
          </div>
          <button onClick={closeSidebar} className="p-1.5 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-2 flex-1" onClick={closeSidebar}>
          <NavLink to="/" end className={navLinkClass}>
            <Map className="w-4 h-4" />
            Dashboard
          </NavLink>
          <NavLink to="/historical" className={navLinkClass}>
            <Eye className="w-4 h-4" />
            Historical Explorer
          </NavLink>
          <NavLink to="/cyclogenesis" className={navLinkClass}>
            <Shield className="w-4 h-4" />
            Cyclogenesis Watch
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            <BookOpen className="w-4 h-4" />
            Methodology & Disclaimer
          </NavLink>
        </nav>

        <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
          Official bulletins: <a href="https://mausam.imd.gov.in" target="_blank" rel="noreferrer" className="text-cyan-400 underline">mausam.imd.gov.in</a>
        </div>
      </div>
    </div>
  );
};
