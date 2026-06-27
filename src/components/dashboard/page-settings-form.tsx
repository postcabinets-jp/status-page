"use client";

import { useActionState } from "react";
import { updatePage, deletePage } from "@/app/actions/pages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Database } from "@/types/database";

type Page = Database["public"]["Tables"]["pages"]["Row"];

export function PageSettingsForm({ pageId, page }: { pageId: string; page: Page }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | undefined, formData: FormData) => {
      return await updatePage(pageId, formData);
    },
    undefined
  );

  const handleDelete = async () => {
    if (!confirm(`Permanently delete "${page.name}" and all its data? This cannot be undone.`)) return;
    await deletePage(pageId);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Page settings</h3>
      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {state.error}
          </div>
        )}
        {state?.success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded text-sm">
            Settings saved.
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="pg-name">Page name</Label>
          <Input id="pg-name" name="name" required defaultValue={page.name} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pg-desc">Description</Label>
          <Input id="pg-desc" name="description" defaultValue={page.description ?? ""} />
        </div>
        <div className="flex items-center justify-between pt-2">
          <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
          <button
            type="button"
            onClick={handleDelete}
            className="text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            Delete page
          </button>
        </div>
      </form>
    </div>
  );
}
