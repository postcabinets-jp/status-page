import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageNav } from "@/components/dashboard/nav";
import { MaintenanceList } from "@/components/dashboard/maintenance-list";

export default async function MaintenancePage({
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

  const { data: maintenances } = await supabase
    .from("maintenances")
    .select("*")
    .eq("page_id", pageId)
    .order("scheduled_start", { ascending: false });

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900">{page.name}</h1>
      </div>
      <PageNav pageId={pageId} slug={page.slug} />
      <MaintenanceList pageId={pageId} maintenances={maintenances ?? []} />
    </div>
  );
}
