import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NexusProvider } from "@/context/NexusContext";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { AiCopilotDrawer } from "@/components/AiCopilotDrawer";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RailQuick Nexus OS",
  description: "AI-Powered Railway Station Commerce Operations Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="h-full bg-slate-950 text-slate-100 flex overflow-hidden">
        <NexusProvider>
          {/* Main Layout Grid */}
          <Sidebar />
          
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <Header />
            
            {/* Scrollable Page Body */}
            <main className="flex-1 overflow-y-auto bg-slate-950/20">
              {children}
            </main>
          </div>

          {/* Global AI Assistant Floating Drawer */}
          <AiCopilotDrawer />
        </NexusProvider>
      </body>
    </html>
  );
}
