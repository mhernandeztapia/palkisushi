"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  Unlock,
  KeyRound,
  UtensilsCrossed,
  Tag,
  Bike,
  BarChart3,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Search,
  ArrowLeft,
  DollarSign,
  Calendar,
  Layers,
  ChefHat,
  Clock,
  Sparkles,
  Users,
} from "lucide-react";
import { Category, Product, Promotion, DeliveryZone, RestaurantTable } from "@/types";
import { formatCLP } from "@/lib/formatters";

export default function AdminDashboardPage() {
  // Estado de Autenticación por PIN
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState("");
  const [newPinInput, setNewPinInput] = useState("");
  const [pinChangeMsg, setPinChangeMsg] = useState<string | null>(null);

  // Pestaña activa: 1=Carta, 2=Promos, 3=Delivery, 4=Mesas/Ventas
  const [activeTab, setActiveTab] = useState<"MENU" | "PROMOS" | "DELIVERY" | "SALES_TABLES">("MENU");

  // Datos para Pestaña 1 (Carta y Precios)
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rollOptions, setRollOptions] = useState<any[]>([]);
  const [menuSearch, setMenuSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    badge: "",
    pieces: "",
  });

  // Datos para Pestaña 2 (Promociones)
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isCreatingPromo, setIsCreatingPromo] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any | null>(null);
  const [promoForm, setPromoForm] = useState({
    title: "",
    description: "",
    badge: "2x1 Happy Hour",
    scheduleType: "DAY_OF_WEEK",
    dayOfWeek: "4", // Jueves por defecto
    weekOfMonth: "1",
    monthOfYear: "11",
    isActive: true,
    bannerText: "",
  });

  // Datos para Pestaña 3 (Delivery Dinámico & Zonas)
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [baseKmFee, setBaseKmFee] = useState<number>(1000);
  const [perKmFee, setPerKmFee] = useState<number>(500);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZonePrice, setNewZonePrice] = useState("");
  const [newZoneTime, setNewZoneTime] = useState("");
  const [deliveryMsg, setDeliveryMsg] = useState<string | null>(null);

  // Datos para Pestaña 4 (Mesas & Resumen de Ventas)
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newTableType, setNewTableType] = useState<"TABLE" | "BAR">("TABLE");
  const [newTableCapacity, setNewTableCapacity] = useState("4");
  const [salesSummary, setSalesSummary] = useState<any | null>(null);
  const [salesRange, setSalesRange] = useState<"TODAY" | "WEEK" | "MONTH" | "ALL">("TODAY");

  const [loading, setLoading] = useState(false);

  // Verificar si hay PIN guardado en sessionStorage al cargar
  useEffect(() => {
    const savedPin = sessionStorage.getItem("palkisushi_admin_auth");
    if (savedPin === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Cargar datos cuando está autenticado
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [menuRes, promosRes, delivRes, tablesRes, salesRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/promotions"),
        fetch("/api/delivery-settings"),
        fetch("/api/tables"),
        fetch(`/api/admin/sales?range=${salesRange}`),
      ]);

      if (menuRes.ok) {
        const m = await menuRes.json();
        setProducts(m.products || []);
        setCategories(m.categories || []);
        setRollOptions(m.rollOptions || []);
        if (m.categories?.length > 0 && !newProductForm.categoryId) {
          setNewProductForm((prev) => ({ ...prev, categoryId: m.categories[0].id }));
        }
      }

      if (promosRes.ok) {
        const p = await promosRes.json();
        setPromotions(p.promotions || []);
      }

      if (delivRes.ok) {
        const d = await delivRes.json();
        setDeliveryZones(d.zones || []);
        setBaseKmFee(d.baseKmFee || 1000);
        setPerKmFee(d.perKmFee || 500);
      }

      if (tablesRes.ok) {
        const t = await tablesRes.json();
        setTables(t.tables || []);
      }

      if (salesRes.ok) {
        const s = await salesRes.json();
        setSalesSummary(s);
      }
    } catch (err) {
      console.error("Error al cargar datos de administración:", err);
    } finally {
      setLoading(false);
    }
  }, [salesRange, newProductForm.categoryId]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated, loadAllData]);

  // Manejador de Login PIN
  const handlePinSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPinError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinInput }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem("palkisushi_admin_auth", "true");
        setPinInput("");
      } else {
        setPinError("PIN incorrecto. (Por defecto: 1234)");
      }
    } catch {
      setPinError("Error de conexión al validar PIN");
    }
  };

  // Cambiar PIN
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeMsg(null);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPin: currentPinInput, newPin: newPinInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setPinChangeMsg("✓ PIN actualizado con éxito");
        setCurrentPinInput("");
        setNewPinInput("");
        setTimeout(() => setIsChangingPin(false), 2000);
      } else {
        setPinChangeMsg(data.error || "Error al actualizar PIN");
      }
    } catch {
      setPinChangeMsg("Error al actualizar PIN");
    }
  };

  // PESTAÑA 1: Operaciones de Productos y Precios
  const handleToggleProductStock = async (product: Product) => {
    try {
      await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          isAvailable: !product.isAvailable,
        }),
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, isAvailable: !p.isAvailable } : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProductPrice = async (id: string, newPrice: number) => {
    try {
      await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, price: newPrice }),
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, price: newPrice } : p))
      );
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.name || !newProductForm.price || !newProductForm.categoryId) return;

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProductForm),
      });
      if (res.ok) {
        await loadAllData();
        setIsCreatingProduct(false);
        setNewProductForm({
          name: "",
          description: "",
          price: "",
          categoryId: categories[0]?.id || "",
          badge: "",
          pieces: "",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // PESTAÑA 2: Operaciones de Promociones
  const handleTogglePromo = async (promo: Promotion) => {
    try {
      await fetch("/api/promotions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: promo.id, isActive: !promo.isActive }),
      });
      setPromotions((prev) =>
        prev.map((p) => (p.id === promo.id ? { ...p, isActive: !p.isActive } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPromo) {
        await fetch("/api/promotions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingPromo.id, ...promoForm }),
        });
      } else {
        await fetch("/api/promotions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(promoForm),
        });
      }
      setIsCreatingPromo(false);
      setEditingPromo(null);
      await loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm("¿Eliminar esta promoción?")) return;
    try {
      await fetch(`/api/promotions?id=${id}`, { method: "DELETE" });
      setPromotions((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // PESTAÑA 3: Guardar Tarifas de Delivery
  const handleSaveKmFees = async () => {
    setDeliveryMsg(null);
    try {
      const res = await fetch("/api/delivery-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_KM_SETTINGS",
          baseKmFee,
          perKmFee,
        }),
      });
      if (res.ok) {
        setDeliveryMsg("✓ Tarifas de distancia actualizadas correctamente");
        setTimeout(() => setDeliveryMsg(null), 3000);
      }
    } catch {
      setDeliveryMsg("Error al guardar tarifas");
    }
  };

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName || !newZonePrice) return;
    try {
      const res = await fetch("/api/delivery-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_ZONE",
          zone: {
            name: newZoneName,
            price: Number(newZonePrice),
            estimatedMinutes: newZoneTime,
          },
        }),
      });
      if (res.ok) {
        setNewZoneName("");
        setNewZonePrice("");
        setNewZoneTime("");
        await loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteZone = async (id: string) => {
    if (!confirm("¿Eliminar esta zona de delivery?")) return;
    try {
      await fetch("/api/delivery-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_ZONE",
          zone: { id },
        }),
      });
      setDeliveryZones((prev) => prev.filter((z) => z.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // PESTAÑA 4: Operaciones de Mesas
  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber) return;
    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: newTableNumber,
          type: newTableType,
          capacity: Number(newTableCapacity),
        }),
      });
      if (res.ok) {
        setNewTableNumber("");
        await loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTable = async (id: string, num: string) => {
    if (!confirm(`¿Eliminar la mesa "${num}" del salón?`)) return;
    try {
      await fetch(`/api/tables?id=${id}`, { method: "DELETE" });
      setTables((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 1. PANTALLA DE ACCESO PROTEGIDO CON PIN (Estilo Apple Lock)
  // ─────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm p-8 rounded-3xl bg-zinc-950/90 border border-white/10 shadow-2xl text-center space-y-6 backdrop-blur-2xl animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-palki-red/20 border border-palki-red/30 text-palki-red flex items-center justify-center mx-auto shadow-glow">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-white tracking-tight">
              Panel Administrativo
            </h2>
            <p className="text-xs text-zinc-400">
              Ingresa el PIN de seguridad de Palkisushi
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="• • • •"
                className="w-full text-center text-2xl tracking-[0.5em] font-black bg-zinc-900 border border-zinc-800 rounded-2xl py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-palki-red"
                autoFocus
              />
            </div>

            {pinError && (
              <div className="text-xs text-red-400 flex items-center justify-center gap-1.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            {/* Teclado numérico táctil estilo Apple */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPinInput((prev) => (prev.length < 6 ? prev + num : prev))}
                  className="py-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-lg font-bold text-white border border-white/5 active:scale-95 transition-all"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPinInput("")}
                className="py-3 rounded-xl bg-zinc-900/40 hover:bg-zinc-800 text-xs font-bold text-zinc-400 border border-white/5"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => setPinInput((prev) => (prev.length < 6 ? prev + "0" : prev))}
                className="py-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-lg font-bold text-white border border-white/5 active:scale-95 transition-all"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => setPinInput((prev) => prev.slice(0, -1))}
                className="py-3 rounded-xl bg-zinc-900/40 hover:bg-zinc-800 text-xs font-bold text-zinc-400 border border-white/5"
              >
                Borrar
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-palki-red hover:bg-palki-redHover text-white font-extrabold text-sm shadow-glow transition-all"
            >
              Desbloquear Panel
            </button>
          </form>

          <div className="text-[11px] text-zinc-500">
            PIN por defecto: <strong className="text-zinc-400">1234</strong>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. PANEL ADMINISTRADOR PRINCIPAL AUTENTICADO
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#070709] text-white pb-24">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Carta Web</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-palki-red/40 bg-black/60 p-0.5">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>Administración Palkisushi</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-palki-red/20 text-palki-red border border-palki-red/30">
                    Pro
                  </span>
                </h1>
                <p className="text-xs text-zinc-400">
                  Control de carta, promociones programadas, delivery y mesas
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsChangingPin(!isChangingPin)}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-800 flex items-center gap-1.5 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Cambiar PIN</span>
            </button>

            <button
              onClick={() => {
                sessionStorage.removeItem("palkisushi_admin_auth");
                setIsAuthenticated(false);
              }}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 text-xs font-semibold border border-zinc-800 transition-colors"
              title="Cerrar sesión"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modal para cambiar PIN */}
        {isChangingPin && (
          <div className="p-4 bg-zinc-900/95 border-t border-b border-zinc-800 animate-slide-up">
            <div className="max-w-md mx-auto space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>Actualizar PIN de Seguridad</span>
                <button
                  onClick={() => setIsChangingPin(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleChangePin} className="flex gap-2">
                <input
                  type="password"
                  placeholder="PIN actual..."
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value)}
                  className="w-1/2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  required
                />
                <input
                  type="password"
                  placeholder="Nuevo PIN (4+ dígitos)..."
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  className="w-1/2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-palki-red text-white text-xs font-bold rounded-xl shrink-0"
                >
                  Guardar
                </button>
              </form>

              {pinChangeMsg && (
                <div className="text-xs text-amber-300">{pinChangeMsg}</div>
              )}
            </div>
          </div>
        )}

        {/* 4 Pestañas Principales */}
        <div className="border-t border-white/5 bg-zinc-950/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-2">
              {[
                {
                  id: "MENU",
                  label: "1. Carta y Precios",
                  icon: UtensilsCrossed,
                  color: "text-amber-400",
                },
                {
                  id: "PROMOS",
                  label: "2. Promociones Programadas",
                  icon: Tag,
                  color: "text-palki-red",
                },
                {
                  id: "DELIVERY",
                  label: "3. Tarifas de Delivery",
                  icon: Bike,
                  color: "text-cyan-400",
                },
                {
                  id: "SALES_TABLES",
                  label: "4. Mesas & Resumen Ventas",
                  icon: BarChart3,
                  color: "text-emerald-400",
                },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                      isActive
                        ? "bg-white text-black border-white shadow-card font-black"
                        : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-black" : tab.color}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ─────────────────────────────────────────────────────────────
            PESTAÑA 1: GESTIÓN DE CARTA Y PRECIOS
        ────────────────────────────────────────────────────────────── */}
        {activeTab === "MENU" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="Buscar plato o roll..."
                    className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-palki-red"
                  />
                </div>

                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="text-xs bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="ALL">Todas las Categorías</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsCreatingProduct(true)}
                className="px-4 py-2.5 rounded-xl bg-palki-red hover:bg-palki-redHover text-white text-xs font-bold flex items-center gap-1.5 shadow-glow transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Nuevo Plato</span>
              </button>
            </div>

            {/* Modal para Crear Nuevo Plato */}
            {isCreatingProduct && (
              <div className="p-5 rounded-2xl bg-zinc-900 border border-palki-red/40 space-y-4 animate-slide-up">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-palki-red" />
                    <span>Crear Nuevo Producto en Carta</span>
                  </h3>
                  <button
                    onClick={() => setIsCreatingProduct(false)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-zinc-400 font-semibold block mb-1">
                      Nombre del Plato *
                    </label>
                    <input
                      type="text"
                      required
                      value={newProductForm.name}
                      onChange={(e) =>
                        setNewProductForm({ ...newProductForm, name: e.target.value })
                      }
                      placeholder="Ej: Roll Especial Curicó"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 font-semibold block mb-1">
                      Precio en CLP ($) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newProductForm.price}
                      onChange={(e) =>
                        setNewProductForm({ ...newProductForm, price: e.target.value })
                      }
                      placeholder="Ej: 8500"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 font-semibold block mb-1">
                      Categoría *
                    </label>
                    <select
                      required
                      value={newProductForm.categoryId}
                      onChange={(e) =>
                        setNewProductForm({ ...newProductForm, categoryId: e.target.value })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 font-semibold block mb-1">
                      Badge / Etiqueta destacada
                    </label>
                    <input
                      type="text"
                      value={newProductForm.badge}
                      onChange={(e) =>
                        setNewProductForm({ ...newProductForm, badge: e.target.value })
                      }
                      placeholder="Ej: Nuevo, Recomendado, Top"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-zinc-400 font-semibold block mb-1">
                      Descripción e Ingredientes
                    </label>
                    <textarea
                      rows={2}
                      value={newProductForm.description}
                      onChange={(e) =>
                        setNewProductForm({ ...newProductForm, description: e.target.value })
                      }
                      placeholder="Detalla los ingredientes y acompañamientos..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingProduct(false)}
                      className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-palki-red text-white font-bold"
                    >
                      Guardar Plato
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tabla de Productos */}
            <div className="bg-zinc-950/70 border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <span>Carta de Productos ({products.length} platos)</span>
                <span>Precios en tiempo real</span>
              </div>

              <div className="divide-y divide-white/5">
                {products
                  .filter((p) => {
                    if (selectedCategoryFilter !== "ALL" && p.categoryId !== selectedCategoryFilter) return false;
                    if (menuSearch && !p.name.toLowerCase().includes(menuSearch.toLowerCase())) return false;
                    return true;
                  })
                  .map((p) => (
                    <div
                      key={p.id}
                      className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-zinc-900/40 transition-colors"
                    >
                      <div className="space-y-1 max-w-lg">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {p.name}
                          </span>
                          {p.badge && (
                            <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full">
                              {p.badge}
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-md">
                            {p.category?.name}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-1">
                          {p.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        {editingProduct?.id === p.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-zinc-400">$</span>
                            <input
                              type="number"
                              defaultValue={p.price}
                              className="w-24 text-xs bg-black border border-palki-red rounded-lg px-2 py-1 text-white font-bold"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleSaveProductPrice(p.id, Number((e.target as any).value));
                                }
                              }}
                              id={`price-${p.id}`}
                            />
                            <button
                              onClick={() => {
                                const input = document.getElementById(`price-${p.id}`) as HTMLInputElement;
                                if (input) handleSaveProductPrice(p.id, Number(input.value));
                              }}
                              className="p-1 rounded bg-emerald-600 text-white"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingProduct(null)}
                              className="p-1 rounded bg-zinc-800 text-zinc-400"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => setEditingProduct(p)}
                            className="cursor-pointer group flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-800"
                            title="Haz clic para editar precio"
                          >
                            <span className="text-sm font-extrabold text-white">
                              {formatCLP(p.price)}
                            </span>
                            <Edit2 className="w-3 h-3 text-zinc-500 group-hover:text-amber-400" />
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleProductStock(p)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                            p.isAvailable
                              ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/40 hover:bg-emerald-900/40"
                              : "bg-red-950/40 text-red-300 border-red-800/40 hover:bg-red-900/40"
                          }`}
                        >
                          {p.isAvailable ? "✓ En Stock" : "Pausado (Sin stock)"}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            PESTAÑA 2: GESTOR DE PROMOCIONES PROGRAMADAS
        ────────────────────────────────────────────────────────────── */}
        {activeTab === "PROMOS" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-palki-red" />
                  <span>Promociones Programadas por Día / Semana / Mes</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Las promociones activas se muestran automáticamente en el banner superior de la web en su día correspondiente.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingPromo(null);
                  setIsCreatingPromo(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-palki-red hover:bg-palki-redHover text-white text-xs font-bold flex items-center gap-1.5 shadow-glow"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Promoción</span>
              </button>
            </div>

            {/* Formulario Crear/Editar Promoción */}
            {isCreatingPromo && (
              <div className="p-5 rounded-2xl bg-zinc-900 border border-palki-red/40 space-y-4 animate-slide-up">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <h4 className="text-sm font-bold text-white">
                    {editingPromo ? "Editar Promoción" : "Programar Nueva Promoción"}
                  </h4>
                  <button
                    onClick={() => {
                      setIsCreatingPromo(false);
                      setEditingPromo(null);
                    }}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSavePromo} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-zinc-400 font-semibold block mb-1">
                      Título de la Promoción *
                    </label>
                    <input
                      type="text"
                      required
                      value={promoForm.title}
                      onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                      placeholder="Ej: Jueves de Happy Hour: Tragos 2x1"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 font-semibold block mb-1">
                      Etiqueta / Badge
                    </label>
                    <input
                      type="text"
                      value={promoForm.badge}
                      onChange={(e) => setPromoForm({ ...promoForm, badge: e.target.value })}
                      placeholder="Ej: 2x1 Happy Hour, Fin de Semana"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 font-semibold block mb-1">
                      Frecuencia / Programación
                    </label>
                    <select
                      value={promoForm.scheduleType}
                      onChange={(e) => setPromoForm({ ...promoForm, scheduleType: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="DAY_OF_WEEK">Día Específico de la Semana</option>
                      <option value="ALWAYS">Siempre Activa</option>
                      <option value="WEEK">Semana del Mes</option>
                      <option value="MONTH">Mes Específico</option>
                    </select>
                  </div>

                  {promoForm.scheduleType === "DAY_OF_WEEK" && (
                    <div>
                      <label className="text-zinc-400 font-semibold block mb-1">
                        Día de la Semana
                      </label>
                      <select
                        value={promoForm.dayOfWeek}
                        onChange={(e) => setPromoForm({ ...promoForm, dayOfWeek: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="1">Lunes</option>
                        <option value="2">Martes</option>
                        <option value="3">Miércoles</option>
                        <option value="4">Jueves (Happy Hour)</option>
                        <option value="5">Viernes</option>
                        <option value="6">Sábado</option>
                        <option value="0">Domingo</option>
                      </select>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="text-zinc-400 font-semibold block mb-1">
                      Texto del Banner Superior Web
                    </label>
                    <input
                      type="text"
                      value={promoForm.bannerText}
                      onChange={(e) => setPromoForm({ ...promoForm, bannerText: e.target.value })}
                      placeholder="Ej: 🍹 ¡Jueves de Happy Hour! Tragos 2x1 en barra y terraza en Palkisushi"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-zinc-400 font-semibold block mb-1">
                      Descripción de la Promoción
                    </label>
                    <textarea
                      rows={2}
                      value={promoForm.description}
                      onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                      placeholder="Detalles y condiciones de la promoción..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingPromo(false);
                        setEditingPromo(null);
                      }}
                      className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-palki-red text-white font-bold"
                    >
                      Guardar Promoción
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Listado de Promociones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promotions.map((p) => {
                const dayLabels = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
                const dayName = p.dayOfWeek !== null && p.dayOfWeek !== undefined ? dayLabels[p.dayOfWeek] : "Día";

                return (
                  <div
                    key={p.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                      p.isActive
                        ? "bg-zinc-900/80 border-palki-red/30 shadow-card"
                        : "bg-zinc-950/60 border-white/5 opacity-60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-amber-300 bg-amber-950/60 border border-amber-800/40 px-2.5 py-0.5 rounded-full">
                          {p.badge || "PROMO"}
                        </span>
                        <div className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {p.scheduleType === "DAY_OF_WEEK"
                              ? `Todos los ${dayName}`
                              : p.scheduleType === "ALWAYS"
                              ? "Siempre Activa"
                              : "Programada"}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-white mt-2">
                        {p.title}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1">
                        {p.description}
                      </p>

                      {p.bannerText && (
                        <div className="text-[11px] text-zinc-300 bg-black/40 p-2 rounded-lg mt-2 border border-white/5">
                          📢 <strong>Banner:</strong> {p.bannerText}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => handleTogglePromo(p)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
                          p.isActive
                            ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/40"
                            : "bg-zinc-800 text-zinc-400 border-zinc-700"
                        }`}
                      >
                        {p.isActive ? "✓ Activa en Web" : "Pausada"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePromo(p.id)}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 p-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            PESTAÑA 3: TARIFAS DE DELIVERY DINÁMICAS & ZONAS
        ────────────────────────────────────────────────────────────── */}
        {activeTab === "DELIVERY" && (
          <div className="space-y-6 animate-fade-in">
            {/* Calculador Dinámico por KM */}
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  Cálculo Dinámico por Kilómetros
                </h3>
              </div>
              <p className="text-xs text-zinc-400">
                Aplica cuando el cliente ingresa los kilómetros aproximados desde Los Niches hasta su destino.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">
                    Tarifa Base en CLP ($)
                  </label>
                  <input
                    type="number"
                    value={baseKmFee}
                    onChange={(e) => setBaseKmFee(Number(e.target.value))}
                    className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">
                    Valor adicional por Kilómetro ($/km)
                  </label>
                  <input
                    type="number"
                    value={perKmFee}
                    onChange={(e) => setPerKmFee(Number(e.target.value))}
                    className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveKmFees}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Guardar Tarifas por KM
                </button>
                {deliveryMsg && (
                  <span className="text-xs text-emerald-400">{deliveryMsg}</span>
                )}
              </div>
            </div>

            {/* Zonas Preconfiguradas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Zonas Predefinidas Alrededor de Los Niches y Curicó
                </h4>
              </div>

              {/* Form Crear Zona */}
              <form onSubmit={handleCreateZone} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row gap-2.5 items-end">
                <div className="flex-1 w-full sm:w-auto">
                  <label className="text-[11px] text-zinc-400 font-semibold block mb-1">
                    Nombre de la Zona
                  </label>
                  <input
                    type="text"
                    required
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    placeholder="Ej: Sector El Boldo"
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="w-full sm:w-36">
                  <label className="text-[11px] text-zinc-400 font-semibold block mb-1">
                    Tarifa ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={newZonePrice}
                    onChange={(e) => setNewZonePrice(e.target.value)}
                    placeholder="Ej: 3000"
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="w-full sm:w-36">
                  <label className="text-[11px] text-zinc-400 font-semibold block mb-1">
                    Tiempo estimado
                  </label>
                  <input
                    type="text"
                    value={newZoneTime}
                    onChange={(e) => setNewZoneTime(e.target.value)}
                    placeholder="Ej: 30-40 min"
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-palki-red text-white text-xs font-bold rounded-xl shrink-0"
                >
                  Agregar Zona
                </button>
              </form>

              {/* Grid de Zonas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {deliveryZones.map((z) => (
                  <div
                    key={z.id}
                    className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">
                          {z.name}
                        </span>
                        <span className="font-black text-amber-300 text-sm">
                          {formatCLP(z.price)}
                        </span>
                      </div>
                      {z.estimatedMinutes && (
                        <div className="text-[11px] text-zinc-400 mt-1">
                          ⏱️ {z.estimatedMinutes}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/5 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleDeleteZone(z.id)}
                        className="text-xs text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            PESTAÑA 4: GESTIÓN DE MESAS Y RESUMEN DE VENTAS
        ────────────────────────────────────────────────────────────── */}
        {activeTab === "SALES_TABLES" && (
          <div className="space-y-8 animate-fade-in">
            {/* SECCIÓN A: RESUMEN DE VENTAS */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                    <span>Métricas y Resumen de Ventas</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Ventas registradas y separadas por salón, delivery y retiro
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-xl border border-white/5">
                  {[
                    { key: "TODAY", label: "Hoy" },
                    { key: "WEEK", label: "7 Días" },
                    { key: "MONTH", label: "Este Mes" },
                    { key: "ALL", label: "Histórico" },
                  ].map((r) => (
                    <button
                      key={r.key}
                      onClick={() => setSalesRange(r.key as any)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        salesRange === r.key
                          ? "bg-white text-black shadow-card"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {salesSummary && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-zinc-900/80 border border-emerald-500/30">
                      <div className="text-[11px] text-emerald-400 font-bold uppercase">
                        Total Recaudado
                      </div>
                      <div className="text-2xl font-black text-white mt-1">
                        {formatCLP(salesSummary.totalRevenue || 0)}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {salesSummary.totalOrdersCount} comandas finalizadas
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/5">
                      <div className="text-[11px] text-amber-400 font-bold uppercase">
                        Salón (Mesas)
                      </div>
                      <div className="text-xl font-black text-white mt-1">
                        {formatCLP(salesSummary.breakdownByType?.local?.revenue || 0)}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {salesSummary.breakdownByType?.local?.count || 0} mesas atendidas
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/5">
                      <div className="text-[11px] text-palki-red font-bold uppercase">
                        Delivery a Domicilio
                      </div>
                      <div className="text-xl font-black text-white mt-1">
                        {formatCLP(salesSummary.breakdownByType?.delivery?.revenue || 0)}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {salesSummary.breakdownByType?.delivery?.count || 0} despachos
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/5">
                      <div className="text-[11px] text-cyan-400 font-bold uppercase">
                        Retiro en Local
                      </div>
                      <div className="text-xl font-black text-white mt-1">
                        {formatCLP(salesSummary.breakdownByType?.pickup?.revenue || 0)}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {salesSummary.breakdownByType?.pickup?.count || 0} retiros
                      </div>
                    </div>
                  </div>

                  {/* Desglose por Método de Pago */}
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <span className="font-bold text-zinc-400 uppercase">
                      Desglose por Método de Pago:
                    </span>
                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-zinc-400">POS / Tarjeta: </span>
                        <strong className="text-white">
                          {formatCLP(salesSummary.breakdownByPayment?.pos || 0)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-zinc-400">Transferencia: </span>
                        <strong className="text-white">
                          {formatCLP(salesSummary.breakdownByPayment?.transfer || 0)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-zinc-400">Efectivo: </span>
                        <strong className="text-white">
                          {formatCLP(salesSummary.breakdownByPayment?.cash || 0)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* SECCIÓN B: GESTIÓN DE MESAS DEL SALÓN */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-400" />
                    <span>Configuración de Mesas y Salón</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Agrega o quita mesas y barras del plano operativo de garzones
                  </p>
                </div>
              </div>

              {/* Form Crear Mesa */}
              <form onSubmit={handleCreateTable} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row gap-2.5 items-end">
                <div className="flex-1 w-full sm:w-auto">
                  <label className="text-[11px] text-zinc-400 font-semibold block mb-1">
                    Identificador de la Mesa *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(e.target.value)}
                    placeholder="Ej: Mesa 11, Barra 5, Terraza 1..."
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="w-full sm:w-36">
                  <label className="text-[11px] text-zinc-400 font-semibold block mb-1">
                    Tipo
                  </label>
                  <select
                    value={newTableType}
                    onChange={(e) => setNewTableType(e.target.value as any)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="TABLE">Mesa de Salón</option>
                    <option value="BAR">Barra</option>
                  </select>
                </div>

                <div className="w-full sm:w-32">
                  <label className="text-[11px] text-zinc-400 font-semibold block mb-1">
                    Capacidad (personas)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newTableCapacity}
                    onChange={(e) => setNewTableCapacity(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 bg-palki-red text-white text-xs font-bold rounded-xl shrink-0"
                >
                  Agregar al Salón
                </button>
              </form>

              {/* Grid de Mesas configuradas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{table.number}</div>
                      <div className="text-[10px] text-zinc-500">
                        {table.type === "BAR" ? "Barra" : "Mesa"} ({table.capacity} p.)
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteTable(table.id, table.number)}
                      className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                      title="Eliminar mesa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
