"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPageSchema, updatePageSchema, parseFormData } from "@/lib/validations";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createPage(formData: FormData) {
  const parsed = parseFormData(createPageSchema, formData);
  if (!parsed.success) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { name, slug: rawSlug, description } = parsed.data;
  const slug = slugify(rawSlug || name);

  const { data, error } = await supabase
    .from("pages")
    .insert({
      user_id: user.id,
      name,
      slug,
      description: description || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505")
      return { error: "This URL is already taken. Choose a different one." };
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/${data.id}`);
}

export async function updatePage(pageId: string, formData: FormData) {
  const parsed = parseFormData(updatePageSchema, formData);
  if (!parsed.success) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { name, description } = parsed.data;

  const { error } = await supabase
    .from("pages")
    .update({ name, description: description || null })
    .eq("id", pageId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${pageId}`);
  revalidatePath(`/dashboard/${pageId}/settings`);
  return { success: true };
}

export async function deletePage(pageId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("pages")
    .delete()
    .eq("id", pageId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
