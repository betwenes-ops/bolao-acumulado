"use client";

import { Search, Inbox, LoaderCircle, AlertTriangle } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) { return <div className="pageHeader"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action && <div>{action}</div>}</div>; }

export function StatCard({ label, value, detail, tone = "default", featured = false }: { label: string; value: ReactNode; detail?: ReactNode; tone?: "default"|"warning"|"success"; featured?: boolean }) { return <section className={`adminStat ${featured ? "featured" : ""} ${tone}`}><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</section>; }

export function StatusBadge({ status }: { status: string }) { const key = status.toLowerCase(); return <span className={`statusBadge status-${key}`}>{status}</span>; }

export function Dezenas({ dezenas, acertadas = [] }: { dezenas: number[]; acertadas?: number[] }) { const hits = new Set(acertadas); return <div className="adminDezenas" aria-label={`Dezenas ${dezenas.join(", ")}`}>{dezenas.map((n) => <span key={n} className={hits.has(n) ? "hit" : ""}>{String(n).padStart(2, "0")}</span>)}</div>; }

export function EmptyState({ title, description = "Não há registros para exibir." }: { title: string; description?: string }) { return <div className="adminEmpty"><div><Inbox size={25}/></div><strong>{title}</strong><p>{description}</p></div>; }

export function LoadingState({ rows = 4 }: { rows?: number }) { return <div className="adminLoading" aria-label="Carregando"><LoaderCircle className="spin" size={20}/>{Array.from({length: rows}).map((_,i)=><span key={i}/>)}</div>; }

export function ConfirmDialog({ label, title, description, tone = "primary" }: { label: string; title: string; description: string; tone?: "primary"|"danger"|"warning" }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const confirm = () => { const form = dialog.current?.closest("form"); dialog.current?.close(); form?.requestSubmit(); };
  return <><button type="button" className={`adminButton ${tone}`} onClick={() => dialog.current?.showModal()}>{label}</button><dialog ref={dialog} className="confirmDialog"><div className="confirmIcon"><AlertTriangle size={23}/></div><h3>{title}</h3><p>{description}</p><div className="confirmActions"><button type="button" className="adminButton ghost" onClick={() => dialog.current?.close()}>Cancelar</button><button type="button" className={`adminButton ${tone}`} onClick={confirm}>Confirmar</button></div></dialog></>;
}

export function DataTable({ headers, rows, emptyTitle = "Nenhum registro encontrado", searchable = false }: { headers: string[]; rows: ReactNode[][]; emptyTitle?: string; searchable?: boolean }) {
  const [term, setTerm] = useState("");
  const visible = term ? rows.filter((row) => row.some((cell) => typeof cell === "string" && cell.toLocaleLowerCase("pt-BR").includes(term.toLocaleLowerCase("pt-BR")))) : rows;
  return <div className="dataTableCard">{searchable && <div className="tableToolbar"><label><Search size={17}/><input value={term} onChange={(e)=>setTerm(e.target.value)} placeholder="Buscar nesta lista" aria-label="Buscar nesta lista"/></label></div>}{visible.length ? <><div className="tableDesktop"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{visible.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j} data-label={headers[j]}>{cell}</td>)}</tr>)}</tbody></table></div><div className="tableMobile">{visible.map((row,i)=><article key={i}>{row.map((cell,j)=><div key={j}><span>{headers[j]}</span><div>{cell}</div></div>)}</article>)}</div></> : <EmptyState title={emptyTitle}/>}</div>;
}

export function Toast({ kind = "success", children }: { kind?: "success"|"error"; children: ReactNode }) { return <div className={`adminToast ${kind}`} role="status">{children}</div>; }
