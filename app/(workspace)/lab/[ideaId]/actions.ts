"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function value(form: FormData, name: string) {
  return String(form.get(name) || "").trim();
}
function optional(form: FormData, name: string) {
  return value(form, name) || null;
}
async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");
  return supabase;
}
function refresh(ideaId: string) {
  revalidatePath("/lab/" + ideaId);
}

export async function createHypothesis(form: FormData) {
  const supabase = await requireUser();
  const ideaId = value(form, "idea_id");
  const importance = value(form, "importance");
  const allowedImportance = ["CRITICAL", "MAJOR", "SECONDARY"];

  const { error } = await supabase.from("hypotheses").insert({
    idea_id: ideaId,
    code: value(form, "code"),
    description: value(form, "description"),
    hypothesis_type: optional(form, "hypothesis_type"),
    importance: allowedImportance.includes(importance) ? importance : "MAJOR",
  });

  if (error) redirect("/lab/" + ideaId + "?error=hypothesis");
  refresh(ideaId);
}

export async function createEvidence(form: FormData) {
  const supabase = await requireUser();
  const ideaId = value(form, "idea_id");
  const strength = value(form, "evidence_strength");
  const allowedStrength = ["E1", "E2", "E3", "E4", "E5"];

  const { error } = await supabase.from("evidence").insert({
    hypothesis_id: value(form, "hypothesis_id"),
    code: value(form, "code"),
    claim: value(form, "claim"),
    source: optional(form, "source"),
    evidence_date: optional(form, "evidence_date"),
    evidence_type: optional(form, "evidence_type"),
    proves: optional(form, "proves"),
    does_not_prove: optional(form, "does_not_prove"),
    evidence_strength: allowedStrength.includes(strength) ? strength : "E1",
  });

  if (error) redirect("/lab/" + ideaId + "?error=evidence");
  refresh(ideaId);
}

export async function createExperiment(form: FormData) {
  const supabase = await requireUser();
  const ideaId = value(form, "idea_id");
  const rawCost = value(form, "cost");
  const parsedCost = rawCost === "" ? null : Number(rawCost);

  const { error } = await supabase.from("experiments").insert({
    hypothesis_id: value(form, "hypothesis_id"),
    method: value(form, "method"),
    metric: optional(form, "metric"),
    success_criteria: value(form, "success_criteria"),
    failure_criteria: value(form, "failure_criteria"),
    cost: parsedCost !== null && Number.isFinite(parsedCost) && parsedCost >= 0 ? parsedCost : null,
    result: optional(form, "result"),
    decision: optional(form, "decision"),
  });

  if (error) redirect("/lab/" + ideaId + "?error=experiment");
  refresh(ideaId);
}
