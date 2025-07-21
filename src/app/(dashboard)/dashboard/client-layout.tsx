"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Users,
  Building2,
  FileText,
  BarChart3,
  MessageSquare,
  FileCheck,
  Wallet,
  Package,
  HeartPulse,
  ClipboardList,
  ScrollText,
  Vote,
  Shield,
  ChevronDown,
  Bell,
  LogOut,
  LayoutDashboard,
  Home,
  Map,
  UserCog,
  X,
  Menu,
  User,
  Settings,
  FileEdit,
  Calendar,
  PiggyBank,
  BrainCircuit,
  Lightbulb,
  Pencil,
  Upload,
  Plus,
  Eye,
  CheckCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Zap,
  Star,
  TrendingUp,
  Activity,
  Clock
} from "lucide-react";
import { LoadingBar } from "@/components/ui/loading-bar";
import { SignOutButton } from "@/components/auth/sign-out-button";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  hasSubmenu?: boolean;
  expanded?: boolean;
  onClick?: () => void;
  subItems?: Array<{
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: string;
  }>;
  badge?: string;
  isCollapsed?: boolean;
}

const SidebarItem = ({
  icon,
  label,
  href,
  active,
  hasSubmenu,
  expanded,
  onClick,
  subItems,
  badge,
  isCollapsed
}: SidebarItemProps) => {
  const pathname = usePathname();

  // Check if this item or any of its subitems are active
  const isActive = active ||
    (subItems && subItems.some(item => pathname === item.href));

  return (
    <div className="relative group">
      <Link
        href={hasSubmenu ? '#' : href}
        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${isActive
          ? "bg-gradient-to-r from-white/20 to-white/10 text-white shadow-lg border border-white/20"
          : "text-white/80 hover:bg-white/10 hover:text-white hover:scale-105"
          }`}
        onClick={onClick}
        title={isCollapsed ? label : undefined}
      >
        <div className="flex items-center justify-center w-5 h-5 text-white relative z-10">
          {icon}
        </div>
        {!isCollapsed && (
          <>
            <span className="flex-1 font-medium">{label}</span>
            {badge && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                {badge}
              </span>
            )}
            {hasSubmenu && (
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              />
            )}
          </>
        )}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl"></div>
        )}
      </Link>

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
          {label}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}

      {/* Submenu items */}
      {hasSubmenu && expanded && subItems && !isCollapsed && (
        <div className="ml-8 my-2 space-y-1 border-l-2 border-white/10 pl-4">
          {subItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${pathname === item.href
                ? "bg-white/15 text-white shadow-md"
                : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
            >
              <div className="text-white/80">{item.icon}</div>
              <span className="text-sm font-medium flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default function ClientDashboardLayout({
  children,
  userName,
  userRole,
}: {
  children: React.ReactNode;
  userName: string;
  userRole: string;
}) {
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [clientLogo, setClientLogo] = useState<string>("/default-brgy-logo.png");
  const [isEditingLogo, setIsEditingLogo] = useState(false);
  const [logoInput, setLogoInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState({
    certificates: 0,
    blotter: 0,
    residents: 0,
    certificateManagement: 0,
    total: 0
  });
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Load saved client logo if available
    const savedClientLogo = localStorage.getItem('clientLogo');
    if (savedClientLogo) {
      setClientLogo(savedClientLogo);
    }

    // Load collapsed state
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed) {
      setIsCollapsed(JSON.parse(savedCollapsed));
    }

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleCollapsed = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newCollapsed));
    // Close all expanded menus when collapsing
    if (newCollapsed) {
      setExpandedMenus({});
    }
  };

  const formatRole = (role: string) => {
    return role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleLogoEdit = () => {
    setIsEditingLogo(true);
    setLogoInput(clientLogo);
    setPreviewImage(null);
  };

  const saveClientLogo = () => {
    const logoToSave = previewImage || logoInput;
    setClientLogo(logoToSave);
    localStorage.setItem('clientLogo', logoToSave);
    setIsEditingLogo(false);
    setPreviewImage(null);
  };

  const cancelLogoEdit = () => {
    setIsEditingLogo(false);
    setPreviewImage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Fetch notification counts from API
  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotificationCounts(data);
      } else {
        console.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Add useEffect to fetch notifications
  useEffect(() => {
    fetchNotifications();

    // Set up interval to refresh notifications every 30 seconds
    const notificationInterval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(notificationInterval);
  }, []);

  // Navigation items with enhanced badges
  const navigationItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />
    },
    {
      href: "/dashboard/residents",
      label: "Residents",
      icon: <Users size={20} />,
      badge: notificationCounts.residents > 0 ? notificationCounts.residents.toString() : undefined
    },
    {
      href: "/dashboard/households",
      label: "Households",
      icon: <Home size={20} />
    },
    {
      href: "/dashboard/map",
      label: "Map",
      icon: <Map size={20} />
    },
    {
      href: "#",
      label: "Certificates",
      icon: <FileText size={20} />,
      badge: notificationCounts.certificates > 0 ? notificationCounts.certificates.toString() : undefined,
      hasSubmenu: true,
      subItems: [
        {
          label: "Overview",
          href: "/dashboard/certificates",
          icon: <Eye size={18} />
        },
        {
          label: "New Certificate",
          href: "/dashboard/certificates/new",
          icon: <Plus size={18} />
        },
        {
          label: "Manage",
          href: "/dashboard/certificates/manage",
          icon: <Settings size={18} />,
          badge: notificationCounts.certificateManagement > 0 ? notificationCounts.certificateManagement.toString() : undefined
        },
        {
          label: "Verify",
          href: "/dashboard/certificates/verify",
          icon: <CheckCircle size={18} />
        }
      ]
    },
    {
      href: "/dashboard/blotter",
      label: "Katarungan",
      icon: <Shield size={20} />,
      badge: notificationCounts.blotter > 0 ? notificationCounts.blotter.toString() : undefined
    },
    {
      href: "/dashboard/reports",
      label: "Reports",
      icon: <BarChart3 size={20} />
    },
    {
      href: "/dashboard/users",
      label: "Users",
      icon: <UserCog size={20} />
    },
    // {
    //   href: "#",
    //   label: "Settings",
    //   icon: <Settings size={20} />,
    //   hasSubmenu: true,
    //   subItems: [
    //     {
    //       label: "Certificate Templates",
    //       href: "/dashboard/certificates/settings/templates",
    //       icon: <FileEdit size={18} />
    //     }
    //   ]
    // },
  ];

  // Filter navigation items based on search
  const filteredNavigationItems = navigationItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.subItems && item.subItems.some(subItem =>
      subItem.label.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <LoadingBar />

      {/* Top Navigation Bar - Mobile */}
      <div className="bg-gradient-to-r from-[#006B5E] to-[#008B73] text-white md:hidden flex items-center justify-between p-4 sticky top-0 z-30 shadow-lg">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="flex items-center">
          <div className="flex space-x-2 items-center">
            <Image
              src="/bisig-logo.jpg"
              alt="BISIG Logo"
              width={32}
              height={32}
              className="rounded-full ring-2 ring-white/20"
            />
            {clientLogo && (
              <div className="relative group">
                <Image
                  src={clientLogo}
                  alt="Client Logo"
                  width={32}
                  height={32}
                  className="rounded-full ring-2 ring-white/20"
                  onError={(e) => {
                    e.currentTarget.src = "/default-brgy-logo.png";
                    setClientLogo("/default-brgy-logo.png");
                  }}
                />
                <button
                  onClick={handleLogoEdit}
                  className="absolute -top-1 -right-1 bg-white/20 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Pencil size={12} />
                </button>
              </div>
            )}
          </div>
          <div className="font-bold text-xl ml-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            BISIG
          </div>
        </div>
        <div className="relative">
          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors relative">
            <Bell size={20} />
            {isLoadingNotifications && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            )}
            {!isLoadingNotifications && notificationCounts.total > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {notificationCounts.total}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside
          className={`bg-gradient-to-b from-[#006B5E] via-[#007A68] to-[#008B73] text-white flex-shrink-0 flex flex-col z-20 shadow-2xl
            ${isSidebarOpen ? (isCollapsed ? 'w-20' : 'w-80') : 'w-0 -translate-x-full'} 
            ${isCollapsed ? 'md:w-20' : 'md:w-80'} md:translate-x-0
            transition-all duration-300 fixed md:sticky top-0 md:top-0 h-screen overflow-hidden backdrop-blur-sm`}
        >
          {/* Sidebar Header - Desktop */}
          <div className={`p-6 border-b border-white/10 hidden md:flex ${isCollapsed ? 'flex-col items-center' : 'flex-col items-center'} justify-center relative`}>
            {!isCollapsed && (
              <>
                <div className="flex items-center justify-center space-x-4 mb-3">
                  <div className="w-16 h-16 relative">
                    <Image
                      src="/bisig-logo.jpg"
                      alt="BISIG Logo"
                      width={64}
                      height={64}
                      className="rounded-full ring-4 ring-white/20 shadow-lg"
                    />
                  </div>
                  {clientLogo && (
                    <div className="w-16 h-16 relative group">
                      <Image
                        src={clientLogo}
                        alt="Client Logo"
                        width={64}
                        height={64}
                        className="rounded-full ring-4 ring-white/20 shadow-lg"
                        onError={(e) => {
                          e.currentTarget.src = "/default-brgy-logo.png";
                          setClientLogo("/default-brgy-logo.png");
                        }}
                      />
                      <button
                        onClick={handleLogoEdit}
                        className="absolute top-0 right-0 bg-white/20 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="font-bold text-2xl text-center bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                  BISIG
                </div>
                <div className="text-white/60 text-sm text-center mt-1">
                  Barangay Management System
                </div>
              </>
            )}

            {isCollapsed && (
              <div className="w-12 h-12 relative">
                <Image
                  src="/bisig-logo.jpg"
                  alt="BISIG Logo"
                  width={48}
                  height={48}
                  className="rounded-full ring-2 ring-white/20 shadow-lg"
                />
              </div>
            )}

            {/* Collapse/Expand Button */}
            <button
              onClick={toggleCollapsed}
              className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white text-[#006B5E] rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Search Bar */}
          {!isCollapsed && (
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
                <input
                  type="text"
                  placeholder="Search navigation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all"
                />
              </div>
            </div>
          )}



          {/* User Info */}
          <div className="p-4 border-b border-white/10">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center text-white font-bold shadow-lg">
                {userName.charAt(0)}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate text-white">{userName}</div>
                  <div className="text-xs text-white/70 truncate">{formatRole(userRole)}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Activity size={12} className="text-green-400" />
                    <span className="text-xs text-green-400">Online</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            <div className="space-y-2">
              {filteredNavigationItems.map((item) => (
                <SidebarItem
                  key={`${item.href}-${item.label}`}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={pathname === item.href}
                  hasSubmenu={item.hasSubmenu}
                  expanded={expandedMenus[item.label]}
                  onClick={item.hasSubmenu ? () => toggleMenu(item.label) : undefined}
                  subItems={item.subItems}
                  badge={item.badge}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/10">
            <SignOutButton asChild>
              <button className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} text-white/80 hover:text-white w-full p-2 rounded-lg hover:bg-white/10 transition-all duration-200`}>
                <LogOut size={18} />
                {!isCollapsed && <span className="font-medium">Sign Out</span>}
              </button>
            </SignOutButton>
          </div>
        </aside>

        {/* Logo Edit Modal */}
        {isEditingLogo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Edit Client Logo</h3>

              {/* Logo Upload Section */}
              <div className="mb-6 border-b pb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Upload Logo</h4>
                <div
                  onClick={triggerFileInput}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  <Upload className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 2MB</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                {isUploading && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <p className="text-sm text-blue-500">Uploading...</p>
                  </div>
                )}
              </div>

              {/* Logo URL Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Or Enter Logo URL</h4>
                <input
                  type="text"
                  value={logoInput}
                  onChange={(e) => {
                    setLogoInput(e.target.value);
                    setPreviewImage(null);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter logo URL..."
                />
              </div>

              {/* Preview */}
              {(previewImage || logoInput) && (
                <div className="mb-6 flex justify-center">
                  <div className="border-2 border-gray-200 rounded-full p-2 inline-block shadow-lg">
                    <Image
                      src={previewImage || logoInput}
                      alt="Preview"
                      width={100}
                      height={100}
                      className="rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = "/default-brgy-logo.png";
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelLogoEdit}
                  className="px-6 py-2.5 bg-gray-200 rounded-xl text-gray-800 hover:bg-gray-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveClientLogo}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#006B5E] to-[#008B73] rounded-xl text-white hover:shadow-lg font-medium transition-all"
                >
                  Save Logo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-h-screen transition-all duration-300">
          {/* Overlay for mobile when sidebar is open */}
          {isSidebarOpen && isMobile && (
            <div
              className="fixed inset-0 bg-black/50 z-10 md:hidden backdrop-blur-sm"
              onClick={toggleSidebar}
            />
          )}

          {children}
        </main>
      </div>
    </div>
  );
} 