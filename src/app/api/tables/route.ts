import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tables = await prisma.restaurantTable.findMany({
      orderBy: { number: "asc" },
    });

    // Para cada mesa con activeOrderId, obtener la orden y sus items
    const populated = await Promise.all(
      tables.map(async (table) => {
        let activeOrder = null;
        if (table.activeOrderId) {
          activeOrder = await prisma.order.findUnique({
            where: { id: table.activeOrderId },
            include: { items: true },
          });
        }
        return {
          ...table,
          activeOrder,
        };
      })
    );

    return NextResponse.json({ tables: populated });
  } catch (error) {
    console.error("Error al obtener mesas:", error);
    return NextResponse.json(
      { error: "Error al consultar mesas" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { number, type = "TABLE", capacity = 4 } = body;

    if (!number) {
      return NextResponse.json(
        { error: "El identificador de la mesa es requerido (ej: Mesa 11)" },
        { status: 400 }
      );
    }

    const table = await prisma.restaurantTable.create({
      data: {
        number: number.trim(),
        type: type || "TABLE",
        capacity: Number(capacity) || 4,
        status: "FREE",
        isAvailable: true,
      },
    });

    return NextResponse.json({ success: true, table });
  } catch (error: any) {
    console.error("Error al crear mesa:", error);
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe una mesa con ese identificador" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error al crear mesa" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de mesa no especificado" },
        { status: 400 }
      );
    }

    await prisma.restaurantTable.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar mesa:", error);
    return NextResponse.json(
      { error: "Error al eliminar mesa" },
      { status: 500 }
    );
  }
}
