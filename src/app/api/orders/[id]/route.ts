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

    const allowedFields: Record<string, unknown> = {};

    if (body.status !== undefined) {
      allowedFields.status = body.status;
    }
    if (body.paymentStatus !== undefined) {
      allowedFields.paymentStatus = body.paymentStatus;
    }
    if (body.tableNumber !== undefined) {
      allowedFields.tableNumber = body.tableNumber;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: allowedFields,
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Error al actualizar pedido:", error);
    return NextResponse.json(
      { error: "Error al actualizar el pedido" },
      { status: 500 }
    );
  }
}
