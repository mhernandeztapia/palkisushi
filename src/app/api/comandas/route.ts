import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/comandas
 * Abre o suma productos a una comanda de salón (DINE_IN)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tableId,
      tableNumber,
      items,
      waiterName = "Garzón",
      notes = "",
      tip = 0,
      paymentMethod = "POS",
    } = body;

    if (!tableId || !tableNumber) {
      return NextResponse.json(
        { error: "Mesa no especificada" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Debe incluir al menos un producto en la comanda" },
        { status: 400 }
      );
    }

    // Verificar si la mesa ya tiene una orden activa
    const table = await prisma.restaurantTable.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      return NextResponse.json(
        { error: "Mesa no encontrada" },
        { status: 404 }
      );
    }

    let activeOrder = null;
    if (table.activeOrderId) {
      activeOrder = await prisma.order.findUnique({
        where: { id: table.activeOrderId },
        include: { items: true },
      });
      // Si la orden previa ya está entregada o cancelada, la descartamos
      if (
        activeOrder &&
        (activeOrder.status === "DELIVERED" || activeOrder.status === "CANCELLED")
      ) {
        activeOrder = null;
      }
    }

    const itemsSubtotal = items.reduce(
      (acc: number, it: any) =>
        acc + Number(it.unitPrice) * (Number(it.quantity) || 1),
      0
    );

    if (activeOrder) {
      // 1. SUMAR PRODUCTOS A LA ORDEN EXISTENTE
      await prisma.orderItem.createMany({
        data: items.map((it: any) => ({
          orderId: activeOrder.id,
          productId: it.productId || null,
          productName: it.productName,
          unitPrice: Number(it.unitPrice),
          quantity: Number(it.quantity) || 1,
          subtotal: Number(it.subtotal) || Number(it.unitPrice) * (Number(it.quantity) || 1),
          notes: it.notes || null,
          rollConfig: it.rollConfig ? (typeof it.rollConfig === "string" ? it.rollConfig : JSON.stringify(it.rollConfig)) : null,
        })),
      });

      const updatedSubtotal = activeOrder.subtotal + itemsSubtotal;
      const updatedTotal = updatedSubtotal + (Number(tip) || activeOrder.tip);

      const updatedOrder = await prisma.order.update({
        where: { id: activeOrder.id },
        data: {
          subtotal: updatedSubtotal,
          tip: Number(tip) || activeOrder.tip,
          total: updatedTotal,
          status: "PREPARING", // Vuelve a entrar en preparación por los nuevos items
          notes: notes
            ? `${activeOrder.notes || ""}${activeOrder.notes ? " | " : ""}${notes}`
            : activeOrder.notes,
        },
        include: { items: true },
      });

      await prisma.restaurantTable.update({
        where: { id: tableId },
        data: { status: "OCCUPIED" },
      });

      return NextResponse.json({
        success: true,
        order: updatedOrder,
        isNew: false,
      });
    } else {
      // 2. CREAR NUEVA COMANDA PARA LA MESA
      const totalOrders = await prisma.order.count();
      const orderNumber = `PK-${tableNumber.replace(/\s+/g, "")}-${1000 + totalOrders + 1}`;

      const total = itemsSubtotal + Number(tip);

      const newOrder = await prisma.order.create({
        data: {
          orderNumber,
          orderType: "DINE_IN",
          status: "PREPARING",
          customerName: `${tableNumber} (${waiterName})`,
          customerPhone: "Salón Local",
          tableNumber,
          paymentMethod: paymentMethod || "POS",
          paymentStatus: "PENDING_PAYMENT",
          subtotal: itemsSubtotal,
          tip: Number(tip),
          total,
          notes: notes || null,
          items: {
            create: items.map((it: any) => ({
              productId: it.productId || null,
              productName: it.productName,
              unitPrice: Number(it.unitPrice),
              quantity: Number(it.quantity) || 1,
              subtotal: Number(it.subtotal) || Number(it.unitPrice) * (Number(it.quantity) || 1),
              notes: it.notes || null,
              rollConfig: it.rollConfig ? (typeof it.rollConfig === "string" ? it.rollConfig : JSON.stringify(it.rollConfig)) : null,
            })),
          },
        },
        include: { items: true },
      });

      // Vincular orden a la mesa y marcar como OCUPADA
      await prisma.restaurantTable.update({
        where: { id: tableId },
        data: {
          status: "OCCUPIED",
          activeOrderId: newOrder.id,
        },
      });

      return NextResponse.json({
        success: true,
        order: newOrder,
        isNew: true,
      });
    }
  } catch (error) {
    console.error("Error al procesar comanda:", error);
    return NextResponse.json(
      { error: "Error al registrar la comanda" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/comandas
 * Cobrar cuenta y liberar mesa
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tableId,
      orderId,
      paymentMethod = "POS",
      tip = 0,
    } = body;

    if (!tableId || !orderId) {
      return NextResponse.json(
        { error: "Datos incompletos para cerrar mesa" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    const finalTotal = order.subtotal + Number(tip);

    // Actualizar orden como PAGADA y ENTREGADA
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        status: "DELIVERED",
        paymentMethod,
        tip: Number(tip),
        total: finalTotal,
      },
    });

    // Liberar la mesa
    await prisma.restaurantTable.update({
      where: { id: tableId },
      data: {
        status: "FREE",
        activeOrderId: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Mesa liberada y cuenta cobrada exitosamente",
    });
  } catch (error) {
    console.error("Error al cobrar comanda:", error);
    return NextResponse.json(
      { error: "Error al cerrar comanda de mesa" },
      { status: 500 }
    );
  }
}
