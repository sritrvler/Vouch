"use client";

import { motion } from "framer-motion";
import { Star, Check, Zap } from "lucide-react";

export default function CollectVisual() {
  return (
    <div className="relative max-w-sm mx-auto lg:mx-0">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Branded header */}
        <div className="bg-indigo-600 px-7 pt-7 pb-8">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center mb-3">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <p className="text-indigo-300 text-xs font-medium mb-0.5">Acme Studio</p>
          <h3 className="text-lg font-bold text-white">
            How was your experience?
          </h3>
        </div>

        {/* Form body */}
        <div className="px-7 py-6">
          {/* Stars */}
          <div className="flex justify-center gap-3 mb-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <motion.div
                key={s}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.4 + s * 0.1,
                  type: "spring",
                  stiffness: 350,
                }}
              >
                <Star className="w-9 h-9 fill-amber-400 text-amber-400" />
              </motion.div>
            ))}
          </div>

          {/* Text area mockup */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 mb-4 min-h-[80px]">
            <p className="text-sm text-gray-400 mb-1 text-[11px]">
              Your experience
            </p>
            <p className="text-sm text-gray-700">
              Working with them transformed our onboarding flow completely.
              Drop-off went from 67% to
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                {" "}
                38%
              </motion.span>
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 1.8 }}
                className="inline-block w-0.5 h-4 bg-indigo-500 ml-0.5 align-middle"
              />
            </p>
          </div>

          {/* Name/role fields */}
          <div className="flex gap-2 mb-5">
            <div className="flex-1 h-10 bg-gray-50 border border-gray-100 rounded-lg px-3 flex items-center">
              <span className="text-[11px] text-gray-400">Your name</span>
            </div>
            <div className="flex-1 h-10 bg-gray-50 border border-gray-100 rounded-lg px-3 flex items-center">
              <span className="text-[11px] text-gray-400">Role</span>
            </div>
          </div>

          <div className="w-full bg-indigo-600 text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
            Submit testimonial <Check className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <motion.div
        className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-200"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        Takes 2 min
      </motion.div>
    </div>
  );
}
