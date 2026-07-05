"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createComponentSchema,
  updateComponentSchema,
  componentStatusEnum,
  parseFormData,
} from "@/lib/validations";

export async function createComponent(pageId: string, formData: FormData) {
  const parsed = parseFormData(createComponentSchema, formData);
  if (!parsed.success) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: page } = await supabase
    .from("pages")
    .select("id")
    .eq("id", pageId)
    .eq("user_id", user.id)
    .single();
  if (!page) return { error: "Page not found" };

  const { name, description, group_name, status } = parsed.data;

  const { error } = await supabase.from("components").insert({
    page_id: pageId,
    name,
    description: description || null,
    group_name: group_name || null,
    status,
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
  const parsed = componentStatusEnum.safeParse(status);
  if (!parsed.success) return { error: "Invalid status" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

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
    .update({ status: parsed.data })
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
  const parsed = parseFormData(updateComponentSchema, formData);
  if (!parsed.success) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { name, description, group_name, status } = parsed.data;

  const { error } = await supabase
    .from("components")
    .update({
      name,
      description: description || null,
      group_name: group_name || null,
      status,
    })
    .eq("id", componentId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${pageId}`);
  return { success: true };
}

export async function deleteComponent(pageId: string, componentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("components")
    .delete()
    .eq("id", componentId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${pageId}`);
  return { success: true };
}
