"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  createIncidentSchema,
  addIncidentUpdateSchema,
  updateIncidentSchema,
  incidentImpactEnum,
  parseFormData,
} from "@/lib/validations";

type IncidentStatus = "investigating" | "identified" | "monitoring" | "resolved";
type IncidentImpact = "none" | "minor" | "major" | "critical";
type ComponentStatus = "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance";

const impactToComponentStatus: Record<IncidentImpact, ComponentStatus> = {
  critical: "major_outage",
  major: "partial_outage",
  minor: "degraded",
  none: "degraded",
};

export async function createIncident(pageId: string, formData: FormData) {
  // Handle multi-value component_ids from checkboxes
  const componentIds = formData.getAll("component_ids") as string[];
  const raw = {
    title: formData.get("title") as string,
    impact: formData.get("impact") as string,
    message: formData.get("message") as string,
    component_ids: componentIds,
  };

  const parsed = createIncidentSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { title, impact, message, component_ids } = parsed.data;

  const { data: incident, error } = await supabase
    .from("incidents")
    .insert({
      page_id: pageId,
      title,
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

  if (component_ids.length > 0) {
    await supabase.from("incident_components").insert(
      component_ids.map((cid) => ({
        incident_id: incident.id,
        component_id: cid,
      }))
    );

    await supabase
      .from("components")
      .update({ status: impactToComponentStatus[impact] })
      .in("id", component_ids);
  }

  revalidatePath(`/dashboard/${pageId}/incidents`);
  redirect(`/dashboard/${pageId}/incidents/${incident.id}`);
}

export async function addIncidentUpdate(
  pageId: string,
  incidentId: string,
  formData: FormData
) {
  const parsed = parseFormData(addIncidentUpdateSchema, formData);
  if (!parsed.success) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { status, message } = parsed.data;

  const { error: updateError } = await supabase
    .from("incident_updates")
    .insert({
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
        .in(
          "id",
          ic.map((r) => r.component_id)
        );
    }
  }

  await supabase
    .from("incidents")
    .update(incidentUpdate)
    .eq("id", incidentId);

  revalidatePath(`/dashboard/${pageId}/incidents/${incidentId}`);
  return { success: true };
}

export async function updateIncident(
  pageId: string,
  incidentId: string,
  formData: FormData
) {
  const parsed = parseFormData(updateIncidentSchema, formData);
  if (!parsed.success) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { title, impact } = parsed.data;

  const { error } = await supabase
    .from("incidents")
    .update({ title, impact })
    .eq("id", incidentId);

  if (error) return { error: error.message };

  // Update affected components' status based on new impact level
  const impactParsed = incidentImpactEnum.safeParse(impact);
  if (impactParsed.success) {
    const { data: ic } = await supabase
      .from("incident_components")
      .select("component_id")
      .eq("incident_id", incidentId);

    // Only update component status if the incident is still active
    const { data: incident } = await supabase
      .from("incidents")
      .select("status")
      .eq("id", incidentId)
      .single();

    if (ic && ic.length > 0 && incident && incident.status !== "resolved") {
      await supabase
        .from("components")
        .update({ status: impactToComponentStatus[impactParsed.data] })
        .in(
          "id",
          ic.map((r) => r.component_id)
        );
    }
  }

  revalidatePath(`/dashboard/${pageId}/incidents/${incidentId}`);
  return { success: true };
}

export async function deleteIncident(pageId: string, incidentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("incidents")
    .delete()
    .eq("id", incidentId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${pageId}/incidents`);
  redirect(`/dashboard/${pageId}/incidents`);
}
