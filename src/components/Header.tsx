import React from "react";
import { GraduationCap, Landmark, Settings, MessageSquarePlus, Send, CheckCircle2, HelpCircle } from "lucide-react";

interface HeaderProps {
  activeTab: "home" | "inquiry" | "feedback" | "faq" | "admin";
  setActiveTab: (tab: "home" | "inquiry" | "feedback" | "faq" | "admin") => void;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
}

export default function Header({ activeTab, setActiveTab, isAdminLoggedIn, onLogout }: HeaderProps) {
  return (
    <header className="bg-[#003366] text-white border-b-4 border-[#ff6b00] sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => setActiveTab("home")}
            id="header-brand-logo"
          >
            <div className="bg-white text-[#003366] font-bold p-1.5 rounded shadow-sm flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-[#003366]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-white sm:text-lg">
                  HANSRAJ <span className="text-[#ff6b00]">ACADEMY</span>
                </span>
                <span className="text-[#ff6b00] font-semibold text-[9px] tracking-wider border border-[#ff6b00] px-1.5 py-0.2 rounded uppercase">
                  College (DU)
                </span>
              </div>
              <p className="text-[9px] text-zinc-300 tracking-widest font-mono uppercase leading-none mt-0.5">
                Academy Management Portal
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1" id="desktop-nav-menu">
            <button
              onClick={() => setActiveTab("home")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === "home"
                  ? "bg-[#ff6b00] text-white font-bold shadow-sm"
                  : "text-zinc-200 hover:text-[#ff6b00] hover:bg-[#002244]"
              }`}
              id="nav-btn-home"
            >
              <Landmark className="h-3.5 w-3.5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("inquiry")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === "inquiry"
                  ? "bg-[#ff6b00] text-white font-bold shadow-sm"
                  : "text-zinc-200 hover:text-[#ff6b00] hover:bg-[#002244]"
              }`}
              id="nav-btn-inquiry"
            >
              <Send className="h-3.5 w-3.5" />
              Admission Inquiry
            </button>
            <button
              onClick={() => setActiveTab("feedback")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === "feedback"
                  ? "bg-[#ff6b00] text-white font-bold shadow-sm"
                  : "text-zinc-200 hover:text-[#ff6b00] hover:bg-[#002244]"
              }`}
              id="nav-btn-feedback"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              Student Feedback
            </button>
            <button
              onClick={() => setActiveTab("faq")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === "faq"
                  ? "bg-[#ff6b00] text-white font-bold shadow-sm"
                  : "text-zinc-200 hover:text-[#ff6b00] hover:bg-[#002244]"
              }`}
              id="nav-btn-faq"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Frequently Asked Qs
            </button>
            <span className="h-5 w-[1px] bg-sky-900/40 mx-2"></span>
            
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-2" id="admin-user-controls">
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 border border-emerald-400 bg-emerald-950/40 text-emerald-300 ${
                    activeTab === "admin" ? "bg-emerald-500 text-[#003366] font-bold" : "hover:bg-emerald-900/50"
                  }`}
                  id="nav-btn-admin-panel"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Admin Panel
                </button>
                <button
                  onClick={onLogout}
                  className="px-2.5 py-1.5 text-xs font-medium bg-red-600/20 text-red-300 border border-red-500/35 hover:bg-red-600 hover:text-white rounded-md transition-all duration-200"
                  id="nav-btn-logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  activeTab === "admin"
                    ? "bg-[#ff6b00] text-white font-bold shadow-sm"
                    : "text-zinc-300 border border-zinc-500/30 hover:bg-[#002244] hover:text-[#ff6b00]"
                }`}
                id="nav-btn-admin-login"
              >
                <Settings className="h-3.5 w-3.5" />
                Admin Desk
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile Sub-Navigation indicators */}
      <div className="md:hidden bg-[#002244] text-center py-2 flex justify-around border-t border-sky-900/35 text-[11px] font-medium text-zinc-300" id="mobile-bottom-tabs">
        <button 
          onClick={() => setActiveTab("home")} 
          className={`px-2 py-1 rounded transition-colors ${activeTab === "home" ? "text-[#ff6b00] font-bold" : ""}`}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab("inquiry")} 
          className={`px-2 py-1 rounded transition-colors ${activeTab === "inquiry" ? "text-[#ff6b00] font-bold" : ""}`}
        >
          Inquiry
        </button>
        <button 
          onClick={() => setActiveTab("feedback")} 
          className={`px-2 py-1 rounded transition-colors ${activeTab === "feedback" ? "text-[#ff6b00] font-bold" : ""}`}
        >
          Feedback
        </button>
        <button 
          onClick={() => setActiveTab("faq")} 
          className={`px-2 py-1 rounded transition-colors ${activeTab === "faq" ? "text-[#ff6b00] font-bold" : ""}`}
        >
          FAQ Section
        </button>
        <button 
          onClick={() => setActiveTab("admin")} 
          className={`px-2 py-1 rounded transition-colors ${activeTab === "admin" ? "text-[#ff6b00] font-bold" : ""}`}
        >
          {isAdminLoggedIn ? "Admin" : "Admin Desk"}
        </button>
      </div>
    </header>
  );
}
