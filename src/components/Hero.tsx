"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, Utensils, MapPin, Clock, Bike, ShieldAlert, Award } from "lucide-react";

interface HeroProps {
  onOpenRollBuilder: () => void;
}

export function Hero({ onOpenRollBuilder }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-6 pb-12 md:py-16">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-palki-red/15 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-medium text-zinc-300 backdrop-blur-md shadow-card">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Restobar & Delivery abierto en Los Niches, Curicó</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Tradición japonesa, <br />
            <span className="bg-gradient-to-r from-white via-zinc-200 to-palki-red bg-clip-text text-transparent">
              experiencia de autor.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-palki-muted leading-relaxed font-normal">
            Rolls artesanales con queso crema incluido, tablas abundantes para picar,
            ceviches frescos y coctelería seleccionada. Disfruta en nuestro restobar o pide a domicilio.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onOpenRollBuilder}
              className="px-6 py-3.5 rounded-full bg-palki-red hover:bg-palki-redHover text-white font-semibold text-sm sm:text-base flex items-center gap-2 shadow-glow hover:shadow-glow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Arma tu Roll Paso a Paso</span>
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                Desde $4.000
              </span>
            </button>

            <a
              href="#carta"
              className="px-6 py-3.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-white font-semibold text-sm sm:text-base flex items-center gap-2 border border-zinc-700/80 transition-all hover:border-zinc-500"
            >
              <Utensils className="w-4 h-4 text-palki-red" />
              <span>Ver Toda la Carta</span>
            </a>
          </div>
        </div>

        {/* Bento Grid Highlights (Apple style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
          {/* Bento Item 1: Arma tu Roll */}
          <div
            onClick={onOpenRollBuilder}
            className="md:col-span-2 glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden cursor-pointer group border border-white/10"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-palki-red/10 rounded-full blur-2xl group-hover:bg-palki-red/20 transition-all" />
            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-palki-red bg-palki-red/10 px-2.5 py-1 rounded-full border border-palki-red/30">
                  Configurador Interactivo
                </span>
                <span className="text-xs text-zinc-400">10 a 100 Piezas</span>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-palki-red transition-colors">
                  Sushi: Arma tu Roll a tu Medida
                </h3>
                <p className="text-sm text-palki-muted mt-1.5">
                  Elige tus proteínas (salmón, pulpo, pollo teriyaki, camarón apanado),
                  verduras frescas y tus envolturas favoritas en tempura crocante, queso o palta.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold bg-amber-950/40 border border-amber-800/40 px-3 py-1.5 rounded-lg">
                  <Award className="w-4 h-4" />
                  <span>Todos incluyen queso crema</span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Comenzar ahora →
                </span>
              </div>
            </div>
          </div>

          {/* Bento Item 2: Delivery Zonas */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between space-y-4 border border-white/10">
            <div>
              <div className="w-10 h-10 rounded-xl bg-palki-red/20 border border-palki-red/30 flex items-center justify-center text-palki-red mb-3">
                <Bike className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Delivery Local</h3>
              <p className="text-xs text-palki-muted mt-1">
                Despacho directo en Los Niches Centro ($1.500), alrededores y Curicó Urbano ($4.500).
              </p>
            </div>
            <div className="bg-red-950/30 border border-red-800/40 p-2.5 rounded-xl text-[11px] text-red-200 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-palki-red shrink-0 mt-0.5" />
              <span>Pago verificado obligatorio antes de iniciar el despacho.</span>
            </div>
          </div>

          {/* Bento Item 3: Local & Horarios */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between space-y-4 border border-white/10">
            <div>
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400 mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Restobar & Barra</h3>
              <p className="text-xs text-palki-muted mt-1">
                Mesas interiores, terraza y barra de coctelería. Jueves de Happy Hour 2x1 en tragos.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
              <MapPin className="w-4 h-4 text-palki-red" />
              <span>Los Niches, Curicó</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
