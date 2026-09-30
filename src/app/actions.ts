"use server";
import { redirect } from "next/navigation";
import { compare, hash } from "bcryptjs";
import { createClient } from "@/lib/supabase/server";
import { cpfValido, somenteDigitos } from "@/lib/cpf";
import { dezenasValidas, normalizarDezenas } from "@/lib/dezenas";

const virtualEmail=(cpf:string)=>`${cpf}@cliente.bolao.invalid`;
const pinOk=(pin:string)=>/^\d{6}$/.test(pin);

export async function cadastrar(formData:FormData){
 const nome=String(formData.get("nome")??"").trim(); const cidade=String(formData.get("cidade")??"").trim();
 const cpf=somenteDigitos(String(formData.get("cpf")??"")); const pin=String(formData.get("pin")??"");
 if(nome.length<3||cidade.length<2||!cpfValido(cpf)||!pinOk(pin)) redirect("/cadastro?erro=dados");
 const supabase=await createClient();
 const {data,error}=await supabase.auth.signUp({email:virtualEmail(cpf),password:pin});
 if(error||!data.user) redirect(`/cadastro?erro=${error?.code??"auth"}`);
 const pinHash=await hash(pin,12);
 const {error:profileError}=await supabase.from("usuarios").insert({auth_user_id:data.user.id,nome,cidade,cpf_unico:cpf,pin_hash:pinHash,consentimento_lgpd_em:new Date().toISOString()});
 if(profileError){await supabase.auth.signOut();redirect("/cadastro?erro=perfil")}
 redirect("/painel");
}

export async function entrar(formData:FormData){
 const cpf=somenteDigitos(String(formData.get("cpf")??"")); const pin=String(formData.get("pin")??"");
 if(!cpfValido(cpf)||!pinOk(pin)) redirect("/login?erro=credenciais");
 const supabase=await createClient(); const {error}=await supabase.auth.signInWithPassword({email:virtualEmail(cpf),password:pin});
 if(error) redirect("/login?erro=credenciais"); redirect("/painel");
}

export async function sair(){const supabase=await createClient();await supabase.auth.signOut();redirect("/login")}

export async function criarJogo(formData:FormData){
 const dezenas=String(formData.get("dezenas")??"").split(",").filter(Boolean).map(Number); const normalizadas=normalizarDezenas(dezenas);
 if(!dezenasValidas(normalizadas)) redirect("/painel/novo-jogo?erro=dezenas");
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)redirect("/login");
 const {data:perfil}=await supabase.from("usuarios").select("id,status").eq("auth_user_id",user.id).single(); if(!perfil||perfil.status!=="ATIVO")redirect("/login");
 const now=new Date().toISOString(); const {data:concurso}=await supabase.from("concursos").select("id,ciclo_id,limite_apostas,status").eq("status","ABERTO").gt("limite_apostas",now).order("data_sorteio").limit(1).maybeSingle();
 if(!concurso)redirect("/painel/novo-jogo?erro=sem_concurso");
 const {error}=await supabase.from("jogos").insert({usuario_id:perfil.id,concurso_id:concurso.id,ciclo_id:concurso.ciclo_id,dezenas:normalizadas});
 if(error)redirect(`/painel/novo-jogo?erro=${error.code}`);redirect("/painel/meus-jogos?ok=1");
}

export async function entrarAdmin(formData:FormData){
 const email=String(formData.get("email")??"").trim().toLowerCase(); const senha=String(formData.get("senha")??""); const supabase=await createClient();
 const {error}=await supabase.auth.signInWithPassword({email,password:senha}); if(error)redirect("/admin?erro=credenciais");
 const {data:{user}}=await supabase.auth.getUser(); if(!user){redirect("/admin?erro=credenciais")}
 const {data:admin}=await supabase.from("admins").select("id,ativo").eq("auth_user_id",user.id).eq("ativo",true).maybeSingle(); if(!admin){await supabase.auth.signOut();redirect("/admin?erro=acesso")}
 redirect("/admin/dashboard");
}

export async function confirmarPagamento(formData:FormData){
 const jogoId=String(formData.get("jogo_id")??""); const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)redirect("/admin");
 const {data:admin}=await supabase.from("admins").select("id").eq("auth_user_id",user.id).eq("ativo",true).single(); if(!admin)redirect("/admin");
 await supabase.from("jogos").update({pagamento_status:"CONFIRMADO",pagamento_confirmado_em:new Date().toISOString(),pagamento_confirmado_por:admin.id}).eq("id",jogoId).eq("pagamento_status","PENDENTE"); redirect("/admin/dashboard");
}

export async function conferirPinAtual(pin:string){const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return false;const {data}=await supabase.from("usuarios").select("pin_hash").eq("auth_user_id",user.id).single();return !!data&&compare(pin,data.pin_hash)}
