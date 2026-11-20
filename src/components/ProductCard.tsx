"use client";

import React, { useState } from "react";
import { Plus, Check, Sparkles, MessageSquare } from "lucide-react";
import { Product } from "@/types";
import { formatCLP } from "@/lib/formatters";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [notes, setNotes] = useState("");

  const handleAdd = () => {
    addItem(product, 1, notes);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    setNotes("");
    setShowNotesInput(false);
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 sm:p-6 flex flex-col justify-between border border-white/8 relative group transition-all duration-300">
      <div>
        {/* Top Badges & Pieces */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {product.badge ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/40 border border-amber-800/40 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {product.badge}
            </span>
          ) : (
            <span />
          )}

          {product.pieces && (
            <span className="text-[11px] font-bold text-palki-red bg-palki-red/10 border border-palki-red/30 px-2.5 py-0.5 rounded-full">
              {product.pieces} Piezas
            </span>
          )}
        </div>

        {/* Product Name & Price */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-white group-hover:text-palki-red transition-colors leading-snug">
            {product.name}
          </h3>
          <span className="text-base sm:text-lg font-extrabold text-white whitespace-nowrap bg-zinc-900/80 px-2.5 py-1 rounded-lg border border-zinc-800">
            {formatCLP(product.price)}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-palki-muted mt-2.5 leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="mt-5 pt-4 border-t border-white/5 space-y-3">
        {showNotesInput ? (
          <div className="space-y-2 animate-fade-in">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instrucción (ej: sin mayonesa, extra salsa)..."
              className="w-full text-xs bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-palki-red"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNotesInput(false)}
                className="text-xs text-zinc-400 hover:text-white px-2 py-1"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAdd}
                className="text-xs bg-palki-red text-white font-semibold px-3 py-1 rounded-md"
              >
                Confirmar y Agregar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowNotesInput(true)}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 py-1 px-2 rounded-md hover:bg-zinc-800/60 transition-colors"
              title="Agregar notas para este plato"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Instrucción especial</span>
            </button>

            <button
              onClick={handleAdd}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                added
                  ? "bg-emerald-600 text-white"
                  : "bg-palki-red hover:bg-palki-redHover text-white shadow-glow hover:scale-105"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Agregado!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Agregar</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
