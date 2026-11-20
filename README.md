# Palkisushi - Sistema de Pedidos y Comandas

Aplicación web desarrollada para Palkisushi, un bar-restaurant de sushi ubicado en Los Niches, Curicó. El proyecto nació con la idea de facilitar la toma de pedidos para delivery, retiro en local y el control de comandas internas por mesa en horarios de alta concurrencia.

## Funcionalidades principales

- **Carta digital y pedidos online:** Catálogo con armado personalizado de rolls, tablas, promociones activas según el día y cálculo de envío según zona o distancia.
- **Integración con WhatsApp y panel interno:** Al confirmar un pedido web, este queda registrado en el sistema del local y genera el resumen listo para enviar por WhatsApp.
- **Comandas en salón (`/comandas`):** Selección de mesas y barra para que los garzones ingresen pedidos, agreguen notas para cocina y cierren cuentas.
- **Vista de cocina (`/cocina`):** Tablero de estados para gestionar la preparación de pedidos de salón, retiro y delivery (incluyendo verificación de pago previo al despacho).
- **Panel de administración (`/admin`):** Acceso con PIN para modificar precios, activar promociones programadas y ajustar tarifas de reparto.

## Tecnologías utilizadas

- Next.js (App Router)
- React
- Tailwind CSS
- Prisma ORM
- SQLite

## Uso de IA en el desarrollo

Este proyecto fue también una instancia práctica para aprender a trabajar con agentes de programación basados en inteligencia artificial.

Para construirlo, primero recurrí a Gemini explicándole el contexto real del local —un restaurant concurrido que necesitaba ordenar tanto la atención en mesas como los pedidos a domicilio— para que me ayudara a estructurar los requerimientos funcionales en dos prompts ordenados. Con esa base, utilicé Antigravity como agente de desarrollo para levantar la arquitectura en Next.js, configurar la base de datos con Prisma y programar los distintos módulos de la aplicación.

## Instalación y ejecución local

1. Clonar el repositorio e instalar las dependencias:

```bash
npm install
```

2. Copiar el archivo de variables de entorno:

```bash
cp .env.example .env
```

3. Inicializar la base de datos y cargar los datos del menú:

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

4. Iniciar el servidor de desarrollo:

```bash
npm run dev
```

5. Abrir el navegador en `http://localhost:3000`

## Vistas disponibles

- `/` - Carta digital para clientes (pedidos web)
- `/comandas` - Panel de garzones y mesas del local
- `/cocina` - KDS de cocina y caja en tiempo real
- `/admin` - Panel administrativo (PIN por defecto: 1234)

## Autor

Martin Hernandez - Estudiante de Analisis y Programacion, INACAP
