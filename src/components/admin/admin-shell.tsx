"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { LayoutDashboard, Users, TicketCheck, CalendarDays, Trophy, Medal, Settings, ScrollText, Menu, X, LogOut } from "lucide-react";

const nav = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Clientes", href: "/admin/clientes", icon: Users },
  { label: "Jogos", href: "/admin/jogos", icon: TicketCheck },
  { label: "Concursos", href: "/admin/concursos", icon: CalendarDays },
  { label: "Ranking", href: "/admin/ranking", icon: Trophy },
  { label: "Ganhadores", href: "/admin/ganhadores", icon: Medal },
  { label: "Configurações", href: "/admin/configuracoes", icon: Settings },
  { label: "Auditoria", href: "/admin/auditoria", icon: ScrollText },
];

export function AdminShell({ adminName, title, children, logoutAction }: { adminName: string; title: string; children: ReactNode; logoutAction: (formData: FormData) => void | Promise<void> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const initials = adminName.split(/\s+/).filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "AD";
  const sidebar = <>
    <div className="adminLogo"><span>BA</span><div><strong>Bolão Acumulado</strong><small>Administração</small></div></div>
    <nav className="adminSidebarNav" aria-label="Navegação administrativa">
      {nav.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return <Link key={href} href={href} className={active ? "active" : ""} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined}><Icon size={19} strokeWidth={2}/><span>{label}</span></Link>;
      })}
    </nav>
    <div className="adminSidebarFoot"><span>Sistema seguro</span><small>Bolão Acumulado</small></div>
  </>;
  return <div className="adminApp">
    <aside className="adminSidebar">{sidebar}</aside>
    {open && <div className="adminDrawerBackdrop" onClick={() => setOpen(false)} aria-hidden="true"/>}
    <aside className={`adminDrawer ${open ? "open" : ""}`} aria-hidden={!open}><button className="adminDrawerClose" onClick={() => setOpen(false)} aria-label="Fechar menu"><X size={22}/></button>{sidebar}</aside>
    <div className="adminMain">
      <header className="adminTopbar">
        <div className="adminTopbarInner">
          <button className="adminMenuButton" onClick={() => setOpen(true)} aria-label="Abrir menu"><Menu size={22}/></button>
          <h1>{title}</h1>
          <div className="adminIdentity"><div className="adminAvatar">{initials}</div><div className="adminIdentityText"><strong>{adminName}</strong><small>Administrador</small></div></div>
          <form action={logoutAction}><button className="adminLogout" type="submit"><LogOut size={17}/><span>Sair</span></button></form>
        </div>
      </header>
      <main className="adminContent">{children}</main>
    </div>
  </div>;
}
