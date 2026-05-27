import React, { useState, useEffect } from "react";
import { 
  Lock, User, Search, Filter, Download, Mail, BarChart3, 
  CheckCircle, Clock, Calendar, Reply, ShieldCheck, AlertCircle, 
  Send, ExternalLink, RefreshCw, Star, Info
} from "lucide-react";
import { Inquiry, Feedback, EmailLog, AnalyticsData, FAQEntry } from "../types";

interface AdminPanelProps {
  courses: string[];
  token: string | null;
  setToken: (token: string | null) => void;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (status: boolean) => void;
}

export default function AdminPanel({ courses, token, setToken, isAdminLoggedIn, setIsAdminLoggedIn }: AdminPanelProps) {
  // Login states
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("hansraj123");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<"inquiries" | "feedback" | "analytics" | "outbox" | "faqs">("inquiries");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // FAQ states
  const [faqs, setFaqs] = useState<FAQEntry[]>([]);
  const [faqSearch, setFaqSearch] = useState("");
  const [faqCategoryFilter, setFaqCategoryFilter] = useState("All");
  const [isEditingFaq, setIsEditingFaq] = useState<FAQEntry | null>(null);
  const [faqFormQuestion, setFaqFormQuestion] = useState("");
  const [faqFormAnswer, setFaqFormAnswer] = useState("");
  const [faqFormCategory, setFaqFormCategory] = useState("courses");
  const [isFaqSubmitting, setIsFaqSubmitting] = useState(false);
  const [faqSuccessMessage, setFaqSuccessMessage] = useState<string | null>(null);
  const [faqErrorMessage, setFaqErrorMessage] = useState<string | null>(null);

  // Filters for inquiries
  const [inqSearch, setInqSearch] = useState("");
  const [inqCourseFilter, setInqCourseFilter] = useState("All");
  const [inqStatusFilter, setInqStatusFilter] = useState("All");

  // Filters for feedback
  const [fbSearch, setFbSearch] = useState("");
  const [fbCourseFilter, setFbCourseFilter] = useState("All");
  const [fbRatingFilter, setFbRatingFilter] = useState("All");

  // Active expanded inquiry for responding
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replySuccessMessage, setReplySuccessMessage] = useState<string | null>(null);

  // Fetch admin dashboard content
  const fetchDashboardData = async () => {
    if (!token) return;
    setIsLoadingData(true);
    setDataError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [inqRes, fbRes, analRes] = await Promise.all([
        fetch("/api/admin/inquiries", { headers }),
        fetch("/api/admin/feedback", { headers }),
        fetch("/api/admin/analytics", { headers })
      ]);

      if (!inqRes.ok || !fbRes.ok || !analRes.ok) {
        throw new Error("Failed to load secure database. Session might be expired.");
      }

      const inqData = await inqRes.json();
      const fbData = await fbRes.json();
      const analyticsData = await analRes.json();

      setInquiries(inqData);
      setFeedbacks(fbData);
      setAnalytics(analyticsData);
    } catch (err: any) {
      setDataError(err.message || "Session key validation failed. Please log in again.");
      // Auto logout on key/fetch failure
      if (err.message?.includes("expired") || err.message?.includes("token")) {
        handleLogout();
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchFaqsAdmin = async () => {
    try {
      const res = await fetch("/api/faqs");
      const data = await res.json();
      setFaqs(data);
    } catch (err) {
      console.error("Failed to fetch FAQs:", err);
    }
  };

  // Trigger loading when token state changes
  useEffect(() => {
    if (isAdminLoggedIn && token) {
      fetchDashboardData();
      fetchFaqsAdmin();
    }
  }, [isAdminLoggedIn, token]);

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqFormQuestion.trim() || !faqFormAnswer.trim() || !faqFormCategory.trim()) {
      setFaqErrorMessage("Please complete all fields.");
      return;
    }

    setIsFaqSubmitting(true);
    setFaqSuccessMessage(null);
    setFaqErrorMessage(null);

    try {
      const isEdit = !!isEditingFaq;
      const url = isEdit ? `/api/admin/faqs/${isEditingFaq.id}` : "/api/admin/faqs";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          question: faqFormQuestion,
          answer: faqFormAnswer,
          category: faqFormCategory
        })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to save FAQ entry.");
      }

      setFaqSuccessMessage(isEdit ? "FAQ updated successfully!" : "FAQ created successfully!");
      setFaqFormQuestion("");
      setFaqFormAnswer("");
      setIsEditingFaq(null);
      
      await fetchFaqsAdmin();
    } catch (err: any) {
      setFaqErrorMessage(err.message || "An error occurred.");
    } finally {
      setIsFaqSubmitting(false);
    }
  };

  const handleEditFaqClick = (faq: FAQEntry) => {
    setIsEditingFaq(faq);
    setFaqFormQuestion(faq.question);
    setFaqFormAnswer(faq.answer);
    setFaqFormCategory(faq.category);
    
    // Smoothly scroll to editor
    const editorEl = document.getElementById("faq-form-section");
    if (editorEl) {
      editorEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this FAQ entry?")) {
      return;
    }

    setFaqErrorMessage(null);
    setFaqSuccessMessage(null);

    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to delete FAQ entry.");
      }

      setFaqSuccessMessage("FAQ entry deleted successfully.");
      await fetchFaqsAdmin();
    } catch (err: any) {
      setFaqErrorMessage(err.message || "Failed to delete FAQ.");
    }
  };

  const handleCancelFaqEdit = () => {
    setIsEditingFaq(null);
    setFaqFormQuestion("");
    setFaqFormAnswer("");
    setFaqFormCategory("courses");
    setFaqErrorMessage(null);
    setFaqSuccessMessage(null);
  };

  // Handle Log out
  const handleLogout = () => {
    fetch("/api/admin/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});

    setToken(null);
    setIsAdminLoggedIn(false);
    localStorage.removeItem("admin_token");
  };

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setLoginError("Please enter your admin credentials.");
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login unauthorized.");
      }

      setToken(data.token);
      setIsAdminLoggedIn(true);
      localStorage.setItem("admin_token", data.token);
    } catch (err: any) {
      setLoginError(err.message || "Invalid credentials. Please attempt again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Submit response message to student inquiry
  const handleSendResponse = async (inqId: string) => {
    if (!replyText.trim()) return;
    setIsSendingReply(true);
    setReplySuccessMessage(null);

    try {
      const response = await fetch("/api/admin/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ inquiryId: inqId, responseMessage: replyText })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to commit response.");
      }

      setReplyText("");
      setReplySuccessMessage("Counseling advice email successfully recorded and sent!");
      
      // Refresh list
      await fetchDashboardData();
    } catch (err: any) {
      alert("Error responding: " + err.message);
    } finally {
      setIsSendingReply(false);
    }
  };

  // EXPORT TO CSV helper
  const exportInquiriesToCSV = () => {
    const filtered = inquiries.filter(inq => {
      const matchesSearch = inq.name.toLowerCase().includes(inqSearch.toLowerCase()) || 
                            inq.message.toLowerCase().includes(inqSearch.toLowerCase()) ||
                            inq.email.toLowerCase().includes(inqSearch.toLowerCase());
      const matchesCourse = inqCourseFilter === "All" || inq.course === inqCourseFilter;
      const matchesStatus = inqStatusFilter === "All" || 
                            (inqStatusFilter === "Responded" && inq.status === "responded") ||
                            (inqStatusFilter === "Pending" && inq.status === "pending");
      return matchesSearch && matchesCourse && matchesStatus;
    });

    const headers = ["ID", "Student Name", "Email", "Phone", "Course Enrolled/Interested", "Query", "Created At", "Status", "Admin Reply", "Replied At"];
    const rows = filtered.map(inq => [
      inq.id,
      `"${inq.name.replace(/"/g, '""')}"`,
      inq.email,
      inq.phone,
      `"${inq.course.replace(/"/g, '""')}"`,
      `"${inq.message.replace(/"/g, '""')}"`,
      inq.createdAt,
      inq.status,
      `"${(inq.responseMessage || "").replace(/"/g, '""')}"`,
      inq.respondedAt || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Hansraj_Inquiries_Export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportFeedbackToCSV = () => {
    const filtered = feedbacks.filter(fb => {
      const matchesSearch = fb.name.toLowerCase().includes(fbSearch.toLowerCase()) || 
                            fb.message.toLowerCase().includes(fbSearch.toLowerCase());
      const matchesCourse = fbCourseFilter === "All" || fb.course === fbCourseFilter;
      const matchesRating = fbRatingFilter === "All" || fb.rating === parseInt(fbRatingFilter, 10);
      return matchesSearch && matchesCourse && matchesRating;
    });

    const headers = ["ID", "Student Name", "Email", "Course Enrolled", "Rating (Stars)", "Review Message", "Submitted At"];
    const rows = filtered.map(fb => [
      fb.id,
      `"${fb.name.replace(/"/g, '""')}"`,
      fb.email,
      `"${fb.course.replace(/"/g, '""')}"`,
      fb.rating,
      `"${fb.message.replace(/"/g, '""')}"`,
      fb.createdAt
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Hansraj_Feedback_Export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // RENDER LOGIN GATE IF NOT AUTHED
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12" id="admin-login-screen">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-150">
          
          <div className="bg-[#003366] p-8 text-center text-white border-b-4 border-[#ff6b00]">
            <div className="bg-[#ff6b00] text-white h-14 w-14 rounded-xl flex items-center justify-center mx-auto shadow-inner mb-3">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-extrabold tracking-tight">Academic Admin Gate</h3>
            <p className="text-xs text-zinc-300 font-mono mt-1">HANSRAJ DIGITAL MARKETING PORTAL</p>
          </div>

          <div className="p-8">
            <div className="bg-amber-50 rounded-lg p-3.5 border border-amber-200 text-xs text-amber-800 space-y-1 mb-6">
              <p className="font-bold flex items-center gap-1">
                <Info className="h-3.5 w-3.5 fill-amber-100" />
                Demo Credentials Provided for Evaluation:
              </p>
              <p className="font-mono">Username: <span className="font-bold text-slate-900">admin</span></p>
              <p className="font-mono">Password: <span className="font-bold text-slate-900">hansraj123</span></p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 text-red-700 border-l-4 border-red-500 rounded text-xs flex items-center gap-2 mb-4" id="login-error-toast">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4" id="admin-login-form">
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">
                  Admin Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#003366]"
                    id="login-username-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">
                  Security Passkey
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#003366]"
                    id="login-password-field"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-[#003366] text-white font-bold py-3.5 rounded-lg text-sm uppercase tracking-wider hover:bg-[#002244] transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                id="login-submit-btn"
              >
                {isLoggingIn ? "Encrypting Access..." : "Secure Decrypt & Login"}
              </button>
            </form>
          </div>

          <div className="bg-zinc-50 border-t border-zinc-200 px-6 py-4 text-center">
            <p className="text-[10px] text-zinc-400 flex items-center justify-center gap-1 font-mono">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
              SESSION SECURED BY AES-256 SYSTEM STANDARDS
            </p>
          </div>

        </div>
      </div>
    );
  }

  // ==================== FILTER CALCULATIONS ====================
  const filteredInquiries = inquiries.filter(inq => {
    const matchesSearch = inq.name.toLowerCase().includes(inqSearch.toLowerCase()) || 
                          inq.email.toLowerCase().includes(inqSearch.toLowerCase()) || 
                          inq.phone.toLowerCase().includes(inqSearch.toLowerCase()) ||
                          inq.message.toLowerCase().includes(inqSearch.toLowerCase());
    const matchesCourse = inqCourseFilter === "All" || inq.course === inqCourseFilter;
    const matchesStatus = inqStatusFilter === "All" || 
                          (inqStatusFilter === "Responded" && inq.status === "responded") ||
                          (inqStatusFilter === "Pending" && inq.status === "pending");
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const filteredFeedback = feedbacks.filter(fb => {
    const matchesSearch = fb.name.toLowerCase().includes(fbSearch.toLowerCase()) || 
                          fb.message.toLowerCase().includes(fbSearch.toLowerCase()) ||
                          fb.email.toLowerCase().includes(fbSearch.toLowerCase());
    const matchesCourse = fbCourseFilter === "All" || fb.course === fbCourseFilter;
    const matchesRating = fbRatingFilter === "All" || fb.rating === parseInt(fbRatingFilter, 10);
    return matchesSearch && matchesCourse && matchesRating;
  });

  // Calculate timelines / averages for UI metrics
  const totalInq = inquiries.length;
  const totalFb = feedbacks.length;
  const pendingInqCount = inquiries.filter(i => i.status === "pending").length;
  const answeredInqCount = totalInq - pendingInqCount;
  const responseRatePct = totalInq > 0 ? Math.round((answeredInqCount / totalInq) * 100) : 0;
  const avgRatingStars = totalFb > 0 ? Number((feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFb).toFixed(2)) : 0;

  return (
    <div className="space-y-6" id="admin-main-interface">
      
      {/* Mini Bar Menu */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-xs border border-zinc-150">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "inquiries"
                ? "bg-[#003366] text-white shadow-sm"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            Inquiries ({filteredInquiries.length})
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "feedback"
                ? "bg-[#003366] text-white shadow-sm"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            Feedback ({filteredFeedback.length})
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "analytics"
                ? "bg-[#003366] text-white shadow-sm"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            Analytics Hub
          </button>
          <button
            onClick={() => setActiveTab("outbox")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "outbox"
                ? "bg-[#003366] text-white shadow-sm"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            Sent Outbox Logs
          </button>
          <button
            onClick={() => setActiveTab("faqs")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "faqs"
                ? "bg-[#003366] text-white shadow-sm"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
            id="admin-btn-faqs"
          >
            FAQs Desk ({faqs.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={isLoadingData}
            className="p-2 bg-zinc-100 hover:bg-zinc-250 text-zinc-600 rounded-lg active:scale-95 transition-all text-xs flex items-center gap-1.5"
            title="Refresh database records"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingData ? "animate-spin" : ""}`} />
            Refresh DB
          </button>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200/50 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>

      {isLoadingData && inquiries.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-xl shadow-xs border border-zinc-200 flex flex-col items-center justify-center space-y-4">
          <div className="h-8 w-8 border-4 border-[#003366]/20 border-t-[#003366] rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-zinc-500 font-mono">Loading Academic Ledger database logs...</p>
        </div>
      ) : (
        <React.Fragment>

          {/* ==================== TAB 1: INQUIRIES MANAGER ==================== */}
          {activeTab === "inquiries" && (
            <div className="bg-white rounded-xl shadow-md border border-zinc-100 overflow-hidden" id="inquiries-manager-tab">
              
              <div className="p-6 bg-[#003366]/5 border-b border-zinc-200/75 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#ff6b00]"></span>
                    Course Inquiry Manager
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Filter, search, export, and respond to student inquiries instantly.</p>
                </div>
                <button
                  onClick={exportInquiriesToCSV}
                  className="px-4 py-2.5 bg-sky-950/90 text-sky-200 hover:bg-sky-900 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-sky-800"
                >
                  <Download className="h-4 w-4" />
                  Export Filtered to CSV
                </button>
              </div>

              {/* Inquiry filters strip */}
              <div className="p-4 bg-zinc-50 border-b border-zinc-100 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search name, message, email..."
                    value={inqSearch}
                    onChange={(e) => setInqSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white text-xs text-slate-900 border border-zinc-200 rounded-lg placeholder-zinc-400"
                  />
                </div>

                <div>
                  <select
                    value={inqCourseFilter}
                    onChange={(e) => setInqCourseFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-xs text-slate-900 border border-zinc-200 rounded-lg"
                  >
                    <option value="All">All Course Topics</option>
                    {courses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={inqStatusFilter}
                    onChange={(e) => setInqStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-xs text-slate-900 border border-zinc-200 rounded-lg"
                  >
                    <option value="All">All Response States</option>
                    <option value="Pending">🔴 Pending Counsel</option>
                    <option value="Responded">🟢 Responded</option>
                  </select>
                </div>

                <div className="text-right flex items-center justify-end text-zinc-500 text-[11px] font-mono">
                  Showing {filteredInquiries.length} inquiries
                </div>
              </div>

              {/* Inquiries table */}
              <div className="overflow-x-auto">
                {filteredInquiries.length === 0 ? (
                  <div className="p-16 text-center text-zinc-450 italic text-sm">
                    No inquiries match your current filtering ruleset.
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-zinc-100 text-left text-xs text-zinc-650">
                    <thead className="bg-[#003366]/5 text-[#003366] font-bold text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3.5">Student Details</th>
                        <th className="px-6 py-3.5">Requested Program</th>
                        <th className="px-6 py-3.5">Submission Query</th>
                        <th className="px-6 py-3.5">Counsel State</th>
                        <th className="px-6 py-3.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-zinc-100">
                      {filteredInquiries.map((inq) => (
                        <React.Fragment key={inq.id}>
                          <tr className={`hover:bg-zinc-50/50 ${selectedInquiryId === inq.id ? "bg-[#ff6b00]/5 font-medium" : ""}`}>
                            
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-950">{inq.name}</div>
                              <div className="text-zinc-500 font-mono mt-0.5 text-[11px]">{inq.email}</div>
                              <div className="text-zinc-500 font-mono text-[11px]">{inq.phone}</div>
                            </td>
 
                            <td className="px-6 py-4">
                              <span className="inline-block bg-[#003366]/10 text-[#003366] font-semibold px-2.5 py-0.5 rounded text-[11px]">
                                {inq.course}
                              </span>
                              <div className="text-[10px] text-zinc-400 font-mono mt-1">
                                {new Date(inq.createdAt).toLocaleDateString()} at {new Date(inq.createdAt).toLocaleTimeString()}
                              </div>
                            </td>

                            <td className="px-6 py-4 max-w-sm">
                              <p className="line-clamp-2 text-zinc-700 italic">"{inq.message}"</p>
                            </td>

                            <td className="px-6 py-4">
                              {inq.status === "responded" ? (
                                <span className="inline-flex items-center gap-1.5 px-2 bg-emerald-50 text-emerald-800 rounded font-semibold text-[10px] uppercase tracking-wider border border-emerald-150">
                                  <CheckCircle className="h-3 w-3 text-emerald-600" />
                                  Resolved
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2 bg-rose-50 text-rose-800 rounded font-semibold text-[10px] uppercase tracking-wider border border-rose-150">
                                  <Clock className="h-3 w-3 text-rose-600 animate-pulse" />
                                  Pending
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => {
                                  setSelectedInquiryId(selectedInquiryId === inq.id ? null : inq.id);
                                  setReplySuccessMessage(null);
                                }}
                                className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-all ${
                                  selectedInquiryId === inq.id
                                    ? "bg-slate-700 text-white"
                                    : "bg-[#003366] text-white hover:bg-[#002244]"
                                }`}
                              >
                                {selectedInquiryId === inq.id ? "Minimize" : "Handle Inquiry"}
                              </button>
                            </td>

                          </tr>

                          {/* Detail expansion row */}
                          {selectedInquiryId === inq.id && (
                            <tr>
                              <td colSpan={5} className="bg-zinc-50 px-8 py-5 border-l-4 border-[#ff6b00]">
                                <div className="space-y-4">
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-4 rounded-lg border border-zinc-200">
                                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Original Student Message</h4>
                                      <p className="text-sm italic text-slate-800 whitespace-pre-line bg-zinc-50 p-3 rounded">
                                        "{inq.message}"
                                      </p>
                                    </div>

                                    {/* Action Reply panel */}
                                    <div className="bg-white p-4 rounded-lg border border-zinc-200 flex flex-col justify-between">
                                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                        {inq.status === "responded" ? "Feedback Advisory Response" : "Draft Counseling Advice (Generates Outbox Email)"}
                                      </h4>
                                      
                                      {inq.status === "responded" ? (
                                        <div className="space-y-3">
                                          <div className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-150 p-3 rounded">
                                            <p className="font-semibold text-xs mb-1">Reply Log Transmitted:</p>
                                            <p className="italic">"{inq.responseMessage}"</p>
                                          </div>
                                          <p className="text-[10px] text-zinc-400 font-mono">
                                            Replied on {inq.respondedAt ? new Date(inq.respondedAt).toLocaleString() : ""}
                                          </p>
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          {replySuccessMessage && (
                                            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs">
                                              {replySuccessMessage}
                                            </div>
                                          )}
                                          
                                          <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            rows={3}
                                            placeholder={`Write counseling instructions to send to ${inq.name}. It triggers academic log update and registers outgoing mail...`}
                                            className="w-full text-xs p-2.5 border border-zinc-300 rounded focus:outline-hidden focus:ring-1 focus:ring-[#003366] resize-none"
                                          ></textarea>

                                          <button
                                            onClick={() => handleSendResponse(inq.id)}
                                            disabled={isSendingReply || !replyText.trim()}
                                            className={`w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 ${
                                              !replyText.trim() ? "opacity-55 cursor-not-allowed" : ""
                                            }`}
                                          >
                                            <Send className="h-3 w-3" />
                                            {isSendingReply ? "Sending out of mail server..." : "Send Advice Response"}
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Auto Acknowledgment Email Tracking for this sub-inquiry */}
                                  <div className="border-t border-zinc-200/60 pt-3">
                                    <h5 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                                      <Mail className="h-3.5 w-3.5" />
                                      Email Dispatch History ({inq.emails?.length || 0})
                                    </h5>
                                    
                                    <div className="space-y-2.5">
                                      {inq.emails && inq.emails.map(log => (
                                        <div key={log.id} className="bg-white rounded p-3 border border-zinc-150 text-[11px] grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                                          <div>
                                            <span className="font-semibold text-slate-800 block">{log.subject}</span>
                                            <span className="text-[9px] text-zinc-400 font-mono">{log.id}</span>
                                          </div>
                                          <div>
                                            <span className="text-zinc-500">Sent to:</span> <span className="font-mono text-zinc-700">{log.recipientEmail}</span>
                                          </div>
                                          <div>
                                            <span className="text-zinc-500">Trigger Date:</span> <span className="font-mono text-zinc-700">{new Date(log.sentAt).toLocaleString()}</span>
                                          </div>
                                          <div className="text-right">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                                              log.type === "acknowledgment" ? "bg-amber-100 text-amber-800" : "bg-teal-100 text-teal-800"
                                            }`}>
                                              {log.type === "acknowledgment" ? "Automated ACK" : "Admin Reply"}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>
          )}

          {/* ==================== TAB 2: FEEDBACK DESK ==================== */}
          {activeTab === "feedback" && (
            <div className="bg-white rounded-xl shadow-md border border-zinc-100 overflow-hidden" id="feedback-desk-tab">
              
              <div className="p-6 bg-[#003366]/5 border-b border-zinc-200/75 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#ff6b00]"></span>
                    Course Feedback desk
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Understand student experience levels, filter reviews, and compile testimonies.</p>
                </div>
                <button
                  onClick={exportFeedbackToCSV}
                  className="px-4 py-2.5 bg-sky-950/90 text-sky-200 hover:bg-sky-900 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-sky-800"
                >
                  <Download className="h-4 w-4" />
                  Export Feedback to CSV
                </button>
              </div>

              {/* Feedback filters panel */}
              <div className="p-4 bg-zinc-50 border-b border-zinc-100 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search comments or student..."
                    value={fbSearch}
                    onChange={(e) => setFbSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white text-xs text-slate-900 border border-zinc-200 rounded-lg placeholder-zinc-400"
                  />
                </div>

                <div>
                  <select
                    value={fbCourseFilter}
                    onChange={(e) => setFbCourseFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-xs text-[#003366] border border-zinc-200 rounded-lg"
                  >
                    <option value="All">All Course Programs</option>
                    {courses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={fbRatingFilter}
                    onChange={(e) => setFbRatingFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-xs text-slate-900 border border-zinc-200 rounded-lg"
                  >
                    <option value="All">All Ratings (1-5)</option>
                    <option value="5">⭐⭐⭐⭐⭐ Outstanding (5)</option>
                    <option value="4">⭐⭐⭐⭐ Professional (4)</option>
                    <option value="3">⭐⭐⭐ Met Expectations (3)</option>
                    <option value="2">⭐⭐ Below expectation (2)</option>
                    <option value="1">⭐ Poor rating (1)</option>
                  </select>
                </div>

                <div className="text-right flex items-center justify-end text-zinc-500 text-[11px] font-mono">
                  Showing {filteredFeedback.length} submissions • Avg Stars: <span className="font-bold text-[#ff6b00] ml-1">{avgRatingStars}</span>
                </div>
              </div>

              {/* Feedback Items Grid/List */}
              <div className="p-6 divide-y divide-zinc-100">
                {filteredFeedback.length === 0 ? (
                  <div className="text-center py-12 text-zinc-450 italic text-sm">
                    No student reviews match your selected filter criteria.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredFeedback.map(fb => (
                      <div key={fb.id} className="pt-4 first:pt-0 group">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-950 text-sm">{fb.name}</span>
                              <span className="text-[10px] text-zinc-400 font-mono">({fb.email})</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="bg-[#003366]/10 text-[#003366] font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded">
                                {fb.course}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-mono">
                                Sent: {new Date(fb.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Star Rating visualization */}
                          <div className="flex items-center gap-1 bg-amber-50 border border-amber-150 px-2 py-1 rounded">
                            {[1, 2, 3, 4, 5].map(st => (
                              <Star 
                                key={st} 
                                className={`h-3 w-3 ${st <= fb.rating ? "text-amber-500 fill-amber-500" : "text-zinc-300"}`} 
                              />
                            ))}
                            <span className="text-[11px] font-bold text-amber-700 ml-1 font-mono">{fb.rating}.0</span>
                          </div>

                        </div>

                        <p className="text-zinc-700 text-xs italic leading-relaxed mt-3 bg-zinc-50/50 p-3 rounded border border-zinc-100/50">
                          "{fb.message}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ==================== TAB 3: REAL-TIME ANALYTICS HUB ==================== */}
          {activeTab === "analytics" && (
            <div className="space-y-6" id="analytics-hub-tab">
              
              {/* Analytics KPI strip */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-xs border border-zinc-200">
                  <span className="text-[10pt] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Total Inquiries</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-extrabold text-[#003366]">{totalInq}</span>
                    <span className="text-xs text-zinc-400 font-mono">registrations</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-xs border border-zinc-200">
                  <span className="text-[10pt] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Student Reviews</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-extrabold text-emerald-700">{totalFb}</span>
                    <span className="text-xs text-zinc-400 font-mono">testimonials</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-xs border border-zinc-200">
                  <span className="text-[10pt] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Response Rate</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-extrabold text-[#ff6b00]">{responseRatePct}%</span>
                    <span className="text-xs text-zinc-400 font-mono">{answeredInqCount}/{totalInq} resolved</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-xs border border-zinc-200">
                  <span className="text-[10pt] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Average Rating</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-extrabold text-[#ff6b00]">{avgRatingStars}</span>
                    <span className="text-xs text-zinc-400 font-mono">/ 5.0 stars</span>
                  </div>
                </div>
              </div>

              {/* Graphical Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* SVG TIMELINE CHART */}
                <div className="bg-white p-6 rounded-xl border border-zinc-200 space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Inquiry & Feedback Submission Timeline</h4>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">HISTORIC SUBMISSION DISTRIBUTION GROUPED BY YYYY-MM-DD</p>
                  </div>

                  {analytics && analytics.timeline && analytics.timeline.length > 0 ? (
                    <div className="h-64 flex flex-col justify-between">
                      <div className="flex-1 flex items-end gap-3 pt-6 border-b border-zinc-200 px-4" id="timeline-chart-bars">
                        {analytics.timeline.map((point, index) => {
                          const maxCount = Math.max(...analytics.timeline.map(t => t.inquiries + t.feedback), 1);
                          const inqPct = (point.inquiries / maxCount) * 100;
                          const fbPct = (point.feedback / maxCount) * 100;

                          return (
                            <div key={index} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                              
                              {/* Hover tooltip */}
                              <div className="absolute top-0 bg-[#003366] text-white p-2 rounded text-[9px] font-mono hidden group-hover:block z-20 pointer-events-none shadow-md">
                                <p className="font-bold">{point.date}</p>
                                <p className="text-sky-300">Inq: {point.inquiries}</p>
                                <p className="text-emerald-400">Review: {point.feedback}</p>
                              </div>

                              <div className="w-full flex justify-center items-end gap-1 h-full">
                                {/* Inquiries bar */}
                                <div 
                                  className="w-3 sm:w-5 bg-[#003366] rounded-t transition-all duration-500 hover:brightness-125"
                                  style={{ height: `${inqPct}%`, minHeight: point.inquiries > 0 ? "4px" : "0px" }}
                                ></div>
                                {/* Feedback bar */}
                                <div 
                                  className="w-3 sm:w-5 bg-emerald-600 rounded-t transition-all duration-500 hover:brightness-125"
                                  style={{ height: `${fbPct}%`, minHeight: point.feedback > 0 ? "4px" : "0px" }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* X-Axis Dates */}
                      <div className="flex justify-between text-[9px] text-zinc-500 font-mono pt-2 px-2" id="timeline-chart-xaxis">
                        {analytics.timeline.map((point, idx) => (
                          <span key={idx} className="truncate select-none">{point.date.substring(5)}</span>
                        ))}
                      </div>

                      {/* Legend */}
                      <div className="flex items-center justify-center gap-4 text-[10px] font-mono pt-4 border-t border-zinc-100">
                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-[#003366] rounded-sm"></span> Student Inquiries</span>
                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-emerald-600 rounded-sm"></span> Student Feedback</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-zinc-400 text-sm italic">
                      Insufficient timeline data points recorded to render graphic timelines.
                    </div>
                  )}
                </div>

                {/* COURSE STATS ANALYSIS */}
                <div className="bg-white p-6 rounded-xl border border-zinc-200 space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Course Statistics & Program Breakdown</h4>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">ACQUISITIONS & TESTIMONY COUNT PER ACADEMIC PROGRAM</p>
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1" id="course-breakdown-list">
                    {analytics?.courseStats.map((stat, i) => {
                      const maxCourseInq = Math.max(...(analytics?.courseStats.map(s => s.inquiries) || []), 1);
                      const barPct = (stat.inquiries / maxCourseInq) * 100;

                      return (
                        <div key={i} className="text-xs space-y-1">
                          <div className="flex items-center justify-between font-medium">
                            <span className="truncate text-slate-900 pr-2">{stat.courseName}</span>
                            <span className="font-mono text-[10px] shrink-0 text-zinc-500">
                              Inquiries: <span className="font-bold text-slate-950">{stat.inquiries}</span> • Rating: <span className="font-bold text-[#ff6b00]">{stat.avgRating || "0.0"}</span>
                            </span>
                          </div>
                          
                          <div className="w-full bg-zinc-100 h-2 rounded overflow-hidden">
                            <div 
                              className="bg-zinc-800 h-full rounded transition-all duration-300"
                              style={{ width: `${barPct}%`, backgroundColor: i % 2 === 0 ? "#003366" : "#002244" }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==================== TAB 4: OUTBOX EMAIL LOGS ==================== */}
          {activeTab === "outbox" && (
            <div className="bg-white rounded-xl shadow-md border border-zinc-100 overflow-hidden" id="outbox-email-logs-tab">
              
              <div className="p-6 bg-[#003366]/5 border-b border-zinc-200/75">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#ff6b00]"></span>
                  Dispatcher Outbox Logs
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">Verify real-time mail server logs, including automated acknowledgments and counseling messages.</p>
              </div>

              <div className="p-4 bg-zinc-50 border-b border-zinc-100/80 flex flex-col sm:flex-row justify-between items-center gap-2">
                <p className="text-xs text-zinc-600 font-mono font-bold uppercase tracking-wider">
                  🔐 SECURE SERVER LOGICAL OUTBOX LEDGER (READ-ONLY)
                </p>
                <span className="text-xs text-zinc-500 font-mono bg-zinc-200 px-2 py-0.5 rounded">
                  System Count: {analytics?.rawEmailLogs.length || 0}
                </span>
              </div>

              <div className="divide-y divide-zinc-150 p-6 overflow-y-auto max-h-[600px] space-y-5">
                {(!analytics || !analytics.rawEmailLogs || analytics.rawEmailLogs.length === 0) ? (
                  <p className="text-center py-12 text-zinc-400 italic text-sm">No emails have been triggered by our SMTP dispatcher yet.</p>
                ) : (
                  analytics.rawEmailLogs.map((log) => (
                    <div key={log.id} className="pt-5 first:pt-0">
                      <div className="bg-zinc-55 p-4 rounded-lg border border-zinc-200 text-xs text-slate-900 space-y-3 font-mono">
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 pb-2 gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-950">Subject: {log.subject}</span>
                            <span className={`px-2 py-0.2 rounded font-mono font-bold uppercase text-[9px] ${
                              log.type === "acknowledgment" ? "bg-amber-100 text-amber-800 border border-amber-250" : "bg-teal-100 text-teal-800 border border-teal-250"
                            }`}>
                              {log.type === "acknowledgment" ? "ACK Auto-Email" : "Manual Advice Outgoing"}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500 text-right shrink-0">
                            {new Date(log.sentAt).toLocaleString()}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-zinc-100 pb-2">
                          <div>
                            <span className="text-zinc-500 font-sans font-semibold">Log UUID:</span> <span className="text-zinc-700 text-[11px]">{log.id}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 font-sans font-semibold">Recipient:</span> <span className="text-zinc-700 text-[11px]">{log.recipientName}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 font-sans font-semibold">Delivery Email:</span> <span className="text-zinc-700 text-[11px] font-bold">{log.recipientEmail}</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-zinc-400 font-sans font-semibold mb-1">Decrypted SMTP Transcript:</p>
                          <p className="whitespace-pre-line text-zinc-600 bg-white p-3.5 rounded border border-zinc-150 font-sans leading-relaxed text-[11px]">
                            {log.body}
                          </p>
                        </div>

                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* ==================== TAB 5: FAQ MANAGER ==================== */}
          {activeTab === "faqs" && (
            <div className="bg-white rounded-xl shadow-md border border-zinc-100 overflow-hidden text-slate-900 shadow-xs" id="faqs-manager-tab">
              
              <div className="p-6 bg-[#003366]/5 border-b border-zinc-200/75 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#ff6b00]"></span>
                    Institution FAQ Desk Manager
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5 font-sans">Add, edit, change category or remove helpful FAQ entries for the online student assistance hub.</p>
                </div>
              </div>

              {/* Toolbar search and category filter */}
              <div className="p-5 bg-zinc-50 border-b border-zinc-200/50 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search Qs/As in database..."
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-zinc-200 bg-white rounded-lg text-xs font-sans text-slate-800 focus:ring-1 focus:ring-[#003366] focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto self-stretch md:self-auto justify-end">
                  <span className="text-xs text-zinc-500 font-mono flex items-center gap-1.5 whitespace-nowrap">
                    <Filter className="h-3 w-3" /> Filter Category:
                  </span>
                  <select
                    value={faqCategoryFilter}
                    onChange={(e) => setFaqCategoryFilter(e.target.value)}
                    className="bg-white border border-zinc-200 rounded-lg text-xs py-1.5 px-3 text-[#003366] font-extrabold focus:outline-hidden cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    <option value="courses">Courses & Syllabus</option>
                    <option value="admissions">Admissions & Entry</option>
                    <option value="fees">Fees & Structure</option>
                    <option value="institution">Institution & Info</option>
                  </select>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6" id="faq-admin-two-column-workspace">
                
                {/* COLUMN 1: FORM EDITOR */}
                <div className="lg:col-span-5" id="faq-form-section">
                  <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-200 shadow-xs space-y-4">
                    <div className="pb-3 border-b border-zinc-150 flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-[#003366] tracking-tight uppercase">
                        {isEditingFaq ? "✏️ Edit FAQ Entry" : "➕ Create New FAQ Entry"}
                      </h4>
                      {isEditingFaq && (
                        <button
                          onClick={handleCancelFaqEdit}
                          className="text-xs font-bold text-red-650 hover:underline cursor-pointer"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    {faqErrorMessage && (
                      <div className="p-3 bg-red-50 text-red-700 font-sans border border-red-200 rounded-lg text-xs flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{faqErrorMessage}</span>
                      </div>
                    )}

                    {faqSuccessMessage && (
                      <div className="p-3 bg-emerald-50 text-emerald-700 font-sans border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        <span>{faqSuccessMessage}</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveFaq} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-650 uppercase tracking-wider mb-1">
                          Group Category
                        </label>
                        <select
                          value={faqFormCategory}
                          onChange={(e) => setFaqFormCategory(e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-lg text-xs py-2 px-3 text-[#003366] font-bold focus:outline-hidden cursor-pointer"
                        >
                          <option value="courses">courses (Courses & Syllabus)</option>
                          <option value="admissions">admissions (Admissions & Entry)</option>
                          <option value="fees">fees (Fees & Structure)</option>
                          <option value="institution">institution (Institution & Info)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-650 uppercase tracking-wider mb-1">
                          Question Prompt
                        </label>
                        <input
                          type="text"
                          placeholder="What is the timing choice for weekend lectures?"
                          value={faqFormQuestion}
                          onChange={(e) => setFaqFormQuestion(e.target.value)}
                          className="w-full p-2.5 border border-[#003366]/25 bg-white rounded-lg text-xs font-sans text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#003366]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-650 uppercase tracking-wider mb-1">
                          Informational Answer text
                        </label>
                        <textarea
                          rows={6}
                          placeholder="Type clear informational solution to answer the question prompt accurately..."
                          value={faqFormAnswer}
                          onChange={(e) => setFaqFormAnswer(e.target.value)}
                          className="w-full p-2.5 border border-[#003366]/25 bg-white rounded-lg text-xs font-sans text-slate-800 leading-relaxed focus:outline-hidden focus:ring-1 focus:ring-[#003366]"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isFaqSubmitting}
                        className="w-full bg-[#ff6b00] hover:bg-[#e05d00] disabled:bg-zinc-300 text-white font-extrabold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {isFaqSubmitting ? "Publishing..." : isEditingFaq ? "Save & Update FAQ" : "Publish FAQ Entry"}
                      </button>
                    </form>
                  </div>
                </div>

                {/* COLUMN 2: LIST VIEW */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-150 pb-2">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">
                      Published FAQ Directory ({faqs.length})
                    </h4>
                  </div>

                  {faqs.length === 0 ? (
                    <div className="p-12 border-2 border-dashed border-zinc-155 text-center text-xs text-zinc-400 bg-zinc-50 rounded-xl">
                      No matching FAQ entries found in Hansraj College Digital Academy ledger.
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-[540px] overflow-y-auto pr-1">
                      {faqs
                        .filter((faq) => {
                          const matchesSearch =
                            faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
                            faq.answer.toLowerCase().includes(faqSearch.toLowerCase());
                          const matchesCategory =
                            faqCategoryFilter === "All" || faq.category === faqCategoryFilter;
                          return matchesSearch && matchesCategory;
                        })
                        .map((faq) => (
                          <div
                            key={faq.id}
                            className={`bg-white rounded-xl border p-4.5 shadow-xs transition-all flex items-start justify-between gap-4 border-zinc-150 hover:border-[#003366]/35 ${
                              isEditingFaq?.id === faq.id ? "border-[#ff6b00] ring-1 ring-[#ff6b00]/10 bg-orange-50/10" : ""
                            }`}
                          >
                            <div className="space-y-2 flex-1 text-slate-900">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-block bg-sky-100 text-[#003366] font-bold text-[9px] font-mono px-2 py-0.5 rounded uppercase tracking-wider">
                                  {faq.category}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  ID: {faq.id} • Posted: {new Date(faq.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">
                                Q: {faq.question}
                              </h5>
                              <p className="text-xs text-zinc-650 leading-relaxed whitespace-pre-line font-sans">
                                {faq.answer}
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-1.5 shrink-0 self-start mt-0.5">
                              <button
                                onClick={() => handleEditFaqClick(faq)}
                                className="px-2.5 py-1.5 text-[10px] font-extrabold tracking-wide uppercase bg-zinc-50 text-[#003366] border border-zinc-200 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteFaq(faq.id)}
                                className="px-2.5 py-1.5 text-[10px] font-extrabold tracking-wide uppercase bg-red-50 text-red-650 border border-red-100 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

        </React.Fragment>
      )}

    </div>
  );
}
