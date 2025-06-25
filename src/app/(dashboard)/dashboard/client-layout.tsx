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
  Upload
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
  }>;
}

const SidebarItem = ({
  icon,
  label,
  href,
  active,
  hasSubmenu,
  expanded,
  onClick,
  subItems
}: SidebarItemProps) => {
  const pathname = usePathname();

  // Check if this item or any of its subitems are active
  const isActive = active ||
    (subItems && subItems.some(item => pathname === item.href));

  return (
    <div>
      <Link
        href={hasSubmenu ? '#' : href}
        className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive
          ? "bg-white/10 text-white"
          : "text-white/80 hover:bg-white/5 hover:text-white"
          }`}
        onClick={onClick}
      >
        <div className="text-white">{icon}</div>
        <span className="flex-1">{label}</span>
        {hasSubmenu && (
          <ChevronDown
            size={16}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        )}
      </Link>

      {/* Submenu items */}
      {hasSubmenu && expanded && subItems && (
        <div className="ml-8 my-1 space-y-1">
          {subItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${pathname === item.href
                ? "bg-white/10 text-white"
                : "text-white/80 hover:bg-white/5 hover:text-white"
                }`}
            >
              <div className="text-white">{item.icon}</div>
              <span className="text-sm">{item.label}</span>
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
  const [isMobile, setIsMobile] = useState(false);
  const [clientLogo, setClientLogo] = useState<string>("/default-brgy-logo.png");
  const [isEditingLogo, setIsEditingLogo] = useState(false);
  const [logoInput, setLogoInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
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

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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

    // Check file type
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size should be less than 2MB');
      return;
    }

    setIsUploading(true);

    // Create a FileReader to read the file
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        // Set the preview image
        setPreviewImage(event.target.result as string);
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      alert('Error reading the file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Navigation items
  const navigationItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />
    },
    {
      href: "/dashboard/residents",
      label: "Residents",
      icon: <Users size={20} />
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
      href: "/dashboard/certificates",
      label: "Certificates",
      icon: <FileText size={20} />
    },
    {
      href: "/dashboard/blotter",
      label: "Blotter Management",
      icon: <Shield size={20} />
    },
    {
      href: "/dashboard/reports",
      label: "Reports",
      icon: <BarChart3 size={20} />,

    },
    // {
    //   href: "/dashboard/finance",
    //   label: "Finance",
    //   icon: <Wallet size={20} />,
    //   hasSubmenu: true,
    //   subItems: [
        // {
        //   label: "Dashboard",
        //   href: "/dashboard/finance",
        //   icon: <LayoutDashboard size={18} />
        // },
        // {
        //   label: "Annual Investment Program",
        //   href: "/dashboard/finance/aip",
        //   icon: <Calendar size={18} />
        // },
        // {
        //   label: "AI Insights",
        //   href: "/dashboard/finance/aip/insights",
        //   icon: <BrainCircuit size={18} />
        // },
        // {
        //   label: "AIP Reports",
        //   href: "/dashboard/finance/reports/aip",
        //   icon: <BarChart3 size={18} />
        // },
        // {
        //   label: "Budget Management",
        //   href: "/dashboard/finance/budgets",
        //   icon: <PiggyBank size={18} />
        // },
        // {
        //   label: "Transactions",
        //   href: "/dashboard/finance/transactions",
        //   icon: <FileText size={18} />
        // }
    //   ]
    // },
    // {
    //   href: "#",
    //   label: "AI Tools",
    //   icon: <BrainCircuit size={20} />,
    //   hasSubmenu: true,
    //   subItems: [
    //     {
    //       label: "AI Dashboard",
    //       href: "/dashboard/ai",
    //       icon: <LayoutDashboard size={18} />
    //     },
    //     {
    //       label: "Document Intelligence",
    //       href: "/dashboard/ai/document-intelligence",
    //       icon: <FileText size={18} />
    //     },
    //     {
    //       label: "Feedback Dashboard",
    //       href: "/dashboard/ai/feedback",
    //       icon: <MessageSquare size={18} />
    //     },
    //     {
    //       label: "Performance Analytics",
    //       href: "/dashboard/ai/performance-analytics",
    //       icon: <BarChart3 size={18} />
    //     },
    //     {
    //       label: "AI Insights",
    //       href: "/dashboard/ai/insights",
    //       icon: <Lightbulb size={18} />
    //     }
    //   ]
    // },
    {
      href: "/dashboard/users",
      label: "Users",
      icon: <UserCog size={20} />
    },
    {
      href: "#",
      label: "Settings",
      icon: <Settings size={20} />,
      hasSubmenu: true,
      subItems: [
        {
          label: "Certificate Templates",
          href: "/dashboard/certificates/settings/templates",
          icon: <FileEdit size={18} />
        }
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <LoadingBar />

      {/* Top Navigation Bar - Mobile */}
      <div className="bg-[#006B5E] text-white md:hidden flex items-center justify-between p-4 sticky top-0 z-30">
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-white/10"
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
              className="rounded-full"
            />
            {clientLogo && (
              <div className="relative group">
                <Image
                  src={clientLogo}
                  alt="Client Logo"
                  width={32}
                  height={32}
                  className="rounded-full"
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
          <div className="font-bold text-xl ml-2">BISIG</div>
        </div>
        <div className="relative">
          <button className="p-1 rounded-md hover:bg-white/10">
            <User size={24} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside
          className={`bg-[#006B5E] text-white flex-shrink-0 flex flex-col z-20
            ${isSidebarOpen ? 'w-64' : 'w-0 -translate-x-full'} 
            md:w-64 md:translate-x-0
            transition-all duration-300 fixed md:sticky top-0 md:top-0 h-screen overflow-hidden`}
        >
          {/* Sidebar Header - Desktop */}
          <div className="p-4 border-b border-white/10 hidden md:flex flex-col items-center justify-center">
            <div className="flex items-center justify-center space-x-4 mb-2">
              <div className="w-24 h-24 relative">
                <Image
                  src="/bisig-logo.jpg"
                  alt="BISIG Logo"
                  width={96}
                  height={96}
                  className="rounded-full"
                />
              </div>
              {clientLogo && (
                <div className="w-24 h-24 relative group">
                  <Image
                    src={clientLogo}
                    alt="Client Logo"
                    width={96}
                    height={96}
                    className="rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = "/default-brgy-logo.png";
                      setClientLogo("/default-brgy-logo.png");
                    }}
                  />
                  <button 
                    onClick={handleLogoEdit}
                    className="absolute top-0 right-0 bg-white/20 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className="font-bold text-xl text-center">BISIG</div>
          </div>

          {/* Logo Edit Modal */}
          {isEditingLogo && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Client Logo</h3>
                
                {/* Logo Upload Section */}
                <div className="mb-6 border-b pb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Upload Logo</h4>
                  <div 
                    onClick={triggerFileInput}
                    className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 2MB</p>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  {isUploading && <p className="text-sm text-blue-500 mt-2">Uploading...</p>}
                </div>
                
                {/* Logo URL Section */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Or Enter Logo URL</h4>
                  <input
                    type="text"
                    value={logoInput}
                    onChange={(e) => {
                      setLogoInput(e.target.value);
                      setPreviewImage(null);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
                    placeholder="Enter logo URL..."
                  />
                </div>
                
                {/* Preview */}
                {(previewImage || logoInput) && (
                  <div className="mb-6 flex justify-center">
                    <div className="border border-gray-200 rounded-full p-1 inline-block">
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
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={cancelLogoEdit}
                    className="px-4 py-2 bg-gray-200 rounded-md text-gray-800 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveClientLogo}
                    className="px-4 py-2 bg-[#006B5E] rounded-md text-white hover:bg-[#005a4f]"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* User Info */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                {userName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{userName}</div>
                <div className="text-xs text-white/70 truncate">{formatRole(userRole)}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2">
            <div className="space-y-1">
              {navigationItems.map((item) => (
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
                />
              ))}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/10">
            <SignOutButton asChild>
              <button className="flex items-center gap-2 text-white/80 hover:text-white w-full">
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </SignOutButton>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-h-screen">
          {/* Overlay for mobile when sidebar is open */}
          {isSidebarOpen && isMobile && (
            <div
              className="fixed inset-0 bg-black/50 z-10 md:hidden"
              onClick={toggleSidebar}
            />
          )}

          {children}
        </main>
      </div>
    </div>
  );
} 