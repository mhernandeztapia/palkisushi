"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { PromoBanner } from "@/components/PromoBanner";
import { Hero } from "@/components/Hero";
import { CategoryNav } from "@/components/CategoryNav";
import { ProductCard } from "@/components/ProductCard";
import { RollBuilderModal } from "@/components/RollBuilderModal";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import {
  Category,
  DeliveryZone,
  Promotion,
  RollOption,
} from "@/types";
import { Sparkles, ArrowRight, Award, Flame, Bike, MapPin } from "lucide-react";
import { formatCLP } from "@/lib/formatters";

interface PalkiClientViewProps {
  categories: Category[];
  rollOptions: RollOption[];
  promotions: Promotion[];
  deliveryZones: DeliveryZone[];
}

export function PalkiClientView({
  categories,
  rollOptions,
  promotions,
  deliveryZones,
}: PalkiClientViewProps) {
  const [isRollBuilderOpen, setIsRollBuilderOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(
    categories[0]?.slug || "tablas"
  );

  const handleSelectCategory = (slug: string) => {
    setActiveCategory(slug);
    const element = document.getElementById(slug);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">
      {/* 1. Dynamic Promo Banner */}
      <PromoBanner promotions={promotions} />

      {/* 2. Glassmorphic Header */}
      <Header onOpenRollBuilder={() => setIsRollBuilderOpen(true)} />

      {/* 3. Hero Section (Apple Minimalism + Japanese Aesthetic) */}
      <Hero onOpenRollBuilder={() => setIsRollBuilderOpen(true)} />

      {/* 4. Sticky Category Bar */}
      <CategoryNav
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onOpenRollBuilder={() => setIsRollBuilderOpen(true)}
      />

      {/* 5. Main Menu Sections */}
      <main id="carta" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {categories.map((cat) => {
          const isArmaRoll = cat.slug === "arma-tu-roll";

          return (
            <section
              key={cat.id}
              id={cat.slug}
              className="scroll-mt-36 space-y-6"
            >
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/5 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-palki-red" />
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      {cat.name}
                    </h2>
                  </div>
                  {cat.description && (
                    <p className="text-xs sm:text-sm text-palki-muted mt-1">
                      {cat.description}
                    </p>
                  )}
                </div>

                {isArmaRoll && (
                  <button
                    onClick={() => setIsRollBuilderOpen(true)}
                    className="self-start sm:self-auto px-4 py-2 rounded-full bg-palki-red hover:bg-palki-redHover text-white text-xs font-bold flex items-center gap-1.5 shadow-glow transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Abrir Configurador</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Special Section: "Sushi - Arma tu Roll" Interactive Apple Card */}
              {isArmaRoll ? (
                <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-palki-red/30 relative overflow-hidden bg-gradient-to-br from-zinc-900/90 via-black to-zinc-950">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-palki-red/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 max-w-3xl space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/40 text-amber-300 text-xs font-bold">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Todos los rolls incluyen queso crema sin costo extra</span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl sm:text-3xl font-black text-white">
                        Arma tu combinación perfecta (10 a 100 piezas)
                      </h3>
                      <p className="text-sm text-zinc-300 leading-relaxed">
                        Selecciona la cantidad de piezas deseadas y personaliza cada roll de 10 piezas
                        con tus ingredientes favoritos: salmón, atún, camarón apanado, pulpo, palta,
                        champiñones, y envolturas en tempura crocante, queso crema o palta.
                      </p>
                    </div>

                    {/* Precios base rápidos */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-2xl bg-black/50 border border-white/5 text-center">
                        <div className="font-bold text-white text-sm">10 Piezas</div>
                        <div className="text-palki-red font-extrabold mt-0.5">$4.000</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-black/50 border border-white/5 text-center">
                        <div className="font-bold text-white text-sm">20 Piezas</div>
                        <div className="text-palki-red font-extrabold mt-0.5">$8.000</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-black/50 border border-white/5 text-center">
                        <div className="font-bold text-white text-sm">40 Piezas</div>
                        <div className="text-palki-red font-extrabold mt-0.5">$16.000</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-black/50 border border-white/5 text-center">
                        <div className="font-bold text-white text-sm">100 Piezas</div>
                        <div className="text-palki-red font-extrabold mt-0.5">$40.000</div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => setIsRollBuilderOpen(true)}
                        className="px-6 py-3.5 rounded-full bg-palki-red hover:bg-palki-redHover text-white font-bold text-sm shadow-glow hover:shadow-glow-lg transition-all flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Comenzar a Armar mi Roll</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Regular Bento Grid for Category Products */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {cat.products && cat.products.length > 0 ? (
                    cat.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  ) : (
                    <div className="col-span-full py-8 text-center text-xs text-zinc-500">
                      No hay productos disponibles en esta categoría por el momento.
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}

        {/* Bento Extra: Zonas de Delivery & Regla de Negocio */}
        <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-palki-red/20 border border-palki-red/30 flex items-center justify-center text-palki-red">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Zonas y Tarifas de Delivery Palkisushi
                </h3>
                <p className="text-xs text-zinc-400">
                  Despachamos directo desde Los Niches hacia sectores rurales y Curicó urbano.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/60 border border-red-800/40 text-red-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-palki-red" />
              <span>Pago verificado antes de iniciar despacho</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {deliveryZones.map((zone) => (
              <div
                key={zone.id}
                className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {zone.name}
                  </span>
                  <span className="text-sm font-extrabold text-amber-300">
                    {formatCLP(zone.price)}
                  </span>
                </div>
                {zone.estimatedMinutes && (
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <span>⏱️ Estimado:</span>
                    <span>{zone.estimatedMinutes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <Footer />

      {/* 7. Interactive Apple-Style Roll Customizer Modal */}
      <RollBuilderModal
        isOpen={isRollBuilderOpen}
        onClose={() => setIsRollBuilderOpen(false)}
        rollOptions={rollOptions}
      />

      {/* 8. Sliding Cart Drawer */}
      <CartDrawer deliveryZones={deliveryZones} />
    </div>
  );
}
