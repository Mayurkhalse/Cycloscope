import React, { useState } from 'react';
import {
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  UserCheck,
  RefreshCw,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { PRESET_OPERATOR_PERSONAS } from '../../store/operatorsData';

export const RoleClearanceRibbon = () => {
  const { user, switchRole, logout } = useAuthStore();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!user) return null;

  const getThemeClasses = () => {
    switch (user.role) {
      case 'meteorologist':
        return {
          bannerBg: 'bg-emerald-950/70 border-emerald-800/80 text-emerald-200',
          badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
          accent: 'text-emerald-400',
        };
      case 'analyst':
        return {
          bannerBg: 'bg-sky-950/70 border-sky-800/80 text-sky-200',
          badgeBg: 'bg-sky-500/20 border-sky-500/40 text-sky-300',
          accent: 'text-sky-400',
        };
      case 'coordinator':
        return {
          bannerBg: 'bg-amber-950/70 border-amber-800/80 text-amber-200',
          badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
          accent: 'text-amber-400',
        };
      case 'admin':
        return {
          bannerBg: 'bg-indigo-950/70 border-indigo-800/80 text-indigo-200',
          badgeBg: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
          accent: 'text-indigo-400',
        };
      default:
        return {
          bannerBg: 'bg-slate-900 border-slate-800 text-slate-200',
          badgeBg: 'bg-slate-700 text-slate-300 border-slate-600',
          accent: 'text-teal-400',
        };
    }
  };

  const theme = getThemeClasses();

  return (
    <div className={`w-full border-b backdrop-blur-md px-4 py-1.5 transition-all text-xs ${theme.bannerBg}`}>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Active Operator Identity */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white tracking-wide">OPERATIONAL SESSION:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white">{user.name}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-slate-300">
              {user.callsign}
            </span>
          </div>

          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${theme.badgeBg}`}>
            {user.clearanceLevel}
          </span>

          <span className="hidden lg:inline-block text-[11px] opacity-80">
            • {user.station}
          </span>
        </div>

        {/* Right: Quick Role Switcher Buttons & Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Role Switch Pills */}
          <div className="hidden sm:flex items-center gap-1 bg-black/30 p-0.5 rounded-lg border border-white/10 text-[11px]">
            <span className="px-2 text-slate-400 font-medium">Switch Role:</span>
            {PRESET_OPERATOR_PERSONAS.map((op) => {
              const isActive = user.role === op.role;
              return (
                <button
                  key={op.id}
                  onClick={() => switchRole(op.role)}
                  className={`px-2 py-0.5 rounded-md font-semibold transition ${
                    isActive
                      ? 'bg-white/20 text-white shadow-xs font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                  title={`Switch to ${op.roleTitle}`}
                >
                  {op.role === 'meteorologist'
                    ? 'Forecaster'
                    : op.role === 'analyst'
                    ? 'Analyst'
                    : op.role === 'coordinator'
                    ? 'Coordinator'
                    : 'Admin'}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition font-medium"
            title="Toggle Operator Capabilities"
          >
            <span>Capabilities</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 font-semibold transition"
            title="Lock Workstation & Log Out"
          >
            <LogOut className="w-3 h-3" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Expanded Capabilities Tray */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-white/10 pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-semibold text-white mb-1">
              Active Authorization Mandate ({user.roleTitle}):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {user.capabilities?.map((cap, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-slate-300 font-medium text-[11px]">
                  ✓ {cap}
                </span>
              ))}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 italic">
            Department: {user.department}
          </div>
        </div>
      )}
    </div>
  );
};
