import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import "./admin.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-admin" });
export const metadata: Metadata = { title: "Bolão Acumulado", description: "Bolão acumulado da Mega-Sena" };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="pt-BR" className={geist.variable}><body>{children}</body></html>; }
