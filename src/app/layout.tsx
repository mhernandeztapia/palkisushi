import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { DevNavigationPill } from "@/components/DevNavigationPill";

export const metadata: Metadata = {
  title: "Palkisushi | Japanese Food & Restobar en Los Niches, Curicó",
  description:
    "Auténtica cocina japonesa, rolls personalizados con queso crema, tablas abundantes, ceviches, papas bravas y coctelería de autor. Pide online con delivery en Los Niches y Curicó.",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased flex flex-col selection:bg-palki-red selection:text-white">
        <CartProvider>
          {children}
          <DevNavigationPill />
        </CartProvider>
      </body>
    </html>
  );
}
