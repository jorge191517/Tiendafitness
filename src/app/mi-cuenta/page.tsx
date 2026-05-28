"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  MapPin,
  Package,
  LogOut,
  ChevronRight,
  Home,
  Shield,
  Pencil,
  Check,
  X,
  Loader2,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { fadeInUp } from "@/lib/animations";

interface ProfileData {
  full_name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
}

type EditingField = "name" | "phone" | "email" | "password" | "address" | null;

export default function MiCuentaPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",
    country: "España",
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditingField>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        setLoading(false);
        return;
      }

      setUser(authUser);
      setNewEmail(authUser.email ?? "");

      // Load profile
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, phone, address, city, province, postal_code, country, role")
          .eq("id", authUser.id)
          .single();

        if (profileData) {
          setProfile({
            full_name: profileData.full_name ?? authUser.user_metadata?.full_name ?? "",
            phone: profileData.phone ?? "",
            address: profileData.address ?? "",
            city: profileData.city ?? "",
            province: profileData.province ?? "",
            postal_code: profileData.postal_code ?? "",
            country: profileData.country ?? "España",
          });
          setIsAdmin(profileData.role === "admin");
        }
      } catch {
        // Profile may not exist yet — use auth metadata
        setProfile((prev) => ({
          ...prev,
          full_name: authUser.user_metadata?.full_name ?? "",
        }));
      }

      setLoading(false);
    }
    load();
  }, []);

  const showFeedback = (type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveProfile = async (field: EditingField) => {
    if (!user) return;
    setSaving(true);

    const supabase = createClient();

    try {
      if (field === "password") {
        if (newPassword.length < 6) {
          showFeedback("error", "La contraseña debe tener al menos 6 caracteres");
          setSaving(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          showFeedback("error", "Las contraseñas no coinciden");
          setSaving(false);
          return;
        }
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          showFeedback("error", error.message);
        } else {
          showFeedback("success", "Contraseña actualizada correctamente");
          setNewPassword("");
          setConfirmPassword("");
          setEditing(null);
        }
      } else if (field === "email") {
        if (!newEmail || newEmail === user.email) {
          setEditing(null);
          setSaving(false);
          return;
        }
        const { error } = await supabase.auth.updateUser({ email: newEmail });
        if (error) {
          showFeedback("error", error.message);
        } else {
          showFeedback("success", "Se ha enviado un correo de confirmación a tu nueva dirección");
          setEditing(null);
        }
      } else {
        // Save to profiles table
        const updates: Record<string, string> = {};
        if (field === "name") updates.full_name = profile.full_name;
        if (field === "phone") updates.phone = profile.phone;
        if (field === "address") {
          updates.address = profile.address;
          updates.city = profile.city;
          updates.province = profile.province;
          updates.postal_code = profile.postal_code;
          updates.country = profile.country;
        }

        const { error } = await supabase
          .from("profiles")
          .upsert({ id: user.id, ...updates }, { onConflict: "id" });

        if (error) {
          showFeedback("error", "Error al guardar los cambios");
        } else {
          // Also update auth metadata for name
          if (field === "name") {
            await supabase.auth.updateUser({ data: { full_name: profile.full_name } });
          }
          showFeedback("success", "Datos actualizados correctamente");
          setEditing(null);
        }
      }
    } catch {
      showFeedback("error", "Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-electric border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
        <div className="bg-[#1e293b]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center max-w-md w-full">
          <User className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Inicia sesión</h2>
          <p className="text-white/50 text-sm mb-6">Necesitas iniciar sesión para acceder a tu cuenta.</p>
          <Link href="/auth/login">
            <Button className="bg-electric hover:bg-electric/90 text-white font-semibold h-11 px-6 rounded-xl">
              Iniciar sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayName = profile.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario";

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="h-20" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* Header */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all duration-300"
          >
            <Home className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Mi Cuenta</h1>
            <p className="text-white/50 mt-0.5 text-sm">Gestiona tu perfil y preferencias</p>
          </div>
        </motion.div>

        {/* Feedback banner */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${
              feedback.type === "success"
                ? "bg-lime/10 border border-lime/30 text-lime"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}
          >
            {feedback.msg}
          </motion.div>
        )}

        {/* ─── Profile Card ─── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-[#1e293b] rounded-2xl border border-white/[0.08] p-5 sm:p-6 mb-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-electric/10 border-2 border-electric/30 flex items-center justify-center shrink-0">
              <span className="text-electric font-black text-xl">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-lg truncate">{displayName}</p>
              <p className="text-white/40 text-sm truncate">{user.email}</p>
            </div>
          </div>
        </motion.div>

        {/* ─── Personal Info ─── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-[#1e293b] rounded-2xl border border-white/[0.08] overflow-hidden mb-4"
        >
          <div className="px-5 sm:px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
            <User className="h-4 w-4 text-electric" />
            <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">Información Personal</h2>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {/* Name */}
            <div className="px-5 sm:px-6 py-4">
              <div className="flex items-center justify-between mb-1">
                <Label className="text-white/40 text-xs uppercase tracking-wider">Nombre completo</Label>
                {editing !== "name" && (
                  <button
                    onClick={() => setEditing("name")}
                    className="text-electric/70 hover:text-electric transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {editing === "name" ? (
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    value={profile.full_name}
                    onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white h-10 text-sm"
                    placeholder="Tu nombre completo"
                  />
                  <button
                    onClick={() => handleSaveProfile("name")}
                    disabled={saving}
                    className="w-10 h-10 rounded-lg bg-lime/10 border border-lime/30 flex items-center justify-center text-lime hover:bg-lime/20 transition-colors shrink-0 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <p className="text-white text-sm font-medium mt-1">{profile.full_name || "Sin nombre"}</p>
              )}
            </div>

            {/* Phone */}
            <div className="px-5 sm:px-6 py-4">
              <div className="flex items-center justify-between mb-1">
                <Label className="text-white/40 text-xs uppercase tracking-wider">Teléfono</Label>
                {editing !== "phone" && (
                  <button
                    onClick={() => setEditing("phone")}
                    className="text-electric/70 hover:text-electric transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {editing === "phone" ? (
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white h-10 text-sm"
                    placeholder="+34 600 000 000"
                    type="tel"
                  />
                  <button
                    onClick={() => handleSaveProfile("phone")}
                    disabled={saving}
                    className="w-10 h-10 rounded-lg bg-lime/10 border border-lime/30 flex items-center justify-center text-lime hover:bg-lime/20 transition-colors shrink-0 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <p className="text-white text-sm font-medium mt-1 flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-white/30" />
                  {profile.phone || "Sin teléfono"}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="px-5 sm:px-6 py-4">
              <div className="flex items-center justify-between mb-1">
                <Label className="text-white/40 text-xs uppercase tracking-wider">Correo electrónico</Label>
                {editing !== "email" && (
                  <button
                    onClick={() => setEditing("email")}
                    className="text-electric/70 hover:text-electric transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {editing === "email" ? (
                <div className="space-y-3 mt-2">
                  <Input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-white h-10 text-sm"
                    placeholder="tu@email.com"
                    type="email"
                  />
                  <p className="text-white/30 text-xs">Recibirás un correo de confirmación en tu nueva dirección.</p>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleSaveProfile("email")}
                      disabled={saving}
                      size="sm"
                      className="bg-electric hover:bg-electric/90 text-white font-semibold h-9 px-4 text-xs"
                    >
                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Check className="h-3.5 w-3.5 mr-1.5" />}
                      Guardar
                    </Button>
                    <Button
                      onClick={() => { setEditing(null); setNewEmail(user.email ?? ""); }}
                      variant="ghost"
                      size="sm"
                      className="text-white/40 hover:text-white h-9 px-3 text-xs"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-white text-sm font-medium mt-1 flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-white/30" />
                  {user.email}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* ─── Password ─── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-[#1e293b] rounded-2xl border border-white/[0.08] overflow-hidden mb-4"
        >
          <button
            onClick={() => setEditing(editing === "password" ? null : "password")}
            className="w-full px-5 sm:px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lock className="h-4 w-4 text-lime" />
              <div className="text-left">
                <p className="text-white font-medium text-sm">Cambiar contraseña</p>
                <p className="text-white/30 text-xs mt-0.5">Actualiza tu contraseña de acceso</p>
              </div>
            </div>
            <ChevronRight className={`h-4 w-4 text-white/30 transition-transform duration-300 ${editing === "password" ? "rotate-90" : ""}`} />
          </button>

          {editing === "password" && (
            <div className="px-5 sm:px-6 pb-5 space-y-3 border-t border-white/[0.06] pt-4">
              <div className="space-y-2">
                <Label className="text-white/50 text-xs">Nueva contraseña</Label>
                <Input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  className="bg-white/5 border-white/10 text-white h-10 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/50 text-xs">Confirmar contraseña</Label>
                <Input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                  placeholder="Repite la nueva contraseña"
                  className="bg-white/5 border-white/10 text-white h-10 text-sm"
                />
              </div>
              <Button
                onClick={() => handleSaveProfile("password")}
                disabled={saving || !newPassword}
                size="sm"
                className="bg-lime hover:bg-lime/90 text-deep font-semibold h-9 px-4 text-xs"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Shield className="h-3.5 w-3.5 mr-1.5" />}
                Actualizar contraseña
              </Button>
            </div>
          )}
        </motion.div>

        {/* ─── Shipping Address ─── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-[#1e293b] rounded-2xl border border-white/[0.08] overflow-hidden mb-4"
        >
          <button
            onClick={() => setEditing(editing === "address" ? null : "address")}
            className="w-full px-5 sm:px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-yellow-400" />
              <div className="text-left">
                <p className="text-white font-medium text-sm">Dirección de envío</p>
                <p className="text-white/30 text-xs mt-0.5">
                  {profile.address
                    ? `${profile.city ? profile.city + ", " : ""}${profile.province || ""}`
                    : "Añade tu dirección de envío"}
                </p>
              </div>
            </div>
            <ChevronRight className={`h-4 w-4 text-white/30 transition-transform duration-300 ${editing === "address" ? "rotate-90" : ""}`} />
          </button>

          {editing === "address" && (
            <div className="px-5 sm:px-6 pb-5 space-y-3 border-t border-white/[0.06] pt-4">
              <div className="space-y-2">
                <Label className="text-white/50 text-xs">Calle y número</Label>
                <Input
                  value={profile.address}
                  onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white h-10 text-sm"
                  placeholder="Calle Mayor 10, 3ºA"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-white/50 text-xs">Ciudad</Label>
                  <Input
                    value={profile.city}
                    onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white h-10 text-sm"
                    placeholder="Madrid"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/50 text-xs">Provincia</Label>
                  <Input
                    value={profile.province}
                    onChange={(e) => setProfile((p) => ({ ...p, province: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white h-10 text-sm"
                    placeholder="Madrid"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-white/50 text-xs">Código Postal</Label>
                  <Input
                    value={profile.postal_code}
                    onChange={(e) => setProfile((p) => ({ ...p, postal_code: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white h-10 text-sm"
                    placeholder="28001"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/50 text-xs">País</Label>
                  <Input
                    value={profile.country}
                    onChange={(e) => setProfile((p) => ({ ...p, country: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white h-10 text-sm"
                    placeholder="España"
                  />
                </div>
              </div>
              <Button
                onClick={() => handleSaveProfile("address")}
                disabled={saving}
                size="sm"
                className="bg-electric hover:bg-electric/90 text-white font-semibold h-9 px-4 text-xs"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Check className="h-3.5 w-3.5 mr-1.5" />}
                Guardar dirección
              </Button>
            </div>
          )}
        </motion.div>

        {/* ─── Quick Links ─── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="space-y-2 mb-6"
        >
          <Link
            href="/mis-pedidos"
            className="flex items-center justify-between bg-[#1e293b] rounded-2xl border border-white/[0.08] px-5 sm:px-6 py-4 hover:bg-white/[0.02] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Package className="h-4 w-4 text-electric" />
              <div>
                <p className="text-white font-medium text-sm">Mis Pedidos</p>
                <p className="text-white/30 text-xs mt-0.5">Consulta y haz seguimiento de tus pedidos</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors" />
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center justify-between bg-electric/5 rounded-2xl border border-electric/20 px-5 sm:px-6 py-4 hover:bg-electric/10 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-electric" />
                <div>
                  <p className="text-electric font-medium text-sm">Panel Admin</p>
                  <p className="text-electric/40 text-xs mt-0.5">Gestión de la tienda</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-electric/30 group-hover:text-electric/60 transition-colors" />
            </Link>
          )}
        </motion.div>

        {/* ─── Logout ─── */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 bg-red-500/5 border border-red-500/20 rounded-2xl px-5 py-4 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors font-medium text-sm"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </motion.div>
      </div>
    </div>
  );
}
