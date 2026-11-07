import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "J R Consulting — Google Workspace, Referencias y Crecimiento",
  description: "Plataforma comercial y de consultoría tecnológica para Google Workspace por J R Consulting. Productividad empresarial, asesoría y códigos promocionales.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
