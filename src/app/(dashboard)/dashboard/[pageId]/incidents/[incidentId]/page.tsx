import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageNav } from "@/components/dashboard/nav";
import { IncidentDetail } from "@/components/dashboard/incident-detail";

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ pageId: string; incidentId: string }>;
}) {
  const { pageId, incidentId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("id", pageId)
    .eq("user_id", user!.id)
    .single();

  if (!page) notFound();

  const { data: incident } = await supabase
    .from("incidents")
    .select("*")
    .eq("id", incidentId)
    .eq("page_id", pageId)
    .single();

  if (!incident) notFound();

  const { data: updates } = await supabase
    .from("incident_updates")
    .select("*")
    .eq("incident_id", incidentId)
    .order("created_at", { ascending: false });

  // Fetch incident_components then look up component details separately
  const { data: incidentComponents } = await supabase
    .from("incident_components")
    .select("component_id")
    .eq("incident_id", incidentId);

  const componentIds = (incidentComponents ?? []).map((ic) => ic.component_id);

  const { data: components } = componentIds.length > 0
    ? await supabase
        .from("components")
        .select("id, name, status")
        .in("id", componentIds)
    : { data: [] };

  const affectedComponents = (incidentComponents ?? []).map((ic) => ({
    component_id: ic.component_id,
    components: (components ?? []).find((c) => c.id === ic.component_id) ?? null,
  }));

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900">{page.name}</h1>
      </div>
      <PageNav pageId={pageId} slug={page.slug} />
      <IncidentDetail
        pageId={pageId}
        incident={incident}
        updates={updates ?? []}
        affectedComponents={affectedComponents}
      />
    </div>
  );
}
