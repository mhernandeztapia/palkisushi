import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      orderType,
      customerName,
      customerPhone,
      customerAddress,
      deliveryZoneId,
      deliveryZoneName,
      deliveryFee = 0,
      paymentMethod = "TRANSFER",
      notes,
      tip = 0,
      deliveryNoticeAccepted = false,
      items,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "El pedido debe contener al menos un producto" },
        { status: 400 }
      );
    }

    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { error: "Nombre y teléfono del cliente son requeridos" },
        { status: 400 }
      );
    }

    if (orderType === "DELIVERY" && !customerAddress) {
      return NextResponse.json(
        { error: "La dirección es obligatoria para pedidos con delivery" },
        { status: 400 }
      );
    }

    // Calcular subtotal de items
    const subtotal = items.reduce(
      (sum: number, it: { unitPrice: number; quantity: number }) =>
        sum + (it.unitPrice || 0) * (it.quantity || 1),
      0
    );

    const total = subtotal + Number(deliveryFee) + Number(tip);

    // Generar un número de orden único y elegante, ej: PK-1042
    const todayCount = await prisma.order.count();
    const orderNumber = `PK-${1000 + todayCount + 1}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        orderType: orderType || "DELIVERY",
        status: "PENDING",
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress ? customerAddress.trim() : null,
        deliveryZoneId: deliveryZoneId || null,
        deliveryZoneName: deliveryZoneName || null,
        deliveryFee: Number(deliveryFee),
        paymentMethod: paymentMethod || "TRANSFER",
        paymentStatus: "PENDING_PAYMENT", // Siempre pendiente antes del despacho
        subtotal,
        tip: Number(tip),
        total,
        notes: notes ? notes.trim() : null,
        deliveryNoticeAccepted: Boolean(deliveryNoticeAccepted),
        items: {
          create: items.map((it: {
            productId?: string;
            productName: string;
            unitPrice: number;
            quantity: number;
            subtotal: number;
            notes?: string;
            rollConfig?: string;
          }) => ({
            productId: it.productId || null,
            productName: it.productName,
            unitPrice: Number(it.unitPrice),
            quantity: Number(it.quantity) || 1,
            subtotal: Number(it.subtotal) || Number(it.unitPrice) * (Number(it.quantity) || 1),
            notes: it.notes || null,
            rollConfig: it.rollConfig || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      order,
    });
  } catch (error) {
    console.error("Error al crear pedido:", error);
    return NextResponse.json(
      { error: "Error al registrar el pedido en el sistema" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
      take: 100,
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return NextResponse.json(
      { error: "Error al consultar pedidos" },
      { status: 500 }
    );
  }
}
