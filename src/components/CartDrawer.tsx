"use client";

import React, { useState } from "react";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Bike,
  Store,
  CreditCard,
  Banknote,
  Send,
  ShieldAlert,
  CheckCircle2,
  MessageCircle,
  AlertCircle,
  Loader2,
  MapPin,
  HeartHandshake,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCLP } from "@/lib/formatters";
import { DeliveryZone, OrderType, PaymentMethod } from "@/types";

interface CartDrawerProps {
  deliveryZones: DeliveryZone[];
}

export function CartDrawer({ deliveryZones }: CartDrawerProps) {
  const {
    items,
    isCartOpen,
    closeCart,
    orderType,
    setOrderType,
    deliveryZone,
    setDeliveryZone,
    customDistanceKm,
    setCustomDistanceKm,
    deliveryFee,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    customerAddress,
    setCustomerAddress,
    notes,
    setNotes,
    paymentMethod,
    setPaymentMethod,
    tip,
    tipPercentage,
    setTipPercentage,
    setCustomTip,
    deliveryNoticeAccepted,
    setDeliveryNoticeAccepted,
    subtotal,
    total,
    removeItem,
    updateQuantity,
    submitOrder,
    isSubmitting,
    lastCreatedOrder,
    getWhatsAppUrl,
  } = useCart();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successOrderNumber, setSuccessOrderNumber] = useState<string | null>(null);
  const [isKmMode, setIsKmMode] = useState(false);
  const [customTipInput, setCustomTipInput] = useState("");

  if (!isCartOpen) return null;

  const handleOrderSubmit = async () => {
    setErrorMsg(null);

    // Si no ha seleccionado zona de delivery y no está en km mode
    if (orderType === "DELIVERY" && !deliveryZone && !customDistanceKm) {
      if (deliveryZones.length > 0) {
        setDeliveryZone(deliveryZones[0]);
      }
    }

    const res = await submitOrder();
    if (!res.success) {
      setErrorMsg(res.error || "Ocurrió un error al procesar el pedido");
    } else {
      setSuccessOrderNumber(res.orderNumber || "CONFIRMADO");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-palki-card border-l border-white/10 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/5 bg-zinc-950/80 backdrop-blur-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-palki-red/20 border border-palki-red/30 flex items-center justify-center text-palki-red">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">
                  Tu Pedido Palkisushi
                </h3>
                <span className="text-xs text-palki-muted">
                  {items.length} {items.length === 1 ? "producto" : "productos"}
                </span>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Screen after Order Submission */}
          {successOrderNumber ? (
            <div className="p-6 overflow-y-auto space-y-6 text-center my-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  ¡Pedido Registrado con Éxito!
                </span>
                <h4 className="text-2xl font-black text-white">
                  Orden #{successOrderNumber}
                </h4>
                <p className="text-xs text-zinc-400">
                  Tu pedido ha sido guardado en la base de datos de Palkisushi y se abrió WhatsApp para su confirmación.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Cliente:</span>
                  <span className="font-semibold text-white">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Modalidad:</span>
                  <span className="font-semibold text-white">
                    {orderType === "DELIVERY" ? "Delivery" : "Retiro en Local"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total a Pagar:</span>
                  <span className="font-bold text-palki-red text-sm">
                    {formatCLP(total)}
                  </span>
                </div>
                {orderType === "DELIVERY" && (
                  <div className="mt-2 pt-2 border-t border-zinc-800 text-[11px] text-amber-300">
                    ⚠️ Recuerda enviar el comprobante de transferencia por WhatsApp antes de despachar.
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href={getWhatsAppUrl(successOrderNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Reabrir WhatsApp del Local</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setSuccessOrderNumber(null);
                    closeCart();
                  }}
                  className="w-full py-3 px-4 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-800 transition-colors"
                >
                  Cerrar y Volver a la Carta
                </button>
              </div>
            </div>
          ) : (
            /* Regular Cart Content */
            <>
              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
                {items.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-base">
                        Tu carrito está vacío
                      </h4>
                      <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                        Agrega rolls, ceviches, tablas o papas bravas de nuestra carta para comenzar tu pedido.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Items List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                        <span>Items seleccionados</span>
                        <span>{formatCLP(subtotal)}</span>
                      </div>

                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h5 className="text-sm font-bold text-white leading-tight">
                                {item.name}
                              </h5>
                              <div className="text-xs font-extrabold text-palki-red mt-0.5">
                                {formatCLP(item.price)}
                              </div>

                              {/* Custom Roll Specs Breakdown */}
                              {item.isCustomRoll && item.rollConfig && (
                                <div className="mt-2 space-y-1 border-t border-zinc-800 pt-1.5 text-[11px] text-zinc-400">
                                  <div className="text-amber-300 font-medium">
                                    ✓ Queso crema incluido
                                  </div>
                                  {item.rollConfig.rolls.map((r, rIdx) => (
                                    <div key={rIdx} className="leading-snug">
                                      <span className="text-zinc-300 font-semibold">
                                        Roll #{rIdx + 1}:
                                      </span>{" "}
                                      {r.protein} + {r.vegetable} ({r.wrap})
                                      {r.acevichado && (
                                        <span className="text-amber-400 ml-1">
                                          +Acevichado
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {item.notes && (
                                <div className="text-[11px] text-zinc-400 italic mt-1">
                                  Nota: &quot;{item.notes}&quot;
                                </div>
                              )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-xl border border-white/5">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
                              >
                                {item.quantity === 1 ? (
                                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                ) : (
                                  <Minus className="w-3 h-3" />
                                )}
                              </button>

                              <span className="w-6 text-center text-xs font-bold text-white">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* MODALIDAD DE ENTREGA: Delivery vs Retiro */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <label className="text-xs font-bold text-white uppercase tracking-wider">
                        Modalidad de Pedido
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setOrderType("DELIVERY")}
                          className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                            orderType === "DELIVERY"
                              ? "bg-palki-red/15 border-palki-red text-white shadow-glow"
                              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                          }`}
                        >
                          <Bike
                            className={`w-5 h-5 ${
                              orderType === "DELIVERY" ? "text-palki-red" : "text-zinc-500"
                            }`}
                          />
                          <div>
                            <div className="text-xs font-bold">Delivery</div>
                            <div className="text-[10px] text-zinc-400">
                              A tu domicilio
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setOrderType("PICKUP")}
                          className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                            orderType === "PICKUP"
                              ? "bg-white text-black border-white shadow-card"
                              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                          }`}
                        >
                          <Store
                            className={`w-5 h-5 ${
                              orderType === "PICKUP" ? "text-black" : "text-zinc-500"
                            }`}
                          />
                          <div>
                            <div className="text-xs font-bold">Retiro en Local</div>
                            <div className="text-[10px] text-zinc-400">
                              Los Niches ($0)
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* SELECCIÓN DE ZONA DE DELIVERY */}
                    {orderType === "DELIVERY" && (
                      <div className="space-y-3 p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-white flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-palki-red" />
                            <span>Sector de Despacho</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setIsKmMode(!isKmMode);
                              if (!isKmMode) setDeliveryZone(null);
                            }}
                            className="text-[11px] text-amber-400 hover:underline"
                          >
                            {isKmMode ? "Seleccionar sector" : "Calcular por KM"}
                          </button>
                        </div>

                        {!isKmMode ? (
                          <div className="space-y-1.5">
                            {deliveryZones.map((zone) => {
                              const isSelected = deliveryZone?.id === zone.id;
                              return (
                                <button
                                  key={zone.id}
                                  type="button"
                                  onClick={() => {
                                    setDeliveryZone(zone);
                                    setCustomDistanceKm(null);
                                  }}
                                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                                    isSelected
                                      ? "bg-palki-red/20 border-palki-red text-white font-semibold"
                                      : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                                  }`}
                                >
                                  <div>
                                    <span>{zone.name}</span>
                                    {zone.estimatedMinutes && (
                                      <span className="text-[10px] text-zinc-400 ml-2">
                                        ({zone.estimatedMinutes})
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-bold text-amber-300">
                                    {formatCLP(zone.price)}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                max="30"
                                step="0.5"
                                value={customDistanceKm || ""}
                                onChange={(e) =>
                                  setCustomDistanceKm(
                                    e.target.value ? parseFloat(e.target.value) : null
                                  )
                                }
                                placeholder="Distancia aproximada en km..."
                                className="w-full text-xs bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-palki-red"
                              />
                              <span className="text-xs text-zinc-400 font-bold">
                                KM
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400">
                              Cálculo dinámico: Base $1.000 + $600 por km. Envío calculado:{" "}
                              <strong className="text-white">
                                {formatCLP(deliveryFee)}
                              </strong>
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* DATOS DEL CLIENTE */}
                    <div className="space-y-3 pt-2 border-t border-white/5">
                      <label className="text-xs font-bold text-white uppercase tracking-wider">
                        Tus Datos de Contacto
                      </label>

                      <div className="space-y-2">
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Nombre y Apellido *"
                          className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-palki-red"
                        />

                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="Teléfono / WhatsApp (ej: +56 9 1234 5678) *"
                          className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-palki-red"
                        />

                        {orderType === "DELIVERY" && (
                          <input
                            type="text"
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            placeholder="Dirección exacta en Los Niches / Curicó (Calle, N°, Referencias) *"
                            className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-palki-red"
                          />
                        )}
                      </div>
                    </div>

                    {/* MÉTODO DE PAGO */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <label className="text-xs font-bold text-white uppercase tracking-wider">
                        Método de Pago
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            key: "TRANSFER" as PaymentMethod,
                            label: "Transferencia",
                            icon: Send,
                          },
                          {
                            key: "CASH" as PaymentMethod,
                            label: "Efectivo",
                            icon: Banknote,
                          },
                          {
                            key: "POS" as PaymentMethod,
                            label: "Máquina POS",
                            icon: CreditCard,
                          },
                        ].map((m) => {
                          const isSelected = paymentMethod === m.key;
                          const Icon = m.icon;
                          return (
                            <button
                              key={m.key}
                              type="button"
                              onClick={() => setPaymentMethod(m.key)}
                              className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1 text-xs transition-all ${
                                isSelected
                                  ? "bg-palki-red/20 border-palki-red text-white font-bold"
                                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                              }`}
                            >
                              <Icon className="w-4 h-4 text-palki-red" />
                              <span className="text-[11px]">{m.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* REGLA DE NEGOCIO OBLIGATORIA (DELIVERY PRE-PAGADO) */}
                    {orderType === "DELIVERY" && (
                      <div className="p-3.5 rounded-2xl bg-red-950/40 border border-palki-red/40 space-y-2.5 text-xs text-red-200">
                        <div className="flex items-start gap-2">
                          <ShieldAlert className="w-5 h-5 text-palki-red shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white block font-bold">
                              Regla de Despacho Palkisushi:
                            </strong>
                            <span>
                              Todo pedido delivery debe ser pagado antes de iniciar el despacho desde nuestro restobar.
                            </span>
                          </div>
                        </div>

                        <label className="flex items-start gap-2.5 pt-1.5 cursor-pointer border-t border-red-900/40">
                          <input
                            type="checkbox"
                            checked={deliveryNoticeAccepted}
                            onChange={(e) =>
                              setDeliveryNoticeAccepted(e.target.checked)
                            }
                            className="mt-0.5 w-4 h-4 rounded text-palki-red bg-zinc-900 border-red-800 focus:ring-palki-red"
                          />
                          <span className="text-[11px] text-white/90">
                            Entiendo y confirmo que realizaré el pago antes del despacho de mi pedido.
                          </span>
                        </label>
                      </div>
                    )}

                    {/* PROPINA SUGERIDA */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <HeartHandshake className="w-3.5 h-3.5 text-palki-red" />
                          <span>Propina / Servicio</span>
                        </label>
                        <span className="text-zinc-400 font-semibold">
                          {formatCLP(tip)}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setTipPercentage(0)}
                          className={`py-2 rounded-xl text-xs border transition-all ${
                            tipPercentage === 0
                              ? "bg-zinc-800 border-zinc-600 text-white font-bold"
                              : "bg-zinc-900/80 border-zinc-800 text-zinc-400"
                          }`}
                        >
                          0%
                        </button>

                        <button
                          type="button"
                          onClick={() => setTipPercentage(10)}
                          className={`py-2 rounded-xl text-xs border transition-all flex flex-col items-center ${
                            tipPercentage === 10
                              ? "bg-palki-red/20 border-palki-red text-white font-bold"
                              : "bg-zinc-900/80 border-zinc-800 text-zinc-400"
                          }`}
                        >
                          <span>10% Sugerido</span>
                          <span className="text-[10px] text-amber-300">
                            {formatCLP(Math.round(subtotal * 0.1))}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const val = prompt(
                              "Ingresa el monto de propina voluntaria en pesos (CLP):",
                              "1000"
                            );
                            if (val && !isNaN(Number(val))) {
                              setCustomTip(Number(val));
                            }
                          }}
                          className={`py-2 rounded-xl text-xs border transition-all ${
                            tipPercentage === null
                              ? "bg-zinc-800 border-zinc-600 text-white font-bold"
                              : "bg-zinc-900/80 border-zinc-800 text-zinc-400"
                          }`}
                        >
                          Otro Monto
                        </button>
                      </div>
                    </div>

                    {/* NOTAS GENERALES */}
                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      <label className="text-xs font-bold text-white uppercase tracking-wider">
                        Notas Generales para el Local
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ej: Extra soya, jengibre, sin cebollín, tocar timbre blanco..."
                        className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-palki-red"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="px-4 py-2 bg-red-950/80 border-t border-red-800 flex items-center gap-2 text-xs text-red-200">
                  <AlertCircle className="w-4 h-4 text-palki-red shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Drawer Footer with Financial Summary & Action */}
              {items.length > 0 && (
                <div className="p-4 sm:p-5 border-t border-white/10 bg-zinc-950 space-y-4">
                  {/* Desglose de totales */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Subtotal de productos:</span>
                      <span className="font-medium text-white">
                        {formatCLP(subtotal)}
                      </span>
                    </div>

                    {orderType === "DELIVERY" && (
                      <div className="flex justify-between text-zinc-400">
                        <span>
                          Envío ({deliveryZone?.name || (customDistanceKm ? `${customDistanceKm} km` : "Los Niches")}):
                        </span>
                        <span className="font-medium text-amber-300">
                          {formatCLP(deliveryFee)}
                        </span>
                      </div>
                    )}

                    {tip > 0 && (
                      <div className="flex justify-between text-zinc-400">
                        <span>Propina:</span>
                        <span className="font-medium text-white">
                          {formatCLP(tip)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-baseline pt-2 border-t border-zinc-800 text-sm">
                      <span className="font-bold text-white">Total a Pagar:</span>
                      <span className="font-black text-xl text-white">
                        {formatCLP(total)}
                      </span>
                    </div>
                  </div>

                  {/* Botón de doble confirmación (BD + WhatsApp) */}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleOrderSubmit}
                    className="w-full py-3.5 px-4 rounded-full bg-palki-red hover:bg-palki-redHover disabled:opacity-50 text-white font-extrabold text-sm shadow-glow hover:shadow-glow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Registrando Pedido...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5 text-white" />
                        <span>Confirmar Pedido y Abrir WhatsApp</span>
                      </>
                    )}
                  </button>

                  <div className="text-center text-[10px] text-zinc-500">
                    🔒 Tu pedido se almacena inmediatamente en el sistema interno del local.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
