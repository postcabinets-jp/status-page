"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ComponentRow = Database["public"]["Tables"]["components"]["Row"];
type IncidentRow = Database["public"]["Tables"]["incidents"]["Row"];
type MaintenanceRow = Database["public"]["Tables"]["maintenances"]["Row"];
type ComponentStatus = Database["public"]["Enums"]["component_status"];

export interface StatusOverview {
  overall: ComponentStatus;
  components: ComponentRow[];
  activeIncidents: IncidentRow[];
  upcomingMaintenances: MaintenanceRow[];
}

const statusPriority: Record<ComponentStatus, number> = {
  major_outage: 4,
  partial_outage: 3,
  maintenance: 2,
  degraded: 1,
  operational: 0,
};

function deriveOverallStatus(components: ComponentRow[]): ComponentStatus {
  if (components.length === 0) return "operational";
  let worst: ComponentStatus = "operational";
  for (const c of components) {
    const s = c.status as ComponentStatus;
    if (statusPriority[s] > statusPriority[worst]) {
      worst = s;
    }
  }
  return worst;
}

/**
 * Get a full status overview for a page by its slug.
 * This is a public action -- no auth required.
 */
export async function getStatusOverview(
  slug: string
): Promise<{ data: StatusOverview } | { error: string }> {
  if (!slug || typeof slug !== "string") {
    return { error: "Slug is required" };
  }

  const supabase = await createClient();

  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("id")
    .eq("slug", slug)
    .single();

  if (pageError || !page) return { error: "Page not found" };

  const [componentsRes, incidentsRes, maintenancesRes] = await Promise.all([
    supabase
      .from("components")
      .select("*")
      .eq("page_id", page.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("incidents")
      .select("*")
      .eq("page_id", page.id)
      .neq("status", "resolved")
      .order("created_at", { ascending: false }),
    supabase
      .from("maintenances")
      .select("*")
      .eq("page_id", page.id)
      .in("status", ["scheduled", "in_progress"])
      .order("scheduled_start", { ascending: true }),
  ]);

  const components = componentsRes.data ?? [];
  const activeIncidents = incidentsRes.data ?? [];
  const upcomingMaintenances = maintenancesRes.data ?? [];

  return {
    data: {
      overall: deriveOverallStatus(components),
      components,
      activeIncidents,
      upcomingMaintenances,
    },
  };
}

/**
 * Get status overview for a page by its ID (dashboard use, requires auth).
 */
export async function getStatusOverviewById(
  pageId: string
): Promise<{ data: StatusOverview } | { error: string }> {
  if (!pageId || typeof pageId !== "string") {
    return { error: "Page ID is required" };
  }

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

  const [componentsRes, incidentsRes, maintenancesRes] = await Promise.all([
    supabase
      .from("components")
      .select("*")
      .eq("page_id", pageId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("incidents")
      .select("*")
      .eq("page_id", pageId)
      .neq("status", "resolved")
      .order("created_at", { ascending: false }),
    supabase
      .from("maintenances")
      .select("*")
      .eq("page_id", pageId)
      .in("status", ["scheduled", "in_progress"])
      .order("scheduled_start", { ascending: true }),
  ]);

  const components = componentsRes.data ?? [];
  const activeIncidents = incidentsRes.data ?? [];
  const upcomingMaintenances = maintenancesRes.data ?? [];

  return {
    data: {
      overall: deriveOverallStatus(components),
      components,
      activeIncidents,
      upcomingMaintenances,
    },
  };
}
