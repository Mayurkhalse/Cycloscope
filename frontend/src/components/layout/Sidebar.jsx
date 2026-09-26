import React from 'react';
import { NavLink } from 'react-router-dom';
import { Map, Eye, Shield, BookOpen, X, Activity, Bot, LogOut, User } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

export const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useUIStore();
  const { user, logout } = useAuthStore();

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
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
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

        {/* Operator Profile Card in Sidebar */}
        {user && (
          <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-ocean-600 text-white font-bold text-xs flex items-center justify-center">
                {user.avatarInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 text-xs truncate">{user.name}</div>
                <div className="text-[10px] text-slate-500 font-mono truncate">{user.callsign}</div>
              </div>
            </div>
            <div className="mt-2 text-[10px] font-semibold text-ocean-700 bg-ocean-50 px-2 py-0.5 rounded border border-ocean-200">
              {user.roleTitle}
            </div>
          </div>
        )}

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

        <div className="pt-4 border-t border-slate-200 space-y-3">
          {user && (
            <button
              onClick={() => {
                closeSidebar();
                logout();
              }}
              className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold text-xs transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Workstation</span>
            </button>
          )}
          <div className="text-[11px] text-slate-500">
            Official bulletins: <a href="https://mausam.imd.gov.in" target="_blank" rel="noreferrer" className="text-ocean-600 font-semibold underline">mausam.imd.gov.in</a>
          </div>
        </div>
      </div>
    </div>
  );
};

