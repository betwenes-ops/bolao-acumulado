"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export async function verificarMfa(formData: FormData) {
  const factorId = String(formData.get("factor_id") || "");
  const code = String(formData.get("codigo") || "");
  if (!factorId || code.length !== 6) redirect("/admin/mfa?erro=codigo");
  const supabase = await createClient();
  const result = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
  if (result.error) redirect("/admin/mfa?erro=codigo");
  redirect("/admin/dashboard");
}
