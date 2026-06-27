"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ComponentStatus = "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance";

function toComponentStatus(value: string | null): ComponentStatus {
  const valid: ComponentStatus[] = ["operational", "degraded", "partial_outage", "major_outage", "maintenance"];
  return valid.includes(value as ComponentStatus) ? (value as ComponentStatus) : "operational";
}

export async function createComponent(pageId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: page } = await supabase
    .from("pages")
    .select("id")
    .eq("id", pageId)
    .eq("user_id", user.id)
    .single();
  if (!page) return { error: "Page not found" };

  const { error } = await supabase.from("components").insert({
    page_id: pageId,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    group_name: (formData.get("group_name") as string) || null,
    status: toComponentStatus(formData.get("status") as string | null),
  });

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${pageId}`);
  return { success: true };
}

export async function updateComponentStatus(
  pageId: string,
  componentId: string,
  status: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Verify ownership via page
  const { data: component } = await supabase
    .from("components")
    .select("id, page_id")
    .eq("id", componentId)
    .single();
  if (!component) return { error: "Component not found" };

  const { data: page } = await supabase
    .from("pages")
    .select("id")
    .eq("id", component.page_id)
    .eq("user_id", user.id)
    .single();
  if (!page) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("components")
    .update({ status: toComponentStatus(status) })
    .eq("id", componentId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${pageId}`);
  return { success: true };
}

export async function updateComponent(
  pageId: string,
  componentId: string,
  formData: FormData
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("components")
    .update({
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      group_name: (formData.get("group_name") as string) || null,
      status: toComponentStatus(formData.get("status") as string | null),
    })
    .eq("id", componentId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${pageId}`);
  return { success: true };
}

export async function deleteComponent(pageId: string, componentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("components")
    .delete()
    .eq("id", componentId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${pageId}`);
  return { success: true };
}
