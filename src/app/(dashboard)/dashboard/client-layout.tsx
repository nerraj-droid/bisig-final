"use client";

import { useState, useEffect } from "react";
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
  Lightbulb
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
    {
      href: "/dashboard/finance",
      label: "Finance",
      icon: <Wallet size={20} />,
      hasSubmenu: true,
      subItems: [
        {
          label: "Dashboard",
          href: "/dashboard/finance",
          icon: <LayoutDashboard size={18} />
        },
        {
          label: "Annual Investment Program",
          href: "/dashboard/finance/aip",
          icon: <Calendar size={18} />
        },
        {
          label: "AI Insights",
          href: "/dashboard/finance/aip/insights",
          icon: <BrainCircuit size={18} />
        },
        {
          label: "AIP Reports",
          href: "/dashboard/finance/reports/aip",
          icon: <BarChart3 size={18} />
        },
        {
          label: "Budget Management",
          href: "/dashboard/finance/budgets",
          icon: <PiggyBank size={18} />
        },
        {
          label: "Transactions",
          href: "/dashboard/finance/transactions",
          icon: <FileText size={18} />
        }
      ]
    },
    {
      href: "#",
      label: "AI Tools",
      icon: <BrainCircuit size={20} />,
      hasSubmenu: true,
      subItems: [
        {
          label: "AI Dashboard",
          href: "/dashboard/ai",
          icon: <LayoutDashboard size={18} />
        },
        {
          label: "Document Intelligence",
          href: "/dashboard/ai/document-intelligence",
          icon: <FileText size={18} />
        },
        {
          label: "Feedback Dashboard",
          href: "/dashboard/ai/feedback",
          icon: <MessageSquare size={18} />
        },
        {
          label: "Performance Analytics",
          href: "/dashboard/ai/performance-analytics",
          icon: <BarChart3 size={18} />
        },
        {
          label: "AI Insights",
          href: "/dashboard/ai/insights",
          icon: <Lightbulb size={18} />
        }
      ]
    },
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
          <Image
            src="/bisig-logo.jpg"
            alt="BISIG Logo"
            width={32}
            height={32}
            className="rounded-full mr-2"
          />
          <div className="font-bold text-xl">BISIG</div>
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
            <div className="w-24 h-24 relative mb-2">
              <Image
                src="/bisig-logo.jpg"
                alt="BISIG Logo"
                width={96}
                height={96}
                className="rounded-full"
              />
            </div>
            <div className="font-bold text-xl text-center">BISIG</div>
          </div>

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