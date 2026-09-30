import Link from"next/link";import{requireAdmin}from"@/lib/auth/admin";
const links=[['Dashboard','/admin/dashboard'],['Clientes','/admin/clientes'],['Jogos','/admin/jogos'],['Concursos','/admin/concursos'],['Ranking','/admin/ranking'],['Ganhadores','/admin/ganhadores'],['Configurações','/admin/configuracoes'],['Auditoria','/admin/auditoria']];
export default async function AdminLayout({children}:{children:React.ReactNode}){await requireAdmin();return <><nav className="adminNav adminTopNav">{links.map(([label,href])=><Link key={href} href={href}>{label}</Link>)}</nav>{children}</>}
