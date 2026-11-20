"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  CartItem,
  CustomRollConfig,
  DeliveryZone,
  OrderType,
  PaymentMethod,
  Product,
} from "@/types";
import { formatCLP } from "@/lib/formatters";

// Teléfono oficial de Palkisushi Los Niches (WhatsApp)
export const PALKI_WHATSAPP_PHONE = "56972109865"; // Número de Palkisushi Los Niches

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  orderType: OrderType;
  deliveryZone: DeliveryZone | null;
  customDistanceKm: number | null;
  deliveryFee: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes: string;
  paymentMethod: PaymentMethod;
  tip: number;
  tipPercentage: number | null;
  deliveryNoticeAccepted: boolean;
  subtotal: number;
  total: number;
  itemCount: number;
  isSubmitting: boolean;
  lastCreatedOrder: { orderNumber: string; id: string } | null;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number, itemNotes?: string) => void;
  addCustomRoll: (rollConfig: CustomRollConfig, itemNotes?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setOrderType: (type: OrderType) => void;
  setDeliveryZone: (zone: DeliveryZone | null) => void;
  setCustomDistanceKm: (km: number | null) => void;
  setCustomerName: (name: string) => void;
  setCustomerPhone: (phone: string) => void;
  setCustomerAddress: (address: string) => void;
  setNotes: (notes: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setTipPercentage: (percentage: number | null) => void;
  setCustomTip: (amount: number) => void;
  setDeliveryNoticeAccepted: (accepted: boolean) => void;
  submitOrder: () => Promise<{ success: boolean; orderNumber?: string; error?: string }>;
  getWhatsAppUrl: (orderNumber?: string) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>("DELIVERY");
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone | null>(null);
  const [customDistanceKm, setCustomDistanceKm] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("TRANSFER");
  const [tipPercentage, setTipPercentageState] = useState<number | null>(0);
  const [customTip, setCustomTipAmount] = useState<number>(0);
  const [deliveryNoticeAccepted, setDeliveryNoticeAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<{
    orderNumber: string;
    id: string;
  } | null>(null);

  // Cargar carrito desde localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("palkisushi_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
      const savedCustomer = localStorage.getItem("palkisushi_customer");
      if (savedCustomer) {
        const parsed = JSON.parse(savedCustomer);
        if (parsed.name) setCustomerName(parsed.name);
        if (parsed.phone) setCustomerPhone(parsed.phone);
        if (parsed.address) setCustomerAddress(parsed.address);
      }
    } catch {
      // Ignorar errores de parsing
    }
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    try {
      localStorage.setItem("palkisushi_cart", JSON.stringify(items));
    } catch {
      // Ignorar
    }
  }, [items]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Calcular subtotal de items
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Calcular costo de delivery
  let deliveryFee = 0;
  if (orderType === "DELIVERY") {
    if (deliveryZone) {
      deliveryFee = deliveryZone.price;
    } else if (customDistanceKm && customDistanceKm > 0) {
      // Cálculo dinámico por distancia: Base $1.000 + $600 por km
      deliveryFee = Math.max(1500, Math.round(1000 + customDistanceKm * 600));
    } else {
      deliveryFee = 1500; // Valor base por defecto Los Niches Centro
    }
  }

  // Calcular propina
  let tip = 0;
  if (tipPercentage !== null) {
    tip = Math.round((subtotal * tipPercentage) / 100);
  } else {
    tip = customTip;
  }

  const total = subtotal + deliveryFee + tip;
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const addItem = (product: Product, quantity = 1, itemNotes = "") => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === product.id && !i.isCustomRoll && (i.notes || "") === itemNotes
      );
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          id: `${product.id}-${Date.now()}`,
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          notes: itemNotes,
          isCustomRoll: false,
        },
      ];
    });
    openCart();
  };

  const addCustomRoll = (rollConfig: CustomRollConfig, itemNotes = "") => {
    // Calcular precio total del custom roll
    let totalPrice = rollConfig.basePrice;
    rollConfig.rolls.forEach((r) => {
      totalPrice += r.proteinExtra + r.vegetableExtra + r.wrapExtra + r.acevichadoExtra;
    });

    const itemName = `Arma tu Roll (${rollConfig.totalPieces} Piezas)`;

    setItems((prev) => [
      ...prev,
      {
        id: `custom-roll-${Date.now()}`,
        name: itemName,
        price: totalPrice,
        quantity: 1,
        notes: itemNotes,
        isCustomRoll: true,
        rollConfig,
      },
    ]);
    openCart();
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem("palkisushi_cart");
    } catch {}
  };

  const setTipPercentage = (percentage: number | null) => {
    setTipPercentageState(percentage);
  };

  const setCustomTip = (amount: number) => {
    setTipPercentageState(null);
    setCustomTipAmount(Math.max(0, amount));
  };

  const getWhatsAppUrl = (orderNumber?: string): string => {
    const numDisplay = orderNumber ? `#${orderNumber}` : "NUEVO";
    const paymentLabel =
      paymentMethod === "CASH"
        ? "Efectivo"
        : paymentMethod === "TRANSFER"
        ? "Transferencia Electrónica"
        : "Pago con Máquina (POS)";

    const typeLabel =
      orderType === "DELIVERY"
        ? `🛵 Delivery a Domicilio (${deliveryZone?.name || (customDistanceKm ? `${customDistanceKm} km` : "Zona General")})`
        : "🏬 Retiro en Local Palkisushi (Los Niches)";

    let message = `🍣 *NUEVO PEDIDO PALKISUSHI* (${numDisplay})\n`;
    message += `──────────────────\n`;
    message += `👤 *Cliente:* ${customerName || "Cliente"}\n`;
    message += `📞 *Teléfono:* ${customerPhone || "Sin especificar"}\n`;
    message += `📦 *Modalidad:* ${typeLabel}\n`;

    if (orderType === "DELIVERY") {
      message += `📍 *Dirección:* ${customerAddress || "A convenir"}\n`;
      message += `⚠️ *Regla Delivery:* Entendido que el despacho requiere pago previo verificado.\n`;
    }

    message += `💳 *Método de Pago:* ${paymentLabel}\n`;
    message += `──────────────────\n`;
    message += `📋 *DETALLE DEL PEDIDO:*\n\n`;

    items.forEach((item, idx) => {
      message += `${idx + 1}. *${item.quantity}x ${item.name}* - ${formatCLP(item.price * item.quantity)}\n`;

      if (item.isCustomRoll && item.rollConfig) {
        message += `   _Queso crema incluido en todos los rolls_\n`;
        item.rollConfig.rolls.forEach((r, rIdx) => {
          message += `   • Roll #${rIdx + 1}: ${r.protein} + ${r.vegetable} | Env: ${r.wrap}`;
          if (r.acevichado) message += ` + Acevichado (+${formatCLP(r.acevichadoExtra)})`;
          message += `\n`;
        });
      }

      if (item.notes) {
        message += `   ↳ _Nota: ${item.notes}_\n`;
      }
    });

    message += `\n──────────────────\n`;
    message += `Subtotal: ${formatCLP(subtotal)}\n`;
    if (orderType === "DELIVERY") {
      message += `Envío (${deliveryZone?.name || "Delivery"}): ${formatCLP(deliveryFee)}\n`;
    }
    if (tip > 0) {
      message += `Propina sugerida: ${formatCLP(tip)}\n`;
    }
    message += `🔥 *TOTAL A PAGAR: ${formatCLP(total)}*\n`;

    if (notes) {
      message += `\n📝 *Notas del cliente:* ${notes}\n`;
    }

    message += `\n📍 *Palkisushi - Japanese Food & Restobar*\nLos Niches, Curicó, Chile`;

    return `https://wa.me/${PALKI_WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
  };

  const submitOrder = async (): Promise<{
    success: boolean;
    orderNumber?: string;
    error?: string;
  }> => {
    if (items.length === 0) {
      return { success: false, error: "El carrito está vacío" };
    }

    if (!customerName.trim()) {
      return { success: false, error: "Por favor ingresa tu nombre" };
    }

    if (!customerPhone.trim()) {
      return { success: false, error: "Por favor ingresa tu número de teléfono" };
    }

    if (orderType === "DELIVERY") {
      if (!customerAddress.trim()) {
        return {
          success: false,
          error: "Para delivery es obligatorio ingresar tu dirección en Los Niches o Curicó",
        };
      }
      if (!deliveryNoticeAccepted) {
        return {
          success: false,
          error:
            "Debes confirmar haber leído la regla: Todo pedido delivery debe ser pagado antes de iniciar el despacho",
        };
      }
    }

    setIsSubmitting(true);

    try {
      // Guardar datos de cliente para próximas visitas
      try {
        localStorage.setItem(
          "palkisushi_customer",
          JSON.stringify({
            name: customerName,
            phone: customerPhone,
            address: customerAddress,
          })
        );
      } catch {}

      const payload = {
        orderType,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: orderType === "DELIVERY" ? customerAddress.trim() : null,
        deliveryZoneId: deliveryZone?.id || null,
        deliveryZoneName:
          orderType === "DELIVERY"
            ? deliveryZone?.name || (customDistanceKm ? `Por Distancia (${customDistanceKm} km)` : "Los Niches")
            : "Retiro en Local",
        deliveryFee,
        paymentMethod,
        tip,
        notes: notes.trim(),
        deliveryNoticeAccepted,
        items: items.map((item) => ({
          productId: item.productId || null,
          productName: item.name,
          unitPrice: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
          notes: item.notes || null,
          rollConfig: item.rollConfig ? JSON.stringify(item.rollConfig) : null,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al procesar el pedido");
      }

      const data = await res.json();
      const orderNumber = data.orderNumber;
      setLastCreatedOrder({ orderNumber, id: data.id });

      // Doble salida (Opción C): Abrir WhatsApp automáticamente
      const waUrl = getWhatsAppUrl(orderNumber);
      if (typeof window !== "undefined") {
        window.open(waUrl, "_blank");
      }

      // Vaciar carrito
      clearCart();

      return { success: true, orderNumber };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido al procesar el pedido";
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        orderType,
        deliveryZone,
        customDistanceKm,
        deliveryFee,
        customerName,
        customerPhone,
        customerAddress,
        notes,
        paymentMethod,
        tip,
        tipPercentage,
        deliveryNoticeAccepted,
        subtotal,
        total,
        itemCount,
        isSubmitting,
        lastCreatedOrder,
        openCart,
        closeCart,
        addItem,
        addCustomRoll,
        removeItem,
        updateQuantity,
        clearCart,
        setOrderType,
        setDeliveryZone,
        setCustomDistanceKm,
        setCustomerName,
        setCustomerPhone,
        setCustomerAddress,
        setNotes,
        setPaymentMethod,
        setTipPercentage,
        setCustomTip,
        setDeliveryNoticeAccepted,
        submitOrder,
        getWhatsAppUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return ctx;
}
