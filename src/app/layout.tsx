import type { Metadata } from "next";import "./globals.css";
export const metadata:Metadata={title:"Bolão Acumulado",description:"Bolão acumulado da Mega-Sena"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
