"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  Settings,
  Package,
  Home,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { navigationLinks } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { brandingConfig } from "@/config/branding";
import {
  headerEntry,
} from "@/lib/animations";
import { useCartStore, useCartTotals } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { totalItems } = useCartTotals();
  const setCartSidebarOpen = useUIStore((s) => s.setCartSidebarOpen);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Escuchar cambios en la sesión de Supabase + verificar rol admin
  useEffect(() => {
    const supabase = createClient();

    async function checkAdminRole(userId: string) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();
        setIsAdmin(profile?.role === "admin");
      } catch {
        setIsAdmin(false);
      }
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) checkAdminRole(user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);
        if (sessionUser) {
          checkAdminRole(sessionUser.id);
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setShowUserMenu(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        variants={headerEntry}
        initial="hidden"
        animate="visible"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#0f172a]/95 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/[0.06]"
            : "bg-[#0f172a]/70 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-electric rounded-lg flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,153,255,0.5)]">
                  <span className="text-white font-black text-sm md:text-lg">{siteConfig.brandShort}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-sm md:text-lg tracking-tight leading-none">
                  TiendaFitness
                  <span className="text-electric">Pro</span>
                </span>
                <span className="text-[10px] md:text-xs text-white/50 tracking-widest uppercase">
                  {siteConfig.tagline}
                </span>
              </div>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigationLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors duration-300 group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-electric rounded-full transition-all duration-300 group-hover:w-6 group-hover:shadow-[0_0_10px_rgba(0,153,255,0.5)]" />
                </a>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-full"
              >
                <Search className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-full"
                onClick={() => setCartSidebarOpen(true)}
              >
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 md:w-5 md:h-5 bg-electric rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-[0_0_10px_rgba(0,153,255,0.5)]">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Button>

              {/* User menu / Auth (Desktop) */}
              <div className="relative hidden md:block">
                {user ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-full"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <User className="h-5 w-5" />
                  </Button>
                ) : (
                  <a href="/auth/login">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-full"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </a>
                )}

                {/* Dropdown del usuario (desktop) */}
                <AnimatePresence>
                  {showUserMenu && user && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#111827] border border-white/10 shadow-xl shadow-black/40 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white truncate">
                          {user.user_metadata?.full_name || user.email}
                        </p>
                        <p className="text-xs text-white/50 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <a
                          href="/"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Home className="h-4 w-4" />
                          Inicio
                        </a>
                        <a
                          href="/mi-cuenta"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="h-4 w-4" />
                          Mi Cuenta
                        </a>
                        <a
                          href="/mis-pedidos"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Package className="h-4 w-4" />
                          Mis Pedidos
                        </a>
                        {isAdmin && (
                          <a
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className="h-4 w-4" />
                            Panel Admin
                          </a>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-full w-11 h-11"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer — Full screen overlay + slide-in panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay — lighter, less opaque */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer panel — solid, slides from right */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-[85%] max-w-sm bg-[#111827] border-l border-white/10 lg:hidden overflow-y-auto"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-electric rounded-lg flex items-center justify-center">
                    <span className="text-white font-black text-sm">{siteConfig.brandShort}</span>
                  </div>
                  <span className="text-white font-bold text-sm">
                    TiendaFitness<span className="text-electric">Pro</span>
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-11 h-11"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* User info (if logged in) */}
              {user && (
                <div className="px-5 py-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-electric/10 border border-electric/30 flex items-center justify-center">
                      <User className="h-5 w-5 text-electric" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {user.user_metadata?.full_name || user.email}
                      </p>
                      <p className="text-xs text-white/50 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation links */}
              <nav className="px-3 py-4">
                <div className="space-y-1">
                  {navigationLinks.map((link, i) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-3.5 text-white/80 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all duration-200 font-medium touch-target"
                    >
                      <span>{link.label}</span>
                      <ChevronRight className="h-4 w-4 text-white/30" />
                    </motion.a>
                  ))}
                </div>

                {/* Separator */}
                <div className="h-px bg-white/[0.08] my-4" />

                {/* User actions */}
                <div className="space-y-1">
                  {user ? (
                    <>
                      <a
                        href="/"
                        className="flex items-center gap-3 px-4 py-3.5 text-white/80 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all duration-200 font-medium touch-target"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Home className="h-5 w-5 text-white/50" />
                        Inicio
                      </a>
                      <a
                        href="/mi-cuenta"
                        className="flex items-center gap-3 px-4 py-3.5 text-white/80 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all duration-200 font-medium touch-target"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-5 w-5 text-white/50" />
                        Mi Cuenta
                      </a>
                      <a
                        href="/mis-pedidos"
                        className="flex items-center gap-3 px-4 py-3.5 text-white/80 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all duration-200 font-medium touch-target"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Package className="h-5 w-5 text-white/50" />
                        Mis Pedidos
                      </a>
                      {isAdmin && (
                        <a
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-3.5 text-electric hover:text-electric/90 hover:bg-electric/[0.06] rounded-xl transition-all duration-200 font-medium touch-target"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Settings className="h-5 w-5 text-electric/70" />
                          Panel Admin
                        </a>
                      )}
                      <div className="h-px bg-white/[0.08] my-3" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-red-400 hover:text-red-300 hover:bg-red-400/[0.06] rounded-xl transition-all duration-200 font-medium touch-target"
                      >
                        <LogOut className="h-5 w-5 text-red-400/70" />
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <a
                      href="/auth/login"
                      className="flex items-center gap-3 px-4 py-3.5 text-white/80 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all duration-200 font-medium touch-target"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5 text-white/50" />
                      {brandingConfig?.cta?.login ?? 'Iniciar Sesión / Registrarse'}
                    </a>
                  )}
                </div>
              </nav>

              {/* Drawer footer */}
              <div className="px-5 py-4 border-t border-white/[0.08] mt-auto">
                <p className="text-xs text-white/30 text-center">
                  © {new Date().getFullYear()} TiendaFitnessPro
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
