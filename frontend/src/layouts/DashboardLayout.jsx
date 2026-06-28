import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, BarChart2, Clock, Users, Disc, User, Settings, LogOut, Menu, X, Search, Bell } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, profile: user } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Recent Tracks', path: '/recent', icon: Clock },
    { name: 'Top Artists', path: '/artists', icon: Users },
    { name: 'Top Albums', path: '/albums', icon: Disc },
    { name: 'Groups', path: '/groups', icon: Users },
    { name: 'Friends', path: '/friends', icon: User },
    { name: 'Invitations', path: '/invitations', icon: Bell },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const getPageTitle = () => {
    const item = navItems.find(item => item.path === location.pathname);
    return item ? item.name : 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-beatly-bg text-beatly-text overflow-hidden font-montserrat">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 glass-panel transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto m-4 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-[120%]'}`}
      >
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-beatly-primary rounded-full flex items-center justify-center">
              <span className="text-black font-extrabold text-xl">B</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight">Beatly</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-beatly-text-muted hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold ${
                    isActive 
                      ? 'bg-beatly-primary/10 text-beatly-primary' 
                      : 'text-beatly-text-muted hover:bg-beatly-surface-hover hover:text-white'
                  }`
                }
              >
                <Icon size={20} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-beatly-border">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-beatly-text-muted hover:text-beatly-error hover:bg-beatly-error/10 rounded-xl transition-colors font-bold"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 px-6 lg:px-8 flex items-center justify-between z-10 relative">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-beatly-text-muted hover:text-white hover:bg-beatly-surface rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-extrabold hidden md:block">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-beatly-text-muted" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-beatly-surface border border-beatly-border text-white placeholder-beatly-text-muted text-sm rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-beatly-primary transition-colors font-semibold"
              />
            </div>
            
            <button className="p-2 text-beatly-text-muted hover:text-white hover:bg-beatly-surface rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-beatly-primary rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-beatly-border">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold">{user?.displayName || 'User'}</p>
                <p className="text-xs text-beatly-text-muted capitalize">{user?.product || 'Free'} Plan</p>
              </div>
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-10 h-10 rounded-full border border-beatly-border" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-beatly-surface border border-beatly-border flex items-center justify-center">
                  <User size={20} className="text-beatly-text-muted" />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
        
      </div>
    </div>
  );
}
