import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  Shield,
  Map,
  Eye,
  BookOpen,
  MessageSquare,
  Menu,
  Bot,
  LogOut,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useActiveSystems } from '../../hooks/useActiveSystems';
import { useAuthStore } from '../../store/authStore';

export const Navbar = () => {
  const { toggleSidebar, toggleChat, isChatOpen } = useUIStore();
  const { systemStatus } = useActiveSystems();
  const { user, logout } = useAuthStore();

  const getStatusIndicator = () => {
    const status = systemStatus?.status || 'green';
    if (status === 'green') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs text-emerald-700 font-semibold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          ML Live
        </span>
      );
    } else if (status === 'amber') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-700 font-semibold shadow-xs" title="Statistical Fallback Active">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Fallback Mode
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 rounded-full text-xs text-rose-700 font-semibold shadow-xs">
        <span className="w-2 h-2 rounded-full bg-rose-500" />
        Offline
      </span>
    );
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${isActive
      ? 'bg-ocean-50 text-ocean-700 border border-ocean-200 shadow-xs'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const getAvatarBg = (role) => {
    switch (role) {
      case 'meteorologist':
        return 'bg-emerald-600';
      case 'analyst':
        return 'bg-sky-600';
      case 'coordinator':
        return 'bg-amber-600';
      case 'admin':
        return 'bg-indigo-600';
      default:
        return 'bg-ocean-600';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200/80 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Clean Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-ocean-600 to-teal-500 flex items-center justify-center shadow-md shadow-ocean-600/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight group-hover:text-ocean-600 transition-colors">
              Cycloscope
            </span>
          </NavLink>
        </div>

        {/* Desktop Route Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          <NavLink to="/" end className={navLinkClass}>
            <Map className="w-3.5 h-3.5" />
            Dashboard
          </NavLink>
          <NavLink to="/historical" className={navLinkClass}>
            <Eye className="w-3.5 h-3.5" />
            Historical Explorer
          </NavLink>
          <NavLink to="/cyclogenesis" className={navLinkClass}>
            <Shield className="w-3.5 h-3.5" />
            Cyclogenesis Watch
          </NavLink>
          <NavLink to="/chat" className={navLinkClass}>
            <Bot className="w-3.5 h-3.5" />
            AI Assistant
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            <BookOpen className="w-3.5 h-3.5" />
            Methodology
          </NavLink>
        </nav>

        {/* Right Status, Mode Switcher, Profile Name & Logout Button */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mode Switcher Pill */}
          <div className="hidden xl:flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold shadow-inner">
            <button
              onClick={() => useUIStore.getState().setSystemMode('live')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${useUIStore((s) => s.systemMode) === 'live'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${useUIStore((s) => s.systemMode) === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              Live Mode
            </button>
            <button
              onClick={() => useUIStore.getState().setSystemMode('replay')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${useUIStore((s) => s.systemMode) === 'replay'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${useUIStore((s) => s.systemMode) === 'replay' ? 'bg-indigo-500' : 'bg-slate-400'}`} />
              Replay Mode
            </button>
          </div>

          <div className="hidden sm:block">
            {getStatusIndicator()}
          </div>

          {/* Profile Name & Direct Log Out Button */}
          {user && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl shadow-xs">
                <div className={`w-6 h-6 rounded-lg ${getAvatarBg(user.role)} text-white font-bold text-[10px] flex items-center justify-center shadow-xs`}>
                  {user.avatarInitials || 'OP'}
                </div>
                <span className="text-slate-800 text-xs font-bold whitespace-nowrap">
                  {user.name}
                </span>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 hover:text-rose-800 transition shadow-xs"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          )}

          <button
            onClick={toggleChat}
            className={`hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${isChatOpen
                ? 'bg-ocean-600 text-white shadow-md shadow-ocean-600/25'
                : 'bg-white text-ocean-700 hover:bg-ocean-50 border border-ocean-200'
              }`}
            title="Toggle Floating Assistant Panel"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Quick Chat</span>
          </button>
        </div>
      </div>
    </header>
  );
};
