"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function optional(form: FormData, name: string) {
  const value = String(form.get(name) || "").trim();
  return value || null;
}

export async function createIdea(form: FormData) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = typeof auth?.claims?.sub === "string" ? auth.claims.sub : null;
  if (!userId) redirect("/login");

  const title = String(form.get("title") || "").trim();
  if (!title) redirect("/vault?error=title");

  const requestedLevel = String(form.get("confidentiality_level") || "P0");
  const confidentialityLevel = ["P0", "P1", "P2", "P3"].includes(requestedLevel)
    ? requestedLevel
    : "P0";

  const { data, error } = await supabase
    .from("ideas")
    .insert({
      title,
      short_description: optional(form, "short_description"),
      problem: optional(form, "problem"),
      initial_solution: optional(form, "initial_solution"),
      sector: optional(form, "sector"),
      market: optional(form, "market"),
      customer: optional(form, "customer"),
      potential_buyer: optional(form, "potential_buyer"),
      idea_source: optional(form, "idea_source"),
      notes: optional(form, "notes"),
      confidentiality_level: confidentialityLevel,
      created_by: userId,
    })
    .select("id")
    .single();

  if (error || !data) redirect("/vault?error=save");

  revalidatePath("/vault");
  redirect("/lab/" + data.id);
}
