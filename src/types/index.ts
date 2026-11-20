export type OrderType = "DELIVERY" | "PICKUP" | "DINE_IN";
export type PaymentMethod = "CASH" | "TRANSFER" | "POS";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "ON_THE_WAY"
  | "DELIVERED"
  | "CANCELLED";
export type PaymentStatus = "PENDING_PAYMENT" | "PAID";
export type TableStatus = "FREE" | "OCCUPIED" | "BILL_REQUESTED";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  sortOrder: number;
  products?: Product[];
}

export interface Product {
  id: string;
  name: string;
  slug?: string | null;
  description: string;
  price: number;
  categoryId: string;
  image?: string | null;
  badge?: string | null;
  pieces?: number | null;
  isAvailable: boolean;
  sortOrder?: number;
  category?: Category;
}

export interface RollOption {
  id: string;
  type: "BASE_PIECES" | "PROTEIN" | "VEGETABLE" | "WRAP" | "EXTRA";
  name: string;
  pieces?: number | null;
  price: number;
  description?: string | null;
  isAvailable: boolean;
  sortOrder: number;
}

export interface SingleRollSubItem {
  rollIndex: number; // 1, 2, 3...
  protein: string;
  proteinExtra: number;
  vegetable: string;
  vegetableExtra: number;
  wrap: string;
  wrapExtra: number;
  acevichado: boolean;
  acevichadoExtra: number;
}

export interface CustomRollConfig {
  totalPieces: number;
  rollsCount: number; // e.g. 40 pieces = 4 rolls
  basePrice: number;
  rolls: SingleRollSubItem[];
  allIncludeCreamCheese: boolean; // always true by default
}

export interface CartItem {
  id: string; // unique cart item id (e.g. timestamp/uuid)
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  isCustomRoll?: boolean;
  rollConfig?: CustomRollConfig;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  badge?: string | null;
  scheduleType?: "ALWAYS" | "DAY_OF_WEEK" | "WEEK" | "MONTH" | string;
  dayOfWeek?: number | null;
  weekOfMonth?: number | null;
  monthOfYear?: number | null;
  isActive: boolean;
  bannerText?: string | null;
}

export interface DeliveryZone {
  id: string;
  name: string;
  price: number;
  estimatedMinutes?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface RestaurantTable {
  id: string;
  number: string;
  type: string;
  status: TableStatus | string;
  capacity: number;
  activeOrderId?: string | null;
  isAvailable: boolean;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
}

export interface CreateOrderPayload {
  orderType: OrderType;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  deliveryZoneId?: string;
  deliveryZoneName?: string;
  deliveryFee: number;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  status?: OrderStatus;
  notes?: string;
  tableNumber?: string;
  tip: number;
  deliveryNoticeAccepted?: boolean;
  items: {
    productId?: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    notes?: string;
    rollConfig?: string; // stringified JSON
  }[];
}

export interface OrderItemRecord {
  id: string;
  orderId: string;
  productId?: string | null;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  rollConfig?: string | null;
  notes?: string | null;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  orderType: OrderType;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerAddress?: string | null;
  deliveryZoneId?: string | null;
  deliveryZoneName?: string | null;
  deliveryFee: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  tip: number;
  total: number;
  notes?: string | null;
  tableNumber?: string | null;
  deliveryNoticeAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  items: OrderItemRecord[];
}
