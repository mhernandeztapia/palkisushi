import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed para Palkisushi...");

  // Limpiar datos existentes
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.rollOption.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.deliveryZone.deleteMany();
  await prisma.restaurantTable.deleteMany();

  // 1. CATEGORÍAS
  const catTablas = await prisma.category.create({
    data: {
      name: "Tablas",
      slug: "tablas",
      description: "Tablas abundantes para picar y compartir con amigos",
      icon: "UtensilsCrossed",
      sortOrder: 1,
    },
  });

  const catPapas = await prisma.category.create({
    data: {
      name: "Papas Fritas",
      slug: "papas-fritas",
      description: "Papas rústicas y crocantes con toppings artesanales",
      icon: "Flame",
      sortOrder: 2,
    },
  });

  const catArmaRoll = await prisma.category.create({
    data: {
      name: "Sushi - Arma tu Roll",
      slug: "arma-tu-roll",
      description: "Personaliza tus rolls paso a paso. Todos incluyen queso crema",
      icon: "Sparkles",
      sortOrder: 3,
    },
  });

  const catMixSushi = await prisma.category.create({
    data: {
      name: "Mix Sushi (40 Piezas)",
      slug: "mix-sushi",
      description: "Promociones exclusivas de 40 piezas premium. Todos llevan queso crema",
      icon: "Boxes",
      sortOrder: 4,
    },
  });

  const catCeviches = await prisma.category.create({
    data: {
      name: "Ceviches",
      slug: "ceviches",
      description: "Pescados y mariscos frescos marinados con toque nikkei",
      icon: "Fish",
      sortOrder: 5,
    },
  });

  const catHamburguesas = await prisma.category.create({
    data: {
      name: "Hamburguesas Artesanales",
      slug: "hamburguesas",
      description: "En suave pan brioche. Todas incluyen papas fritas",
      icon: "Sandwich",
      sortOrder: 6,
    },
  });

  // 2. PRODUCTOS - TABLAS
  await prisma.product.createMany({
    data: [
      {
        name: "Tabla full Palki",
        description: "8 tutitos apanados, 8 empanadas de queso, 4 aros de cebolla, papas fritas y 4 salsas de la casa.",
        price: 12000,
        categoryId: catTablas.id,
        badge: "Especial de la Casa",
        sortOrder: 1,
      },
      {
        name: "Tabla Mix",
        description: "4 tutitos apanados, 4 empanadas de queso, papas fritas y 4 salsas de la casa.",
        price: 7000,
        categoryId: catTablas.id,
        badge: "Para 2 Personas",
        sortOrder: 2,
      },
    ],
  });

  // 3. PRODUCTOS - PAPAS FRITAS
  await prisma.product.createMany({
    data: [
      {
        name: "Papas Bravas",
        description: "Papas fritas crocantes, pollo apanado, queso cheddar fundido, tocino crocante y ciboulette fresco.",
        price: 6500,
        categoryId: catPapas.id,
        badge: "Más Vendido",
        sortOrder: 1,
      },
      {
        name: "Papas Cheddar",
        description: "Papas fritas crocantes, baño de queso cheddar, champiñones salteados y ciboulette fresco.",
        price: 6000,
        categoryId: catPapas.id,
        sortOrder: 2,
      },
    ],
  });

  // 4. PRODUCTOS - CEVICHES
  await prisma.product.createMany({
    data: [
      {
        name: "Ceviche de Salmón",
        description: "Salmón premium, cebolla morada en pluma fina, cilantro fresco, trilogía de pimentón, acompañado de crocante para servir.",
        price: 9000,
        categoryId: catCeviches.id,
        badge: "Fresco del Día",
        sortOrder: 1,
      },
      {
        name: "Ceviche Mixto",
        description: "Salmón, camarón seleccionado, cebolla morada, cilantro fresco, trilogía de pimentón, palta cremosa y crocante para servir.",
        price: 11000,
        categoryId: catCeviches.id,
        badge: "Recomendado",
        sortOrder: 2,
      },
    ],
  });

  // 5. PRODUCTOS - MIX SUSHI (40 Piezas)
  await prisma.product.createMany({
    data: [
      {
        name: "Mix Pacífico (40 piezas)",
        description: "10 Salmón palta ciboulette envuelto en tempura + 10 Camarón apanado ciboulette envuelto en palta + 10 Pulpo palta envuelto en ciboulette merken con salsa teriyaki + 10 Camarón apanado champiñón envuelto en queso ciboulette. Todos incluyen queso crema.",
        price: 19000,
        pieces: 40,
        categoryId: catMixSushi.id,
        badge: "Favorito del Chef",
        sortOrder: 1,
      },
      {
        name: "Mix Clásica (40 piezas)",
        description: "10 Pollo teriyaki ciboulette champiñón envuelto en tempura + 10 Churrasco palta envuelto en tempura merken + 10 Pollo palta envuelto en tempura + 10 Camarón palmito envuelto en tempura. Todos incluyen queso crema.",
        price: 18000,
        pieces: 40,
        categoryId: catMixSushi.id,
        badge: "100% Tempura",
        sortOrder: 2,
      },
      {
        name: "Mix Palki Sushi (40 piezas)",
        description: "10 Pollo palta envuelto en tempura + 10 Pollo apanado pimentón palta envuelto en tempura sin nori + 10 Salmón palta envuelta en tempura merken + 10 Pepino palta aceituna envuelto en salmón ahumado. Todos incluyen queso crema.",
        price: 18500,
        pieces: 40,
        categoryId: catMixSushi.id,
        badge: "Especial Palki",
        sortOrder: 3,
      },
    ],
  });

  // 6. PRODUCTOS - HAMBURGUESAS
  await prisma.product.createMany({
    data: [
      {
        name: "Hamburguesa Italiana",
        description: "Pan brioche artesanal, burger de res seleccionada, rodajas de tomate fresco, abundante palta cremosa y mayonesa casera. Incluye porción de papas fritas.",
        price: 7500,
        categoryId: catHamburguesas.id,
        badge: "Clásica Chilena",
        sortOrder: 1,
      },
      {
        name: "Hamburguesa Vaquera",
        description: "Pan brioche artesanal, burger de res seleccionada, queso cheddar fundido, tocino crocante y salsa Palki secreta. Incluye porción de papas fritas.",
        price: 8000,
        categoryId: catHamburguesas.id,
        badge: "Top Ventas",
        sortOrder: 2,
      },
      {
        name: "Hamburguesa Vegg Palki",
        description: "Pan brioche artesanal, burger de verduras sazonada, champiñones salteados, palta fresca, queso cheddar fundido y mayonesa. Incluye porción de papas fritas.",
        price: 7500,
        categoryId: catHamburguesas.id,
        badge: "Vegetariana",
        sortOrder: 3,
      },
    ],
  });

  // 7. OPCIONES PARA "ARMA TU ROLL"
  // A. Cantidad base de piezas
  const basePieces = [
    { pieces: 10, price: 4000 },
    { pieces: 20, price: 8000 },
    { pieces: 30, price: 12000 },
    { pieces: 40, price: 16000 },
    { pieces: 50, price: 20000 },
    { pieces: 60, price: 24000 },
    { pieces: 70, price: 28000 },
    { pieces: 80, price: 32000 },
    { pieces: 90, price: 36000 },
    { pieces: 100, price: 40000 },
  ];

  for (let i = 0; i < basePieces.length; i++) {
    await prisma.rollOption.create({
      data: {
        type: "BASE_PIECES",
        name: `${basePieces[i].pieces} Piezas`,
        pieces: basePieces[i].pieces,
        price: basePieces[i].price,
        description: `Incluye queso crema en cada roll de 10 piezas`,
        sortOrder: i + 1,
      },
    });
  }

  // B. Proteínas
  const proteins = [
    { name: "Pollo", price: 0 },
    { name: "Camarón", price: 0 },
    { name: "Pollo teriyaki", price: 0 },
    { name: "Salmón", price: 1000 },
    { name: "Kanikama", price: 0 },
    { name: "Churrasco", price: 0 },
    { name: "Pollo apanado", price: 0 },
    { name: "Camarón apanado", price: 0 },
    { name: "Pulpo", price: 1000 },
    { name: "Atún", price: 1000 },
  ];

  for (let i = 0; i < proteins.length; i++) {
    await prisma.rollOption.create({
      data: {
        type: "PROTEIN",
        name: proteins[i].name,
        price: proteins[i].price,
        sortOrder: i + 1,
      },
    });
  }

  // C. Verduras
  const vegetables = [
    { name: "Palta", price: 0 },
    { name: "Champiñón", price: 0 },
    { name: "Aceitunas negras", price: 0 },
    { name: "Ciboulette", price: 0 },
    { name: "Pimentón", price: 0 },
    { name: "Palmito", price: 0 },
    { name: "Pepino", price: 0 },
    { name: "Vegetariano (2 verduras a elección)", price: 0 },
  ];

  for (let i = 0; i < vegetables.length; i++) {
    await prisma.rollOption.create({
      data: {
        type: "VEGETABLE",
        name: vegetables[i].name,
        price: vegetables[i].price,
        sortOrder: i + 1,
      },
    });
  }

  // D. Envolturas
  const wraps = [
    { name: "Tempura (Crocante)", price: 0 },
    { name: "Palta", price: 1000 },
    { name: "Queso crema", price: 1000 },
    { name: "Ciboulette", price: 0 },
    { name: "Sésamo", price: 0 },
    { name: "Nori", price: 0 },
    { name: "Palta sésamo", price: 1000 },
    { name: "Queso ciboulette", price: 1000 },
    { name: "Salmón ahumado", price: 1000 },
    { name: "Merken", price: 0 },
    { name: "Nori tempura", price: 0 },
  ];

  for (let i = 0; i < wraps.length; i++) {
    await prisma.rollOption.create({
      data: {
        type: "WRAP",
        name: wraps[i].name,
        price: wraps[i].price,
        sortOrder: i + 1,
      },
    });
  }

  // E. Extras opcionales
  await prisma.rollOption.create({
    data: {
      type: "EXTRA",
      name: "Agregado acevichado",
      price: 3000,
      description: "Corona de salsa acevichada artesanal sobre el roll",
      sortOrder: 1,
    },
  });

  await prisma.rollOption.create({
    data: {
      type: "EXTRA",
      name: "Hamburguesa Doble (Para Hamburguesas)",
      price: 2000,
      description: "Agrega una segunda burger artesanal a tu pedido",
      sortOrder: 2,
    },
  });

  // 8. PROMOCIONES
  await prisma.promotion.create({
    data: {
      title: "Jueves de Happy Hour: Tragos 2x1",
      description: "Todos los jueves del mes, disfruta de nuestra coctelería seleccionada al 2x1 en Palkisushi Restobar.",
      badge: "2x1 Happy Hour",
      dayOfWeek: 4, // 4 = Jueves (0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado)
      isActive: true,
      bannerText: "🍹 ¡Jueves de Happy Hour! Tragos 2x1 en barra y terraza en Palkisushi Los Niches",
    },
  });

  await prisma.promotion.create({
    data: {
      title: "Viernes & Sábado de Sushi Mix",
      description: "Acompaña tus fines de semana con la mejor selección de 40 piezas y cervezas artesanales.",
      badge: "Fin de Semana",
      isActive: true,
      bannerText: "🍣 Pide tus 40 piezas Pacífico, Clásica o Palki con delivery en Los Niches y Curicó",
    },
  });

  // 9. ZONAS DE DELIVERY
  const deliveryZones = [
    { name: "Los Niches Centro", price: 1500, estimatedMinutes: "25-35 min", sortOrder: 1 },
    { name: "Alrededores Los Niches", price: 2500, estimatedMinutes: "35-45 min", sortOrder: 2 },
    { name: "Camino a Curicó / Sectores cercanos", price: 3500, estimatedMinutes: "40-50 min", sortOrder: 3 },
    { name: "Curicó Urbano", price: 4500, estimatedMinutes: "45-60 min", sortOrder: 4 },
  ];

  for (const zone of deliveryZones) {
    await prisma.deliveryZone.create({
      data: zone,
    });
  }

  // 10. MESAS Y BARRA
  for (let i = 1; i <= 10; i++) {
    await prisma.restaurantTable.create({
      data: {
        number: `Mesa ${i}`,
        type: "TABLE",
        isAvailable: true,
      },
    });
  }

  for (let i = 1; i <= 4; i++) {
    await prisma.restaurantTable.create({
      data: {
        number: `Barra ${i}`,
        type: "BAR",
        isAvailable: true,
      },
    });
  }

  console.log("✅ Seed completado con éxito para Palkisushi!");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
