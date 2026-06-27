"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createIncident } from "@/app/actions/incidents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { componentStatusConfig } from "@/lib/status";

interface Component {
  id: string;
  name: string;
  status: string;
}

export function NewIncidentForm({
  pageId,
  components,
}: {
  pageId: string;
  components: Component[];
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return await createIncident(pageId, formData);
    },
    undefined
  );

  return (
    <form action={formAction} className="space-y-5 bg-white border border-gray-200 rounded-xl p-6">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {state.error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="title">Incident title</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="Elevated error rates on API Gateway"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="impact">Impact</Label>
        <select
          id="impact"
          name="impact"
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
        >
          <option value="none">None</option>
          <option value="minor" defaultValue="minor">Minor</option>
          <option value="major">Major</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {components.length > 0 && (
        <div className="space-y-2">
          <Label>Affected components</Label>
          <div className="space-y-1.5">
            {components.map((c) => {
              const statusConfig = componentStatusConfig[c.status as keyof typeof componentStatusConfig];
              return (
                <label key={c.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="component_ids"
                    value={c.id}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-900">{c.name}</span>
                  <span className={`text-xs ${statusConfig.textColor}`}>
                    {statusConfig.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="message">Initial status update</Label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-none"
          placeholder="We are investigating elevated error rates reported by users in the Tokyo region."
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Link href={`/dashboard/${pageId}/incidents`} className="flex-1">
          <Button type="button" variant="outline" className="w-full">
            Cancel
          </Button>
        </Link>
        <Button
          type="submit"
          className="flex-1 bg-red-600 hover:bg-red-700"
          disabled={pending}
        >
          {pending ? "Creating…" : "Create incident"}
        </Button>
      </div>
    </form>
  );
}
