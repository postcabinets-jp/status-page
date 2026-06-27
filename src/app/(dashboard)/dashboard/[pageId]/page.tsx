import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageNav } from "@/components/dashboard/nav";
import { ComponentList } from "@/components/dashboard/component-list";
import { AddComponentDialog } from "@/components/dashboard/add-component-dialog";
import { componentStatusConfig, getOverallStatus } from "@/lib/status";

export default async function PageOverview({
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

  const { data: components } = await supabase
    .from("components")
    .select("*")
    .eq("page_id", pageId)
    .order("sort_order", { ascending: true });

  const statuses = (components ?? []).map((c) => c.status as keyof typeof componentStatusConfig);
  const overallStatus = getOverallStatus(statuses);
  const overallConfig = componentStatusConfig[overallStatus];

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-xl font-semibold text-gray-900">{page.name}</h1>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${overallConfig.bg} ${overallConfig.textColor} border ${overallConfig.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${overallConfig.color}`} />
            {overallConfig.label}
          </span>
        </div>
        {page.description && (
          <p className="text-sm text-gray-500">{page.description}</p>
        )}
      </div>

      <PageNav pageId={pageId} slug={page.slug} />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-700">
          Components{" "}
          <span className="text-gray-400 font-normal">({components?.length ?? 0})</span>
        </h2>
        <AddComponentDialog pageId={pageId} />
      </div>

      <ComponentList pageId={pageId} components={components ?? []} />
    </div>
  );
}
