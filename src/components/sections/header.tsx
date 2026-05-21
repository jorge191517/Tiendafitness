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
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { navigationLinks } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { brandingConfig } from "@/config/branding";
import {
  headerEntry,
  mobileMenuVariants,
  mobileMenuTransition,
  mobileMenuItemVariants,
} from "@/lib/animations";
import { useCartStore, useCartTotals, clearCartStorage } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
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

  // Escuchar cambios en la sesión de Supabase
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        // Limpiar carrito al cerrar sesión o cambiar de usuario
        if (event === "SIGNED_OUT") {
          useCartStore.getState().clearCart();
          clearCartStorage();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    const handleRouteChange = () => {
      setMobileMenuOpen(false);
      setShowUserMenu(false);
    };
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    useCartStore.getState().clearCart();
    clearCartStorage();
    await supabase.auth.signOut();
    setUser(null);
    setShowUserMenu(false);
    setMobileMenuOpen(false);
    window.location.href = "/";
  };

  return (
    <motion.header
      variants={headerEntry}
      initial="hidden"
      animate="visible"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass shadow-lg shadow-black/30"
          : "bg-transparent"
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
              <span className="text-[10px] md:text-xs text-white/40 tracking-widest uppercase">
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

            {/* Desktop User menu / Auth */}
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

              {/* Desktop Dropdown del usuario */}
              <AnimatePresence>
                {showUserMenu && user && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-mid-gray border border-white/10 shadow-xl shadow-black/50 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-medium text-white truncate">
                        {user.user_metadata?.full_name || user.email}
                      </p>
                      <p className="text-xs text-white/40 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <a
                        href="/mis-pedidos"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Package className="h-4 w-4" />
                        Mis Pedidos
                      </a>
                      <a
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Panel Admin
                      </a>
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
              className="lg:hidden text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-full"
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

      {/* Mobile Menu — fondo sólido oscuro, no glass/transparente */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={mobileMenuTransition}
            className="lg:hidden bg-[#0d0d0d] border-t border-white/5"
          >
            <div className="px-4 py-4 space-y-1">
              {navigationLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  variants={mobileMenuItemVariants}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3.5 text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 font-medium text-base"
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4 text-white/30" />
                </motion.a>
              ))}

              {/* User section — separado visualmente */}
              <div className="pt-3 mt-2 border-t border-white/10">
                {user ? (
                  <>
                    <div className="px-4 py-3 mb-1">
                      <p className="text-sm font-semibold text-white truncate">
                        {user.user_metadata?.full_name || user.email}
                      </p>
                      <p className="text-xs text-white/40 truncate mt-0.5">{user.email}</p>
                    </div>
                    <a
                      href="/mis-pedidos"
                      className="flex items-center justify-between px-4 py-3.5 text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 font-medium text-base"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-electric" />
                        Mis Pedidos
                      </span>
                      <ChevronRight className="h-4 w-4 text-white/30" />
                    </a>
                    <a
                      href="/admin"
                      className="flex items-center justify-between px-4 py-3.5 text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 font-medium text-base"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="flex items-center gap-3">
                        <Settings className="h-5 w-5 text-white/50" />
                        Panel Admin
                      </span>
                      <ChevronRight className="h-4 w-4 text-white/30" />
                    </a>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-red-400 hover:text-red-300 hover:bg-red-400/5 rounded-xl transition-all duration-300 font-medium text-base"
                    >
                      <span className="flex items-center gap-3">
                        <LogOut className="h-5 w-5" />
                        Cerrar Sesión
                      </span>
                    </button>
                  </>
                ) : (
                  <a
                    href="/auth/login"
                    className="flex items-center justify-between px-4 py-3.5 text-electric hover:text-white hover:bg-electric/10 rounded-xl transition-all duration-300 font-semibold text-base"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-3">
                      <User className="h-5 w-5" />
                      {brandingConfig.cta.login}
                    </span>
                    <ChevronRight className="h-4 w-4 text-white/30" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
