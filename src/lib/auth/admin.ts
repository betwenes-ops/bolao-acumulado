import{redirect}from"next/navigation";
import{createClient}from"@/lib/supabase/server";

export async function requireAdmin(){
 const supabase=await createClient();
 const{data:{user}}=await supabase.auth.getUser();
 if(!user)redirect("/admin");
 const{data:admin}=await supabase.from("admins").select("id,nome,papel,ativo").eq("auth_user_id",user.id).eq("ativo",true).maybeSingle();
 if(!admin){await supabase.auth.signOut();redirect("/admin?erro=acesso")}
 const{data:factors}=await supabase.auth.mfa.listFactors();
 const verified=factors?.totp?.some(f=>f.status==="verified");
 if(!verified)redirect("/admin/mfa/configurar");
 const{data:aal}=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
 if(aal?.currentLevel!=="aal2")redirect("/admin/mfa");
 return{supabase,admin,user};
}
