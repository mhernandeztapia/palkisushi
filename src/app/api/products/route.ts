import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { sortOrder: "asc" },
      include: { category: true },
    });
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    });
    const rollOptions = await prisma.rollOption.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ products, categories, rollOptions });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json(
      { error: "Error al obtener productos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      description = "",
      price,
      categoryId,
      badge = null,
      pieces = null,
      isAvailable = true,
    } = body;

    if (!name || price === undefined || !categoryId) {
      return NextResponse.json(
        { error: "Nombre, precio y categoría son obligatorios" },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : "",
        price: Number(price),
        categoryId,
        badge: badge ? badge.trim() : null,
        pieces: pieces ? Number(pieces) : null,
        isAvailable: Boolean(isAvailable),
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json(
      { error: "Error al crear el producto" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, type, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID no especificado" },
        { status: 400 }
      );
    }

    // Si es un RollOption (opción de arma tu roll)
    if (type === "ROLL_OPTION") {
      const updateData: Record<string, any> = {};
      if (fields.price !== undefined) updateData.price = Number(fields.price);
      if (fields.isAvailable !== undefined) updateData.isAvailable = Boolean(fields.isAvailable);
      if (fields.name !== undefined) updateData.name = fields.name;

      const updatedOpt = await prisma.rollOption.update({
        where: { id },
        data: updateData,
      });
      return NextResponse.json({ success: true, rollOption: updatedOpt });
    }

    // Producto regular
    const updateData: Record<string, any> = {};
    if (fields.name !== undefined) updateData.name = fields.name.trim();
    if (fields.description !== undefined) updateData.description = fields.description.trim();
    if (fields.price !== undefined) updateData.price = Number(fields.price);
    if (fields.categoryId !== undefined) updateData.categoryId = fields.categoryId;
    if (fields.badge !== undefined) updateData.badge = fields.badge ? fields.badge.trim() : null;
    if (fields.pieces !== undefined) updateData.pieces = fields.pieces ? Number(fields.pieces) : null;
    if (fields.isAvailable !== undefined) updateData.isAvailable = Boolean(fields.isAvailable);
    if (fields.sortOrder !== undefined) updateData.sortOrder = Number(fields.sortOrder);

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json(
      { error: "Error al actualizar el producto" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id) {
      return NextResponse.json(
        { error: "ID no especificado" },
        { status: 400 }
      );
    }

    if (type === "ROLL_OPTION") {
      await prisma.rollOption.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json(
      { error: "Error al eliminar el producto" },
      { status: 500 }
    );
  }
}
