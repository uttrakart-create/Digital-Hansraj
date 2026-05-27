import React, { useState } from "react";
import { Star, MessageSquarePlus, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

interface FeedbackFormProps {
  courses: string[];
}

export default function FeedbackForm({ courses }: FeedbackFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Define text labels for ratings
  const getRatingLabel = (val: number) => {
    switch (val) {
      case 1: return "Needs Significant Improvement 😞";
      case 2: return "Below Expectations 🤨";
      case 3: return "Average / Met Requirements 🫡";
      case 4: return "Very Good & Professional 😊";
      case 5: return "Outstanding & Highly Recommended! ⭐🌟";
      default: return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !course || !rating || !message) {
      setError("Please fill in all details, select a course, and rate your overall academic experience.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, course, rating, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Cannot save feedback. Please check email/rating format.");
      }

      setSuccess(true);
      // Reset State
      setName("");
      setEmail("");
      setMessage("");
      setRating(5);
    } catch (err: any) {
      setError(err.message || "Failed to submit feedback. Our servers might be experiencing transient errors.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100 p-6 sm:p-10" id="student-feedback-section">
      <div className="max-w-3xl mx-auto">
        
        {success ? (
          <div className="py-12 text-center space-y-5 animate-scale-up" id="feedback-success-card">
            <div className="inline-flex bg-emerald-100 text-emerald-800 p-4 rounded-full shadow-inner animate-bounce-slow">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h3 className="text-3xl font-extrabold text-slate-950">
              Thank You for Your Feedback!
            </h3>
            <p className="text-zinc-600 max-w-md mx-auto text-sm leading-relaxed">
              Your valuable curriculum review has been securely saved in the secure registry. The administration uses these insights to constantly upgrade classroom resources & AI tools.
            </p>
            <div className="pt-4">
              <button
                onClick={() => setSuccess(false)}
                className="bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs uppercase tracking-wider py-3.5 px-8 rounded-lg transition-all duration-300 shadow-md"
                id="reset-feedback-form-btn"
              >
                Submit New Review
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-10">
              <span className="bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/35 text-[10px] font-bold tracking-widest uppercase px-3.5 py-1 rounded-full">
                Review Desk
              </span>
              <h3 className="text-3xl font-extrabold text-slate-950 mt-3">
                Share Your Academic Experience
              </h3>
              <p className="text-zinc-500 text-sm mt-1 max-w-md mx-auto">
                Help prospective digital marketers by rating your modules, instructors, laboratories and placement guides at Hansraj.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 border-l-4 border-red-500 rounded-r-lg text-sm flex items-start gap-2" id="feedback-error-banner">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" id="feedback-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                    Student Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 bg-white text-sm text-slate-900 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all"
                    id="fb-input-name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                    Enrolled Email ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh.kumar@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 bg-white text-sm text-slate-900 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all"
                    id="fb-input-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                  Enrolled Course Programme <span className="text-red-500">*</span>
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-zinc-200 bg-white text-sm text-slate-950 focus:outline-hidden focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all"
                  id="fb-select-course"
                  required
                >
                  <option value="" disabled>Select the course you attended...</option>
                  {courses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Star Rating design */}
              <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-150">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider text-center mb-3">
                  Overall Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="flex items-center gap-2" id="rating-stars-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 hover:scale-12.5 active:scale-95 transition-all text-amber-400"
                        id={`star-btn-${star}`}
                      >
                        <Star
                          className="h-8 w-8"
                          fill={star <= (hoverRating ?? rating) ? "#F59E0B" : "none"}
                          strokeWidth={1.5}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-semibold font-mono text-zinc-600 pt-1" id="star-desc-label">
                    {getRatingLabel(hoverRating ?? rating)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                  What was your favorite chapter, and how can we benefit future students? <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share details regarding class atmosphere, placement guidance, and hands-on session benefits..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-zinc-200 bg-white text-sm text-slate-900 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all resize-none"
                  id="fb-textarea-message"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-lg text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-md ${
                  isLoading
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-[#003366] hover:bg-[#002244] active:scale-[0.99]"
                }`}
                id="fb-submit-btn"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Saving Review...
                  </>
                ) : (
                  <>
                    Submit Secure Review
                    <MessageSquarePlus className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="flex justify-center items-center gap-2 text-[10px] text-zinc-400 font-mono">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Your rating and email inputs are cryptographically verified and checked against SPAM before ledger commitment.</span>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
