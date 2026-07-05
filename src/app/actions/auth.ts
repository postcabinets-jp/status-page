"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  signInSchema,
  signUpSchema,
  resetPasswordSchema,
  parseFormData,
} from "@/lib/validations";

export async function signIn(formData: FormData) {
  const parsed = parseFormData(signInSchema, formData);
  if (!parsed.success) return { error: parsed.error };

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const parsed = parseFormData(signUpSchema, formData);
  if (!parsed.success) return { error: parsed.error };

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resetPassword(formData: FormData) {
  const parsed = parseFormData(resetPasswordSchema, formData);
  if (!parsed.success) return { error: parsed.error };

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: `${origin}/auth/callback?next=/update-password` }
  );

  if (error) {
    return { error: error.message };
  }

  return { success: "Check your email for a reset link." };
}
