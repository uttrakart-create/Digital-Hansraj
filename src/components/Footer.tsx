import React from "react";
import { GraduationCap, Landmark, ShieldAlert, Award, FileSpreadsheet } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#003366] text-[#F3F4F6] border-t-8 border-[#ff6b00] pt-12 pb-6 mt-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Institutional Identity Card */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="bg-[#ff6b00] text-white p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold tracking-tight text-white uppercase">
                Hansraj College
              </h4>
              <p className="text-[10px] text-zinc-300 uppercase font-mono tracking-widest leading-none">
                University of Delhi (DU)
              </p>
            </div>
          </div>
          
          <p className="text-zinc-200 text-xs leading-relaxed max-w-sm">
            Hansraj College is one of the largest constituent colleges of the University of Delhi. Our specialized Digital Marketing & AI short Courses provide hands-on conceptual rigor to future-ready careers.
          </p>

          <div className="text-xs space-y-1 font-mono text-zinc-300">
            <p className="flex items-center gap-1">📍 Mahatma Hans Raj Marg, Malka Ganj, Delhi, 110007</p>
            <p className="flex items-center gap-1">📞 Helpline: +91 9811345678</p>
            <p className="flex items-center gap-1">✉️ Email: admissions@hansrajdigital.com</p>
          </div>
        </div>

        {/* Useful Links / Course List */}
        <div>
          <h5 className="text-[#ff6b00] text-xs font-bold tracking-widest uppercase border-b border-sky-900 pb-2 mb-3">
            Academics List
          </h5>
          <ul className="space-y-2 text-xs text-zinc-300">
            <li className="hover:text-[#ff6b00] transition-all cursor-pointer font-sans">Digital Marketing Plus Generative AI</li>
            <li className="hover:text-[#ff6b00] transition-all cursor-pointer font-sans">SEO & Search Engine Optimization</li>
            <li className="hover:text-[#ff6b00] transition-all cursor-pointer">Social Media Marketing & Branding</li>
            <li className="hover:text-[#ff6b00] transition-all cursor-pointer">Web Designing & UI/UX</li>
            <li className="hover:text-[#ff6b00] transition-all cursor-pointer">Data Analytics & Performance</li>
          </ul>
        </div>

        {/* Educational Certification logos */}
        <div>
          <h5 className="text-[#ff6b00] text-xs font-bold tracking-widest uppercase border-b border-[#002244] pb-2 mb-3">
            Recognition Portfolio
          </h5>
          
          <div className="space-y-3" id="educational-portfolio-footer">
            <div className="flex items-center gap-2 bg-[#002244]/50 p-2 rounded-lg border border-sky-900/40 text-[11px] text-zinc-200">
              <Award className="h-4 w-4 text-[#ff6b00] shrink-0" />
              <span>Recognous Hansraj College Dublin/DU Academic Certificate</span>
            </div>
            <div className="flex items-center gap-2 bg-[#002244]/50 p-2 rounded-lg border border-sky-900/40 text-[11px] text-zinc-200">
              <FileSpreadsheet className="h-4 w-4 text-[#ff6b00] shrink-0" />
              <span>Full Placement Portfolio Access Included</span>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-sky-900/40 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 gap-4" id="footer-copyright-strip">
        <p className="font-mono">
          © {new Date().getFullYear()} Hansraj College, University of Delhi. All academic rights reserved.
        </p>
        <p className="flex items-center gap-1.5 justify-center font-mono text-zinc-300">
          <ShieldAlert className="h-4 w-4 text-[#ff6b00]" />
          Portals & admission systems compiled for www.hansrajdigital.com
        </p>
      </div>

    </footer>
  );
}
