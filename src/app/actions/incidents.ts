"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type IncidentStatus = "investigating" | "identified" | "monitoring" | "resolved";
type IncidentImpact = "none" | "minor" | "major" | "critical";
type ComponentStatus = "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance";

function toIncidentImpact(value: string | null): IncidentImpact {
  const valid: IncidentImpact[] = ["none", "minor", "major", "critical"];
  return valid.includes(value as IncidentImpact) ? (value as IncidentImpact) : "minor";
}

function toIncidentStatus(value: string | null): IncidentStatus {
  const valid: IncidentStatus[] = ["investigating", "identified", "monitoring", "resolved"];
  return valid.includes(value as IncidentStatus) ? (value as IncidentStatus) : "investigating";
}

const impactToComponentStatus: Record<IncidentImpact, ComponentStatus> = {
  critical: "major_outage",
  major: "partial_outage",
  minor: "degraded",
  none: "degraded",
};

export async function createIncident(pageId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const componentIds = formData.getAll("component_ids") as string[];
  const message = formData.get("message") as string;
  const impact = toIncidentImpact(formData.get("impact") as string | null);

  const { data: incident, error } = await supabase
    .from("incidents")
    .insert({
      page_id: pageId,
      title: formData.get("title") as string,
      status: "investigating" as IncidentStatus,
      impact,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  if (message) {
    await supabase.from("incident_updates").insert({
      incident_id: incident.id,
      status: "investigating",
      message,
    });
  }

  if (componentIds.length > 0) {
    await supabase.from("incident_components").insert(
      componentIds.map((cid) => ({
        incident_id: incident.id,
        component_id: cid,
      }))
    );

    await supabase
      .from("components")
      .update({ status: impactToComponentStatus[impact] })
      .in("id", componentIds);
  }

  revalidatePath(`/dashboard/${pageId}/incidents`);
  redirect(`/dashboard/${pageId}/incidents/${incident.id}`);
}

export async function addIncidentUpdate(
  pageId: string,
  incidentId: string,
  formData: FormData
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const status = toIncidentStatus(formData.get("status") as string | null);
  const message = formData.get("message") as string;

  const { error: updateError } = await supabase.from("incident_updates").insert({
    incident_id: incidentId,
    status,
    message,
  });

  if (updateError) return { error: updateError.message };

  const incidentUpdate: { status: IncidentStatus; resolved_at?: string } = { status };
  if (status === "resolved") {
    incidentUpdate.resolved_at = new Date().toISOString();

    const { data: ic } = await supabase
      .from("incident_components")
      .select("component_id")
      .eq("incident_id", incidentId);

    if (ic && ic.length > 0) {
      await supabase
        .from("components")
        .update({ status: "operational" as ComponentStatus })
        .in("id", ic.map((r) => r.component_id));
    }
  }

  await supabase
    .from("incidents")
    .update(incidentUpdate)
    .eq("id", incidentId);

  revalidatePath(`/dashboard/${pageId}/incidents/${incidentId}`);
  return { success: true };
}

export async function deleteIncident(pageId: string, incidentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("incidents")
    .delete()
    .eq("id", incidentId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${pageId}/incidents`);
  redirect(`/dashboard/${pageId}/incidents`);
}
