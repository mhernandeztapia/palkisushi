import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "TODAY"; // "TODAY", "WEEK", "MONTH", "ALL"

    let startDate: Date | undefined;
    const now = new Date();

    if (range === "TODAY") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (range === "WEEK") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === "MONTH") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    }

    const whereClause: any = {
      status: { not: "CANCELLED" },
    };

    if (startDate) {
      whereClause.createdAt = { gte: startDate };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    let localRevenue = 0;
    let localCount = 0;
    let deliveryRevenue = 0;
    let deliveryCount = 0;
    let pickupRevenue = 0;
    let pickupCount = 0;

    let cashTotal = 0;
    let transferTotal = 0;
    let posTotal = 0;

    let tipTotal = 0;
    let totalRevenue = 0;

    orders.forEach((o) => {
      totalRevenue += o.total;
      tipTotal += o.tip;

      if (o.orderType === "DINE_IN") {
        localRevenue += o.total;
        localCount++;
      } else if (o.orderType === "DELIVERY") {
        deliveryRevenue += o.total;
        deliveryCount++;
      } else if (o.orderType === "PICKUP") {
        pickupRevenue += o.total;
        pickupCount++;
      }

      if (o.paymentMethod === "CASH") cashTotal += o.total;
      else if (o.paymentMethod === "TRANSFER") transferTotal += o.total;
      else if (o.paymentMethod === "POS") posTotal += o.total;
    });

    const totalOrdersCount = orders.length;
    const averageTicket = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

    return NextResponse.json({
      range,
      totalRevenue,
      tipTotal,
      totalOrdersCount,
      averageTicket,
      breakdownByType: {
        local: { revenue: localRevenue, count: localCount },
        delivery: { revenue: deliveryRevenue, count: deliveryCount },
        pickup: { revenue: pickupRevenue, count: pickupCount },
      },
      breakdownByPayment: {
        cash: cashTotal,
        transfer: transferTotal,
        pos: posTotal,
      },
      recentOrders: orders.slice(0, 15),
    });
  } catch (error) {
    console.error("Error al obtener resumen de ventas:", error);
    return NextResponse.json(
      { error: "Error al generar métricas de ventas" },
      { status: 500 }
    );
  }
}
