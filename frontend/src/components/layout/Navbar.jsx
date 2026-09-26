import React, { useState, useRef, useEffect } from 'react';
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
  User,
  LogOut,
  ChevronDown,
  Check,
  Sparkles,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useActiveSystems } from '../../hooks/useActiveSystems';
import { useAuthStore } from '../../store/authStore';
import { PRESET_OPERATOR_PERSONAS } from '../../store/operatorsData';

export const Navbar = () => {
  const { toggleSidebar, toggleChat, isChatOpen } = useUIStore();
  const { systemStatus } = useActiveSystems();
  const { user, switchRole, logout } = useAuthStore();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const getRoleBadgeClasses = (role) => {
    switch (role) {
      case 'meteorologist':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'analyst':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'coordinator':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'admin':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

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

        {/* Right Status, Mode Switcher, Operator Badge & Quick Drawer Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mode Switcher Pill */}
          <div className="hidden xl:flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold shadow-inner">
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

          <div className="hidden sm:block">
            {getStatusIndicator()}
          </div>

          {/* =========================================================================
              OPERATOR PROFILE PILL & ROLE SWITCHER DROPDOWN
              ========================================================================= */}
          {user && (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-xl text-xs font-semibold transition shadow-xs group"
                title="Active Operator Profile & Clearance"
              >
                <div className={`w-6 h-6 rounded-lg ${getAvatarBg(user.role)} text-white font-bold text-[10px] flex items-center justify-center shadow-xs`}>
                  {user.avatarInitials || 'OP'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-slate-900 text-xs font-bold leading-none flex items-center gap-1">
                    {user.name.split(' ')[0]} {user.name.split(' ')[1] || ''}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5 leading-none">
                    {user.callsign}
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${getRoleBadgeClasses(user.role)}`}>
                  {user.role === 'meteorologist'
                    ? 'FORECASTER'
                    : user.role === 'analyst'
                    ? 'ANALYST'
                    : user.role === 'coordinator'
                    ? 'COORDINATOR'
                    : 'ADMIN'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition" />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Operator Details Header */}
                  <div className="pb-3 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Operational Session
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 flex items-center gap-1 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        ACTIVE
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <div className={`w-10 h-10 rounded-xl ${getAvatarBg(user.role)} text-white font-extrabold text-sm flex items-center justify-center shadow-sm`}>
                        {user.avatarInitials}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm">{user.name}</div>
                        <div className="text-xs text-slate-600 font-medium">{user.roleTitle}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{user.callsign} • {user.clearanceLevel}</div>
                      </div>
                    </div>
                  </div>

                  {/* Station & Department info */}
                  <div className="py-2.5 border-b border-slate-100 text-xs text-slate-600 space-y-1">
                    <div><span className="font-semibold text-slate-700">Station:</span> {user.station}</div>
                    <div><span className="font-semibold text-slate-700">Department:</span> {user.department}</div>
                  </div>

                  {/* 1-Click Role Switcher */}
                  <div className="py-2.5 border-b border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Switch Role Simulation
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {PRESET_OPERATOR_PERSONAS.map((op) => {
                        const isSelected = user.role === op.role;
                        return (
                          <button
                            key={op.id}
                            onClick={() => {
                              switchRole(op.role);
                              setIsProfileOpen(false);
                            }}
                            className={`p-2 rounded-xl text-left border text-xs transition flex items-center justify-between ${
                              isSelected
                                ? 'bg-ocean-50 border-ocean-300 text-ocean-900 font-bold'
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 font-medium'
                            }`}
                          >
                            <span className="truncate">
                              {op.role === 'meteorologist'
                                ? '🌀 Forecaster'
                                : op.role === 'analyst'
                                ? '🔬 Analyst'
                                : op.role === 'coordinator'
                                ? '🛡️ Coordinator'
                                : '⚙️ Admin'}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-ocean-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lock / Logout Button */}
                  <div className="pt-3">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Lock Workstation & Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

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

