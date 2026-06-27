import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageNav } from "@/components/dashboard/nav";
import { PageSettingsForm } from "@/components/dashboard/page-settings-form";

export default async function SettingsPage({
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

  const { data: subscribers } = await supabase
    .from("subscribers")
    .select("count")
    .eq("page_id", pageId);

  const subscriberCount = (subscribers as { count: number }[] | null)?.[0]?.count ?? 0;

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900">{page.name}</h1>
      </div>
      <PageNav pageId={pageId} slug={page.slug} />
      <div className="max-w-xl space-y-6">
        <PageSettingsForm pageId={pageId} page={page} />
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-900 mb-1">Subscribers</h3>
          <p className="text-sm text-gray-500">
            <span className="text-2xl font-bold text-gray-900">{subscriberCount}</span>{" "}
            email subscribers
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-900 mb-1">Public URL</h3>
          <p className="text-sm font-mono text-gray-600 bg-gray-50 px-3 py-2 rounded">
            {process.env.NEXT_PUBLIC_APP_URL}/s/{page.slug}
          </p>
        </div>
      </div>
    </div>
  );
}
