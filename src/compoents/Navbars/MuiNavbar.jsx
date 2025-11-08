import * as React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
  Home,
  Video,
  Wallet,
  History,
  Settings,
  HelpCircle,
  LogOut,
  User,
  Search,
  ChevronDown,
  Menu,
  X,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

const createNavigation = (user, userData) => [
  {
    kind: 'header',
    title: 'Main',
  },
  {
    segment: 'dashboard',
    title: 'Dashboard',
    icon: Home,
    user: user,
    userData: userData,
  },
  {
    segment: 'videos-user',
    title: 'Videos',
    icon: Video,
    badge: userData?.videoCount || null,
    user: user,
    userData: userData,
  },
  {
    segment: 'withdraw',
    title: 'Withdraw',
    icon: Wallet,
    user: user,
    userData: userData,
  },
  {
    segment: 'historique',
    title: 'History',
    icon: History,
    user: user,
    userData: userData,
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Settings',
  },
  {
    segment: 'settings',
    title: 'Settings',
    icon: Settings,
    user: user,
    userData: userData,
  },
  {
    segment: 'help',
    title: 'Help & Support',
    icon: HelpCircle,
    user: user,
    userData: userData,
  },
];

function SidebarFooterAccount({ user, userData, isCollapsed }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSignOut = async () => {
    try {
      const { sessionStorage } = await import('../../lib/supabaseClient');
      await sessionStorage.clear();
    } catch (error) {
      console.error('Sign out error:', error);
      try {
        await supabase.auth.signOut();
      } catch (signOutErr) {
        console.error('Fallback sign out error:', signOutErr);
      }
    }
    window.location.href = '/';
  };

  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || userData?.name || 'User';
  const userEmail = user?.email || userData?.email || 'user@example.com';
  const userInitials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (isCollapsed) {
    return (
      <div className="relative group">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-110 ring-2 ring-white/20"
        >
          {userInitials}
        </button>
        
        {/* Tooltip */}
        <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-[100] shadow-xl">
          {userName}
          <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
        </div>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[60]"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute bottom-full left-0 mb-3 w-64 rounded-xl border border-gray-200/50 bg-white shadow-2xl z-[70] overflow-hidden backdrop-blur-sm">
              <div className="p-3">
                <div className="flex items-center gap-3 px-2 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-bold ring-2 ring-white shadow-lg">
                    {userInitials}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-bold truncate text-gray-900">{userName}</span>
                    <span className="text-xs text-gray-500 truncate">{userEmail}</span>
                  </div>
                </div>
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 text-gray-700">
                  <User className="h-4 w-4 text-blue-600" />
                  <span>Profile</span>
                </button>
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 text-gray-700">
                  <Settings className="h-4 w-4 text-purple-600" />
                  <span>Settings</span>
                </button>
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-2" />
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-bold ring-2 ring-white/20 shadow-md group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all duration-300">
          {userInitials}
        </div>
        <div className="flex flex-col items-start flex-1 min-w-0">
          <span className="text-sm font-bold truncate w-full text-gray-900">{userName}</span>
          <span className="text-xs text-gray-500 truncate w-full">{userEmail}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[60]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 right-0 mb-3 rounded-xl border border-gray-200/50 bg-white shadow-2xl z-[70] overflow-hidden backdrop-blur-sm">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-2">
                My Account
              </div>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 text-gray-700">
                <User className="h-4 w-4 text-blue-600" />
                <span>Profile</span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 text-gray-700">
                <Settings className="h-4 w-4 text-purple-600" />
                <span>Settings</span>
              </button>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-2" />
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MuiNavbar({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userData, isLoading, error } = useUser();
  
  const [searchValue, setSearchValue] = React.useState('');
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const navigationWithUser = React.useMemo(() => {
    return createNavigation(user, userData);
  }, [user, userData]);

  const filteredNavigation = React.useMemo(() => {
    if (!searchValue.trim()) return navigationWithUser;
    
    return navigationWithUser.filter(item => {
      if (item.kind === 'header' || item.kind === 'divider') return false;
      return item.title.toLowerCase().includes(searchValue.toLowerCase());
    });
  }, [searchValue, navigationWithUser]);

  const isActive = (segment) => {
    if (!segment || !location) return false;
    return location.pathname === `/${segment}` || location.pathname.startsWith(`/${segment}/`);
  };

  const groupedNavigation = React.useMemo(() => {
    const groups = [];
    let currentGroup = null;

    navigationWithUser.forEach((item) => {
      if (item.kind === 'header') {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = { title: item.title, items: [] };
      } else if (item.kind === 'divider') {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = null;
      } else if (currentGroup) {
        currentGroup.items.push(item);
      }
    });

    if (currentGroup) groups.push(currentGroup);
    return groups;
  }, [navigationWithUser]);

  const currentPageTitle = navigationWithUser.find(item => item.segment && isActive(item.segment))?.title || 'Dashboard';

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen bg-white/80 backdrop-blur-xl border-r border-gray-200/50
          transition-all duration-300 ease-in-out flex flex-col shadow-xl lg:shadow-none
          ${isCollapsed ? 'w-20' : 'w-72'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <div className="flex items-center justify-between">
            <Link to="/" className={`flex items-center gap-3 transition-all duration-300 ${isCollapsed ? 'justify-center w-full' : ''}`}>
              <img 
                src="/logotimi.png" 
                alt="Timipay Logo" 
                className="cursor-pointer"
                style={{ height: isCollapsed ? '40px' : '45px', width: 'auto' }}
              />
            </Link>
            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white transition-all duration-200 group"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600 group-hover:text-purple-600 transition-colors" />
              </button>
            )}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Collapsed Toggle Button */}
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="hidden lg:flex mt-3 w-full h-9 items-center justify-center rounded-lg hover:bg-white transition-all duration-200 group"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600 group-hover:text-purple-600 transition-all rotate-180" />
            </button>
          )}

          {/* Search */}
          {!isCollapsed && (
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full h-10 rounded-xl border border-gray-200/50 bg-white/50 backdrop-blur-sm px-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
              />
              {searchValue && (
                <button
                  onClick={() => setSearchValue('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X className="h-3 w-3 text-gray-400" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {searchValue.trim() ? (
            <>
              {!isCollapsed && (
                <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Search className="h-3 w-3" />
                  Search Results
                </div>
              )}
              {filteredNavigation.length > 0 ? (
                filteredNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.segment);
                  return (
                    <button
                      key={item.segment}
                      onClick={() => {
                        navigate(`/${item.segment}`);
                        setIsMobileOpen(false);
                      }}
                      className={`
                        flex items-center w-full rounded-xl px-3 py-3 text-sm font-medium
                        transition-all duration-200 group relative
                        ${active 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 scale-[1.02]' 
                          : 'text-gray-700 hover:bg-white hover:shadow-md'
                        }
                        ${isCollapsed ? 'justify-center' : 'gap-3'}
                      `}
                    >
                      {Icon && (
                        <Icon className={`h-5 w-5 transition-all duration-200 ${
                          active ? 'text-white scale-110' : 'text-gray-500 group-hover:text-purple-600 group-hover:scale-110'
                        }`} />
                      )}
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.title}</span>
                          {item.badge && (
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              active ? 'bg-white/20 text-white' : 'bg-gradient-to-r from-blue-100 to-purple-100 text-purple-700'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {isCollapsed && (
                        <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-[100] shadow-xl">
                          {item.title}
                          {item.badge && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-purple-500 px-2 py-0.5 text-xs font-bold">
                              {item.badge}
                            </span>
                          )}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                !isCollapsed && (
                  <div className="px-3 py-8 text-sm text-gray-500 text-center">
                    <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    No results found
                  </div>
                )
              )}
            </>
          ) : (
            <>
              {groupedNavigation.map((group, groupIndex) => (
                <div key={`group-${groupIndex}`} className="space-y-1">
                  {!isCollapsed && (
                    <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="h-3 w-3" />
                      {group.title}
                    </div>
                  )}
                  {isCollapsed && groupIndex > 0 && (
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-2" />
                  )}
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.segment);
                      return (
                        <button
                          key={item.segment}
                          onClick={() => {
                            navigate(`/${item.segment}`);
                            setIsMobileOpen(false);
                          }}
                          className={`
                            flex items-center w-full rounded-xl px-3 py-3 text-sm font-medium
                            transition-all duration-200 group relative
                            ${active 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 scale-[1.02]' 
                              : 'text-gray-700 hover:bg-white hover:shadow-md'
                            }
                            ${isCollapsed ? 'justify-center' : 'gap-3'}
                          `}
                        >
                          {Icon && (
                            <Icon className={`h-5 w-5 transition-all duration-200 ${
                              active ? 'text-white scale-110' : 'text-gray-500 group-hover:text-purple-600 group-hover:scale-110'
                            }`} />
                          )}
                          {!isCollapsed && (
                            <>
                              <span className="flex-1 text-left">{item.title}</span>
                              {item.badge && (
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                  active ? 'bg-white/20 text-white' : 'bg-gradient-to-r from-blue-100 to-purple-100 text-purple-700'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                          {isCollapsed && (
                            <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-[100] shadow-xl">
                              {item.title}
                              {item.badge && (
                                <span className="ml-2 inline-flex items-center rounded-full bg-purple-500 px-2 py-0.5 text-xs font-bold">
                                  {item.badge}
                                </span>
                              )}
                              <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200/50 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <SidebarFooterAccount 
            user={user} 
            userData={userData} 
            isCollapsed={isCollapsed}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 flex items-center px-6 gap-4 shadow-sm">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group"
          >
            <Menu className="h-5 w-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
          </button>
          
          <h1 className="text-xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex-1">
            {currentPageTitle}
          </h1>

          {userData?.balance !== undefined && userData?.balance !== null && (
            <div className="inline-flex items-center gap-2.5 rounded-xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-green-50 px-4 py-2 shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
              <Wallet className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-700">
                ${typeof userData.balance === 'number' ? userData.balance.toFixed(2) : parseFloat(userData.balance || 0).toFixed(2)}
              </span>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MuiNavbar;