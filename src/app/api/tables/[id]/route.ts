import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const allowedData: Record<string, any> = {};

    if (body.status !== undefined) allowedData.status = body.status;
    if (body.isAvailable !== undefined) allowedData.isAvailable = body.isAvailable;
    if (body.capacity !== undefined) allowedData.capacity = Number(body.capacity);
    if (body.activeOrderId !== undefined) allowedData.activeOrderId = body.activeOrderId;
    if (body.number !== undefined) allowedData.number = body.number.trim();

    const updated = await prisma.restaurantTable.update({
      where: { id },
      data: allowedData,
    });

    return NextResponse.json({ success: true, table: updated });
  } catch (error) {
    console.error("Error al actualizar mesa:", error);
    return NextResponse.json(
      { error: "Error al actualizar estado de la mesa" },
      { status: 500 }
    );
  }
}
