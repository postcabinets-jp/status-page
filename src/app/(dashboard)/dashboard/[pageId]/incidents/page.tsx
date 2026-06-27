import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageNav } from "@/components/dashboard/nav";
import { Button } from "@/components/ui/button";
import { incidentStatusConfig, incidentImpactConfig, formatRelative } from "@/lib/status";
import { Plus } from "lucide-react";

export default async function IncidentsPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("id", pageId)
    .eq("user_id", user!.id)
    .single();

  if (!page) notFound();

  const { data: incidents } = await supabase
    .from("incidents")
    .select("*, incident_updates(count)")
    .eq("page_id", pageId)
    .order("created_at", { ascending: false });

  const active = incidents?.filter((i) => i.status !== "resolved") ?? [];
  const resolved = incidents?.filter((i) => i.status === "resolved") ?? [];

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900">{page.name}</h1>
      </div>

      <PageNav pageId={pageId} slug={page.slug} />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-700">Incidents</h2>
        <Link href={`/dashboard/${pageId}/incidents/new`}>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            New incident
          </Button>
        </Link>
      </div>

      {active.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Active ({active.length})
          </h3>
          <div className="space-y-2">
            {active.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} pageId={pageId} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Resolved ({resolved.length})
        </h3>
        {resolved.length === 0 ? (
          <div className="text-center py-10 bg-white border border-dashed border-gray-200 rounded-xl">
            <p className="text-sm text-gray-400">No resolved incidents yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {resolved.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} pageId={pageId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function IncidentCard({
  incident,
  pageId,
}: {
  incident: {
    id: string;
    title: string;
    status: string;
    impact: string;
    created_at: string;
  };
  pageId: string;
}) {
  const statusConfig = incidentStatusConfig[incident.status as keyof typeof incidentStatusConfig];
  const impactConfig = incidentImpactConfig[incident.impact as keyof typeof incidentImpactConfig];

  return (
    <Link href={`/dashboard/${pageId}/incidents/${incident.id}`}>
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-gray-300 transition-colors flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-medium text-gray-900">{incident.title}</p>
            <p className="text-xs text-gray-400">{formatRelative(incident.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${impactConfig.color}`}>
            {impactConfig.label}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>
    </Link>
  );
}
