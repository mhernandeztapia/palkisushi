import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json();

    const storedPin = await prisma.systemSetting.findUnique({
      where: { key: "admin_pin" },
    });

    const validPin = storedPin ? storedPin.value : "1234";

    if (pin === validPin) {
      return NextResponse.json({ success: true, authorized: true });
    } else {
      return NextResponse.json(
        { success: false, error: "PIN incorrecto" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error al validar PIN:", error);
    return NextResponse.json(
      { error: "Error de servidor al validar PIN" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { currentPin, newPin } = await req.json();

    const stored = await prisma.systemSetting.findUnique({
      where: { key: "admin_pin" },
    });
    const validPin = stored ? stored.value : "1234";

    if (currentPin !== validPin) {
      return NextResponse.json(
        { error: "El PIN actual es incorrecto" },
        { status: 401 }
      );
    }

    if (!newPin || String(newPin).length < 4) {
      return NextResponse.json(
        { error: "El nuevo PIN debe tener al menos 4 dígitos" },
        { status: 400 }
      );
    }

    await prisma.systemSetting.upsert({
      where: { key: "admin_pin" },
      update: { value: String(newPin) },
      create: { key: "admin_pin", value: String(newPin) },
    });

    return NextResponse.json({ success: true, message: "PIN actualizado exitosamente" });
  } catch (error) {
    console.error("Error al cambiar PIN:", error);
    return NextResponse.json(
      { error: "Error al actualizar PIN" },
      { status: 500 }
    );
  }
}
