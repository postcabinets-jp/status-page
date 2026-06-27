"use client";

import { useActionState } from "react";
import { subscribeToPage } from "@/app/actions/maintenances";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SubscribeForm({ pageId }: { pageId: string }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: string } | undefined, formData: FormData) => {
      return await subscribeToPage(pageId, formData);
    },
    undefined
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Get notified</h3>
      <p className="text-sm text-gray-500 mb-3">
        Subscribe to receive email notifications for incidents and maintenance.
      </p>
      {state?.success ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded text-sm">
          {state.success}
        </div>
      ) : (
        <form action={formAction} className="flex gap-2">
          {state?.error && (
            <p className="text-xs text-red-500 absolute">{state.error}</p>
          )}
          <Input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="flex-1"
          />
          <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700" disabled={pending}>
            {pending ? "…" : "Subscribe"}
          </Button>
        </form>
      )}
    </div>
  );
}
