import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  incidentStatusConfig,
  incidentImpactConfig,
  formatDate,
} from "@/lib/status";
import type { Database } from "@/types/database";

export const revalidate = 60;

type Incident = Database["public"]["Tables"]["incidents"]["Row"];
type IncidentUpdate = Database["public"]["Tables"]["incident_updates"]["Row"];

export default async function IncidentHistoryPage({
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

  const { data: incidents } = await supabase
    .from("incidents")
    .select("*")
    .eq("page_id", page.id)
    .eq("status", "resolved")
    .order("created_at", { ascending: false })
    .limit(50);

  const incidentIds = (incidents ?? []).map((i) => i.id);

  const { data: allUpdates } = incidentIds.length > 0
    ? await supabase
        .from("incident_updates")
        .select("*")
        .in("incident_id", incidentIds)
        .order("created_at", { ascending: true })
    : { data: [] };

  const updatesMap = new Map<string, IncidentUpdate[]>();
  for (const update of allUpdates ?? []) {
    const arr = updatesMap.get(update.incident_id) ?? [];
    arr.push(update);
    updatesMap.set(update.incident_id, arr);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link href={`/s/${slug}`} className="text-sm text-emerald-600 hover:underline mb-2 block">
            ← Back to {page.name} Status
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Incident History</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {!incidents || incidents.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No resolved incidents recorded.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(incidents as Incident[]).map((incident) => {
              const statusConfig = incidentStatusConfig[incident.status as keyof typeof incidentStatusConfig];
              const impactConfig = incidentImpactConfig[incident.impact as keyof typeof incidentImpactConfig];
              const updates = updatesMap.get(incident.id) ?? [];

              return (
                <div key={incident.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="text-sm font-semibold text-gray-900">{incident.title}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${impactConfig.color}`}>
                        {impactConfig.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {formatDate(incident.started_at)}
                      {incident.resolved_at && <> → {formatDate(incident.resolved_at)}</>}
                    </p>
                  </div>
                  <div className="px-5 py-3 space-y-3">
                    {updates.map((update) => {
                      const updateStatus = incidentStatusConfig[update.status as keyof typeof incidentStatusConfig];
                      return (
                        <div key={update.id} className="text-sm">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${updateStatus?.color ?? "bg-gray-100 text-gray-600"} mr-2`}>
                            {updateStatus?.label ?? update.status}
                          </span>
                          <span className="text-xs text-gray-400 mr-2">{formatDate(update.created_at)}</span>
                          <span className="text-gray-700">{update.message}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
