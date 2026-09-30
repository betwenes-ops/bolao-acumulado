import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  // MFA is temporarily disabled. The admin record is read with the
  // server-only service client because the current RLS policy for admins
  // still requires AAL2 and would otherwise hide the row from an AAL1 session.
  const privileged = createAdminClient();
  const { data: admin } = await privileged
    .from("admins")
    .select("id,nome,papel,ativo")
    .eq("auth_user_id", user.id)
    .eq("ativo", true)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    redirect("/admin?erro=acesso");
  }

  return { supabase, admin, user };
}
