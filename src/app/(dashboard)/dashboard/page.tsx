import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { CreatePageDialog } from "@/components/dashboard/create-page-dialog";
import { ExternalLink, Plus } from "lucide-react";
import type { Database } from "@/types/database";

export const metadata = { title: "Dashboard — StatusPage" };

type Page = Database["public"]["Tables"]["pages"]["Row"];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  // Get counts separately to avoid relationship type errors
  const pageIds = (pages ?? []).map((p) => p.id);

  const { data: componentCounts } = pageIds.length > 0
    ? await supabase
        .from("components")
        .select("page_id")
        .in("page_id", pageIds)
    : { data: [] };

  const { data: incidentCounts } = pageIds.length > 0
    ? await supabase
        .from("incidents")
        .select("page_id")
        .in("page_id", pageIds)
    : { data: [] };

  const getComponentCount = (pageId: string) =>
    (componentCounts ?? []).filter((c) => c.page_id === pageId).length;
  const getIncidentCount = (pageId: string) =>
    (incidentCounts ?? []).filter((i) => i.page_id === pageId).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Your status pages</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your public status pages and incidents.
          </p>
        </div>
        <CreatePageDialog />
      </div>

      {pages && pages.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((page: Page) => (
            <div
              key={page.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="font-medium text-gray-900">{page.name}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">/s/{page.slug}</p>
                </div>
                <a
                  href={`/s/${page.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              {page.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{page.description}</p>
              )}
              <div className="flex gap-4 text-xs text-gray-400 mb-4">
                <span>{getComponentCount(page.id)} components</span>
                <span>{getIncidentCount(page.id)} incidents</span>
              </div>
              <Link href={`/dashboard/${page.id}`}>
                <Button size="sm" variant="outline" className="w-full text-xs">
                  Manage
                </Button>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-xl">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Plus className="w-6 h-6 text-emerald-500" />
          </div>
          <h3 className="font-medium text-gray-900 mb-1">Create your first status page</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
            Share real-time service status with your users. Free, open-source, no limits.
          </p>
          <CreatePageDialog />
        </div>
      )}
    </div>
  );
}
