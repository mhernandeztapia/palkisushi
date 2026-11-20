"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Sparkles, MapPin, Menu, X, ShieldCheck, Phone } from "lucide-react";
import { useCart, PALKI_WHATSAPP_PHONE } from "@/context/CartContext";
import { formatCLP } from "@/lib/formatters";

interface HeaderProps {
  onOpenRollBuilder?: () => void;
}

export function Header({ onOpenRollBuilder }: HeaderProps) {
  const { itemCount, subtotal, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full glass-header transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-palki-red/40 bg-black/60 p-0.5 shadow-glow group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/logo.png"
                alt="Palkisushi Logo"
                fill
                className="object-cover rounded-full"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-wider text-lg sm:text-xl text-white font-sans uppercase">
                  Palki<span className="text-palki-red">sushi</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-palki-red/20 text-palki-red border border-palki-red/30">
                  Restobar
                </span>
              </div>
              <span className="text-[11px] text-palki-muted tracking-tight flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3 text-palki-red inline" />
                Los Niches, Curicó
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#carta"
              className="text-sm font-medium text-palki-muted hover:text-white transition-colors"
            >
              Carta Completa
            </a>

            <button
              onClick={onOpenRollBuilder}
              className="text-sm font-medium text-white flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-palki-red/20 to-palki-red/10 border border-palki-red/40 hover:border-palki-red hover:shadow-glow transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-palki-red" />
              <span>Arma tu Roll</span>
              <span className="text-[10px] bg-palki-red text-white px-1.5 py-0.2 rounded-full font-bold">
                10-100 pzas
              </span>
            </button>

            <a
              href="#mix-sushi"
              className="text-sm font-medium text-palki-muted hover:text-white transition-colors"
            >
              Mix 40 Piezas
            </a>

            <a
              href="#ubicacion"
              className="text-sm font-medium text-palki-muted hover:text-white transition-colors"
            >
              Horarios & Local
            </a>

            <Link
              href="/admin"
              className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-md border border-white/10 hover:border-white/20 transition-all"
              title="Panel de Pedidos Cocina / Caja"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Panel Local</span>
            </Link>
          </nav>

          {/* Actions: WhatsApp Quick Contact + Cart Button */}
          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/${PALKI_WHATSAPP_PHONE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-900/80 border border-zinc-800 px-3 py-2 rounded-full hover:border-emerald-500/50 transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Directo</span>
            </a>

            <button
              onClick={openCart}
              className="relative flex items-center gap-2.5 bg-palki-card hover:bg-palki-cardHover border border-palki-border hover:border-palki-red/50 text-white px-4 py-2.5 rounded-full transition-all duration-200 shadow-card hover:shadow-glow group"
              aria-label="Abrir Carrito"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-white group-hover:text-palki-red transition-colors" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-palki-red text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left text-xs leading-tight">
                <span className="text-[10px] text-palki-muted font-normal uppercase">
                  {itemCount === 1 ? "1 item" : `${itemCount} items`}
                </span>
                <span className="font-bold text-white">
                  {subtotal > 0 ? formatCLP(subtotal) : "Carrito"}
                </span>
              </div>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 px-2 border-t border-zinc-800/80 bg-black/95 backdrop-blur-xl animate-fade-in space-y-3">
            <a
              href="#carta"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-200 hover:bg-zinc-900"
            >
              Carta Completa
            </a>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenRollBuilder) onOpenRollBuilder();
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-white flex items-center justify-between bg-palki-red/10 border border-palki-red/30"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-palki-red" />
                Arma tu Roll (10 a 100 pzas)
              </span>
              <span className="text-xs bg-palki-red text-white px-2 py-0.5 rounded-full font-bold">
                Personalizar
              </span>
            </button>

            <a
              href="#mix-sushi"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-200 hover:bg-zinc-900"
            >
              Mix 40 Piezas
            </a>

            <a
              href="#ubicacion"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-200 hover:bg-zinc-900"
            >
              Ubicación & Horarios (Los Niches)
            </a>

            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-amber-400 bg-amber-950/20 border border-amber-800/40"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Panel Interno del Local</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
