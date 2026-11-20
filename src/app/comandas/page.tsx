"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  UtensilsCrossed,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Sparkles,
  CreditCard,
  Banknote,
  Send,
  Trash2,
  ArrowLeft,
  X,
  MessageSquare,
  Users,
  Search,
  RefreshCw,
  Wine,
} from "lucide-react";
import {
  Category,
  Product,
  RestaurantTable,
  RollOption,
  CustomRollConfig,
  TableStatus,
  PaymentMethod,
} from "@/types";
import { formatCLP, formatDateTime } from "@/lib/formatters";
import { RollBuilderModal } from "@/components/RollBuilderModal";

interface ComandaItemDraft {
  productId?: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  notes?: string;
  rollConfig?: CustomRollConfig;
}

export default function ComandasPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rollOptions, setRollOptions] = useState<RollOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<any | null>(null);

  // Estado del modal de pedido / cobro para la mesa seleccionada
  const [modalMode, setModalMode] = useState<"VIEW" | "ADD" | "CHECKOUT">("VIEW");
  const [draftItems, setDraftItems] = useState<ComandaItemDraft[]>([]);
  const [waiterNotes, setWaiterNotes] = useState("");
  const [tipPercentage, setTipPercentage] = useState<number>(10);
  const [customTip, setCustomTip] = useState<number>(0);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<PaymentMethod>("POS");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal para Roll Builder
  const [isRollBuilderOpen, setIsRollBuilderOpen] = useState(false);
  const [filterType, setFilterType] = useState<"ALL" | "TABLE" | "BAR">("ALL");
  const [activeMenuCat, setActiveMenuCat] = useState<string>("tablas");

  const fetchTablesAndMenu = useCallback(async () => {
    try {
      const [tablesRes, menuRes] = await Promise.all([
        fetch("/api/tables"),
        fetch("/api/menu"),
      ]);

      if (tablesRes.ok) {
        const tData = await tablesRes.json();
        setTables(tData.tables || []);

        // Si tenemos una mesa seleccionada, actualizarla con los datos frescos
        setSelectedTable((prev: any) => {
          if (!prev) return null;
          const updated = tData.tables.find((t: any) => t.id === prev.id);
          return updated || prev;
        });
      }

      if (menuRes.ok) {
        const mData = await menuRes.json();
        setCategories(mData.categories || []);
        setRollOptions(mData.rollOptions || []);
      }
    } catch (err) {
      console.error("Error al cargar comandas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTablesAndMenu();
    const interval = setInterval(fetchTablesAndMenu, 6000);
    return () => clearInterval(interval);
  }, [fetchTablesAndMenu]);

  // Abrir detalle de una mesa
  const handleOpenTable = (table: any) => {
    setSelectedTable(table);
    setDraftItems([]);
    setWaiterNotes("");
    if (table.status === "FREE") {
      setModalMode("ADD");
    } else {
      setModalMode("VIEW");
    }
  };

  // Agregar producto regular al borrador
  const addProductToDraft = (product: Product) => {
    setDraftItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id && !i.rollConfig);
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity: 1,
        },
      ];
    });
  };

  // Agregar Roll personalizado al borrador
  const handleAddCustomRollToDraft = (rollConfig: CustomRollConfig, itemNotes = "") => {
    let totalPrice = rollConfig.basePrice;
    rollConfig.rolls.forEach((r) => {
      totalPrice += r.proteinExtra + r.vegetableExtra + r.wrapExtra + r.acevichadoExtra;
    });

    setDraftItems((prev) => [
      ...prev,
      {
        productName: `Arma tu Roll (${rollConfig.totalPieces} Piezas)`,
        unitPrice: totalPrice,
        quantity: 1,
        notes: itemNotes,
        rollConfig,
      },
    ]);
    setIsRollBuilderOpen(false);
  };

  const removeDraftItem = (index: number) => {
    setDraftItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateDraftItemQty = (index: number, delta: number) => {
    setDraftItems((prev) =>
      prev
        .map((it, idx) => {
          if (idx === index) {
            const newQty = it.quantity + delta;
            return newQty > 0 ? { ...it, quantity: newQty } : null;
          }
          return it;
        })
        .filter(Boolean) as ComandaItemDraft[]
    );
  };

  // Enviar comanda a cocina
  const handleSubmitComanda = async () => {
    if (!selectedTable || draftItems.length === 0) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/comandas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: selectedTable.id,
          tableNumber: selectedTable.number,
          items: draftItems.map((it) => ({
            productId: it.productId,
            productName: it.productName,
            unitPrice: it.unitPrice,
            quantity: it.quantity,
            subtotal: it.unitPrice * it.quantity,
            notes: it.notes,
            rollConfig: it.rollConfig,
          })),
          notes: waiterNotes,
        }),
      });

      if (res.ok) {
        setDraftItems([]);
        setWaiterNotes("");
        await fetchTablesAndMenu();
        setModalMode("VIEW");
      }
    } catch (err) {
      console.error("Error al enviar comanda:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cambiar estado a "Cuenta pedida"
  const handleRequestBill = async () => {
    if (!selectedTable) return;
    try {
      await fetch(`/api/tables/${selectedTable.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "BILL_REQUESTED" }),
      });
      await fetchTablesAndMenu();
      setModalMode("CHECKOUT");
    } catch (err) {
      console.error("Error al pedir cuenta:", err);
    }
  };

  // Cobrar y liberar mesa
  const handleCheckoutTable = async () => {
    if (!selectedTable || !selectedTable.activeOrder) return;
    setIsSubmitting(true);

    const subtotal = selectedTable.activeOrder.subtotal || 0;
    const finalTip =
      tipPercentage !== null ? Math.round((subtotal * tipPercentage) / 100) : customTip;

    try {
      const res = await fetch("/api/comandas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: selectedTable.id,
          orderId: selectedTable.activeOrder.id,
          paymentMethod: checkoutPaymentMethod,
          tip: finalTip,
        }),
      });

      if (res.ok) {
        setSelectedTable(null);
        await fetchTablesAndMenu();
      }
    } catch (err) {
      console.error("Error al cerrar comanda:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrado de mesas por tipo
  const filteredTables = tables.filter((t) => {
    if (filterType === "TABLE") return t.type === "TABLE";
    if (filterType === "BAR") return t.type === "BAR";
    return true;
  });

  // Métricas rápidas de salón
  const occupiedCount = tables.filter((t) => t.status === "OCCUPIED").length;
  const billCount = tables.filter((t) => t.status === "BILL_REQUESTED").length;
  const freeCount = tables.filter((t) => t.status === "FREE").length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Carta Cliente</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-amber-500/40 bg-black/60 p-0.5">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>Comandas de Salón</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Garzones
                  </span>
                </h1>
                <p className="text-xs text-palki-muted">
                  Control visual de mesas, comandas y cierre de cuentas
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/cocina"
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-emerald-400 border border-zinc-800 hover:border-emerald-500/40 transition-all flex items-center gap-1.5"
            >
              <span>Ver KDS Cocina</span>
            </Link>

            <button
              onClick={() => fetchTablesAndMenu()}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
              title="Refrescar mesas"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`}
              />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Salon Status Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-white/5">
          {/* Quick Counter Badges */}
          <div className="flex items-center gap-3 text-xs font-semibold flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{freeCount} Libres</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 text-red-300 border border-red-800/40">
              <span className="w-2.5 h-2.5 rounded-full bg-palki-red" />
              <span>{occupiedCount} Ocupadas</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 text-amber-300 border border-amber-800/40">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce" />
              <span>{billCount} Cuenta Pedida</span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
            {[
              { key: "ALL", label: "Todas" },
              { key: "TABLE", label: "Mesas" },
              { key: "BAR", label: "Barra" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterType(f.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === f.key
                    ? "bg-white text-black shadow-card"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Table Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredTables.map((table) => {
            const isOccupied = table.status === "OCCUPIED";
            const isBillRequested = table.status === "BILL_REQUESTED";
            const isFree = table.status === "FREE";

            const activeOrder = table.activeOrder;
            const itemsCount = activeOrder?.items?.reduce(
              (acc: number, it: any) => acc + (it.quantity || 1),
              0
            ) || 0;

            return (
              <div
                key={table.id}
                onClick={() => handleOpenTable(table)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-44 group relative overflow-hidden ${
                  isBillRequested
                    ? "bg-amber-950/20 border-amber-500/50 hover:border-amber-400 shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]"
                    : isOccupied
                    ? "bg-zinc-900/90 border-palki-red/40 hover:border-palki-red shadow-[0_0_20px_-5px_rgba(227,28,25,0.3)]"
                    : "bg-zinc-950/70 border-white/5 hover:border-white/20 hover:bg-zinc-900/60"
                }`}
              >
                {/* Status indicator bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isBillRequested
                      ? "bg-amber-400 animate-pulse"
                      : isOccupied
                      ? "bg-palki-red"
                      : "bg-emerald-500/50"
                  }`}
                />

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider">
                      {table.type === "BAR" ? "🍸 Barra" : "🍽️ Mesa"}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isBillRequested
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : isOccupied
                          ? "bg-red-500/20 text-red-300 border-red-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      }`}
                    >
                      {isBillRequested
                        ? "Cuenta Pedida"
                        : isOccupied
                        ? "Ocupada"
                        : "Libre"}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white group-hover:scale-105 transition-transform">
                    {table.number}
                  </h3>
                  <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>Capacidad: {table.capacity} pers.</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-end justify-between">
                  {isFree ? (
                    <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Abrir Comanda</span>
                    </div>
                  ) : (
                    <div>
                      <div className="text-[10px] text-zinc-400">
                        {itemsCount} {itemsCount === 1 ? "plato" : "platos"}
                      </div>
                      <div className="text-sm font-black text-white">
                        {formatCLP(activeOrder?.total || 0)}
                      </div>
                    </div>
                  )}

                  {!isFree && (
                    <span className="text-[11px] text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
                      Ver →
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* MODAL DE MESA (VER COMANDA / AGREGAR PLATOS / COBRAR) */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setSelectedTable(null)}
          />

          <div className="relative w-full max-w-3xl bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 bg-zinc-900/80 backdrop-blur-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg ${
                    selectedTable.status === "BILL_REQUESTED"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : selectedTable.status === "OCCUPIED"
                      ? "bg-palki-red/20 text-palki-red border border-palki-red/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {selectedTable.number.replace(/\D/g, "") || "M"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white">
                      {selectedTable.number}
                    </h2>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        selectedTable.status === "BILL_REQUESTED"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : selectedTable.status === "OCCUPIED"
                          ? "bg-red-500/20 text-red-300 border-red-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      }`}
                    >
                      {selectedTable.status === "BILL_REQUESTED"
                        ? "Cuenta Pedida"
                        : selectedTable.status === "OCCUPIED"
                        ? "Ocupada"
                        : "Libre"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Capacidad: {selectedTable.capacity} personas • Salón Palkisushi
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedTable.status !== "FREE" && modalMode !== "ADD" && (
                  <button
                    onClick={() => setModalMode("ADD")}
                    className="px-3.5 py-2 rounded-xl bg-palki-red hover:bg-palki-redHover text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-glow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Sumar a la Mesa</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedTable(null)}
                  className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* MODO 1: VER COMANDA ACTIVA */}
              {modalMode === "VIEW" && (
                <div className="space-y-5">
                  {selectedTable.activeOrder ? (
                    <>
                      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-zinc-400 uppercase font-bold">
                            Orden #{selectedTable.activeOrder.orderNumber}
                          </div>
                          <div className="text-xs text-zinc-500">
                            Iniciada: {formatDateTime(selectedTable.activeOrder.createdAt)}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-zinc-400">Total Acumulado:</div>
                          <div className="text-xl font-black text-white">
                            {formatCLP(selectedTable.activeOrder.total)}
                          </div>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          Platos enviados a cocina:
                        </h4>
                        <div className="space-y-2">
                          {selectedTable.activeOrder.items?.map((it: any) => {
                            let parsedRoll = null;
                            if (it.rollConfig) {
                              try {
                                parsedRoll = JSON.parse(it.rollConfig);
                              } catch {}
                            }

                            return (
                              <div
                                key={it.id}
                                className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 flex items-start justify-between text-xs"
                              >
                                <div>
                                  <div className="font-bold text-white">
                                    {it.quantity}x {it.productName}
                                  </div>
                                  {parsedRoll && parsedRoll.rolls && (
                                    <div className="text-[11px] text-zinc-400 pl-2 border-l border-palki-red/40 mt-1 space-y-0.5">
                                      {parsedRoll.rolls.map((r: any, rI: number) => (
                                        <div key={rI}>
                                          • Roll #{rI + 1}: {r.protein} + {r.vegetable} ({r.wrap})
                                          {r.acevichado ? " + Acevichado" : ""}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {it.notes && (
                                    <div className="text-[10px] text-amber-300 italic mt-0.5">
                                      Nota: {it.notes}
                                    </div>
                                  )}
                                </div>
                                <span className="font-extrabold text-white">
                                  {formatCLP(it.subtotal)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Actions: Pedir Cuenta o Cobrar */}
                      <div className="pt-4 border-t border-white/5 flex flex-wrap gap-3 justify-end">
                        <button
                          type="button"
                          onClick={() => setModalMode("ADD")}
                          className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold border border-zinc-700 flex items-center gap-1.5 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-palki-red" />
                          <span>Agregar más platos</span>
                        </button>

                        {selectedTable.status !== "BILL_REQUESTED" && (
                          <button
                            type="button"
                            onClick={handleRequestBill}
                            className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1.5 transition-colors"
                          >
                            <Receipt className="w-4 h-4 text-amber-400" />
                            <span>Pedir la Cuenta</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setModalMode("CHECKOUT")}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Cobrar y Liberar Mesa</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10 space-y-3">
                      <p className="text-zinc-400 text-xs">
                        La mesa está libre. Puedes abrir una comanda ahora mismo.
                      </p>
                      <button
                        onClick={() => setModalMode("ADD")}
                        className="px-5 py-2.5 rounded-xl bg-palki-red text-white text-xs font-bold shadow-glow"
                      >
                        Iniciar Comanda
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* MODO 2: AGREGAR PRODUCTOS A LA COMANDA */}
              {modalMode === "ADD" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                      <Plus className="w-4 h-4 text-palki-red" />
                      <span>Seleccionar Platos para {selectedTable.number}</span>
                    </h3>

                    {selectedTable.status !== "FREE" && (
                      <button
                        type="button"
                        onClick={() => setModalMode("VIEW")}
                        className="text-xs text-zinc-400 hover:text-white underline"
                      >
                        ← Volver a ver comanda
                      </button>
                    )}
                  </div>

                  {/* Botón especial para Arma tu Roll */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-palki-red/20 to-zinc-900 border border-palki-red/30 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-palki-red" />
                        <span>Sushi: Arma tu Roll Personalizado</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        10 a 100 piezas con queso crema incluido, proteínas y envolturas a elección.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsRollBuilderOpen(true)}
                      className="px-4 py-2 rounded-xl bg-palki-red hover:bg-palki-redHover text-white text-xs font-bold shadow-glow"
                    >
                      Configurar Roll
                    </button>
                  </div>

                  {/* Selector de Categorías para Garzón */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {categories
                      .filter((c) => c.slug !== "arma-tu-roll")
                      .map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setActiveMenuCat(cat.slug)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                            activeMenuCat === cat.slug
                              ? "bg-white text-black border-white"
                              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                  </div>

                  {/* Grid de Productos rápidos */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {categories
                      .find((c) => c.slug === activeMenuCat)
                      ?.products?.map((prod) => (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => addProductToDraft(prod)}
                          className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left transition-all flex flex-col justify-between group"
                        >
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-palki-red transition-colors line-clamp-1">
                              {prod.name}
                            </div>
                            <div className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                              {prod.description}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                            <span className="text-xs font-extrabold text-amber-300">
                              {formatCLP(prod.price)}
                            </span>
                            <span className="w-5 h-5 rounded-md bg-zinc-800 group-hover:bg-palki-red text-white flex items-center justify-center text-xs font-bold">
                              +
                            </span>
                          </div>
                        </button>
                      ))}
                  </div>

                  {/* Lista de Items en borrador para enviar */}
                  {draftItems.length > 0 && (
                    <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold uppercase text-zinc-400">
                        <span>Nuevos platos a enviar a cocina ({draftItems.length})</span>
                        <span className="text-white">
                          Subtotal:{" "}
                          {formatCLP(
                            draftItems.reduce(
                              (sum, it) => sum + it.unitPrice * it.quantity,
                              0
                            )
                          )}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {draftItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-black/50 border border-white/5 flex items-center justify-between text-xs gap-3"
                          >
                            <div className="flex-1">
                              <span className="font-bold text-white">
                                {item.productName}
                              </span>
                              <span className="text-zinc-400 ml-2">
                                {formatCLP(item.unitPrice * item.quantity)}
                              </span>

                              {/* Input para notas específicas de cocina */}
                              <input
                                type="text"
                                value={item.notes || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setDraftItems((prev) =>
                                    prev.map((it, i) =>
                                      i === idx ? { ...it, notes: val } : it
                                    )
                                  );
                                }}
                                placeholder="Nota cocina (ej: sin mayonesa, sin ciboulette, alergia)..."
                                className="w-full text-[11px] bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-white placeholder-zinc-600 focus:outline-none focus:border-palki-red mt-1"
                              />
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => updateDraftItemQty(idx, -1)}
                                className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center"
                              >
                                -
                              </button>
                              <span className="w-5 text-center font-bold">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateDraftItemQty(idx, 1)}
                                className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() => removeDraftItem(idx)}
                                className="p-1 text-red-400 hover:text-red-300 ml-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Nota general para el pedido */}
                      <div className="pt-2">
                        <input
                          type="text"
                          value={waiterNotes}
                          onChange={(e) => setWaiterNotes(e.target.value)}
                          placeholder="Nota general de comanda (ej: mesa prefiere todo junto)..."
                          className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-palki-red"
                        />
                      </div>
                    </div>
                  )}

                  {/* Botón de Enviar Comanda a Cocina */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedTable.status === "FREE") setSelectedTable(null);
                        else setModalMode("VIEW");
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs text-zinc-400 hover:text-white"
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      disabled={draftItems.length === 0 || isSubmitting}
                      onClick={handleSubmitComanda}
                      className="px-6 py-3 rounded-xl bg-palki-red hover:bg-palki-redHover disabled:opacity-40 text-white text-xs font-extrabold flex items-center gap-2 shadow-glow"
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        {isSubmitting
                          ? "Enviando Comanda..."
                          : `Enviar ${draftItems.length} platos a Cocina`}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* MODO 3: COBRAR Y CERRAR MESA */}
              {modalMode === "CHECKOUT" && selectedTable.activeOrder && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-400" />
                      <span>Cierre de Cuenta - {selectedTable.number}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setModalMode("VIEW")}
                      className="text-xs text-zinc-400 hover:text-white underline"
                    >
                      ← Volver a Comanda
                    </button>
                  </div>

                  {/* Resumen financiero */}
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Subtotal de platos:</span>
                      <span className="font-bold text-white">
                        {formatCLP(selectedTable.activeOrder.subtotal)}
                      </span>
                    </div>

                    {/* Selector de propina */}
                    <div className="space-y-2 pt-2 border-t border-zinc-800">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-zinc-300">
                          Propina sugerida de servicio:
                        </span>
                        <span className="font-bold text-amber-300">
                          {formatCLP(
                            tipPercentage !== null
                              ? Math.round(
                                  (selectedTable.activeOrder.subtotal * tipPercentage) /
                                    100
                                )
                              : customTip
                          )}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setTipPercentage(0)}
                          className={`py-2 rounded-xl text-xs border transition-all ${
                            tipPercentage === 0
                              ? "bg-zinc-800 border-zinc-600 text-white font-bold"
                              : "bg-zinc-950 border-zinc-800 text-zinc-400"
                          }`}
                        >
                          0%
                        </button>
                        <button
                          type="button"
                          onClick={() => setTipPercentage(10)}
                          className={`py-2 rounded-xl text-xs border transition-all ${
                            tipPercentage === 10
                              ? "bg-palki-red/20 border-palki-red text-white font-bold"
                              : "bg-zinc-950 border-zinc-800 text-zinc-400"
                          }`}
                        >
                          10% Sugerido
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const val = prompt("Monto de propina en pesos (CLP):", "2000");
                            if (val && !isNaN(Number(val))) {
                              setTipPercentage(null as any);
                              setCustomTip(Number(val));
                            }
                          }}
                          className={`py-2 rounded-xl text-xs border transition-all ${
                            tipPercentage === null
                              ? "bg-zinc-800 border-zinc-600 text-white font-bold"
                              : "bg-zinc-950 border-zinc-800 text-zinc-400"
                          }`}
                        >
                          Otro Monto
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-baseline pt-2 border-t border-zinc-800 text-base">
                      <span className="font-bold text-white">Total a Cobrar:</span>
                      <span className="font-black text-2xl text-emerald-400">
                        {formatCLP(
                          selectedTable.activeOrder.subtotal +
                            (tipPercentage !== null
                              ? Math.round(
                                  (selectedTable.activeOrder.subtotal * tipPercentage) /
                                    100
                                )
                              : customTip)
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Selector de Método de Pago */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Método de Pago Utilizado por el Cliente
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: "POS" as PaymentMethod, label: "Máquina POS", icon: CreditCard },
                        { key: "TRANSFER" as PaymentMethod, label: "Transferencia", icon: Send },
                        { key: "CASH" as PaymentMethod, label: "Efectivo", icon: Banknote },
                      ].map((m) => {
                        const isSelected = checkoutPaymentMethod === m.key;
                        const Icon = m.icon;
                        return (
                          <button
                            key={m.key}
                            type="button"
                            onClick={() => setCheckoutPaymentMethod(m.key)}
                            className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 text-xs transition-all ${
                              isSelected
                                ? "bg-emerald-950/40 border-emerald-500 text-white font-bold"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                          >
                            <Icon className="w-5 h-5 text-emerald-400" />
                            <span>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Botón de Confirmación de Cobro */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setModalMode("VIEW")}
                      className="px-4 py-2.5 rounded-xl text-xs text-zinc-400 hover:text-white"
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleCheckoutTable}
                      className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {isSubmitting
                          ? "Procesando Cobro..."
                          : "Confirmar Pago y Liberar Mesa"}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal para configurar Roll dentro de comanda de mesa */}
      <RollBuilderModal
        isOpen={isRollBuilderOpen}
        onClose={() => setIsRollBuilderOpen(false)}
        rollOptions={rollOptions}
      />
    </div>
  );
}
