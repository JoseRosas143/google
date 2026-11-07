import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "J R Consulting — Google Workspace, Referencias y Crecimiento",
  description: "Plataforma comercial y de consultoría tecnológica para Google Workspace por J R Consulting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {children}

        {/* Brevo Conversations Widget */}
        <Script id="brevo-conversations" strategy="afterInteractive">
          {`
            (function(d, w, c) {
                w.BrevoConversationsID = '6aee85cc7732b65b8e0f8842';
                w[c] = w[c] || function() {
                    (w[c].q = w[c].q || []).push(arguments);
                };
                var s = d.createElement('script');
                s.async = true;
                s.src = 'https://conversations-widget.brevo.com/brevo-conversations.js';
                if (d.head) d.head.appendChild(s);
            })(document, window, 'BrevoConversations');
          `}
        </Script>
      </body>
    </html>
  );
}
