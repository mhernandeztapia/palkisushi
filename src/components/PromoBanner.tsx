"use client";

import React, { useState } from "react";
import { Sparkles, X, Wine, Flame, Calendar, Tag } from "lucide-react";
import { Promotion } from "@/types";

interface PromoBannerProps {
  promotions: Promotion[];
}

export function PromoBanner({ promotions }: PromoBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !promotions || promotions.length === 0) return null;

  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
  const currentMonth = now.getMonth() + 1; // 1 to 12
  const currentWeekOfMonth = Math.ceil(now.getDate() / 7);

  // Filtrar promociones activas para el día/semana/mes de hoy
  const activeForToday = promotions.filter((p) => {
    if (!p.isActive) return false;

    if (p.scheduleType === "ALWAYS") return true;

    if (p.scheduleType === "DAY_OF_WEEK") {
      return p.dayOfWeek === currentDayOfWeek;
    }

    if (p.scheduleType === "WEEK") {
      return p.weekOfMonth === currentWeekOfMonth;
    }

    if (p.scheduleType === "MONTH") {
      return p.monthOfYear === currentMonth;
    }

    // Compatibilidad si dayOfWeek está establecido directamente
    if (p.dayOfWeek !== null && p.dayOfWeek !== undefined) {
      return p.dayOfWeek === currentDayOfWeek;
    }

    return true;
  });

  // Si hay promociones específicas para hoy, usar la primera de ellas; de lo contrario, una promoción activa general
  const activePromo =
    activeForToday.length > 0
      ? activeForToday[0]
      : promotions.find((p) => p.isActive);

  if (!activePromo) return null;

  const isDrinkOrHappyHour =
    activePromo.badge?.toLowerCase().includes("happy") ||
    activePromo.title?.toLowerCase().includes("trago") ||
    activePromo.title?.toLowerCase().includes("2x1");

  return (
    <div className="relative bg-gradient-to-r from-palki-redDark via-palki-red to-palki-redDark text-white py-2.5 px-4 text-xs md:text-sm font-medium z-40 shadow-glow">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 justify-center text-center">
          {isDrinkOrHappyHour ? (
            <Wine className="w-4 h-4 text-amber-300 animate-bounce" />
          ) : (
            <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
          )}

          <span className="bg-black/35 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-300 border border-amber-300/40">
            {activePromo.badge || "PROMO VIGENTE"}
          </span>

          <span className="hidden sm:inline font-bold">
            {activePromo.title}:
          </span>

          <span className="text-white/95">
            {activePromo.bannerText || activePromo.description}
          </span>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="text-white/70 hover:text-white p-1 rounded-full hover:bg-black/20 transition-colors"
          title="Cerrar aviso"
          aria-label="Cerrar aviso"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
