import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [categories, rollOptions, promotions, deliveryZones] = await Promise.all([
      prisma.category.findMany({
        orderBy: { sortOrder: "asc" },
        include: {
          products: {
            where: { isAvailable: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      }),
      prisma.rollOption.findMany({
        where: { isAvailable: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.promotion.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.deliveryZone.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    return NextResponse.json({
      categories,
      rollOptions,
      promotions,
      deliveryZones,
    });
  } catch (error) {
    console.error("Error al obtener menú:", error);
    return NextResponse.json(
      { error: "Error al cargar la carta de Palkisushi" },
      { status: 500 }
    );
  }
}
