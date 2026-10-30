import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

/**
 * Satu kolom testimoni yang bergulir otomatis ke atas tanpa henti (looping).
 * Meniru desain kartu testimoni modern (5 bintang rating, quote icon, kutipan cerita UMKM/Warga nyata,
 * avatar verified badge, dan role pill).
 */
export default function TestimonialsColumn({ testimonials, duration = 15, className = "" }) {
  return (
    <div className={`${className} overflow-hidden`}>
      <motion.ul
        animate={{ translateY: "-50%" }}
        transition={{ duration, repeat: Infinity, ease: "linear", repeatType: "loop" }}
        className="flex flex-col gap-6 pb-6 list-none m-0 p-0"
      >
        {/* Testimoni digandakan 2x supaya loop-nya terlihat menyambung mulus */}
        {[0, 1].map((loopIndex) => (
          <React.Fragment key={loopIndex}>
            {testimonials.map((testi, i) => (
              <motion.li
                key={`${loopIndex}-${testi.id ?? i}`}
                aria-hidden={loopIndex === 1 ? "true" : "false"}
                tabIndex={loopIndex === 1 ? -1 : 0}
                whileHover={{
                  scale: 1.025,
                  y: -6,
                  boxShadow:
                    "0 20px 40px -10px rgba(0,0,0,0.1), 0 8px 12px -4px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.06)",
                  transition: { type: "spring", stiffness: 400, damping: 20 },
                }}
                className="relative p-7 rounded-[28px] border border-slate-200/90 shadow-md shadow-slate-200/50 max-w-xs w-full bg-white transition-all duration-300 cursor-default select-none group focus:outline-none"
              >
                <blockquote className="m-0 p-0 flex flex-col justify-between h-full">
                  {/* Isi Cerita / Perkataan Pengguna */}
                  <p className="text-slate-700 leading-relaxed font-normal m-0 text-[14px] mb-6">
                    {testi.text}
                  </p>

                  {/* Footer: Avatar Verified, Nama, & Badge Role */}
                  <footer className="flex items-center gap-3 mt-auto pt-2">
                    <div className="relative shrink-0">
                      <img
                        width={44}
                        height={44}
                        src={testi.avatar}
                        alt={testi.name}
                        loading="lazy"
                        className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-500/20 group-hover:ring-emerald-500/40 transition-all duration-300"
                      />
                      {/* Verified Badge Checklist Hijau di sudut avatar */}
                      <span className="absolute -bottom-0.5 -right-0.5 bg-[#00a896] text-white rounded-full w-4 h-4 border-2 border-white shadow-sm flex items-center justify-center">
                        <Check size={9} strokeWidth={4} />
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <cite className="font-bold not-italic tracking-tight leading-snug text-slate-900 text-sm truncate">
                        {testi.name}
                      </cite>
                      {testi.role && (
                        <div className="mt-1">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e6f7f5] text-[#007570] border border-[#b2e8e1]">
                            {testi.role}
                          </span>
                        </div>
                      )}
                    </div>
                  </footer>
                </blockquote>
              </motion.li>
            ))}
          </React.Fragment>
        ))}
      </motion.ul>
    </div>
  );
}