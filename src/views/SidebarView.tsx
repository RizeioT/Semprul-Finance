import React from "react";
import { 
  Wallet, 
  Menu, 
  LogIn, 
  LogOut, 
  X, 
  LayoutDashboard, 
  Receipt, 
  Landmark, 
  Calculator, 
  RefreshCw, 
  ChevronLeft,
  ChevronRight,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatRupiah } from "../models/financialModel";
import { UserAccount } from "../types";

interface SidebarViewProps {
  activeTab: "overview" | "transactions" | "budget" | "calculator" | "login";
  setActiveTab: (tab: "overview" | "transactions" | "budget" | "calculator" | "login") => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  netBalance: number;
  currentUser: UserAccount | null;
  handleLogout: () => void;
  
  // Supabase states
  supabaseStatus: { connected: boolean; tablesExist: boolean; error?: string; bootstrapSQL?: string } | null;
  syncing: boolean;
  lastSynced: string | null;
  handleManualSync: () => Promise<void>;
}

export default function SidebarView({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  netBalance,
  currentUser,
  handleLogout,
  supabaseStatus,
  syncing,
  lastSynced,
  handleManualSync
}: SidebarViewProps) {

  // Local state for collapsed state (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar_collapsed") === "true";
    }
    return false;
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  // Nav items list matching requested set
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "transactions", label: "Transactions Ledger", icon: Receipt },
    { id: "budget", label: "Budget Control", icon: Landmark },
    { id: "calculator", label: "Compound Calculator", icon: Calculator }
  ];

  const handleTabClick = (tabId: "overview" | "transactions" | "budget" | "calculator" | "login") => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  // Main Render Content for Sidebar
  const renderSidebarContent = (isMobile: boolean = false) => {
    const collapsed = !isMobile && isCollapsed;

    return (
      <motion.div 
        layout="position"
        className={`flex flex-col h-full justify-between select-none ${collapsed ? "p-3 items-center" : "p-5"}`}
      >
        
        {/* Upper Portion: Brand, Balance & Nav */}
        <div className="space-y-6 w-full flex flex-col">
          
          {/* Logo & Toggle Button Row */}
          <motion.div layout="position" className="flex flex-col items-center gap-3 w-full">
            <div className={`flex items-center w-full ${collapsed ? "justify-center" : "justify-between"}`}>
              <motion.div 
                layout="position"
                onClick={() => handleTabClick("overview")}
                className={`flex items-center gap-2 cursor-pointer group shrink-0 ${collapsed ? "mx-auto" : "mx-auto md:mx-0"}`}
                id={`${isMobile ? "mobile-" : "desktop-"}sidebar-brand`}
                title="SempruL Finance Overview"
              >
                <span className="bg-[#ABF600] text-black px-3 py-1 border-2 border-black font-extrabold text-xl tracking-tighter shadow-[2px_2px_0px_#000000] group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-[3px_3px_0px_#000000] transition-all">
                  $
                </span>
                {!collapsed && (
                  <span className="font-extrabold text-base tracking-tight uppercase italic hover:text-[#ABF600] transition-colors whitespace-nowrap">
                    SempruL Finance
                  </span>
                )}
              </motion.div>

              {/* Toggle button on the right in expanded mode */}
              {!isMobile && !collapsed && (
                <button
                  onClick={toggleCollapse}
                  className="p-1.5 border-2 border-black bg-white shadow-[2px_2px_0px_#000000] hover:bg-[#ABF600] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                  title="Collapse Menu"
                >
                  <ChevronLeft className="w-4 h-4 text-black" />
                </button>
              )}

              {/* Mobile close button inside slide out */}
              {isMobile && (
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 border-2 border-black bg-white shadow-[2px_2px_0px_#000000] hover:bg-neutral-100 cursor-pointer"
                  id="sidebar-mobile-close-btn"
                >
                  <X className="w-4 h-4 text-black" />
                </button>
              )}
            </div>

            {/* In collapsed mode, render toggle button below the $ icon */}
            {!isMobile && collapsed && (
              <button
                onClick={toggleCollapse}
                className="p-1.5 border-2 border-black bg-white shadow-[2px_2px_0px_#000000] hover:bg-[#ABF600] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer w-10 h-10 flex items-center justify-center mt-1"
                title="Expand Menu"
              >
                <ChevronRight className="w-5 h-5 text-black" />
              </button>
            )}
          </motion.div>

          {/* NET Balance Widget (Placed directly below logo as requested) */}
          <motion.div layout="position" className="w-full flex justify-center relative group/balance">
            <motion.div 
              layout
              className={`border-2 border-black bg-black text-white shadow-[3px_3px_0px_#000000] flex items-center transition-all overflow-hidden cursor-help ${
                collapsed 
                  ? "w-12 h-12 justify-center p-0 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#ABF600]" 
                  : "w-full p-3 justify-between"
              }`}
            >
              <div className="flex items-center gap-1.5 text-[#ABF600] font-mono text-[9px] font-bold tracking-wider uppercase">
                <Wallet className={collapsed ? "w-5 h-5" : "w-3.5 h-3.5"} />
                {!collapsed && <span>Saldo Netto</span>}
              </div>
              {!collapsed && (
                <div className="font-mono text-sm font-black truncate">
                  {formatRupiah(netBalance)}
                </div>
              )}
            </motion.div>

            {/* Custom Brutalist Tooltip showing balance - only shown when collapsed */}
            {collapsed && (
              <div className="absolute left-16 top-1/2 -translate-y-1/2 scale-0 group-hover/balance:scale-100 transition-all duration-150 origin-left z-[100] border-2 border-black bg-black text-white p-3 shadow-[3px_3px_0px_#ABF600] whitespace-nowrap font-mono text-xs pointer-events-none">
                <p className="text-[10px] text-[#ABF600] font-bold uppercase tracking-wider">Saldo Netto</p>
                <p className="font-black text-sm mt-0.5">{formatRupiah(netBalance)}</p>
              </div>
            )}
          </motion.div>

          {/* Navigation Links List */}
          <motion.nav layout="position" className="flex flex-col gap-2 w-full" id="sidebar-navigation">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;

              return (
                <motion.div 
                  key={item.id} 
                  layout="position"
                  className="w-full flex justify-center relative group/nav"
                >
                  <motion.button
                    id={`sidebar-tab-${item.id}`}
                    onClick={() => handleTabClick(item.id as any)}
                    layout
                    className={`border-2 border-black font-black uppercase text-xs tracking-wider transition-all cursor-pointer flex items-center ${
                      collapsed 
                        ? "w-12 h-12 justify-center p-0 shadow-[2px_2px_0px_#000000]" 
                        : "w-full px-4 py-2.5 gap-3 shadow-[3px_3px_0px_#000000]"
                    } ${
                      isActive 
                        ? "bg-[#ABF600] text-black translate-x-[1px] translate-y-[1px] shadow-none" 
                        : "bg-white text-black hover:bg-neutral-50"
                    }`}
                  >
                    <IconComp className={collapsed ? "w-5 h-5 shrink-0 text-black" : "w-4 h-4 shrink-0 text-black"} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </motion.button>

                  {/* Brutalist Tooltip */}
                  {collapsed && (
                    <div className="absolute left-16 top-1/2 -translate-y-1/2 scale-0 group-hover/nav:scale-100 transition-all duration-150 origin-left z-[100] border-2 border-black bg-white text-black p-2.5 shadow-[3px_3px_0px_#000000] whitespace-nowrap font-black text-xs uppercase tracking-wider pointer-events-none">
                      {item.label}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.nav>

        </div>

        {/* Lower Portion: Sync state and Compact User Profile Card */}
        <motion.div layout="position" className="space-y-4 pt-4 border-t-2 border-dashed border-black mt-6 w-full flex flex-col">
          
          {/* Supabase status inside sidebar */}
          {supabaseStatus && (
            <motion.div layout="position" className="w-full">
              <AnimatePresence mode="wait" initial={false}>
                {collapsed ? (
                  /* Compact indicator under minimized layout */
                  <motion.div 
                    key="collapsed-sync"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.12 }}
                    className="relative group/sync flex justify-center w-full hover:z-50"
                  >
                    {!supabaseStatus.connected ? (
                      <div 
                        className="w-10 h-10 border-2 border-black bg-red-100 flex items-center justify-center text-red-800 cursor-help"
                        title={supabaseStatus.error || "Supabase Offline"}
                      >
                        🔴
                      </div>
                    ) : !supabaseStatus.tablesExist ? (
                      <button 
                        onClick={() => handleTabClick("login")}
                        className="w-10 h-10 border-2 border-black bg-amber-100 flex items-center justify-center text-amber-800 cursor-pointer shadow-[2px_2px_0px_#000000]"
                        title="Setup Tables Required"
                      >
                        ⚠️
                      </button>
                    ) : (
                      <button
                        onClick={handleManualSync}
                        disabled={syncing}
                        className={`w-10 h-10 flex items-center justify-center border-2 border-black font-mono shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer ${
                          syncing 
                            ? "bg-amber-300 text-black animate-pulse" 
                            : "bg-[#ABF600] text-black hover:bg-[#8fd100]"
                        }`}
                      >
                        <RefreshCw className={`w-4.5 h-4.5 ${syncing ? 'animate-spin' : ''}`} />
                      </button>
                    )}

                    {/* Brutalist Tooltip for Sync */}
                    <div className="absolute left-16 top-1/2 -translate-y-1/2 scale-0 group-hover/sync:scale-100 transition-all duration-150 origin-left z-[100] border-2 border-black bg-white text-black p-2.5 shadow-[3px_3px_0px_#000000] whitespace-nowrap font-mono text-[10px]">
                      <p className="font-bold text-neutral-800">STATUS CLOUD SYNC</p>
                      <p className="text-xs mt-0.5">
                        {supabaseStatus.connected 
                          ? (supabaseStatus.tablesExist ? `Aktif (${lastSynced?.slice(0, 5) || "Never"})` : "Tabel belum dibuat") 
                          : "Supabase terputus"}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  /* Full size sync display */
                  <motion.div 
                    key="expanded-sync"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.12 }}
                    className="space-y-1.5" 
                    id="sidebar-supabase-sync-section"
                  >
                    {!supabaseStatus.connected ? (
                      <div 
                        className="w-full text-center py-2 border-2 border-black bg-red-100 text-red-800 font-mono text-[9px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000]"
                        title={supabaseStatus.error || "Supabase Offline"}
                      >
                        🔴 Supabase Error
                      </div>
                    ) : !supabaseStatus.tablesExist ? (
                      <button 
                        onClick={() => handleTabClick("login")}
                        className="w-full text-center py-2 border-2 border-black bg-amber-100 text-amber-800 font-mono text-[9px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000] hover:bg-amber-200 cursor-pointer"
                        title="Klik untuk melihat petunjuk setup basis data Supabase"
                      >
                        ⚠️ Setup Supabase
                      </button>
                    ) : (
                      <button
                        onClick={handleManualSync}
                        disabled={syncing}
                        className={`w-full flex items-center justify-center gap-2 py-1.5 border-2 border-black font-mono text-[9px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer ${
                          syncing 
                            ? "bg-amber-300 text-black animate-pulse" 
                            : "bg-[#ABF600] text-black hover:bg-[#8fd100]"
                        }`}
                        title={lastSynced ? `Sinkron terakhir: ${lastSynced}. Klik untuk sinkronisasi manual.` : "Klik untuk sinkronisasi manual sekarang."}
                      >
                        <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                        <span>{syncing ? "Syncing..." : "Sync ke Cloud"}</span>
                      </button>
                    )}
                    {lastSynced && supabaseStatus.connected && supabaseStatus.tablesExist && (
                      <p className="text-[8px] font-mono text-center text-neutral-500">
                        Last Sync: {lastSynced.slice(0, 5)}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Compact User Profile Card with integrated Settings Icon (Gear) */}
          <motion.div layout="position" className="w-full">
            <AnimatePresence mode="wait" initial={false}>
              {currentUser ? (
                collapsed ? (
                  /* Collapsed Profile with Gear Integrated and Tooltip */
                  <motion.div 
                    key="collapsed-profile"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.12 }}
                    className="flex flex-col items-center gap-2 w-full relative group/profile hover:z-50" 
                    id="sidebar-bottom-profile-collapsed"
                  >
                    <div className="relative">
                      <span className="text-xl bg-[#ABF600] border-2 border-black w-10 h-10 flex items-center justify-center rounded-none shadow-[2px_2px_0px_#000000]">
                        {currentUser.avatar}
                      </span>
                    </div>

                    <button
                      onClick={() => handleTabClick("login")}
                      className={`p-1.5 border-2 border-black bg-white shadow-[1.5px_1.5px_0px_#000000] hover:bg-[#ABF600] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer ${
                        activeTab === "login" ? "bg-[#ABF600]" : ""
                      }`}
                      title="Pengaturan Akun"
                    >
                      <Settings className="w-3.5 h-3.5 text-black" />
                    </button>

                    {/* Tooltip for profile info */}
                    <div className="absolute left-16 bottom-2 scale-0 group-hover/profile:scale-100 transition-all duration-150 origin-left z-[100] border-2 border-black bg-white text-black p-2.5 shadow-[3px_3px_0px_#000000] whitespace-nowrap">
                      <h4 className="font-black text-xs uppercase leading-tight">{currentUser.fullName}</h4>
                      <p className="font-mono text-[9px] text-neutral-500 truncate mt-0.5">@{currentUser.username}</p>
                    </div>
                  </motion.div>
                ) : (
                  /* Expanded Profile Card with Settings Gear */
                  <motion.div 
                    key="expanded-profile"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.12 }}
                    className="border-2 border-black bg-[#F8F9FA] p-2.5 shadow-[3px_3px_0px_#000000] flex items-center justify-between gap-2 w-full" 
                    id="sidebar-bottom-profile"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-xl bg-white border-2 border-black w-9 h-9 flex items-center justify-center rounded-none shrink-0 shadow-[1px_1px_0px_#000000]">
                        {currentUser.avatar}
                      </span>
                      <div className="overflow-hidden">
                        <h4 className="font-black text-[11px] truncate uppercase leading-tight">{currentUser.fullName}</h4>
                        <p className="font-mono text-[9px] text-neutral-500 truncate mt-0.5">@{currentUser.username}</p>
                      </div>
                    </div>
                    
                    {/* Integrated Settings gear button */}
                    <button
                      onClick={() => handleTabClick("login")}
                      className={`p-1.5 border-2 border-black bg-white shadow-[1.5px_1.5px_0px_#000000] hover:bg-[#ABF600] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer shrink-0 ${
                        activeTab === "login" ? "bg-[#ABF600]" : ""
                      }`}
                      title="Pengaturan & Sinkronisasi"
                    >
                      <Settings className="w-3.5 h-3.5 text-black" />
                    </button>
                  </motion.div>
                )
              ) : (
                /* Guest Session layout */
                collapsed ? (
                  <motion.div 
                    key="collapsed-guest"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.12 }}
                    className="flex flex-col items-center gap-2 w-full relative group/guest hover:z-50" 
                    id="sidebar-bottom-profile-guest-collapsed"
                  >
                    <span className="text-lg bg-white border-2 border-black w-10 h-10 flex items-center justify-center rounded-none shadow-[1.5px_1.5px_0px_#000000]">
                      👤
                    </span>
                    <button
                      onClick={() => handleTabClick("login")}
                      className={`p-1.5 border-2 border-black bg-white shadow-[1.5px_1.5px_0px_#000000] hover:bg-[#ABF600] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer ${
                        activeTab === "login" ? "bg-[#ABF600]" : ""
                      }`}
                      title="Login & Cloud Sync"
                    >
                      <Settings className="w-3.5 h-3.5 text-black" />
                    </button>

                    {/* Tooltip */}
                    <div className="absolute left-16 bottom-2 scale-0 group-hover/guest:scale-100 transition-all duration-150 origin-left z-[100] border-2 border-black bg-white text-black p-2 shadow-[3px_3px_0px_#000000] whitespace-nowrap">
                      <p className="font-black text-xs uppercase leading-tight">Sesi Tamu</p>
                      <p className="font-mono text-[9px] text-neutral-500 mt-0.5">Mode Offline</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="expanded-guest"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.12 }}
                    className="border-2 border-black bg-[#FFFBEB] p-2.5 shadow-[3px_3px_0px_#000000] flex items-center justify-between gap-2 w-full" 
                    id="sidebar-bottom-profile-guest"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-lg bg-white border-2 border-black w-9 h-9 flex items-center justify-center rounded-none shrink-0 shadow-[1px_1px_0px_#000000]">
                        👤
                      </span>
                      <div className="overflow-hidden">
                        <h4 className="font-black text-[11px] truncate uppercase leading-tight">Sesi Tamu</h4>
                        <p className="font-mono text-[9px] text-neutral-500 truncate">Mode Offline</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTabClick("login")}
                      className={`p-1.5 border-2 border-black bg-white shadow-[1.5px_1.5px_0px_#000000] hover:bg-[#ABF600] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer shrink-0 ${
                        activeTab === "login" ? "bg-[#ABF600]" : ""
                      }`}
                      title="Login & Cloud Sync"
                    >
                      <Settings className="w-3.5 h-3.5 text-black" />
                    </button>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </motion.div>

          {/* Mini Brutalist Version String */}
          {!collapsed && (
            <div className="text-center pt-1">
              <span className="font-mono text-[8px] uppercase font-bold text-neutral-400">
                SempruL Finance v2.0
              </span>
            </div>
          )}

        </motion.div>

      </motion.div>
    );
  };

  return (
    <>
      {/* 1. DESKTOP PERSISTENT SIDEBAR */}
      <motion.aside 
        animate={{ width: isCollapsed ? 80 : 288 }}
        transition={{ type: "tween", duration: 0.2, ease: "easeInOut" }}
        className="hidden md:flex flex-col h-screen sticky top-0 border-r-4 border-black bg-white select-none shrink-0 z-40 overflow-visible"
        id="desktop-sidebar-container"
      >
        {renderSidebarContent(false)}
      </motion.aside>

      {/* 2. MOBILE TOP-BAR */}
      <div 
        className="md:hidden w-full sticky top-0 z-50 border-b-4 border-black bg-white px-4 py-3 flex justify-between items-center shadow-[2px_2px_0px_#000000]"
        id="mobile-topbar-container"
      >
        <div 
          onClick={() => handleTabClick("overview")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className="bg-[#ABF600] text-black px-2.5 py-0.5 border-2 border-black font-black text-base tracking-tighter">
            $
          </span>
          <span className="font-black text-sm uppercase italic tracking-tight">
            SempruL
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Compact Net Balance Pill */}
          <div className="px-2 py-1.5 border-2 border-black bg-black text-white text-[10px] font-mono font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_#000000]">
            <Wallet className="w-3 h-3 text-[#ABF600]" />
            <span>{formatRupiah(netBalance)}</span>
          </div>

          {/* Profile Quick link or Login Indicator */}
          {currentUser ? (
            <button
              onClick={() => handleTabClick("login")}
              className="w-8 h-8 flex items-center justify-center border-2 border-black bg-white shadow-[1.5px_1.5px_0px_#000000] text-sm leading-none"
              title="Ke menu profil akun"
            >
              {currentUser.avatar}
            </button>
          ) : (
            <button
              onClick={() => handleTabClick("login")}
              className="p-1.5 border-2 border-black bg-[#ABF600] shadow-[1.5px_1.5px_0px_#000000]"
              title="Masuk Sesi Keuangan"
            >
              <Settings className="w-4 h-4 text-black" />
            </button>
          )}

          {/* Burger Hamburger Button */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 border-2 border-black bg-white shadow-[1.5px_1.5px_0px_#000000] hover:bg-neutral-100 cursor-pointer flex items-center justify-center"
            id="mobile-hamburger-toggle"
          >
            <Menu className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>

      {/* 3. MOBILE SIDEBAR DRAWER (Sliding Overlay) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Dark Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black z-50 cursor-pointer"
              id="mobile-drawer-backdrop"
            />

            {/* Sliding Drawer Container */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.3 }}
              className="md:hidden fixed top-0 bottom-0 left-0 w-72 h-full bg-white border-r-4 border-black z-50 shadow-[6px_0px_0px_#000000] flex flex-col justify-between"
              id="mobile-sidebar-drawer"
            >
              {renderSidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
