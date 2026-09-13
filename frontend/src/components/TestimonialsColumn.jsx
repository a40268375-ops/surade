import React from "react";
import { motion } from "framer-motion";

/**
 * Satu kolom testimoni yang bergulir otomatis ke atas tanpa henti (looping).
 * Dipakai 3x berdampingan di pages/Home.jsx untuk section "Apa Yang Mereka
 * Katakan", meniru gaya "wall of love" (data + urutan kartu tetap dari
 * TESTIMONIALS_DATA yang sudah ada, cuma cara tampilnya yang berubah).
 *
 * props:
 *  - testimonials : array {id, avatar, name, role, text}
 *  - duration     : lama 1 putaran penuh (detik) — beda-beda tiap kolom
 *                    supaya gerakannya tidak seragam/kaku
 *  - className    : buat sembunyikan kolom di layar kecil (md:block dst)
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
                  scale: 1.03,
                  y: -8,
                  boxShadow:
                    "0 25px 50px -12px rgba(0,0,0,0.12), 0 10px 10px -5px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.05)",
                  transition: { type: "spring", stiffness: 400, damping: 17 },
                }}
                className="p-8 rounded-3xl border border-slate-200 shadow-lg shadow-black/5 max-w-xs w-full bg-white transition-shadow duration-300 cursor-default select-none group focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <blockquote className="m-0 p-0">
                  <p className="text-slate-600 leading-relaxed font-normal m-0 text-sm">{testi.text}</p>
                  <footer className="flex items-center gap-3 mt-6">
                    <img
                      width={40}
                      height={40}
                      src={testi.avatar}
                      alt={testi.name}
                      loading="lazy"
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-emerald-500/30 transition-all duration-300"
                    />
                    <div className="flex flex-col">
                      <cite className="font-bold not-italic tracking-tight leading-5 text-slate-900">
                        {testi.name}
                      </cite>
                      <span className="text-xs font-semibold leading-5 tracking-tight text-amber-600 mt-0.5">
                        {testi.role}
                      </span>
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