import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          {userInitials}
        </button>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute bottom-full left-0 mb-2 w-64 rounded-lg border border-gray-200 bg-white shadow-xl z-50">
              <div className="p-3">
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                    {userInitials}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-semibold truncate">{userName}</span>
                    <span className="text-xs text-gray-500 truncate">{userEmail}</span>
                  </div>
                </div>
                <div className="h-px bg-gray-200 my-2" />
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 transition-colors">
                  <User className="h-4 w-4 text-gray-600" />
                  <span>Profile</span>
                </button>
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 transition-colors">
                  <Settings className="h-4 w-4 text-gray-600" />
                  <span>Settings</span>
                </button>
                <div className="h-px bg-gray-200 my-2" />
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-100 transition-all duration-200"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
          {userInitials}
        </div>
        <div className="flex flex-col items-start flex-1 min-w-0">
          <span className="text-sm font-semibold truncate w-full">{userName}</span>
          <span className="text-xs text-gray-500 truncate w-full">{userEmail}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-gray-200 bg-white shadow-xl z-50">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">My Account</div>
              <div className="h-px bg-gray-200 my-1" />
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 transition-colors">
                <User className="h-4 w-4 text-gray-600" />
                <span>Profile</span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 transition-colors">
                <Settings className="h-4 w-4 text-gray-600" />
                <span>Settings</span>
              </button>
              <div className="h-px bg-gray-200 my-1" />
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 
          transition-all duration-300 ease-in-out flex flex-col
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                <Wallet className="h-5 w-5" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">Timipay</span>
                  <span className="text-xs text-gray-500">Payment Platform</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Search */}
          {!isCollapsed && (
            <div className="relative mt-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 px-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {searchValue.trim() ? (
            <>
              {!isCollapsed && (
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                        flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium
                        transition-all duration-200 group relative
                        ${active 
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                        ${isCollapsed ? 'justify-center' : ''}
                      `}
                    >
                      {Icon && <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-500'} transition-colors`} />}
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.title}</span>
                          {item.badge && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          {item.title}
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                !isCollapsed && (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">
                    No results found
                  </div>
                )
              )}
            </>
          ) : (
            <>
              {groupedNavigation.map((group, groupIndex) => (
                <div key={`group-${groupIndex}`}>
                  {!isCollapsed && (
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {group.title}
                    </div>
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
                            flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium
                            transition-all duration-200 group relative
                            ${active 
                              ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-sm' 
                              : 'text-gray-700 hover:bg-gray-100'
                            }
                            ${isCollapsed ? 'justify-center' : ''}
                          `}
                        >
                          {Icon && <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-500'} transition-colors`} />}
                          {!isCollapsed && (
                            <>
                              <span className="flex-1 text-left">{item.title}</span>
                              {item.badge && (
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                          {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                              {item.title}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {groupIndex < groupedNavigation.length - 1 && (
                    <div className="h-px bg-gray-200 my-3" />
                  )}
                </div>
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200">
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
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-4">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          
          <h1 className="text-lg font-bold text-gray-900 flex-1">
            {currentPageTitle}
          </h1>

          {userData?.balance !== undefined && userData?.balance !== null && (
            <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50 px-3 py-1.5 shadow-sm">
              <Wallet className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">
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