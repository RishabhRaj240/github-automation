import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  GitBranch,
  LogOut,
  Settings,
  Sparkles,
  ShieldCheck,
  LayoutDashboard,
  Code2,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { GithubIcon } from './icons/GithubIcon';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, githubConnection, isDemoMode, signOut, enableDemoMode, disableDemoMode } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Workspace', path: '/workspace', icon: Code2 },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0d14]/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 p-0.5 shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full bg-[#101522] rounded-[10px] flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-brand-400 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  RepoPilot
                </span>
                <span className="ml-1 text-xs px-1.5 py-0.5 font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-md">
                  AI
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1 ml-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-brand-400' : 'text-slate-400'}`} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="hidden md:flex items-center gap-3">
            {/* Demo Mode Pill */}
            {isDemoMode && (
              <div
                title="Running in Local Demo Mode with mock GitHub authentication & storage"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 cursor-pointer"
                onClick={disableDemoMode}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Demo Mode</span>
              </div>
            )}

            {/* Connected GitHub Status Pill */}
            {githubConnection ? (
              <a
                href={githubConnection.githubProfileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition"
              >
                <GithubIcon className="w-4 h-4 text-white" />
                <span className="font-mono font-medium">@{githubConnection.githubUsername}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </a>
            ) : (
              <Link
                to="/settings"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 hover:text-white border border-slate-700 transition"
              >
                <GithubIcon className="w-4 h-4" />
                <span>Connect GitHub</span>
              </Link>
            )}

            {/* User Profile or Sign In */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition"
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                    alt={user.displayName}
                    className="w-7 h-7 rounded-full object-cover border border-slate-600"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 py-2 z-50"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                      <p className="text-xs font-semibold text-white truncate">{user.displayName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                      Dashboard
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      Account Settings
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/workspace"
                  className="px-3.5 py-1.5 text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white rounded-lg shadow-sm shadow-brand-500/20 transition"
                >
                  Publish Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0a0d14] px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          {user ? (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              Sign Out ({user.displayName})
            </button>
          ) : (
            <Link
              to="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center py-2.5 bg-brand-600 text-white font-medium rounded-lg"
            >
              Sign In / Get Started
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};
