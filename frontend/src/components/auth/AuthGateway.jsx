import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Radio,
  ArrowRight,
  Compass,
  Cpu,
  Globe,
  Waves,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { PRESET_OPERATOR_PERSONAS, REGIONAL_CENTERS } from '../../store/operatorsData';

export const AuthGateway = () => {
  const { login, quickLogin, isLoading, error, clearError } = useAuthStore();

  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'credentials'
  const [selectedCenter, setSelectedCenter] = useState('rsmc-delhi');
  const [username, setUsername] = useState('meteorologist');
  const [password, setPassword] = useState('meteo2026');
  const [showPassword, setShowPassword] = useState(false);
  const [utcTime, setUtcTime] = useState('');
  const [authenticatingRole, setAuthenticatingRole] = useState(null);

  // Update Synoptic UTC clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      await login({ username, password });
    } catch {
      // Error handled in store
    }
  };

  const handlePresetSelect = async (op) => {
    clearError();
    setAuthenticatingRole(op.role);
    try {
      await quickLogin(op.role);
    } catch {
      setAuthenticatingRole(null);
    }
  };

  const fillCredentials = (role) => {
    const op = PRESET_OPERATOR_PERSONAS.find((p) => p.role === role);
    if (op) {
      setUsername(op.username);
      setPassword(op.passwords[0]);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#08131d] text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-ocean-500 selection:text-white font-sans">
      {/* =========================================================================
          ATMOSPHERIC RADAR BACKDROP & SCANNER ANIMATION
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle coordinate grid lines */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(to right, #38bdf8 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Ambient Radial Deep Sea Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] bg-gradient-to-tr from-ocean-950/40 via-teal-950/20 to-transparent rounded-full blur-3xl" />

        {/* Concentric Radar Range Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-teal-500/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] rounded-full border border-teal-500/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[920px] h-[920px] rounded-full border border-teal-500/[0.07]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1240px] h-[1240px] rounded-full border border-teal-500/[0.04]" />

        {/* Radar Sweeping Beam */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full animate-spin"
          style={{
            background: 'conic-gradient(from 0deg, transparent 65%, rgba(14, 165, 233, 0.08) 92%, rgba(20, 184, 166, 0.22) 100%)',
            animationDuration: '12s',
          }}
        />

        {/* Crosshair Cardinal Guides */}
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-teal-500/10" />
        <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-teal-500/10" />
      </div>

      {/* =========================================================================
          TOP SECURE PORTAL HEADER BAR
          ========================================================================= */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ocean-600 to-teal-500 flex items-center justify-center shadow-lg shadow-ocean-600/30 text-white font-extrabold ring-1 ring-white/20">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
                cycloscope
                <span className="text-[10px] px-2 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full font-mono uppercase tracking-wider">
                  Operational Portal
                </span>
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>RSMC New Delhi • INCOIS Hyderabad • NDMA</span>
              <span className="text-slate-600">•</span>
              <span className="text-ocean-400 font-mono text-[11px]">Domain: 00°-45°N / 40°-100°E</span>
            </div>
          </div>
        </div>

        {/* Telemetry Status Indicators */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-slate-400 text-[10px] tracking-wider uppercase">Synoptic Synch</span>
            <span className="text-teal-400 font-bold">{utcTime || 'SYNCHRONIZING...'}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300 text-xs shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-sans font-medium">INSAT-3DR Telemetry Active</span>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN AUTHENTICATION CONTAINER
          ========================================================================= */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 my-4">
        <div className="w-full max-w-4xl bg-slate-900/85 border border-slate-700/90 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden ring-1 ring-white/10">
          {/* Card Top Banner */}
          <div className="p-6 sm:p-8 border-b border-slate-800 bg-gradient-to-b from-slate-800/60 to-transparent">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-ocean-400 uppercase tracking-widest mb-1.5">
                  <Shield className="w-4 h-4 text-teal-400" />
                  <span>Restricted Access Control • Level 2-4</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Meteorological Workstation Gateway
                </h1>
                <p className="text-sm text-slate-300 mt-1 max-w-xl">
                  Authorized access for operational forecasters, research analysts, emergency responders, and system administrators.
                </p>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-xl shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('presets');
                    clearError();
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'presets'
                      ? 'bg-gradient-to-r from-ocean-600 to-teal-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>1-Click Operator Presets</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('credentials');
                    clearError();
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'credentials'
                      ? 'bg-gradient-to-r from-ocean-600 to-teal-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Terminal Sign-In</span>
                </button>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold">Authentication Exception</div>
                <div>{error}</div>
              </div>
            </div>
          )}

          {/* TAB 1: 1-CLICK OPERATOR PRESETS */}
          {activeTab === 'presets' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Select Certified Operational Persona
                </div>
                <div className="text-xs text-teal-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Instant Authentication & Role Dispatch
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRESET_OPERATOR_PERSONAS.map((op) => {
                  const isCurrentAuthenticating = authenticatingRole === op.role && isLoading;
                  const borderClasses =
                    op.role === 'meteorologist'
                      ? 'hover:border-emerald-500/60 hover:bg-emerald-950/20'
                      : op.role === 'analyst'
                      ? 'hover:border-sky-500/60 hover:bg-sky-950/20'
                      : op.role === 'coordinator'
                      ? 'hover:border-amber-500/60 hover:bg-amber-950/20'
                      : 'hover:border-indigo-500/60 hover:bg-indigo-950/20';

                  const badgeBg =
                    op.role === 'meteorologist'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : op.role === 'analyst'
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                      : op.role === 'coordinator'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';

                  const avatarBg =
                    op.role === 'meteorologist'
                      ? 'bg-emerald-600'
                      : op.role === 'analyst'
                      ? 'bg-sky-600'
                      : op.role === 'coordinator'
                      ? 'bg-amber-600'
                      : 'bg-indigo-600';

                  return (
                    <div
                      key={op.id}
                      className={`relative flex flex-col justify-between p-5 rounded-xl border border-slate-800 bg-slate-950/50 transition-all group ${borderClasses} ${
                        isCurrentAuthenticating ? 'ring-2 ring-teal-400' : ''
                      }`}
                    >
                      <div>
                        {/* Operator Top Tag */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                            {op.clearanceLevel}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {op.callsign}
                          </span>
                        </div>

                        {/* Name & Title */}
                        <div className="flex items-start gap-3.5 mb-3">
                          <div className={`w-11 h-11 rounded-xl ${avatarBg} text-white font-extrabold flex items-center justify-center text-sm shadow-md shrink-0`}>
                            {op.avatarInitials}
                          </div>
                          <div>
                            <div className="font-extrabold text-base text-white group-hover:text-teal-300 transition-colors">
                              {op.name}
                            </div>
                            <div className="text-xs text-slate-300 font-semibold">{op.roleTitle}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{op.department}</div>
                          </div>
                        </div>

                        {/* Summary */}
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                          {op.roleSummary}
                        </p>

                        {/* Capability Pills */}
                        <div className="flex flex-wrap gap-1.5 mb-5">
                          {op.capabilities.map((cap, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-medium"
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={() => handlePresetSelect(op)}
                        disabled={isLoading}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          op.role === 'meteorologist'
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
                            : op.role === 'analyst'
                            ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-950/40'
                            : op.role === 'coordinator'
                            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-950/40'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-950/40'
                        } disabled:opacity-50`}
                      >
                        {isCurrentAuthenticating ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Authenticating Clearance...</span>
                          </>
                        ) : (
                          <>
                            <span>Access Workstation as {op.name.split(' ')[0]} {op.name.split(' ')[1] || ''}</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: TERMINAL SIGN-IN */}
          {activeTab === 'credentials' && (
            <form onSubmit={handleCredentialSubmit} className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Form Fields */}
                <div className="space-y-4">
                  {/* Meteorological Center Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Regional Operational Center
                    </label>
                    <select
                      value={selectedCenter}
                      onChange={(e) => setSelectedCenter(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
                    >
                      {REGIONAL_CENTERS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Username / Operator ID */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Operator Identifier / Callsign
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. meteorologist or RSMC-MET-01"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs placeholder:text-slate-600 focus:outline-hidden focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition font-mono"
                      />
                    </div>
                  </div>

                  {/* Passkey */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Security Passkey / Token
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter passkey"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs placeholder:text-slate-600 focus:outline-hidden focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember session checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="rememberSession"
                      defaultChecked
                      className="rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="rememberSession" className="text-xs text-slate-400 cursor-pointer select-none">
                      Retain active operational session on this terminal
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-ocean-600 via-teal-600 to-ocean-600 hover:from-ocean-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-ocean-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Security Clearance...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        <span>Authorize & Enter Workstation</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Right Column: Quick Demo Helper & Security Specifications */}
                <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-teal-400" />
                      <span>Quick Test Helper Credentials</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      Click any role below to automatically fill operational credentials into the terminal:
                    </p>

                    <div className="grid grid-cols-2 gap-2 mb-5">
                      <button
                        type="button"
                        onClick={() => fillCredentials('meteorologist')}
                        className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-950/30 hover:bg-emerald-950/50 text-left transition"
                      >
                        <div className="text-xs font-bold text-emerald-300">Forecaster</div>
                        <div className="text-[10px] font-mono text-slate-400">user: meteorologist</div>
                        <div className="text-[10px] font-mono text-slate-400">pass: meteo2026</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => fillCredentials('analyst')}
                        className="p-2.5 rounded-lg border border-sky-500/30 bg-sky-950/30 hover:bg-sky-950/50 text-left transition"
                      >
                        <div className="text-xs font-bold text-sky-300">Analyst</div>
                        <div className="text-[10px] font-mono text-slate-400">user: analyst</div>
                        <div className="text-[10px] font-mono text-slate-400">pass: analyst2026</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => fillCredentials('coordinator')}
                        className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-950/30 hover:bg-amber-950/50 text-left transition"
                      >
                        <div className="text-xs font-bold text-amber-300">NDMA Coordinator</div>
                        <div className="text-[10px] font-mono text-slate-400">user: coordinator</div>
                        <div className="text-[10px] font-mono text-slate-400">pass: ndma2026</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => fillCredentials('admin')}
                        className="p-2.5 rounded-lg border border-indigo-500/30 bg-indigo-950/30 hover:bg-indigo-950/50 text-left transition"
                      >
                        <div className="text-xs font-bold text-indigo-300">Administrator</div>
                        <div className="text-[10px] font-mono text-slate-400">user: admin</div>
                        <div className="text-[10px] font-mono text-slate-400">pass: admin2026</div>
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5 text-teal-400 font-semibold">
                      <Radio className="w-3.5 h-3.5" />
                      <span>Protected Scientific Channel</span>
                    </div>
                    <div>Session tokens are cryptographically salted and verified against operational RBAC policies.</div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Card Footer */}
          <div className="px-6 sm:px-8 py-3.5 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span>North Indian Ocean Cyclone Decision-Support System (NIOC-DSS)</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span>RSMC New Delhi</span>
              <span>•</span>
              <span>INCOIS</span>
              <span>•</span>
              <span>IMD</span>
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================================
          BOTTOM SCIENTIFIC FOOTNOTE
          ========================================================================= */}
      <footer className="relative z-10 w-full py-3 px-4 text-center text-[11px] text-slate-400 border-t border-slate-900 bg-slate-950/40">
        AI-derived estimates are for decision support and contingency planning. Official advisories are issued by the India Meteorological Department.
      </footer>
    </div>
  );
};
