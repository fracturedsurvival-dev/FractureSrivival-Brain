import type { Metadata } from "next";
import "./globals.css";
import OracleTerminal from "@/components/OracleTerminal";

export const metadata: Metadata = {
  title: "Fractured Survival Brain",
  description: "Core simulation shell",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="crt-flicker antialiased selection:bg-cyan-900 selection:text-white">
        <div className="scanlines" />
        <div className="relative z-10 min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
        <OracleTerminal />
      </body>
    </html>
  );
}

