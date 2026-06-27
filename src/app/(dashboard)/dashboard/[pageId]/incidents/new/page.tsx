import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageNav } from "@/components/dashboard/nav";
import { NewIncidentForm } from "@/components/dashboard/new-incident-form";

export default async function NewIncidentPage({
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
    .select("id, name, status")
    .eq("page_id", pageId)
    .order("sort_order");

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900">{page.name}</h1>
      </div>
      <PageNav pageId={pageId} slug={page.slug} />
      <div className="max-w-2xl">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Create incident</h2>
        <NewIncidentForm pageId={pageId} components={components ?? []} />
      </div>
    </div>
  );
}
