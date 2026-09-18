import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Shield, Map, Eye, BookOpen, MessageSquare, Menu, Bot } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useActiveSystems } from '../../hooks/useActiveSystems';

export const Navbar = () => {
  const { toggleSidebar, toggleChat, isChatOpen } = useUIStore();
  const { systemStatus } = useActiveSystems();

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
    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-ocean-50 text-ocean-700 border border-ocean-200 shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200/80 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
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
            <div>
              <div className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight flex items-center gap-2">
                NIO Cyclone Intel
                <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-ocean-700 rounded font-mono font-semibold">v1.0</span>
              </div>
              <div className="text-[10px] text-slate-500 hidden sm:block font-medium">
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
          <NavLink to="/chat" className={navLinkClass}>
            <Bot className="w-3.5 h-3.5" />
            AI Assistant
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            <BookOpen className="w-3.5 h-3.5" />
            Methodology
          </NavLink>
        </nav>

        {/* Right Status, Mode Switcher & Quick Drawer Toggle */}
        <div className="flex items-center gap-3">
          {/* Mode Switcher Pill */}
          <div className="hidden lg:flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold shadow-inner">
            <button
              onClick={() => useUIStore.getState().setSystemMode('live')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                useUIStore((s) => s.systemMode) === 'live'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${useUIStore((s) => s.systemMode) === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              Live Mode
            </button>
            <button
              onClick={() => useUIStore.getState().setSystemMode('replay')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                useUIStore((s) => s.systemMode) === 'replay'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${useUIStore((s) => s.systemMode) === 'replay' ? 'bg-indigo-500' : 'bg-slate-400'}`} />
              Replay Mode
            </button>
          </div>

          {getStatusIndicator()}

          <button
            onClick={toggleChat}
            className={`hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              isChatOpen
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
