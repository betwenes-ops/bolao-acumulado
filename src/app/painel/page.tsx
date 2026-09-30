import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sair } from "@/app/actions";

const dinheiro=(v:number|string|null|undefined)=>Number(v??0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const dataHora=(v:string)=>new Intl.DateTimeFormat("pt-BR",{timeZone:"America/Sao_Paulo",weekday:"long",day:"2-digit",month:"long",hour:"2-digit",minute:"2-digit"}).format(new Date(v));

export default async function Painel(){
 const s=await createClient(); const{data:{user}}=await s.auth.getUser(); if(!user)redirect("/login");
 const{data:perfil}=await s.from("usuarios").select("id,nome,status").eq("auth_user_id",user.id).maybeSingle(); if(!perfil||perfil.status!=="ATIVO")redirect("/login");
 const{data:ciclo}=await s.from("ciclos").select("id,numero,premio_acumulado").eq("status","ATIVO").maybeSingle();
 const{data:concurso}=await s.from("concursos").select("numero_megasena,data_sorteio,limite_apostas,valor_cota").eq("status","ABERTO").gt("limite_apostas",new Date().toISOString()).order("data_sorteio").limit(1).maybeSingle();
 const{data:jogos}=await s.from("jogos").select("id,dezenas,pagamento_status,apuracoes(acertos_acumulados,dezenas_acertadas)").eq("usuario_id",perfil.id).order("criado_em",{ascending:false});
 let melhor:{acertos:number;dezenas:number[];hits:number[]}|null=null; let ganhou=false;
 for(const j of jogos??[]){const aps=j.apuracoes??[];const ap=aps.reduce((m,a)=>!m||a.acertos_acumulados>m.acertos_acumulados?a:m,undefined as undefined|{acertos_acumulados:number;dezenas_acertadas:number[]});const acertos=ap?.acertos_acumulados??0;if(acertos===6)ganhou=true;if(!melhor||acertos>melhor.acertos)melhor={acertos,dezenas:j.dezenas,hits:ap?.dezenas_acertadas??[]};}
 const primeiro=perfil.nome.trim().split(/\s+/)[0]??"Cliente";
 return <main className="clientApp"><header className="clientTop"><div><span>Olá, {primeiro}</span><strong>Bolão Acumulado</strong></div><form action={sair}><button className="clientGhost" type="submit">Sair</button></form></header>
 {ganhou&&<section className="winnerAlert"><strong>🎉 Você tem um jogo vencedor!</strong><span>Consulte seus jogos e fale com a administração.</span></section>}
 <section className="clientPrize"><span>PRÊMIO ACUMULADO</span><strong>{dinheiro(ciclo?.premio_acumulado)}</strong><small>Ciclo nº {ciclo?.numero??"—"}</small></section>
 <section className="clientDraw"><span>PRÓXIMO SORTEIO</span>{concurso?<><h2>Mega-Sena {concurso.numero_megasena}</h2><p>{dataHora(concurso.data_sorteio)}</p><div className="drawFacts"><b>Apostas até {dataHora(concurso.limite_apostas)}</b><b>Cota {dinheiro(concurso.valor_cota)}</b></div></>:<><h2>Nenhum concurso aberto</h2><p>Quando um novo concurso for aberto, ele aparecerá aqui.</p></>}</section>
 {melhor&&<section className="bestGame"><div><span>SEU MELHOR JOGO</span><strong>{melhor.acertos} de 6 acertos</strong><small>{melhor.acertos===6?"Parabéns! Este jogo completou as 6 dezenas.":`Faltam ${6-melhor.acertos} para completar.`}</small></div><div className="clientBalls">{melhor.dezenas.map(n=><i className={melhor!.hits.includes(n)?"hit":""} key={n}>{String(n).padStart(2,"0")}</i>)}</div></section>}
 <nav className="clientMenu" aria-label="Menu principal"><Link className="clientMenuPrimary" href="/painel/novo-jogo"><i>＋</i><div><strong>Novo jogo</strong><small>Escolha suas 6 dezenas</small></div><b>›</b></Link><Link href="/painel/meus-jogos"><i>6</i><div><strong>Meus jogos</strong><small>Acompanhe acertos e pagamentos</small></div><b>›</b></Link><Link href="/painel/sorteios"><i>✓</i><div><strong>Últimos sorteios</strong><small>Veja os resultados apurados</small></div><b>›</b></Link><Link href="/painel/premio"><i>R$</i><div><strong>Prêmio</strong><small>Entenda o acumulado atual</small></div><b>›</b></Link></nav></main>;
}
