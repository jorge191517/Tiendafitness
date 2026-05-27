"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ArrowLeft,
  Trash2,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import WhatsAppButton from "@/components/ui/whatsapp-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore, useCartTotals, type CartItem } from "@/store/cart-store";
import { createClient } from "@/lib/supabase/client";
import { createOrder, type CheckoutResult } from "./actions";
import Link from "next/link";

interface CustomerForm { name: string; email: string; phone: string; }
interface AddressForm { street: string; city: string; province: string; postal_code: string; country: string; }
type CheckoutStep = "form" | "loading" | "success" | "error";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const { totalItems, total } = useCartTotals();

  const [step, setStep] = useState<CheckoutStep>("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const [customer, setCustomer] = useState<CustomerForm>({ name: "", email: "", phone: "" });
  const [address, setAddress] = useState<AddressForm>({ street: "", city: "", province: "", postal_code: "", country: "España" });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user);
      if (data.user) {
        setCustomer((prev) => ({
          ...prev,
          email: data.user?.email ?? "",
          name: data.user?.user_metadata?.full_name ?? data.user?.email?.split("@")[0] ?? "",
        }));
      }
    });
  }, []);

  const isFormValid = (): boolean => {
    return (
      customer.name.trim() !== "" && customer.email.trim() !== "" && customer.phone.trim() !== "" &&
      address.street.trim() !== "" && address.city.trim() !== "" && address.province.trim() !== "" &&
      address.postal_code.trim() !== "" && address.country.trim() !== "" && items.length > 0
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    setStep("loading");
    setErrorMessage("");

    try {
      const result: CheckoutResult = await createOrder({
        customer: { name: customer.name, email: customer.email, phone: customer.phone },
        address: { street: address.street, city: address.city, province: address.province, postal_code: address.postal_code, country: address.country },
        items: items.map((item) => ({
          name: item.name, slug: item.slug, price: item.price,
          colorName: item.colorName, selectedSize: item.selectedSize,
          quantity: item.quantity, image: item.image,
        })),
      });

      if (!result.success) {
        setErrorMessage(result.error ?? "Error desconocido al procesar tu pedido.");
        setStep("error");
        return;
      }
      clearCart();
      setStep("success");
    } catch (err) {
      console.error("Error al procesar el pedido:", err);
      setErrorMessage(err instanceof Error ? err.message : "Ha ocurrido un error. Inténtalo de nuevo.");
      setStep("error");
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
        <Card className="w-full max-w-lg bg-[#1e293b] border-white/[0.08] shadow-xl shadow-black/20">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-electric/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-electric" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-3">¡Pedido Recibido!</h2>
            <p className="text-white/60 mb-2">Tu pedido ha sido procesado correctamente. Recibirás un correo de confirmación en breve.</p>
            <p className="text-sm text-white/40 mb-8">Número de pedido: #{Date.now().toString(36).toUpperCase()}</p>
            <Button onClick={() => router.push("/")} className="bg-electric hover:bg-electric/90 text-white font-bold uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(0,153,255,0.3)]">Volver a la Tienda</Button>
            <div className="mt-4"><WhatsAppButton message="Hola, necesito ayuda con mi pedido en Tienda Fitness Pro." label="Ayuda con mi pedido" variant="outline" className="rounded-xl" /></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (items.length === 0 && step !== "success") {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
        <Card className="w-full max-w-lg bg-[#1e293b] border-white/[0.08] shadow-xl shadow-black/20">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-[#1e293b] rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-10 w-10 text-white/30" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-3">Tu Carrito está Vacío</h2>
            <p className="text-white/60 mb-8">Añade productos a tu carrito para realizar un pedido.</p>
            <Button asChild className="bg-electric hover:bg-electric/90 text-white font-bold uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(0,153,255,0.3)]"><Link href="/productos">Ver Productos</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="h-20" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10 rounded-full" asChild>
            <Link href="/productos"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Finalizar <span className="text-electric">Pedido</span></h1>
            <p className="text-sm text-white/40">{totalItems} {totalItems === 1 ? "producto" : "productos"} en tu carrito</p>
          </div>
        </div>

        {isAuthenticated === false && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-electric/5 border border-electric/20">
            <AlertCircle className="h-5 w-5 text-electric shrink-0" />
            <p className="text-sm text-white/70">No has iniciado sesión. Puedes continuar como invitado, pero <Link href="/auth/login" className="text-electric hover:underline font-semibold">inicia sesión</Link> para hacer seguimiento de tus pedidos.</p>
          </div>
        )}

        {step === "error" && errorMessage && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-300">{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Customer data */}
            <Card className="bg-[#1e293b] border-white/[0.08]">
              <CardHeader className="pb-4"><CardTitle className="flex items-center gap-2 text-white text-lg"><CreditCard className="h-5 w-5 text-electric" />Datos del Cliente</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2"><Label htmlFor="name" className="text-white/70 text-sm">Nombre completo *</Label><Input id="name" type="text" placeholder="Tu nombre" value={customer.name} onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))} className="bg-[#111827] border-white/10 text-white placeholder:text-white/30 focus:border-electric focus:ring-electric/20" /></div>
                  <div className="space-y-2"><Label htmlFor="email" className="text-white/70 text-sm">Email *</Label><Input id="email" type="email" placeholder="tu@email.com" value={customer.email} onChange={(e) => setCustomer((p) => ({ ...p, email: e.target.value }))} className="bg-[#111827] border-white/10 text-white placeholder:text-white/30 focus:border-electric focus:ring-electric/20" /></div>
                  <div className="space-y-2"><Label htmlFor="phone" className="text-white/70 text-sm">Teléfono *</Label><Input id="phone" type="tel" placeholder="+34 600 000 000" value={customer.phone} onChange={(e) => setCustomer((p) => ({ ...p, phone: e.target.value }))} className="bg-[#111827] border-white/10 text-white placeholder:text-white/30 focus:border-electric focus:ring-electric/20" /></div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping address */}
            <Card className="bg-[#1e293b] border-white/[0.08]">
              <CardHeader className="pb-4"><CardTitle className="flex items-center gap-2 text-white text-lg"><Truck className="h-5 w-5 text-electric" />Dirección de Envío</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label htmlFor="street" className="text-white/70 text-sm">Calle y número *</Label><Input id="street" type="text" placeholder="Calle Mayor 10, 3ºA" value={address.street} onChange={(e) => setAddress((p) => ({ ...p, street: e.target.value }))} className="bg-[#111827] border-white/10 text-white placeholder:text-white/30 focus:border-electric focus:ring-electric/20" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="city" className="text-white/70 text-sm">Ciudad *</Label><Input id="city" type="text" placeholder="Madrid" value={address.city} onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))} className="bg-[#111827] border-white/10 text-white placeholder:text-white/30 focus:border-electric focus:ring-electric/20" /></div>
                  <div className="space-y-2"><Label htmlFor="province" className="text-white/70 text-sm">Provincia *</Label><Input id="province" type="text" placeholder="Madrid" value={address.province} onChange={(e) => setAddress((p) => ({ ...p, province: e.target.value }))} className="bg-[#111827] border-white/10 text-white placeholder:text-white/30 focus:border-electric focus:ring-electric/20" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="postal_code" className="text-white/70 text-sm">Código Postal *</Label><Input id="postal_code" type="text" placeholder="28001" value={address.postal_code} onChange={(e) => setAddress((p) => ({ ...p, postal_code: e.target.value }))} className="bg-[#111827] border-white/10 text-white placeholder:text-white/30 focus:border-electric focus:ring-electric/20" /></div>
                  <div className="space-y-2"><Label htmlFor="country" className="text-white/70 text-sm">País *</Label><Input id="country" type="text" placeholder="España" value={address.country} onChange={(e) => setAddress((p) => ({ ...p, country: e.target.value }))} className="bg-[#111827] border-white/10 text-white placeholder:text-white/30 focus:border-electric focus:ring-electric/20" /></div>
                </div>
              </CardContent>
            </Card>

            {/* Mobile cart items */}
            <Card className="bg-[#1e293b] border-white/[0.08] lg:hidden">
              <CardHeader className="pb-4"><CardTitle className="flex items-center gap-2 text-white text-lg"><ShoppingCart className="h-5 w-5 text-electric" />Tu Carrito ({totalItems})</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (<CartItemRow key={item.cartKey} item={item} onUpdateQuantity={updateQuantity} onRemove={removeItem} />))}
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <Card className="bg-[#1e293b] border-white/[0.08] sticky top-24">
              <CardHeader className="pb-4"><CardTitle className="text-white text-lg">Resumen del Pedido</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="hidden lg:block space-y-3 max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.cartKey} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#111827] overflow-hidden shrink-0"><img src={item.image} alt={item.name} className="w-full h-full object-cover" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white/90 truncate">{item.name}</p>
                        <p className="text-xs text-white/40">{item.colorName}{item.selectedSize ? ` · Talla ${item.selectedSize}` : ""} · {item.quantity} × {item.price.toFixed(2)} €</p>
                      </div>
                      <span className="text-sm font-bold text-white shrink-0">{(item.price * item.quantity).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
                <Separator className="bg-white/10" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-white/50">Subtotal</span><span className="text-white">{total.toFixed(2)} €</span></div>
                  <div className="flex justify-between text-sm"><span className="text-white/50">Envío</span><span className="text-lime font-semibold">Gratis</span></div>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between items-baseline"><span className="text-white font-bold text-lg">Total</span><span className="text-2xl font-black text-white">{total.toFixed(2)} €</span></div>
                <Button onClick={handleSubmit} disabled={!isFormValid() || step === "loading"} className="w-full bg-electric hover:bg-electric/90 text-white font-bold py-6 text-base rounded-xl shadow-[0_0_30px_rgba(0,153,255,0.3)] hover:shadow-[0_0_40px_rgba(0,153,255,0.5)] transition-all duration-300 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none">
                  {step === "loading" ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Procesando...</> : <><ShieldCheck className="h-5 w-5 mr-2" />Finalizar Pedido</>}
                </Button>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-center gap-2 text-white/30 text-xs"><ShieldCheck className="h-3.5 w-3.5" /><span>Pago seguro y datos protegidos</span></div>
                  <WhatsAppButton message="Hola, necesito ayuda con mi pedido en Tienda Fitness Pro." label="¿Necesitas ayuda?" variant="ghost" className="w-full text-xs justify-center" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartItemRow({ item, onUpdateQuantity, onRemove }: { item: CartItem; onUpdateQuantity: (cartKey: string, qty: number) => void; onRemove: (cartKey: string) => void; }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#111827] border border-white/[0.06]">
      <div className="w-16 h-16 rounded-lg bg-[#1e293b] overflow-hidden shrink-0"><img src={item.image} alt={item.name} className="w-full h-full object-cover" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white/90 truncate">{item.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="w-3 h-3 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: item.color }} />
          <span className="text-xs text-white/50">{item.colorName}</span>
          {item.selectedSize && <><span className="text-white/20">·</span><span className="text-xs text-white/50">Talla {item.selectedSize}</span></>}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-bold text-white">{item.price.toFixed(2)} €</span>
          {item.oldPrice && <span className="text-xs text-white/30 line-through">{item.oldPrice.toFixed(2)} €</span>}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/10 rounded-md" onClick={() => onUpdateQuantity(item.cartKey, item.quantity - 1)}><Minus className="h-3.5 w-3.5" /></Button>
          <span className="text-sm font-bold text-white w-6 text-center">{item.quantity}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/10 rounded-md" onClick={() => onUpdateQuantity(item.cartKey, item.quantity + 1)}><Plus className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Button variant="ghost" size="icon" className="h-7 w-7 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-md" onClick={() => onRemove(item.cartKey)}><Trash2 className="h-3.5 w-3.5" /></Button>
        <span className="text-sm font-black text-white">{(item.price * item.quantity).toFixed(2)} €</span>
      </div>
    </div>
  );
}
