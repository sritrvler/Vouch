"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

function VouchLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm group-hover:bg-indigo-700 transition-colors">
        <Zap className="w-4 h-4 text-white fill-white" />
      </div>
      <span className="text-lg font-semibold text-gray-900 tracking-tight">
        Vouch
      </span>
    </Link>
  );
}

export default function NavHeader() {
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    const init = () => {
      if (!mounted) return;
      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (mounted) setIsLoggedIn(!!session);
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) setIsLoggedIn(!!session);
      });
      cleanupRef.current = () => subscription.unsubscribe();
    };
    // Defer Supabase init out of hydration critical path
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = window.requestIdleCallback(init);
      return () => {
        mounted = false;
        window.cancelIdleCallback(id);
        cleanupRef.current?.();
      };
    }
    init();
    return () => {
      mounted = false;
      cleanupRef.current?.();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const shouldBeScrolled = window.scrollY > 10;
      if (shouldBeScrolled !== scrolledRef.current) {
        scrolledRef.current = shouldBeScrolled;
        setScrolled(shouldBeScrolled);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change / resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,box-shadow] duration-300",
          scrolled
            ? "bg-white border-b border-gray-100 shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <VouchLogo />

            {/* Center spacer */}
            <div />

            {/* Right actions: desktop */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/pricing"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5"
              >
                Pricing
              </Link>
              {isLoggedIn ? (
                <Button
                  asChild
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 shadow-sm"
                >
                  <Link href="/dashboard">Go to dashboard</Link>
                </Button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5"
                  >
                    Log in
                  </Link>
                  <Button
                    asChild
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 shadow-sm"
                  >
                    <Link href="/signup">Start free</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Hamburger: mobile */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-lg md:hidden",
          "transition-[opacity,transform] duration-[180ms] ease-out",
          mobileOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
          <Link
            href="/pricing"
            onClick={() => setMobileOpen(false)}
            className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
          >
            Pricing
          </Link>
          {isLoggedIn ? (
            <Button
              asChild
              className="mt-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >
              <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                Go to dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                Log in
              </Link>
              <Button
                asChild
                className="mt-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
              >
                <Link href="/signup" onClick={() => setMobileOpen(false)}>
                  Start for free
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
