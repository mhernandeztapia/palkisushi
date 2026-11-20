"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Store,
  ChefHat,
  ShieldCheck,
  UtensilsCrossed,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function DevNavigationPill() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { href: "/", label: "Carta Web", icon: Store, color: "text-zinc-300" },
    {
      href: "/comandas",
      label: "Garzones (Mesas)",
      icon: UtensilsCrossed,
      color: "text-amber-400",
    },
    {
      href: "/cocina",
      label: "Cocina / KDS",
      icon: ChefHat,
      color: "text-emerald-400",
    },
    {
      href: "/admin",
      label: "Admin Local",
      icon: ShieldCheck,
      color: "text-palki-red",
    },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in pointer-events-auto">
      <div className="bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-full px-3 py-1.5 shadow-2xl flex items-center gap-1 sm:gap-2">
        <span className="text-[10px] uppercase tracking-wider font-extrabold text-palki-red px-2 hidden md:inline">
          Palki OS
        </span>

        {!collapsed ? (
          <div className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-white text-black shadow-card font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-black" : link.color
                    }`}
                  />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <span className="text-xs text-zinc-400 px-2 font-medium">
            Módulos Palki
          </span>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 text-zinc-500 hover:text-white rounded-full hover:bg-zinc-800 transition-colors ml-1"
          title={collapsed ? "Expandir barra de navegación" : "Minimizar barra"}
        >
          {collapsed ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
