import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NexusProvider } from "@/context/NexusContext";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RailQuick Nexus App",
  description: "AI-Powered Railway Station Commerce Vendor App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="h-full bg-slate-950 text-slate-100 flex items-center justify-center overflow-hidden">
        <NexusProvider>
          {/* Mobile Simulator Frame on Desktop, Full Bleed on Mobile */}
          <div className="w-full h-full md:max-w-[420px] md:max-h-[850px] md:rounded-[40px] md:border-[12px] md:border-slate-900 md:shadow-[0_0_50px_rgba(99,102,241,0.18)] md:relative md:overflow-hidden flex flex-col bg-[#02050c] transition-all duration-300">
            {/* Dynamic camera notch mockup for premium app look on desktop */}
            <div className="hidden md:flex absolute top-3 left-1/2 transform -translate-x-1/2 w-28 h-5.5 bg-slate-900 rounded-full z-50 items-center justify-center shadow-inner">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800 mr-2"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-950 border border-indigo-900"></span>
            </div>
            
            {/* App Viewport */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative pt-0 md:pt-4">
              {children}
            </main>
          </div>
        </NexusProvider>
      </body>
    </html>
  );
}
