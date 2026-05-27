import React, { useState, useEffect } from "react";
import { Search, HelpCircle, ChevronDown, ChevronUp, BookOpen, GraduationCap, CircleDollarSign, Landmark, ThumbsUp, Sparkles, ArrowRight } from "lucide-react";
import { FAQEntry } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface StudentFAQProps {
  onGoToInquiry: () => void;
}

export default function StudentFAQ({ onGoToInquiry }: StudentFAQProps) {
  const [faqs, setFaqs] = useState<FAQEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [helpfulRatings, setHelpfulRatings] = useState<Record<string, "yes" | "no">>({});

  // Fetch FAQ entries
  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/faqs");
      const data = await res.json();
      setFaqs(data);
    } catch (err) {
      console.error("Failed to load FAQs:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "all", name: "All Questions", icon: HelpCircle },
    { id: "courses", name: "Courses & Syllabus", icon: BookOpen },
    { id: "admissions", name: "Admissions & Entry", icon: GraduationCap },
    { id: "fees", name: "Fees & Structure", icon: CircleDollarSign },
    { id: "institution", name: "Institution & Info", icon: Landmark }
  ];

  // Filter FAQs based on category and search query
  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleHelpful = (faqId: string, value: "yes" | "no") => {
    setHelpfulRatings((prev) => ({
      ...prev,
      [faqId]: value
    }));
  };

  // Helper to highlight searched term
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-amber-100 text-[#003366] font-semibold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="space-y-10" id="student-faq-view">
      
      {/* 1. SECTION HEADER */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-[#003366] bg-[#ff6b00]/10 border border-[#ff6b00]/25 px-4 py-1.5 rounded-full tracking-widest uppercase inline-flex items-center gap-1.5 shadow-xs">
          <Sparkles className="h-3.5 w-[#ff6b00]" />
          Knowledge Hub
        </span>
        <h2 className="text-4xl font-extrabold text-slate-950 tracking-tight leading-none mt-2">
          Frequently Asked Questions
        </h2>
        <p className="text-zinc-500 text-xs sm:text-sm">
          Everything you need to know about our digital marketing curricula, DU enrollment rules, and career opportunities.
        </p>
      </div>

      {/* 2. SEARCH & CATAGORY FILTERS BAR */}
      <div className="bg-white rounded-2xl border border-zinc-150 p-6 shadow-sm space-y-6 max-w-4xl mx-auto">
        
        {/* Search Engine */}
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Type keywords to find answers instantly (e.g., certificates, batches, fees)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 border border-zinc-200 bg-zinc-50/50 rounded-xl text-sm text-slate-900 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all shadow-inner"
            id="faq-student-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-4 flex items-center text-xs font-bold text-zinc-400 hover:text-zinc-650"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2.5 justify-center" id="faq-category-pills">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setExpandedId(null);
                }}
                className={`py-2 px-4 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 flex items-center gap-2 border ${
                  isSelected
                    ? "bg-[#003366] text-white border-transparent shadow-md scale-102"
                    : "bg-white text-zinc-650 border-zinc-150 hover:bg-zinc-50"
                }`}
                id={`faq-pill-${cat.id}`}
              >
                <IconComponent className={`h-3.5 w-3.5 ${isSelected ? "text-amber-400" : "text-zinc-400"}`} />
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. FAQ ACCORDION INNER CONTAINER */}
      <div className="max-w-3xl mx-auto" id="faq-accordion-list">
        {loading ? (
          <div className="bg-white p-16 text-center rounded-2xl shadow-xs border border-zinc-200 flex flex-col items-center justify-center space-y-4">
            <div className="h-8 w-8 border-4 border-[#003366]/20 border-t-[#003366] rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-zinc-500 font-mono">Retrieving academic guidelines FAQ...</p>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="bg-zinc-50 rounded-2xl p-12 text-center border-2 border-dashed border-zinc-200 space-y-4">
            <div className="bg-zinc-200/50 h-14 w-14 rounded-full flex items-center justify-center mx-auto">
              <HelpCircle className="h-6 w-6 text-zinc-400" />
            </div>
            <div className="max-w-md mx-auto">
              <p className="text-slate-900 font-bold text-sm">No Answers Found Matching "{searchQuery}"</p>
              <p className="text-zinc-500 text-xs mt-1.5">
                Our advisors will resolve your specific question personally. Connect to the Admissions Inquiry Desk and get a direct response.
              </p>
            </div>
            <button
              onClick={onGoToInquiry}
              className="bg-[#003366] hover:bg-[#002244] text-white font-bold py-2 px-5 rounded-lg text-xs tracking-wider uppercase inline-flex items-center gap-2 transition-all mt-2 cursor-pointer shadow-md"
              id="faq-no-results-btn"
            >
              Ask a Counselor Directly
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="text-right text-zinc-400 text-[10px] font-mono mb-2">
              Viewing {filteredFaqs.length} of {faqs.length} FAQ questions
            </div>
            {filteredFaqs.map((faq, idx) => {
              const isOpen = expandedId === faq.id;
              const hasRated = helpfulRatings[faq.id];

              return (
                <div
                  key={faq.id}
                  className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden shadow-xs hover:shadow-xs group ${
                    isOpen ? "border-[#ff6b00]/30 ring-1 ring-[#ff6b00]/10 bg-gradient-to-tr from-white to-orange-50/5" : "border-zinc-150"
                  }`}
                  id={`faq-item-${faq.id}`}
                >
                  {/* Question Header Button */}
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full text-left p-4.5 sm:p-5 flex items-start justify-between gap-4 transition-all hover:bg-zinc-50/50 cursor-pointer"
                    id={`faq-trigger-${faq.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-lg bg-zinc-100 group-hover:bg-amber-100/50 text-[#003366] flex items-center justify-center text-xs font-bold font-mono shrink-0 mt-0.5 transition-colors">
                        Q{idx + 1}
                      </span>
                      <h3 className="text-slate-900 font-extrabold text-sm sm:text-base tracking-tight leading-snug">
                        {highlightText(faq.question, searchQuery)}
                      </h3>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-[#ff6b00] shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-zinc-650 shrink-0 mt-1" />
                    )}
                  </button>

                  {/* Accordion content with framer motion inside AnimatePresence */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 pt-1 border-t border-zinc-100 bg-zinc-50/25">
                          {/* Answer Body text */}
                          <div className="text-zinc-650 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans pl-9">
                            {highlightText(faq.answer, searchQuery)}
                          </div>

                          {/* Detail footer - help request metrics and category badging */}
                          <div className="mt-4 pt-3.5 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 pl-9 text-[11px] font-mono">
                            <span className="inline-block bg-zinc-100 text-slate-800 font-semibold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                              Category: {faq.category}
                            </span>
                            
                            {/* Helpful metrics feedback */}
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-450 font-sans">Was this advice helpful?</span>
                              {hasRated ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-1 font-sans">
                                  <ThumbsUp className="h-3 w-3 fill-emerald-100" />
                                  Thank you for your feedback!
                                </span>
                              ) : (
                                <div className="flex items-center gap-1 text-[10px]">
                                  <button
                                    onClick={() => handleHelpful(faq.id, "yes")}
                                    className="bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-zinc-600 px-2 py-1 rounded border border-zinc-200 transition-all cursor-pointer font-sans font-medium"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={() => handleHelpful(faq.id, "no")}
                                    className="bg-zinc-100 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-zinc-600 px-2 py-1 rounded border border-zinc-200 transition-all cursor-pointer font-sans font-medium"
                                  >
                                    No
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. CAN'T FIND ANSWER CALL-TO-ACTION CARD */}
      <div className="max-w-3xl mx-auto bg-gradient-to-tr from-[#003366] to-[#001f3f] rounded-3xl p-6 sm:p-8 text-white text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b-6 border-[#ff6b00] shadow-md relative overflow-hidden" id="faq-cta-counselor">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <HelpCircle className="h-44 w-44" />
        </div>
        <div className="space-y-1.5 z-10">
          <h4 className="text-xl font-extrabold tracking-tight">Still have un-answered questions?</h4>
          <p className="text-zinc-200 text-xs sm:text-sm max-w-md font-sans">
            Submit your details now! Our dedicated admissions desk can customize timing structure plans and installment details for you.
          </p>
        </div>
        <button
          onClick={onGoToInquiry}
          className="bg-[#ff6b00] hover:bg-[#e05d00] text-white font-extrabold text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-md cursor-pointer group shrink-0 active:scale-[0.98] z-10"
          id="faq-cta-inquiry-btn"
        >
          Ask Admissions Desk
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
