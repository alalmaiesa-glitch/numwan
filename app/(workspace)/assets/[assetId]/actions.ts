"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function value(form: FormData, key: string) {
  const raw = form.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

export async function createDeal(form: FormData) {
  const assetId = value(form, "asset_id");
  if (!assetId) redirect("/assets");

  const supabase = await createClient();
  const { data: dealId, error } = await supabase.rpc("create_deal_v1", {
    p_asset_id: assetId,
  });

  if (error || !dealId) {
    redirect("/assets/" + assetId + "?error=deal-create");
  }

  revalidatePath("/assets/" + assetId);
  revalidatePath("/deals");
  revalidatePath("/dashboard");
  redirect("/deals/" + dealId);
}
