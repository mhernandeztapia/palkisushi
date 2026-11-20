import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ promotions });
  } catch (error) {
    console.error("Error al obtener promociones:", error);
    return NextResponse.json(
      { error: "Error al obtener promociones" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      badge = null,
      scheduleType = "DAY_OF_WEEK",
      dayOfWeek = null,
      weekOfMonth = null,
      monthOfYear = null,
      isActive = true,
      bannerText = null,
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Título y descripción son requeridos" },
        { status: 400 }
      );
    }

    const promo = await prisma.promotion.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        badge: badge ? badge.trim() : null,
        scheduleType: scheduleType || "DAY_OF_WEEK",
        dayOfWeek: dayOfWeek !== null && dayOfWeek !== "" ? Number(dayOfWeek) : null,
        weekOfMonth: weekOfMonth !== null && weekOfMonth !== "" ? Number(weekOfMonth) : null,
        monthOfYear: monthOfYear !== null && monthOfYear !== "" ? Number(monthOfYear) : null,
        isActive: Boolean(isActive),
        bannerText: bannerText ? bannerText.trim() : null,
      },
    });

    return NextResponse.json({ success: true, promotion: promo });
  } catch (error) {
    console.error("Error al crear promoción:", error);
    return NextResponse.json(
      { error: "Error al crear promoción" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID no especificado" },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};
    if (fields.title !== undefined) updateData.title = fields.title.trim();
    if (fields.description !== undefined) updateData.description = fields.description.trim();
    if (fields.badge !== undefined) updateData.badge = fields.badge ? fields.badge.trim() : null;
    if (fields.scheduleType !== undefined) updateData.scheduleType = fields.scheduleType;
    if (fields.dayOfWeek !== undefined) {
      updateData.dayOfWeek = fields.dayOfWeek !== null && fields.dayOfWeek !== "" ? Number(fields.dayOfWeek) : null;
    }
    if (fields.weekOfMonth !== undefined) {
      updateData.weekOfMonth = fields.weekOfMonth !== null && fields.weekOfMonth !== "" ? Number(fields.weekOfMonth) : null;
    }
    if (fields.monthOfYear !== undefined) {
      updateData.monthOfYear = fields.monthOfYear !== null && fields.monthOfYear !== "" ? Number(fields.monthOfYear) : null;
    }
    if (fields.isActive !== undefined) updateData.isActive = Boolean(fields.isActive);
    if (fields.bannerText !== undefined) updateData.bannerText = fields.bannerText ? fields.bannerText.trim() : null;

    const updated = await prisma.promotion.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, promotion: updated });
  } catch (error) {
    console.error("Error al actualizar promoción:", error);
    return NextResponse.json(
      { error: "Error al actualizar la promoción" },
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
        { error: "ID no especificado" },
        { status: 400 }
      );
    }

    await prisma.promotion.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar promoción:", error);
    return NextResponse.json(
      { error: "Error al eliminar la promoción" },
      { status: 500 }
    );
  }
}
