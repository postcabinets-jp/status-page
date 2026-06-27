import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UptimeBar } from "@/components/status/uptime-bar";
import { SubscribeForm } from "@/components/status/subscribe-form";
import {
  componentStatusConfig,
  incidentStatusConfig,
  incidentImpactConfig,
  getOverallStatus,
  formatDate,
  formatRelative,
} from "@/lib/status";

export const revalidate = 60; // Revalidate every minute

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!page) return { title: "Not Found" };
  return {
    title: `${page.name} Status`,
    description: page.description ?? `Status page for ${page.name}`,
  };
}

export default async function PublicStatusPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!page) notFound();

  const { data: components } = await supabase
    .from("components")
    .select("*")
    .eq("page_id", page.id)
    .order("sort_order");

  const { data: activeIncidents } = await supabase
    .from("incidents")
    .select("*")
    .eq("page_id", page.id)
    .neq("status", "resolved")
    .order("created_at", { ascending: false });

  // Fetch latest incident updates separately
  const activeIncidentIds = (activeIncidents ?? []).map((i) => i.id);
  const { data: latestUpdates } = activeIncidentIds.length > 0
    ? await supabase
        .from("incident_updates")
        .select("*")
        .in("incident_id", activeIncidentIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  const latestUpdateMap = new Map<string, { message: string }>();
  for (const u of latestUpdates ?? []) {
    if (!latestUpdateMap.has(u.incident_id)) {
      latestUpdateMap.set(u.incident_id, { message: u.message });
    }
  }

  const { data: upcomingMaintenance } = await supabase
    .from("maintenances")
    .select("*")
    .eq("page_id", page.id)
    .in("status", ["scheduled", "in_progress"])
    .order("scheduled_start");

  // 90-day uptime data
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const { data: uptimeData } = await supabase
    .from("uptime_records")
    .select("*")
    .in("component_id", (components ?? []).map((c) => c.id))
    .gte("date", ninetyDaysAgo.toISOString().split("T")[0])
    .order("date");

  const statuses = (components ?? []).map(
    (c) => c.status as keyof typeof componentStatusConfig
  );
  const overallStatus = getOverallStatus(statuses);
  const overallConfig = componentStatusConfig[overallStatus];

  // Group components
  const groups: Record<string, typeof components> = {};
  for (const c of components ?? []) {
    const key = c.group_name ?? "";
    if (!groups[key]) groups[key] = [];
    groups[key]!.push(c);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between">
            <div>
              {page.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={page.logo_url} alt={page.name} className="h-8 mb-3" />
              )}
              <h1 className="text-xl font-bold text-gray-900">{page.name}</h1>
              {page.description && (
                <p className="text-sm text-gray-500 mt-0.5">{page.description}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Overall status */}
        <div className={`rounded-xl px-5 py-4 border ${overallConfig.bg} ${overallConfig.border}`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${overallConfig.color} ${overallStatus === "operational" ? "ring-4 ring-emerald-100" : ""}`} />
            <span className={`font-semibold ${overallConfig.textColor}`}>
              {overallStatus === "operational"
                ? "All Systems Operational"
                : overallConfig.label}
            </span>
          </div>
        </div>

        {/* Active Incidents */}
        {activeIncidents && activeIncidents.length > 0 && (
          <div className="bg-white border border-orange-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-orange-50 border-b border-orange-100">
              <h2 className="text-sm font-semibold text-orange-800">Active Incidents</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {activeIncidents.map((incident) => {
                const statusConfig = incidentStatusConfig[incident.status as keyof typeof incidentStatusConfig];
                const impactConfig = incidentImpactConfig[incident.impact as keyof typeof incidentImpactConfig];
                const latestUpdate = latestUpdateMap.get(incident.id);
                return (
                  <div key={incident.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">{incident.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${impactConfig.color}`}>
                        {impactConfig.label}
                      </span>
                    </div>
                    {latestUpdate && (
                      <p className="text-sm text-gray-600 mb-1">{latestUpdate.message}</p>
                    )}
                    <p className="text-xs text-gray-400">{formatRelative(incident.started_at)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming Maintenance */}
        {upcomingMaintenance && upcomingMaintenance.length > 0 && (
          <div className="bg-white border border-blue-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
              <h2 className="text-sm font-semibold text-blue-800">Scheduled Maintenance</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {upcomingMaintenance.map((m) => (
                <div key={m.id} className="px-5 py-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{m.title}</h3>
                  {m.description && (
                    <p className="text-sm text-gray-600 mb-1">{m.description}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {formatDate(m.scheduled_start)} — {formatDate(m.scheduled_end)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Components */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Components</h2>
          </div>
          {Object.entries(groups).map(([groupName, groupComponents]) => (
            <div key={groupName}>
              {groupName && (
                <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{groupName}</p>
                </div>
              )}
              <div className="divide-y divide-gray-50">
                {(groupComponents ?? []).map((component) => {
                  const statusConfig = componentStatusConfig[component.status as keyof typeof componentStatusConfig];
                  const componentUptime = (uptimeData ?? []).filter(
                    (u) => u.component_id === component.id
                  );

                  return (
                    <div key={component.id} className="px-5 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${statusConfig.color}`} />
                          <span className="text-sm text-gray-900">{component.name}</span>
                          {component.description && (
                            <span className="text-xs text-gray-400">{component.description}</span>
                          )}
                        </div>
                        <span className={`text-xs font-medium ${statusConfig.textColor}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <UptimeBar records={componentUptime} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Subscribe */}
        <SubscribeForm pageId={page.id} />

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 py-4">
          Powered by{" "}
          <a
            href="https://github.com/postcabinets-jp/status-page"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:underline"
          >
            StatusPage OSS
          </a>
        </div>
      </div>
    </div>
  );
}
