"use client";

import React, { useState, useEffect } from "react";
import {
  UtensilsCrossed,
  Flame,
  Sparkles,
  Boxes,
  Fish,
  Sandwich,
  LucideIcon,
} from "lucide-react";
import { Category } from "@/types";

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
  onOpenRollBuilder: () => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
  tablas: UtensilsCrossed,
  "papas-fritas": Flame,
  "arma-tu-roll": Sparkles,
  "mix-sushi": Boxes,
  ceviches: Fish,
  hamburguesas: Sandwich,
};

export function CategoryNav({
  categories,
  activeCategory,
  onSelectCategory,
  onOpenRollBuilder,
}: CategoryNavProps) {
  return (
    <div className="sticky top-20 z-20 py-3 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const Icon = ICON_MAP[cat.slug] || UtensilsCrossed;
            const isActive = activeCategory === cat.slug;
            const isArmaRoll = cat.slug === "arma-tu-roll";

            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (isArmaRoll) {
                    onOpenRollBuilder();
                  } else {
                    onSelectCategory(cat.slug);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isArmaRoll
                    ? "bg-gradient-to-r from-palki-red to-red-600 text-white shadow-glow hover:scale-105"
                    : isActive
                    ? "bg-white text-black shadow-card"
                    : "bg-palki-card hover:bg-palki-cardHover text-zinc-300 hover:text-white border border-white/5"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isArmaRoll
                      ? "text-white animate-spin-slow"
                      : isActive
                      ? "text-black"
                      : "text-palki-red"
                  }`}
                />
                <span>{cat.name}</span>
                {isArmaRoll && (
                  <span className="text-[10px] bg-black/30 text-white px-1.5 py-0.2 rounded-full font-bold ml-1">
                    Configurar
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
