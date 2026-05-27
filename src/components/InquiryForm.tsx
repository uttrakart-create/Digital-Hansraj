import React, { useState, useEffect } from "react";
import { Send, CheckCircle2, Mail, Phone, Calendar, ArrowRight, X, Sparkles, AlertCircle } from "lucide-react";

interface InquiryFormProps {
  courses: string[];
}

export default function InquiryForm({ courses }: InquiryFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [course, setCourse] = useState("");
  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    inquiry: { id: string; name: string; course: string };
    autoEmailSent: { subject: string; recipient: string; body: string };
  } | null>(null);

  // Set default course once loaded
  useEffect(() => {
    if (courses.length > 0 && !course) {
      setCourse(courses[0]);
    }
  }, [courses, course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !course || !message) {
      setError("Please fill out all fields before submitting your inquiry.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, course, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setSuccessData(data);
      // Reset form fields
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err: any) {
      setError(err.message || "Failed to submit inquiry. Please check your network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100" id="admission-inquiry-section">
      <div className="grid grid-cols-1 lg:grid-cols-5">
        
        {/* Left Side: Dynamic Informational/Intro panel */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#003366] to-[#002244] p-8 lg:p-12 text-white flex flex-col justify-between">
          <div>
            <span className="bg-[#ff6b00] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
              DU Hansraj Education
            </span>
            <h3 className="text-3xl font-extrabold tracking-tight text-white mt-4 mb-3">
              Shape Your Career in GenAI & Marketing
            </h3>
            <p className="text-zinc-200 text-sm leading-relaxed mb-6">
              Our flagship 100-Hour Digital Marketing Plus Generative AI Certification is specially designed to make students market-ready with cutting-edge tools.
            </p>

            <div className="space-y-5" id="admission-highlights-list">
              <div className="flex items-start gap-3">
                <div className="bg-white/10 p-2 rounded-lg text-[#ff6b00]">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Flexible Weekend Classes</h4>
                  <p className="text-xs text-zinc-350 font-sans">Perfect for University of Delhi students & working professionals.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white/10 p-2 rounded-lg text-[#ff6b00]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">AI-Powered Curriculum</h4>
                  <p className="text-xs text-zinc-350">Learn prompt engineering, Midjourney, SEO & Meta advertising.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white/10 p-2 rounded-lg text-[#ff6b00]">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Dedicated Counseling</h4>
                  <p className="text-xs text-zinc-350">Immediate calls within 24 hours to clear syllabus & pricing plans.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-sky-900 text-xs text-zinc-300">
            <p className="font-mono">Admissions Help Desk</p>
            <p className="mt-1 font-semibold text-white">📧 info@hansrajdigital.com</p>
            <p className="font-semibold text-white">📞 +91 9811345678</p>
          </div>
        </div>

        {/* Right Side: Form details */}
        <div className="lg:col-span-3 p-8 sm:p-12 bg-zinc-50/50">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-950">
              Admission Inquiry Form
            </h3>
            <p className="text-zinc-500 text-sm mt-1">
              Submit an inquiry below. An automated counseling acknowledgment will be instantly delivered to your email.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border-l-4 border-red-500 rounded-r-lg text-sm flex items-start gap-2" id="inquiry-error-banner">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" id="student-inquiry-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayush Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-zinc-200 bg-white text-sm text-slate-900 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all"
                  id="inq-input-name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ayush@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-zinc-200 bg-white text-sm text-slate-900 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all"
                  id="inq-input-email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 9812345678"
                  value={phone}
                  onChange={(e) => {
                    // Quick phone filter
                    setPhone(e.target.value);
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-zinc-200 bg-white text-sm text-slate-900 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all"
                  id="inq-input-phone"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
                  Course of Interest <span className="text-red-500">*</span>
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-zinc-200 bg-white text-sm text-slate-950 focus:outline-hidden focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all"
                  id="inq-select-course"
                >
                  {courses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
                Query / Message <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Ask us anything! Mention your queries regarding fee structure, timing, or certification schedules."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-zinc-200 bg-white text-sm text-slate-900 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all resize-none"
                id="inq-textarea-message"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-lg text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                isLoading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-[#003366] hover:bg-[#002244] active:scale-[0.99] hover:shadow-[#003366]/20"
              }`}
              id="inq-submit-btn"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Processing Inquiry...
                </>
              ) : (
                <>
                  Submit Secure Inquiry
                  <Send className="h-4 w-4" />
                </>
              )}
            </button>
            <p className="text-[10px] text-zinc-400 text-center font-mono">
              🔒 SSL Secured Transmission. Your phone & email remain fully confidential.
            </p>
          </form>
        </div>
      </div>

      {/* Dynamic Overlay: Automated Acknowledgment Email Visualizer! */}
      {successData && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="success-email-modal">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-zinc-200 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-[#003366] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#ff6b00]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#ff6b00]" />
                <h4 className="font-bold tracking-tight">Inquiry Successfully Saved!</h4>
              </div>
              <button 
                onClick={() => setSuccessData(null)}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
                id="close-email-modal-btn"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content instructions */}
            <div className="p-6 bg-amber-50/50 border-b border-amber-100 flex items-start gap-3">
              <div className="bg-[#ff6b00] text-white p-2 rounded-full mt-0.5 shrink-0">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <div>
                <h5 className="font-extrabold text-slate-900 text-sm">
                  📩 Automated Acknowledgment Email Sent!
                </h5>
                <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">
                  Excellent! Our server database has securely logged your inquiry details and instantly dispatched an automated email to your input address (<span className="font-semibold text-slate-800">{successData.autoEmailSent.recipient}</span>). Here is the exact transcript:
                </p>
              </div>
            </div>

            {/* Email Canvas Visualizer */}
            <div className="p-6 bg-zinc-50 flex-1 overflow-y-auto font-mono text-xs border-b border-zinc-100">
              <div className="bg-white rounded-lg p-5 border border-zinc-200 shadow-xs space-y-3 text-slate-800">
                <div>
                  <span className="text-zinc-400 font-sans">From:</span> admissions@hansrajdigital.com
                </div>
                <div>
                  <span className="text-zinc-400 font-sans">To:</span> {successData.autoEmailSent.recipient}
                </div>
                <div className="border-b border-zinc-100 pb-2">
                  <span className="text-zinc-400 font-sans font-semibold">Subject:</span> <span className="text-emerald-700 font-semibold">{successData.autoEmailSent.subject}</span>
                </div>
                <div className="whitespace-pre-line text-zinc-700 leading-relaxed text-[11px] pt-1 font-sans">
                  {successData.autoEmailSent.body}
                </div>
              </div>
            </div>

            {/* Footer confirmation */}
            <div className="p-4 bg-zinc-100 flex items-center justify-between">
              <div className="text-[10px] text-zinc-500 font-mono">
                Log ID: {successData.inquiry.id}
              </div>
              <button
                onClick={() => setSuccessData(null)}
                className="bg-[#003366] hover:bg-[#002244] text-white px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
                id="ack-ok-btn"
              >
                Done / Return to Portal
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
