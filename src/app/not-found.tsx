import React from "react";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      {/* Background pattern */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #f0f0ff 1px, transparent 1px), linear-gradient(to bottom, #f0f0ff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0.4,
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-md w-full">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-10 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm group-hover:bg-indigo-700 transition-colors">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-lg font-semibold text-gray-900">Vouch</span>
        </Link>

        {/* 404 number */}
        <div className="text-[9rem] font-black leading-none text-gray-100 select-none mb-2">
          404
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Page not found
        </h1>

        {/* Subtext */}
        <p className="text-gray-500 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-7 shadow-md shadow-indigo-100"
          >
            <Link href="/">
              <ArrowLeft className="mr-1.5 w-4 h-4" />
              Back to home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-xl px-7 border-gray-200 text-gray-600 hover:border-gray-300"
          >
            <Link href="/pricing">View pricing</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
