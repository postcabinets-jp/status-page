"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createMaintenance(pageId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("maintenances").insert({
    page_id: pageId,
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    scheduled_start: formData.get("scheduled_start") as string,
    scheduled_end: formData.get("scheduled_end") as string,
    status: "scheduled",
  });

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${pageId}/maintenance`);
  return { success: true };
}

type MaintenanceStatus = "scheduled" | "in_progress" | "completed";

function toMaintenanceStatus(value: string): MaintenanceStatus {
  const valid: MaintenanceStatus[] = ["scheduled", "in_progress", "completed"];
  return valid.includes(value as MaintenanceStatus) ? (value as MaintenanceStatus) : "scheduled";
}

export async function updateMaintenanceStatus(
  pageId: string,
  maintenanceId: string,
  status: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("maintenances")
    .update({ status: toMaintenanceStatus(status) })
    .eq("id", maintenanceId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${pageId}/maintenance`);
  return { success: true };
}

export async function deleteMaintenance(pageId: string, maintenanceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("maintenances")
    .delete()
    .eq("id", maintenanceId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${pageId}/maintenance`);
  return { success: true };
}

export async function subscribeToPage(pageId: string, formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const { error } = await supabase
    .from("subscribers")
    .insert({ page_id: pageId, email });

  if (error) {
    if (error.code === "23505") return { error: "This email is already subscribed." };
    return { error: error.message };
  }

  return { success: "Subscribed! You will receive notifications for this status page." };
}
