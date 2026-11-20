import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const zones = await prisma.deliveryZone.findMany({
      orderBy: { sortOrder: "asc" },
    });

    const [baseSetting, perKmSetting] = await Promise.all([
      prisma.systemSetting.findUnique({
        where: { key: "delivery_base_km_fee" },
      }),
      prisma.systemSetting.findUnique({
        where: { key: "delivery_per_km_fee" },
      }),
    ]);

    return NextResponse.json({
      zones,
      baseKmFee: baseSetting ? Number(baseSetting.value) : 1000,
      perKmFee: perKmSetting ? Number(perKmSetting.value) : 500,
    });
  } catch (error) {
    console.error("Error al obtener tarifas de delivery:", error);
    return NextResponse.json(
      { error: "Error al obtener tarifas de delivery" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, baseKmFee, perKmFee, zone } = body;

    if (action === "UPDATE_KM_SETTINGS") {
      if (baseKmFee !== undefined) {
        await prisma.systemSetting.upsert({
          where: { key: "delivery_base_km_fee" },
          update: { value: String(baseKmFee) },
          create: { key: "delivery_base_km_fee", value: String(baseKmFee) },
        });
      }
      if (perKmFee !== undefined) {
        await prisma.systemSetting.upsert({
          where: { key: "delivery_per_km_fee" },
          update: { value: String(perKmFee) },
          create: { key: "delivery_per_km_fee", value: String(perKmFee) },
        });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "CREATE_ZONE") {
      if (!zone || !zone.name || zone.price === undefined) {
        return NextResponse.json(
          { error: "Nombre y tarifa de zona son obligatorios" },
          { status: 400 }
        );
      }
      const newZone = await prisma.deliveryZone.create({
        data: {
          name: zone.name.trim(),
          price: Number(zone.price),
          estimatedMinutes: zone.estimatedMinutes ? zone.estimatedMinutes.trim() : null,
          isActive: zone.isActive !== undefined ? Boolean(zone.isActive) : true,
          sortOrder: Number(zone.sortOrder) || 0,
        },
      });
      return NextResponse.json({ success: true, zone: newZone });
    }

    if (action === "UPDATE_ZONE") {
      if (!zone || !zone.id) {
        return NextResponse.json(
          { error: "ID de zona requerido" },
          { status: 400 }
        );
      }
      const updateData: Record<string, any> = {};
      if (zone.name !== undefined) updateData.name = zone.name.trim();
      if (zone.price !== undefined) updateData.price = Number(zone.price);
      if (zone.estimatedMinutes !== undefined) updateData.estimatedMinutes = zone.estimatedMinutes;
      if (zone.isActive !== undefined) updateData.isActive = Boolean(zone.isActive);
      if (zone.sortOrder !== undefined) updateData.sortOrder = Number(zone.sortOrder);

      const updated = await prisma.deliveryZone.update({
        where: { id: zone.id },
        data: updateData,
      });
      return NextResponse.json({ success: true, zone: updated });
    }

    if (action === "DELETE_ZONE") {
      if (!zone?.id) {
        return NextResponse.json(
          { error: "ID de zona requerido" },
          { status: 400 }
        );
      }
      await prisma.deliveryZone.delete({ where: { id: zone.id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (error) {
    console.error("Error al actualizar tarifas de delivery:", error);
    return NextResponse.json(
      { error: "Error al actualizar configuración de delivery" },
      { status: 500 }
    );
  }
}
