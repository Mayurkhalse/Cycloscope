import React from 'react';
import { NavLink } from 'react-router-dom';
import { Map, Eye, Shield, BookOpen, X, Activity, Bot } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

export const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useUIStore();

  if (!isSidebarOpen) return null;

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
      isActive
        ? 'bg-ocean-50 text-ocean-700 border border-ocean-200'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={closeSidebar} />
      <div className="relative w-72 max-w-[80vw] bg-white border-r border-slate-200 h-full p-5 flex flex-col z-10 shadow-panel">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ocean-600 flex items-center justify-center text-white font-bold shadow-md shadow-ocean-600/20">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-slate-900">NIO Cyclone Intel</span>
          </div>
          <button onClick={closeSidebar} className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100">
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
          <NavLink to="/chat" className={navLinkClass}>
            <Bot className="w-4 h-4" />
            AI Assistant
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            <BookOpen className="w-4 h-4" />
            Methodology & Disclaimer
          </NavLink>
        </nav>

        <div className="pt-4 border-t border-slate-200 text-xs text-slate-500">
          Official bulletins: <a href="https://mausam.imd.gov.in" target="_blank" rel="noreferrer" className="text-ocean-600 font-semibold underline">mausam.imd.gov.in</a>
        </div>
      </div>
    </div>
  );
};
