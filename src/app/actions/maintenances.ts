"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  maintenanceStatusEnum,
  subscribeSchema,
  parseFormData,
} from "@/lib/validations";

export async function createMaintenance(pageId: string, formData: FormData) {
  const parsed = parseFormData(createMaintenanceSchema, formData);
  if (!parsed.success) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { title, description, scheduled_start, scheduled_end } = parsed.data;

  const { error } = await supabase.from("maintenances").insert({
    page_id: pageId,
    title,
    description: description || null,
    scheduled_start,
    scheduled_end,
    status: "scheduled",
  });

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${pageId}/maintenance`);
  return { success: true };
}

export async function updateMaintenance(
  pageId: string,
  maintenanceId: string,
  formData: FormData
) {
  const parsed = parseFormData(updateMaintenanceSchema, formData);
  if (!parsed.success) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { title, description, scheduled_start, scheduled_end, status } = parsed.data;

  const { error } = await supabase
    .from("maintenances")
    .update({
      title,
      description: description || null,
      scheduled_start,
      scheduled_end,
      status,
    })
    .eq("id", maintenanceId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${pageId}/maintenance`);
  return { success: true };
}

export async function updateMaintenanceStatus(
  pageId: string,
  maintenanceId: string,
  status: string
) {
  const parsed = maintenanceStatusEnum.safeParse(status);
  if (!parsed.success) return { error: "Invalid status" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("maintenances")
    .update({ status: parsed.data })
    .eq("id", maintenanceId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${pageId}/maintenance`);
  return { success: true };
}

export async function deleteMaintenance(pageId: string, maintenanceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
  const parsed = parseFormData(subscribeSchema, formData);
  if (!parsed.success) return { error: parsed.error };

  const supabase = await createClient();
  const { email } = parsed.data;

  const { error } = await supabase
    .from("subscribers")
    .insert({ page_id: pageId, email });

  if (error) {
    if (error.code === "23505")
      return { error: "This email is already subscribed." };
    return { error: error.message };
  }

  return {
    success:
      "Subscribed! You will receive notifications for this status page.",
  };
}
