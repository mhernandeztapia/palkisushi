"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  Copy,
  Award,
  Layers,
  Flame,
} from "lucide-react";
import { RollOption, SingleRollSubItem, CustomRollConfig } from "@/types";
import { formatCLP } from "@/lib/formatters";
import { useCart } from "@/context/CartContext";

interface RollBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  rollOptions: RollOption[];
}

export function RollBuilderModal({
  isOpen,
  onClose,
  rollOptions,
}: RollBuilderModalProps) {
  const { addCustomRoll } = useCart();

  // Filtrar opciones por tipo
  const pieceOptions = useMemo(
    () => rollOptions.filter((o) => o.type === "BASE_PIECES"),
    [rollOptions]
  );
  const proteinOptions = useMemo(
    () => rollOptions.filter((o) => o.type === "PROTEIN"),
    [rollOptions]
  );
  const vegetableOptions = useMemo(
    () => rollOptions.filter((o) => o.type === "VEGETABLE"),
    [rollOptions]
  );
  const wrapOptions = useMemo(
    () => rollOptions.filter((o) => o.type === "WRAP"),
    [rollOptions]
  );

  // Estado del configurador
  const [selectedPieces, setSelectedPieces] = useState<number>(20);
  const [activeRollIndex, setActiveRollIndex] = useState<number>(0);
  const [rollItems, setRollItems] = useState<SingleRollSubItem[]>(() => {
    return [
      {
        rollIndex: 1,
        protein: "Pollo",
        proteinExtra: 0,
        vegetable: "Palta",
        vegetableExtra: 0,
        wrap: "Tempura (Crocante)",
        wrapExtra: 0,
        acevichado: false,
        acevichadoExtra: 0,
      },
      {
        rollIndex: 2,
        protein: "Camarón",
        proteinExtra: 0,
        vegetable: "Ciboulette",
        vegetableExtra: 0,
        wrap: "Palta",
        wrapExtra: 1000,
        acevichado: false,
        acevichadoExtra: 0,
      },
    ];
  });
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const totalRollsCount = selectedPieces / 10;
  const currentBasePrice = (selectedPieces / 10) * 4000;

  // Sincronizar rollItems cuando cambie la cantidad de piezas
  const handleSelectPieces = (pieces: number) => {
    setSelectedPieces(pieces);
    const rollsCount = pieces / 10;
    setRollItems((prev) => {
      const next: SingleRollSubItem[] = [];
      for (let i = 0; i < rollsCount; i++) {
        if (prev[i]) {
          next.push({ ...prev[i], rollIndex: i + 1 });
        } else {
          // Default roll
          next.push({
            rollIndex: i + 1,
            protein: "Pollo",
            proteinExtra: 0,
            vegetable: "Palta",
            vegetableExtra: 0,
            wrap: "Tempura (Crocante)",
            wrapExtra: 0,
            acevichado: false,
            acevichadoExtra: 0,
          });
        }
      }
      return next;
    });
    if (activeRollIndex >= rollsCount) {
      setActiveRollIndex(0);
    }
  };

  const currentRoll = rollItems[activeRollIndex] || rollItems[0];

  // Actualizar el roll activo
  const updateActiveRoll = (patch: Partial<SingleRollSubItem>) => {
    setRollItems((prev) =>
      prev.map((r, idx) => (idx === activeRollIndex ? { ...r, ...patch } : r))
    );
  };

  // Duplicar la configuración del roll actual a todos los demás
  const copyToAllRolls = () => {
    const template = { ...currentRoll };
    setRollItems((prev) =>
      prev.map((r, idx) => ({
        ...template,
        rollIndex: idx + 1,
      }))
    );
  };

  // Calcular precio total acumulado
  const totalExtras = rollItems.reduce(
    (sum, r) => sum + r.proteinExtra + r.vegetableExtra + r.wrapExtra + r.acevichadoExtra,
    0
  );
  const grandTotal = currentBasePrice + totalExtras;

  const handleAddToCart = () => {
    const config: CustomRollConfig = {
      totalPieces: selectedPieces,
      rollsCount: totalRollsCount,
      basePrice: currentBasePrice,
      rolls: rollItems,
      allIncludeCreamCheese: true,
    };
    addCustomRoll(config, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-palki-card border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-palki-red/20 border border-palki-red/30 flex items-center justify-center text-palki-red">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Arma tu Roll Palkisushi
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/50 border border-amber-800/40 px-2 py-0.5 rounded-full">
                  <Award className="w-3.5 h-3.5" />
                  Queso crema incluido
                </span>
              </div>
              <p className="text-xs sm:text-sm text-palki-muted">
                Configurador paso a paso. Personaliza cada roll de 10 piezas a tu gusto.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* PASO 1: Selector de Piezas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-palki-red text-white text-xs flex items-center justify-center">
                  1
                </span>
                ¿Cuántas piezas deseas armar?
              </label>
              <span className="text-xs text-zinc-400">
                Base: $4.000 por cada 10 piezas
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((pieces) => {
                const isSelected = selectedPieces === pieces;
                const basePrice = (pieces / 10) * 4000;
                return (
                  <button
                    key={pieces}
                    type="button"
                    onClick={() => handleSelectPieces(pieces)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? "bg-palki-red border-palki-red text-white shadow-glow"
                        : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-600 text-zinc-300"
                    }`}
                  >
                    <div className="text-base font-extrabold">{pieces} Piezas</div>
                    <div
                      className={`text-xs mt-0.5 ${
                        isSelected ? "text-white/90" : "text-palki-muted"
                      }`}
                    >
                      {formatCLP(basePrice)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aviso obligatorio de Queso Crema */}
          <div className="bg-amber-950/20 border border-amber-800/30 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 text-xs sm:text-sm text-amber-200">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                <strong>Garantía Palkisushi:</strong> Todos los rolls incluyen queso crema sin costo adicional.
              </span>
            </div>
            {totalRollsCount > 1 && (
              <button
                type="button"
                onClick={copyToAllRolls}
                className="hidden sm:flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg border border-zinc-700 shrink-0 transition-colors"
                title="Aplica la configuración de este roll a todos los otros rolls"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>Copiar este roll a todos</span>
              </button>
            )}
          </div>

          {/* PASO 2: Pestañas para cada Roll de 10 piezas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-palki-red text-white text-xs flex items-center justify-center">
                  2
                </span>
                Personaliza tus {totalRollsCount} rolls ({selectedPieces} piezas en total)
              </label>

              {totalRollsCount > 1 && (
                <button
                  type="button"
                  onClick={copyToAllRolls}
                  className="sm:hidden flex items-center gap-1 text-xs text-amber-400 underline"
                >
                  <Copy className="w-3 h-3" />
                  Copiar este a todos
                </button>
              )}
            </div>

            {/* Roll Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {rollItems.map((r, idx) => {
                const isActive = activeRollIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveRollIndex(idx)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                      isActive
                        ? "bg-white text-black border-white shadow-card"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    Roll #{idx + 1} (10 pzas)
                  </button>
                );
              })}
            </div>

            {/* SECCIÓN A: PROTEÍNAS */}
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                  <span>🍗 Elige 1 Proteína para Roll #{activeRollIndex + 1}</span>
                </h4>
                <span className="text-[11px] text-zinc-400">Obligatorio</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {proteinOptions.map((opt) => {
                  const isSelected = currentRoll.protein === opt.name;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        updateActiveRoll({
                          protein: opt.name,
                          proteinExtra: opt.price,
                        })
                      }
                      className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                        isSelected
                          ? "bg-palki-red/20 border-palki-red text-white font-bold"
                          : "bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      <span>{opt.name}</span>
                      <span
                        className={`text-[10px] mt-1 font-semibold ${
                          opt.price > 0 ? "text-amber-400" : "text-emerald-400"
                        }`}
                      >
                        {opt.price > 0 ? `+${formatCLP(opt.price)}` : "$0"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECCIÓN B: VERDURAS */}
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                  <span>🥑 Elige 1 Verdura para Roll #{activeRollIndex + 1}</span>
                </h4>
                <span className="text-[11px] text-zinc-400">Todas a $0</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {vegetableOptions.map((opt) => {
                  const isSelected = currentRoll.vegetable === opt.name;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        updateActiveRoll({
                          vegetable: opt.name,
                          vegetableExtra: opt.price,
                        })
                      }
                      className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                        isSelected
                          ? "bg-palki-red/20 border-palki-red text-white font-bold"
                          : "bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      <span>{opt.name}</span>
                      <span className="text-[10px] mt-1 text-emerald-400 font-semibold">
                        $0
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECCIÓN C: ENVOLTURAS */}
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                  <span>🍙 Elige la Envoltura para Roll #{activeRollIndex + 1}</span>
                </h4>
                <span className="text-[11px] text-zinc-400">Obligatorio</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {wrapOptions.map((opt) => {
                  const isSelected = currentRoll.wrap === opt.name;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        updateActiveRoll({
                          wrap: opt.name,
                          wrapExtra: opt.price,
                        })
                      }
                      className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                        isSelected
                          ? "bg-palki-red/20 border-palki-red text-white font-bold"
                          : "bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      <span>{opt.name}</span>
                      <span
                        className={`text-[10px] mt-1 font-semibold ${
                          opt.price > 0 ? "text-amber-400" : "text-emerald-400"
                        }`}
                      >
                        {opt.price > 0 ? `+${formatCLP(opt.price)}` : "$0"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECCIÓN D: EXTRA ACEVICHADO */}
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Corona Acevichada sobre Roll #{activeRollIndex + 1}
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Bañado en auténtica salsa acevichada de autor (+ $3.000)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateActiveRoll({
                    acevichado: !currentRoll.acevichado,
                    acevichadoExtra: currentRoll.acevichado ? 0 : 3000,
                  })
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  currentRoll.acevichado
                    ? "bg-amber-400 text-black border-amber-400"
                    : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:text-white"
                }`}
              >
                {currentRoll.acevichado ? "✓ Con Acevichado" : "+ Agregar (+$3.000)"}
              </button>
            </div>
          </div>

          {/* Navegación rápida entre rolls */}
          {totalRollsCount > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                disabled={activeRollIndex === 0}
                onClick={() => setActiveRollIndex((prev) => Math.max(0, prev - 1))}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Roll Anterior</span>
              </button>

              <span className="text-xs text-zinc-500">
                Roll {activeRollIndex + 1} de {totalRollsCount}
              </span>

              <button
                type="button"
                disabled={activeRollIndex === totalRollsCount - 1}
                onClick={() =>
                  setActiveRollIndex((prev) =>
                    Math.min(totalRollsCount - 1, prev + 1)
                  )
                }
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              >
                <span>Siguiente Roll</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Resumen de los Rolls armados */}
          <div className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800 space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Resumen de tu pedido personalizado:
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {rollItems.map((r, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white">Roll #{r.rollIndex}: </span>
                    <span className="text-zinc-300">
                      {r.protein} + {r.vegetable} | Env: {r.wrap}
                    </span>
                    {r.acevichado && (
                      <span className="text-amber-400 ml-1 font-semibold">
                        (+Acevichado)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer with Live Price & Add Button */}
        <div className="p-5 sm:p-6 border-t border-white/10 bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <div className="text-[11px] text-zinc-400">
                Base ({selectedPieces} piezas): {formatCLP(currentBasePrice)}
                {totalExtras > 0 && ` + Extras: ${formatCLP(totalExtras)}`}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {formatCLP(grandTotal)}
              </div>
            </div>
            <div className="sm:hidden text-right">
              <span className="text-xs font-bold text-palki-red">
                {selectedPieces} piezas
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 sm:w-auto px-5 py-3 rounded-full text-xs font-semibold text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-2/3 sm:w-auto px-7 py-3 rounded-full bg-palki-red hover:bg-palki-redHover text-white font-bold text-sm shadow-glow hover:shadow-glow-lg transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Agregar {selectedPieces} piezas al Carrito</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
