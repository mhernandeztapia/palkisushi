import { prisma } from "@/lib/prisma";
import { PalkiClientView } from "@/components/PalkiClientView";
import { Category, DeliveryZone, Promotion, RollOption } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
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

  return (
    <PalkiClientView
      categories={categories as unknown as Category[]}
      rollOptions={rollOptions as unknown as RollOption[]}
      promotions={promotions as unknown as Promotion[]}
      deliveryZones={deliveryZones as unknown as DeliveryZone[]}
    />
  );
}
