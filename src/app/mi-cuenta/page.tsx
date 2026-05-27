"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Lock,
  LogOut,
  Package,
  ChevronRight,
  Pencil,
  X,
  Check,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  Truck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ShippingAddress, OrderStatus } from "@/lib/supabase/types";

// ─── Status helpers ───────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string }
> = {
  pending: {
    label: "Pendiente",
    color: "#FFB800",
    bgColor: "rgba(255, 184, 0, 0.12)",
  },
  confirmed: {
    label: "Confirmado",
    color: "#0099FF",
    bgColor: "rgba(0, 153, 255, 0.12)",
  },
  processing: {
    label: "Procesando",
    color: "#FF8C00",
    bgColor: "rgba(255, 140, 0, 0.12)",
  },
  shipped: {
    label: "Enviado",
    color: "#00D4FF",
    bgColor: "rgba(0, 212, 255, 0.12)",
  },
  delivered: {
    label: "Entregado",
    color: "#00CC66",
    bgColor: "rgba(0, 204, 102, 0.12)",
  },
  cancelled: {
    label: "Cancelado",
    color: "#FF4444",
    bgColor: "rgba(255, 68, 68, 0.12)",
  },
};

// ─── Interfaces ───────────────────────────────────────────────────

interface ProfileData {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  default_shipping_address: ShippingAddress | null;
}

interface OrderData {
  id: string;
  order_number: string | null;
  status: OrderStatus;
  total: number;
  created_at: string;
}

// ─── Component ────────────────────────────────────────────────────

export default function MiCuentaPage() {
  const router = useRouter();

  // Auth state
  const [user, setUser] = useState<{
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Profile data
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);

  // Edit modes
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Personal form
  const [personalForm, setPersonalForm] = useState({
    full_name: "",
    phone: "",
  });

  // Address form
  const [addressForm, setAddressForm] = useState<ShippingAddress>({
    street: "",
    city: "",
    province: "",
    postal_code: "",
    country: "España",
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Feedback
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ─── Fetch data ──────────────────────────────────────────────

  const fetchData = useCallback(async (userId: string) => {
    const supabaseClient = createClient();

    // Get profile
    const { data: profileData } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileData) {
      const p = profileData as ProfileData;
      setProfile(p);
      setPersonalForm({
        full_name: p.full_name ?? "",
        phone: p.phone ?? "",
      });
      if (p.default_shipping_address) {
        setAddressForm(p.default_shipping_address);
      }
    }

    // Get recent orders
    const { data: ordersData } = await supabaseClient
      .from("orders")
      .select("id, order_number, status, total, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3);

    if (ordersData) {
      setOrders(ordersData as OrderData[]);
    }
  }, []);

  // ─── Auth check on mount ─────────────────────────────────────

  useEffect(() => {
    const supabaseClient = createClient();

    const checkAuth = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabaseClient.auth.getUser();

        if (!authUser) {
          setAuthLoading(false);
          return;
        }

        setUser(authUser);
        setAuthLoading(false);
        await fetchData(authUser.id);
      } catch {
        setAuthLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
      } else {
        setUser(session.user);
        fetchData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchData]);

  // ─── Clear feedback after timeout ────────────────────────────

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // ─── Save personal data ─────────────────────────────────────

  const savePersonal = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const supabaseClient = createClient();
      const { error } = await supabaseClient
        .from("profiles")
        .update({
          full_name: personalForm.full_name,
          phone: personalForm.phone,
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile((prev) =>
        prev
          ? { ...prev, full_name: personalForm.full_name, phone: personalForm.phone }
          : prev
      );
      setEditingPersonal(false);
      setFeedback({ type: "success", message: "Datos personales actualizados correctamente" });
    } catch {
      setFeedback({ type: "error", message: "Error al guardar los datos. Inténtalo de nuevo." });
    } finally {
      setSaving(false);
    }
  };

  // ─── Save address ───────────────────────────────────────────

  const saveAddress = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const supabaseClient = createClient();
      const { error } = await supabaseClient
        .from("profiles")
        .update({ default_shipping_address: addressForm })
        .eq("id", user.id);

      if (error) throw error;

      setProfile((prev) =>
        prev ? { ...prev, default_shipping_address: addressForm } : prev
      );
      setEditingAddress(false);
      setFeedback({ type: "success", message: "Dirección de envío actualizada correctamente" });
    } catch {
      setFeedback({ type: "error", message: "Error al guardar la dirección. Inténtalo de nuevo." });
    } finally {
      setSaving(false);
    }
  };

  // ─── Change password ────────────────────────────────────────

  const changePassword = async () => {
    if (!user) return;

    if (passwordForm.newPassword.length < 6) {
      setFeedback({ type: "error", message: "La nueva contraseña debe tener al menos 6 caracteres" });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFeedback({ type: "error", message: "Las contraseñas no coinciden" });
      return;
    }

    setSaving(true);
    try {
      const supabaseClient = createClient();
      const { error } = await supabaseClient.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      setChangingPassword(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setFeedback({ type: "success", message: "Contraseña actualizada correctamente" });
    } catch {
      setFeedback({ type: "error", message: "Error al cambiar la contraseña. Inténtalo de nuevo." });
    } finally {
      setSaving(false);
    }
  };

  // ─── Sign out ───────────────────────────────────────────────

  const handleSignOut = async () => {
    const supabaseClient = createClient();
    await supabaseClient.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // ─── Format date ────────────────────────────────────────────

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ─── Format price ───────────────────────────────────────────

  const formatPrice = (price: number) => {
    return price.toFixed(2) + " €";
  };

  // ─── Order status counts ────────────────────────────────────

  const statusCounts = orders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // ─── Get display name ───────────────────────────────────────

  const displayName =
    profile?.full_name ||
    (user?.user_metadata?.full_name as string) ||
    user?.email?.split("@")[0] ||
    "Usuario";

  const displayEmail = user?.email || "";

  const displayPhone = profile?.phone || (user?.user_metadata?.phone as string) || "";

  // ─── Get address display ────────────────────────────────────

  const hasAddress = profile?.default_shipping_address?.street;
  const addr = profile?.default_shipping_address || addressForm;

  // ─── Loading state ──────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0b0e17] via-[#121826] to-[#182033]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-electric animate-spin" />
          <p className="text-white/50 text-sm">Cargando tu cuenta...</p>
        </div>
      </div>
    );
  }

  // ─── Not authenticated ──────────────────────────────────────

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0b0e17] via-[#121826] to-[#182033] px-4">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md text-center"
        >
          <div className="bg-[#181c26]/90 backdrop-blur-xl border border-white/15 rounded-2xl p-8 shadow-[0_0_30px_rgba(0,153,255,0.08)]">
            <div className="w-20 h-20 bg-electric/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="h-10 w-10 text-electric" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Inicia Sesión
            </h2>
            <p className="text-white/50 mb-6 text-sm">
              Necesitas iniciar sesión para acceder a tu cuenta y ver tus
              pedidos, datos personales y más.
            </p>
            <Button
              asChild
              className="w-full bg-electric hover:bg-electric/90 text-white font-semibold h-11 rounded-xl shadow-[0_0_30px_rgba(0,153,255,0.3)] hover:shadow-[0_0_40px_rgba(0,153,255,0.4)] transition-all duration-300"
            >
              <Link href="/auth/login">
                Iniciar Sesión
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <p className="text-white/30 text-xs mt-4">
              ¿No tienes cuenta?{" "}
              <Link
                href="/auth/register"
                className="text-electric hover:text-electric/80 transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Main page ──────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0e17] via-[#121826] to-[#182033]">
      {/* Spacer for fixed header */}
      <div className="h-20" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* ── Feedback toast ─────────────────────────────── */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl border backdrop-blur-xl shadow-lg text-sm font-medium ${
                feedback.type === "success"
                  ? "bg-[#00CC66]/15 border-[#00CC66]/30 text-[#00CC66]"
                  : "bg-[#FF4444]/15 border-[#FF4444]/30 text-[#FF4444]"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Header ─────────────────────────────────────── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-electric/10 rounded-xl flex items-center justify-center">
              <User className="h-6 w-6 text-electric" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                Mi <span className="text-electric">Cuenta</span>
              </h1>
              <p className="text-white/50 text-sm mt-0.5">
                {displayName} {displayEmail && `· ${displayEmail}`}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Cards grid ─────────────────────────────────── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* ══════════════════════════════════════════════════
              DATOS PERSONALES
              ══════════════════════════════════════════════════ */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-[#181c26]/90 backdrop-blur-xl border border-white/15 rounded-2xl shadow-[0_0_30px_rgba(0,153,255,0.05)] hover:border-electric/30 transition-all duration-300">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <div className="w-8 h-8 bg-electric/10 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-electric" />
                    </div>
                    Datos Personales
                  </CardTitle>
                  {!editingPersonal && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingPersonal(true)}
                      className="text-white/40 hover:text-electric hover:bg-electric/10 h-8 px-2"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Editar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                {editingPersonal ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/80 text-sm">
                        Nombre completo
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                        <Input
                          value={personalForm.full_name}
                          onChange={(e) =>
                            setPersonalForm((p) => ({
                              ...p,
                              full_name: e.target.value,
                            }))
                          }
                          placeholder="Tu nombre"
                          className="pl-10 bg-white/8 border-white/18 text-white placeholder:text-white/45 focus-visible:border-electric focus-visible:ring-electric/40 h-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80 text-sm">Teléfono</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                        <Input
                          value={personalForm.phone}
                          onChange={(e) =>
                            setPersonalForm((p) => ({
                              ...p,
                              phone: e.target.value,
                            }))
                          }
                          placeholder="+34 600 000 000"
                          type="tel"
                          className="pl-10 bg-white/8 border-white/18 text-white placeholder:text-white/45 focus-visible:border-electric focus-visible:ring-electric/40 h-10"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        onClick={savePersonal}
                        disabled={saving}
                        className="bg-electric hover:bg-electric/90 text-white font-semibold h-9 rounded-lg shadow-[0_0_20px_rgba(0,153,255,0.3)] transition-all duration-300"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        Guardar
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditingPersonal(false);
                          setPersonalForm({
                            full_name: profile?.full_name ?? "",
                            phone: profile?.phone ?? "",
                          });
                        }}
                        className="text-white/50 hover:text-white hover:bg-white/10 h-9 rounded-lg"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-electric/60 shrink-0" />
                      <div>
                        <p className="text-white/40 text-xs">Email</p>
                        <p className="text-white/90 text-sm">
                          {displayEmail || "No especificado"}
                        </p>
                      </div>
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-electric/60 shrink-0" />
                      <div>
                        <p className="text-white/40 text-xs">Nombre</p>
                        <p className="text-white/90 text-sm">
                          {displayName || "No especificado"}
                        </p>
                      </div>
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-electric/60 shrink-0" />
                      <div>
                        <p className="text-white/40 text-xs">Teléfono</p>
                        <p className="text-white/90 text-sm">
                          {displayPhone || "No especificado"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ══════════════════════════════════════════════════
              DIRECCIÓN DE ENVÍO
              ══════════════════════════════════════════════════ */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-[#181c26]/90 backdrop-blur-xl border border-white/15 rounded-2xl shadow-[0_0_30px_rgba(0,153,255,0.05)] hover:border-[#00D4FF]/30 transition-all duration-300">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <div className="w-8 h-8 bg-[#00D4FF]/10 rounded-lg flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-[#00D4FF]" />
                    </div>
                    Dirección de Envío
                  </CardTitle>
                  {!editingAddress && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingAddress(true)}
                      className="text-white/40 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 h-8 px-2"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Editar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                {editingAddress ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-white/80 text-sm">
                        Calle y número
                      </Label>
                      <Input
                        value={addressForm.street}
                        onChange={(e) =>
                          setAddressForm((p) => ({
                            ...p,
                            street: e.target.value,
                          }))
                        }
                        placeholder="Calle Mayor 10, 3ºA"
                        className="bg-white/8 border-white/18 text-white placeholder:text-white/45 focus-visible:border-[#00D4FF] focus-visible:ring-[#00D4FF]/30 h-10"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-white/80 text-sm">Ciudad</Label>
                        <Input
                          value={addressForm.city}
                          onChange={(e) =>
                            setAddressForm((p) => ({
                              ...p,
                              city: e.target.value,
                            }))
                          }
                          placeholder="Madrid"
                          className="bg-white/8 border-white/18 text-white placeholder:text-white/45 focus-visible:border-[#00D4FF] focus-visible:ring-[#00D4FF]/30 h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80 text-sm">
                          Provincia
                        </Label>
                        <Input
                          value={addressForm.province}
                          onChange={(e) =>
                            setAddressForm((p) => ({
                              ...p,
                              province: e.target.value,
                            }))
                          }
                          placeholder="Madrid"
                          className="bg-white/8 border-white/18 text-white placeholder:text-white/45 focus-visible:border-[#00D4FF] focus-visible:ring-[#00D4FF]/30 h-10"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-white/80 text-sm">
                          Código Postal
                        </Label>
                        <Input
                          value={addressForm.postal_code}
                          onChange={(e) =>
                            setAddressForm((p) => ({
                              ...p,
                              postal_code: e.target.value,
                            }))
                          }
                          placeholder="28001"
                          className="bg-white/8 border-white/18 text-white placeholder:text-white/45 focus-visible:border-[#00D4FF] focus-visible:ring-[#00D4FF]/30 h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80 text-sm">País</Label>
                        <Input
                          value={addressForm.country}
                          onChange={(e) =>
                            setAddressForm((p) => ({
                              ...p,
                              country: e.target.value,
                            }))
                          }
                          placeholder="España"
                          className="bg-white/8 border-white/18 text-white placeholder:text-white/45 focus-visible:border-[#00D4FF] focus-visible:ring-[#00D4FF]/30 h-10"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        onClick={saveAddress}
                        disabled={saving}
                        className="bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#0d0f14] font-semibold h-9 rounded-lg shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all duration-300"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        Guardar
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditingAddress(false);
                          if (profile?.default_shipping_address) {
                            setAddressForm(profile.default_shipping_address);
                          }
                        }}
                        className="text-white/50 hover:text-white hover:bg-white/10 h-9 rounded-lg"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hasAddress ? (
                      <>
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-[#00D4FF]/60 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-white/90 text-sm">
                              {addr.street}
                            </p>
                            <p className="text-white/70 text-sm">
                              {addr.city}
                              {addr.province && `, ${addr.province}`}
                            </p>
                            <p className="text-white/50 text-sm">
                              {addr.postal_code}
                              {addr.country && ` · ${addr.country}`}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-3 py-2">
                        <MapPin className="h-4 w-4 text-white/20 shrink-0" />
                        <p className="text-white/30 text-sm">
                          No tienes dirección de envío configurada
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ══════════════════════════════════════════════════
              SEGURIDAD
              ══════════════════════════════════════════════════ */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-[#181c26]/90 backdrop-blur-xl border border-white/15 rounded-2xl shadow-[0_0_30px_rgba(0,153,255,0.05)] hover:border-lime/30 transition-all duration-300">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 bg-[#AAFF00]/10 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-lime" />
                  </div>
                  Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                {changingPassword ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-white/80 text-sm">
                        Nueva contraseña
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                        <Input
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm((p) => ({
                              ...p,
                              newPassword: e.target.value,
                            }))
                          }
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          className="pl-10 pr-10 bg-white/8 border-white/18 text-white placeholder:text-white/45 focus-visible:border-lime focus-visible:ring-lime/30 h-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80 text-sm">
                        Confirmar contraseña
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                        <Input
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm((p) => ({
                              ...p,
                              confirmPassword: e.target.value,
                            }))
                          }
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Repite la contraseña"
                          className="pl-10 pr-10 bg-white/8 border-white/18 text-white placeholder:text-white/45 focus-visible:border-lime focus-visible:ring-lime/30 h-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        onClick={changePassword}
                        disabled={saving}
                        className="bg-lime hover:bg-lime/90 text-[#0d0f14] font-semibold h-9 rounded-lg shadow-[0_0_20px_rgba(170,255,0,0.3)] transition-all duration-300"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Lock className="h-4 w-4 mr-1" />
                        )}
                        Cambiar Contraseña
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setChangingPassword(false);
                          setPasswordForm({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                        }}
                        className="text-white/50 hover:text-white hover:bg-white/10 h-9 rounded-lg"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={() => setChangingPassword(true)}
                      className="w-full justify-start bg-white/8 border-white/18 text-white/80 hover:bg-lime/10 hover:text-lime hover:border-lime/30 h-10 rounded-lg transition-all duration-300"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Cambiar Contraseña
                    </Button>
                    <Separator className="bg-white/5" />
                    <Button
                      variant="outline"
                      onClick={handleSignOut}
                      className="w-full justify-start bg-white/8 border-white/18 text-white/80 hover:bg-[#FF4444]/10 hover:text-[#FF4444] hover:border-[#FF4444]/30 h-10 rounded-lg transition-all duration-300"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ══════════════════════════════════════════════════
              ESTADO DE PEDIDOS RECIENTES
              ══════════════════════════════════════════════════ */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-[#181c26]/90 backdrop-blur-xl border border-white/15 rounded-2xl shadow-[0_0_30px_rgba(0,153,255,0.05)] hover:border-electric/30 transition-all duration-300">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 bg-[#FFB800]/10 rounded-lg flex items-center justify-center">
                    <Package className="h-4 w-4 text-[#FFB800]" />
                  </div>
                  Estado de Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                {orders.length === 0 ? (
                  <div className="text-center py-4">
                    <Package className="h-8 w-8 text-white/15 mx-auto mb-3" />
                    <p className="text-white/30 text-sm">
                      No tienes pedidos todavía
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {/* Pending */}
                    <div className="bg-[#FFB800]/8 border border-[#FFB800]/15 rounded-xl p-3 text-center">
                      <Clock
                        className="h-5 w-5 mx-auto mb-1.5"
                        style={{ color: "#FFB800" }}
                      />
                      <p
                        className="text-2xl font-black"
                        style={{ color: "#FFB800" }}
                      >
                        {statusCounts["pending"] || 0}
                      </p>
                      <p className="text-white/40 text-xs mt-0.5">Pendientes</p>
                    </div>
                    {/* Shipped */}
                    <div className="bg-[#00D4FF]/8 border border-[#00D4FF]/15 rounded-xl p-3 text-center">
                      <Truck
                        className="h-5 w-5 mx-auto mb-1.5"
                        style={{ color: "#00D4FF" }}
                      />
                      <p
                        className="text-2xl font-black"
                        style={{ color: "#00D4FF" }}
                      >
                        {statusCounts["shipped"] || 0}
                      </p>
                      <p className="text-white/40 text-xs mt-0.5">Enviados</p>
                    </div>
                    {/* Delivered */}
                    <div className="bg-[#00CC66]/8 border border-[#00CC66]/15 rounded-xl p-3 text-center">
                      <CheckCircle2
                        className="h-5 w-5 mx-auto mb-1.5"
                        style={{ color: "#00CC66" }}
                      />
                      <p
                        className="text-2xl font-black"
                        style={{ color: "#00CC66" }}
                      >
                        {statusCounts["delivered"] || 0}
                      </p>
                      <p className="text-white/40 text-xs mt-0.5">Entregados</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            MIS PEDIDOS (full width)
            ══════════════════════════════════════════════════════ */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <Card className="bg-[#181c26]/90 backdrop-blur-xl border border-white/15 rounded-2xl shadow-[0_0_30px_rgba(0,153,255,0.05)] hover:border-electric/30 transition-all duration-300">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 bg-electric/10 rounded-lg flex items-center justify-center">
                    <Package className="h-4 w-4 text-electric" />
                  </div>
                  Mis Pedidos
                </CardTitle>
                {orders.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-electric hover:text-electric/80 hover:bg-electric/10 h-8 px-2"
                  >
                    <Link href="/mis-pedidos">
                      Ver todos
                      <ChevronRight className="h-4 w-4 ml-0.5" />
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/40 text-sm mb-1">
                    No tienes pedidos todavía
                  </p>
                  <p className="text-white/25 text-xs mb-4">
                    Cuando realices tu primer pedido, aparecerá aquí
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="bg-white/8 border-white/18 text-white/70 hover:bg-electric/10 hover:text-electric hover:border-electric/30 rounded-lg transition-all duration-300"
                  >
                    <Link href="/productos">
                      Explorar Productos
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order, idx) => {
                    const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    return (
                      <div key={order.id}>
                        <div className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: statusCfg.bgColor,
                              }}
                            >
                              <Package
                                className="h-4 w-4"
                                style={{ color: statusCfg.color }}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-white/90 text-sm font-medium truncate">
                                {order.order_number
                                  ? `#${order.order_number}`
                                  : `Pedido ${idx + 1}`}
                              </p>
                              <p className="text-white/40 text-xs">
                                {formatDate(order.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className="text-xs font-semibold px-2.5 py-1 rounded-full"
                              style={{
                                color: statusCfg.color,
                                backgroundColor: statusCfg.bgColor,
                              }}
                            >
                              {statusCfg.label}
                            </span>
                            <span className="text-white/90 text-sm font-bold">
                              {formatPrice(order.total)}
                            </span>
                          </div>
                        </div>
                        {idx < orders.length - 1 && (
                          <Separator className="bg-white/5" />
                        )}
                      </div>
                    );
                  })}

                  <Button
                    asChild
                    variant="outline"
                    className="w-full mt-3 bg-white/5 border-white/10 text-white/70 hover:bg-electric/10 hover:text-electric hover:border-electric/30 rounded-xl h-10 transition-all duration-300"
                  >
                    <Link href="/mis-pedidos">
                      Ver todos mis pedidos
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Decorative bottom fade ──────────────────────── */}
        <div className="h-8" />
      </div>
    </div>
  );
}
