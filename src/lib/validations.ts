import { z } from "zod";

// ── Shared enums ──

export const componentStatusEnum = z.enum([
  "operational",
  "degraded",
  "partial_outage",
  "major_outage",
  "maintenance",
]);

export const incidentStatusEnum = z.enum([
  "investigating",
  "identified",
  "monitoring",
  "resolved",
]);

export const incidentImpactEnum = z.enum(["none", "minor", "major", "critical"]);

export const maintenanceStatusEnum = z.enum([
  "scheduled",
  "in_progress",
  "completed",
]);

// ── Components ──

export const createComponentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional().default(""),
  group_name: z.string().max(100).optional().default(""),
  status: componentStatusEnum.optional().default("operational"),
});

export const updateComponentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional().default(""),
  group_name: z.string().max(100).optional().default(""),
  status: componentStatusEnum.optional().default("operational"),
});

// ── Incidents ──

export const createIncidentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  impact: incidentImpactEnum.optional().default("minor"),
  message: z.string().max(2000).optional().default(""),
  component_ids: z.array(z.string().uuid()).optional().default([]),
});

export const addIncidentUpdateSchema = z.object({
  status: incidentStatusEnum,
  message: z.string().min(1, "Message is required").max(2000),
});

export const updateIncidentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  impact: incidentImpactEnum,
});

// ── Maintenances ──

export const createMaintenanceSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().max(2000).optional().default(""),
    scheduled_start: z.string().min(1, "Start time is required"),
    scheduled_end: z.string().min(1, "End time is required"),
  })
  .refine(
    (data) => new Date(data.scheduled_end) > new Date(data.scheduled_start),
    { message: "End time must be after start time", path: ["scheduled_end"] }
  );

export const updateMaintenanceSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().max(2000).optional().default(""),
    scheduled_start: z.string().min(1, "Start time is required"),
    scheduled_end: z.string().min(1, "End time is required"),
    status: maintenanceStatusEnum.optional().default("scheduled"),
  })
  .refine(
    (data) => new Date(data.scheduled_end) > new Date(data.scheduled_start),
    { message: "End time must be after start time", path: ["scheduled_end"] }
  );

// ── Pages ──

export const createPageSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().max(100).optional().default(""),
  description: z.string().max(500).optional().default(""),
});

export const updatePageSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional().default(""),
});

// ── Auth ──

export const signInSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Valid email is required"),
});

// ── Subscribers ──

export const subscribeSchema = z.object({
  email: z.string().email("Valid email is required"),
});

// ── Helpers ──

/** Extract form data into a plain object matching a schema's shape. */
export function formDataToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key in obj) {
      // Handle multi-value fields (checkboxes)
      const existing = obj[key];
      if (Array.isArray(existing)) {
        existing.push(value as string);
      } else {
        obj[key] = [existing as string, value as string];
      }
    } else {
      obj[key] = value as string;
    }
  }
  return obj;
}

export type ParseSuccess<T> = { success: true; data: T };
export type ParseFailure = { success: false; error: string };
export type ParseResult<T> = ParseSuccess<T> | ParseFailure;

/** Parse FormData with a Zod schema. Returns discriminated union on `success`. */
export function parseFormData<T extends z.ZodType>(
  schema: T,
  formData: FormData
): ParseResult<z.infer<T>> {
  const raw = formDataToObject(formData);
  const result = schema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? "Invalid input" };
  }
  return { success: true, data: result.data };
}
