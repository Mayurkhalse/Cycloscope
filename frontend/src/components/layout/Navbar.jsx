import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Shield, Map, Eye, BookOpen, MessageSquare, Menu } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useActiveSystems } from '../../hooks/useActiveSystems';

export const Navbar = () => {
  const { toggleSidebar, toggleChat, isChatOpen } = useUIStore();
  const { systemStatus } = useActiveSystems();

  const getStatusIndicator = () => {
    const status = systemStatus?.status || 'green';
    if (status === 'green') {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 border border-emerald-500/40 rounded-full text-xs text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-3.5" />
          ML Live
        </span>
      );
    } else if (status === 'amber') {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/80 border border-amber-500/40 rounded-full text-xs text-amber-400 font-medium" title="Statistical Fallback Active">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Fallback Mode
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-950/80 border border-rose-500/40 rounded-full text-xs text-rose-400 font-medium">
        <span className="w-2 h-2 rounded-full bg-rose-400" />
        Offline
      </span>
    );
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
      isActive
        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-ocean-950/90 border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base text-slate-100 tracking-tight flex items-center gap-2">
                NIO Cyclone Intel
                <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-cyan-400 rounded font-mono">v1.0</span>
              </div>
              <div className="text-[10px] text-slate-400 hidden sm:block">
                Bay of Bengal & Arabian Sea Decision Support
              </div>
            </div>
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
          <NavLink to="/about" className={navLinkClass}>
            <BookOpen className="w-3.5 h-3.5" />
            Methodology
          </NavLink>
        </nav>

        {/* Right Status & Actions */}
        <div className="flex items-center gap-3">
          {getStatusIndicator()}
          
          <button
            onClick={toggleChat}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isChatOpen
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'bg-slate-800 text-cyan-400 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>
        </div>
      </div>
    </header>
  );
};
