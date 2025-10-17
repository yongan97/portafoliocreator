import type { Metadata } from "next";
import { Albert_Sans } from "next/font/google";
import "./globals.css";

const albertSans = Albert_Sans({
  variable: "--font-albert-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VetaCap - Portfolio Creator",
  description: "Diseña, visualiza y analiza tu portafolio de inversión. El foco está en vos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${albertSans.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
