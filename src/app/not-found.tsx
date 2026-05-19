import Link from "next/link";
import { Dumbbell, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-deep flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-electric/10 flex items-center justify-center mx-auto mb-8">
          <Dumbbell className="h-10 w-10 text-electric" />
        </div>

        {/* 404 */}
        <h1 className="text-7xl md:text-9xl font-black text-white/10 mb-4">404</h1>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-4">
          Página no <span className="text-electric">Encontrada</span>
        </h2>

        {/* Description */}
        <p className="text-white/50 text-sm md:text-base max-w-sm mx-auto mb-8 leading-relaxed">
          Lo sentimos, la página que buscas no existe o ha sido movida.
          Explora nuestro catálogo o vuelve al inicio.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            asChild
            className="bg-electric hover:bg-electric/90 text-white font-bold px-8 py-5 text-sm rounded-xl shadow-[0_0_30px_rgba(0,153,255,0.3)] hover:shadow-[0_0_40px_rgba(0,153,255,0.5)] transition-all duration-300 uppercase tracking-wider"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Inicio
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/10 text-white/60 hover:text-white hover:bg-white/5 px-8 py-5 text-sm rounded-xl uppercase tracking-wider"
          >
            <Link href="/productos">Ver Productos</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
