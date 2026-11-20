"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Instagram,
  Heart,
  Bike,
} from "lucide-react";
import { PALKI_WHATSAPP_PHONE } from "@/context/CartContext";

export function Footer() {
  return (
    <footer id="ubicacion" className="border-t border-white/5 bg-[#070708] pt-14 pb-12 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/5">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-palki-red/40 bg-black/60 p-0.5">
                <Image
                  src="/images/logo.png"
                  alt="Palkisushi"
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <div>
                <span className="font-extrabold text-white text-lg tracking-wider">
                  PALKI<span className="text-palki-red">SUSHI</span>
                </span>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
                  Japanese Food & Restobar
                </div>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Auténtica cocina japonesa, tablas para picar, rolls artesanales con queso crema incluido y coctelería seleccionada en Los Niches, Curicó.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href={`https://wa.me/${PALKI_WHATSAPP_PHONE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-emerald-600 hover:text-white border border-zinc-800 flex items-center justify-center transition-colors text-zinc-300"
                title="WhatsApp Directo"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-pink-600 hover:text-white border border-zinc-800 flex items-center justify-center transition-colors text-zinc-300"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Horarios */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-palki-red" />
              <span>Horarios de Atención</span>
            </h4>
            <ul className="text-xs space-y-1.5 text-zinc-400">
              <li className="flex justify-between">
                <span>Martes a Jueves:</span>
                <span className="text-white font-medium">18:00 - 23:30</span>
              </li>
              <li className="flex justify-between">
                <span>Viernes y Sábado:</span>
                <span className="text-white font-medium">18:00 - 01:00</span>
              </li>
              <li className="flex justify-between">
                <span>Domingo:</span>
                <span className="text-white font-medium">18:00 - 23:00</span>
              </li>
              <li className="flex justify-between text-zinc-500">
                <span>Lunes:</span>
                <span>Cerrado por descanso</span>
              </li>
            </ul>
          </div>

          {/* Delivery & Cobertura */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bike className="w-4 h-4 text-palki-red" />
              <span>Zonas de Delivery</span>
            </h4>
            <ul className="text-xs space-y-1.5 text-zinc-400">
              <li className="flex justify-between">
                <span>Los Niches Centro:</span>
                <span className="text-amber-300 font-semibold">$1.500</span>
              </li>
              <li className="flex justify-between">
                <span>Alrededores Los Niches:</span>
                <span className="text-amber-300 font-semibold">$2.500</span>
              </li>
              <li className="flex justify-between">
                <span>Camino a Curicó:</span>
                <span className="text-amber-300 font-semibold">$3.500</span>
              </li>
              <li className="flex justify-between">
                <span>Curicó Urbano:</span>
                <span className="text-amber-300 font-semibold">$4.500</span>
              </li>
            </ul>
          </div>

          {/* Ubicación y Acceso al Personal */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-palki-red" />
              <span>Ubicación</span>
            </h4>
            <p className="text-xs text-zinc-400">
              Sector Los Niches, Curicó, Región del Maule, Chile.
            </p>
            <div className="pt-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-2 rounded-xl transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Gestión de Pedidos (Panel Local)</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            © {new Date().getFullYear()} Palkisushi - Japanese Food & Restobar. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Diseñado con inspiración Apple & estética japonesa para Los Niches, Curicó</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
