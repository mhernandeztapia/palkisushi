"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChefHat,
  Bike,
  Store,
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Volume2,
  VolumeX,
  CreditCard,
  Banknote,
  Send,
  Phone,
  Flame,
  Search,
} from "lucide-react";
import { OrderRecord, OrderStatus, PaymentStatus } from "@/types";
import { formatCLP, formatDateTime } from "@/lib/formatters";

// Sintetizador de sonido chime para nuevos pedidos sin requerir archivos mp3 externos
function playOrderChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc1.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start();
    osc1.stop(ctx.currentTime + 0.6);
  } catch {
    // Si el navegador bloquea audio antes de interacción
  }
}

export default function CocinaKdsPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterMode, setFilterMode] = useState<"ACTIVE" | "ALL" | "DELIVERY" | "DINE_IN">("ACTIVE");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const prevOrderCountRef = useRef<number>(0);

  const fetchKdsOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        const incomingOrders: OrderRecord[] = data.orders || [];

        // Si llegaron nuevas órdenes pendientes respecto al conteo anterior, emitir chime
        const pendingCount = incomingOrders.filter((o) => o.status === "PENDING" || o.status === "PREPARING").length;
        if (prevOrderCountRef.current > 0 && pendingCount > prevOrderCountRef.current && soundEnabled) {
          playOrderChime();
        }
        prevOrderCountRef.current = pendingCount;

        setOrders(incomingOrders);
      }
    } catch (err) {
      console.error("Error al cargar pedidos en KDS:", err);
    } finally {
      setLoading(false);
    }
  }, [soundEnabled]);

  useEffect(() => {
    fetchKdsOrders();
    // Polling estricto cada 5 segundos según requerimiento
    const interval = setInterval(fetchKdsOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchKdsOrders]);

  // Actualizar estado de orden
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchKdsOrders();
      }
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Confirmar pago desde cocina/caja con 1-click
  const handleVerifyPayment = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "PAID" }),
      });
      if (res.ok) {
        await fetchKdsOrders();
      }
    } catch (err) {
      console.error("Error al verificar pago:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtrado de pedidos para el tablero
  const filteredOrders = orders.filter((o) => {
    if (filterMode === "ACTIVE") {
      return o.status === "PENDING" || o.status === "PREPARING" || o.status === "READY" || o.status === "ON_THE_WAY";
    }
    if (filterMode === "DELIVERY") {
      return o.orderType === "DELIVERY" || o.orderType === "PICKUP";
    }
    if (filterMode === "DINE_IN") {
      return o.orderType === "DINE_IN";
    }
    return true;
  });

  // Métricas rápidas de cocina
  const pendingOrdersCount = orders.filter((o) => o.status === "PENDING").length;
  const inKitchenCount = orders.filter((o) => o.status === "PREPARING").length;
  const readyCount = orders.filter((o) => o.status === "READY").length;

  return (
    <div className="min-h-screen bg-[#070709] text-white pb-24">
      {/* KDS Header */}
      <header className="border-b border-white/10 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/comandas"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Mesas / Garzones</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>KDS Cocina & Caja</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                    En Vivo (5s)
                  </span>
                </h1>
                <p className="text-xs text-zinc-400">
                  Despacho de pedidos web y comandas de salón en tiempo real
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playOrderChime();
              }}
              className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                soundEnabled
                  ? "bg-zinc-900 text-emerald-400 border-zinc-800"
                  : "bg-zinc-900 text-zinc-500 border-zinc-800"
              }`}
              title={soundEnabled ? "Sonido activado" : "Sonido silenciado"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => fetchKdsOrders()}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
              title="Refrescar KDS"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`}
              />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* KPI Counter Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-white/5">
          <div className="flex items-center gap-3 text-xs font-semibold flex-wrap">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-950/40 text-amber-300 border border-amber-800/40">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span>{pendingOrdersCount} Pendientes</span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-950/40 text-purple-300 border border-purple-800/40">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span>{inKitchenCount} En Cocina</span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>{readyCount} Listos para Salir</span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5 overflow-x-auto">
            {[
              { key: "ACTIVE", label: "Activos en Cocina" },
              { key: "DINE_IN", label: "Solo Mesas" },
              { key: "DELIVERY", label: "Solo Delivery & Retiro" },
              { key: "ALL", label: "Todos" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterMode(f.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  filterMode === f.key
                    ? "bg-white text-black shadow-card"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Kanban / KDS Display Grid */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-zinc-950/40 rounded-3xl border border-white/5 space-y-3">
            <ChefHat className="w-14 h-14 text-zinc-700 mx-auto" />
            <h3 className="text-lg font-bold text-white">
              Cocina despejada
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              No hay comandas pendientes bajo este filtro. Los nuevos pedidos que entren por la web o mesas aparecerán automáticamente.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOrders.map((order) => {
              const isDelivery = order.orderType === "DELIVERY";
              const isDineIn = order.orderType === "DINE_IN";
              const isPickup = order.orderType === "PICKUP";
              const isPaid = order.paymentStatus === "PAID";

              // Estilos según estado
              const isPending = order.status === "PENDING";
              const isPreparing = order.status === "PREPARING";
              const isReady = order.status === "READY";
              const isOnTheWay = order.status === "ON_THE_WAY";

              return (
                <div
                  key={order.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    isPending
                      ? "bg-zinc-900/90 border-amber-500/50 shadow-[0_0_25px_-5px_rgba(245,158,11,0.25)]"
                      : isPreparing
                      ? "bg-zinc-900/90 border-purple-500/40"
                      : isReady
                      ? "bg-zinc-900/90 border-emerald-500/40"
                      : "bg-zinc-950/80 border-white/5"
                  }`}
                >
                  {/* Top Ticket Header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-white">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isDineIn
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              : isDelivery
                              ? "bg-palki-red/20 text-palki-red border-palki-red/30"
                              : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                          }`}
                        >
                          {isDineIn
                            ? `🍽️ ${order.tableNumber || "Mesa"}`
                            : isDelivery
                            ? "🛵 Delivery"
                            : "🏬 Retiro"}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-zinc-400">
                          {formatDateTime(order.createdAt)}
                        </div>
                        <div className="text-xs font-black text-white mt-0.5">
                          {formatCLP(order.total)}
                        </div>
                      </div>
                    </div>

                    {/* Customer or Table info */}
                    <div className="flex items-center justify-between text-xs text-zinc-300 bg-black/40 p-2.5 rounded-xl border border-white/5">
                      <span className="font-semibold">{order.customerName}</span>
                      {order.customerPhone && order.customerPhone !== "Salón Local" && (
                        <a
                          href={`https://wa.me/${order.customerPhone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{order.customerPhone}</span>
                        </a>
                      )}
                    </div>

                    {/* Delivery / Pickup Address */}
                    {isDelivery && order.customerAddress && (
                      <div className="text-[11px] text-zinc-400 bg-black/30 p-2 rounded-lg">
                        📍 <strong>Dirección:</strong> {order.customerAddress}
                        {order.deliveryZoneName && ` (${order.deliveryZoneName})`}
                      </div>
                    )}

                    {/* REGLA DE NEGOCIO OBLIGATORIA: ESTADO DE PAGO DESTACADO EN DELIVERY */}
                    {isDelivery && (
                      <div
                        className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs font-bold ${
                          isPaid
                            ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                            : "bg-red-950/60 border-palki-red text-red-200 shadow-glow"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isPaid ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>✓ PAGO VERIFICADO (Liberado)</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-4 h-4 text-palki-red shrink-0 animate-bounce" />
                              <span>⚠️ PENDIENTE DE PAGO - NO DESPACHAR AÚN</span>
                            </>
                          )}
                        </div>

                        {!isPaid && (
                          <button
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() => handleVerifyPayment(order.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black shrink-0 transition-colors shadow-sm"
                          >
                            Validar Pago
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Order Items Breakdown */}
                  <div className="space-y-2 border-t border-b border-white/5 py-3">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
                      Detalle para Cocina:
                    </div>

                    <div className="space-y-1.5">
                      {order.items?.map((item) => {
                        let parsedConfig = null;
                        if (item.rollConfig) {
                          try {
                            parsedConfig = JSON.parse(item.rollConfig);
                          } catch {}
                        }

                        return (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-xl bg-black/50 border border-white/5 text-xs space-y-1"
                          >
                            <div className="flex justify-between font-bold text-white text-sm">
                              <span>
                                {item.quantity}x {item.productName}
                              </span>
                            </div>

                            {/* Roll Specs */}
                            {parsedConfig && parsedConfig.rolls && (
                              <div className="text-[11px] text-zinc-300 pl-2 border-l-2 border-palki-red space-y-0.5 mt-1">
                                <div className="text-amber-300 font-semibold text-[10px]">
                                  Queso crema incluido en todos los rolls
                                </div>
                                {parsedConfig.rolls.map((r: any, rI: number) => (
                                  <div key={rI}>
                                    <strong>Roll #{rI + 1}:</strong> {r.protein} + {r.vegetable} | Env:{" "}
                                    <span className="text-amber-300 font-bold">{r.wrap}</span>
                                    {r.acevichado ? (
                                      <span className="text-amber-400 ml-1 font-bold">
                                        (+Acevichado)
                                      </span>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Item Notes */}
                            {item.notes && (
                              <div className="text-[11px] text-amber-300 font-bold bg-amber-950/40 p-1.5 rounded-lg border border-amber-800/40">
                                ⚡ Ojo Cocina: {item.notes}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Order General Notes */}
                    {order.notes && (
                      <div className="text-xs text-amber-200 bg-amber-950/30 p-2 rounded-xl border border-amber-800/30">
                        <strong>Nota Comanda:</strong> {order.notes}
                      </div>
                    )}
                  </div>

                  {/* Tactile Big Action Buttons for Kitchen / Dispatch */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                      <span>Estado Actual:</span>
                      <span className="font-bold uppercase text-white">
                        {order.status === "PENDING"
                          ? "Pendiente"
                          : order.status === "PREPARING"
                          ? "En Preparación"
                          : order.status === "READY"
                          ? "Listo"
                          : order.status === "ON_THE_WAY"
                          ? "En Reparto"
                          : order.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Botón 1: En Preparación */}
                      <button
                        type="button"
                        disabled={updatingId === order.id || isPreparing}
                        onClick={() => handleUpdateStatus(order.id, "PREPARING")}
                        className={`py-3 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                          isPreparing
                            ? "bg-purple-600 text-white shadow-lg ring-2 ring-purple-400"
                            : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        }`}
                      >
                        <Flame className="w-4 h-4" />
                        <span>En Cocina</span>
                      </button>

                      {/* Botón 2: Listo para Servir o Despachar */}
                      <button
                        type="button"
                        disabled={updatingId === order.id || isReady}
                        onClick={() => handleUpdateStatus(order.id, "READY")}
                        className={`py-3 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                          isReady
                            ? "bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400"
                            : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Listo</span>
                      </button>
                    </div>

                    {/* Siguiente paso según tipo de orden */}
                    {isDelivery && (
                      <button
                        type="button"
                        disabled={updatingId === order.id || isOnTheWay}
                        onClick={() => handleUpdateStatus(order.id, "ON_THE_WAY")}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isOnTheWay
                            ? "bg-cyan-600 text-white ring-2 ring-cyan-400"
                            : "bg-zinc-900 hover:bg-zinc-800 text-cyan-400 border border-zinc-800"
                        }`}
                      >
                        <Bike className="w-4 h-4" />
                        <span>Pasar a Reparto (Delivery en Camino)</span>
                      </button>
                    )}

                    {/* Botón Entregado / Cerrar comanda */}
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => handleUpdateStatus(order.id, "DELIVERED")}
                      className="w-full py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs border border-zinc-800 transition-colors"
                    >
                      ✓ Marcar como Entregado / Despachado
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
