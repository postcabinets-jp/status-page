"use client";

import { useActionState } from "react";
import Link from "next/link";
import { addIncidentUpdate, deleteIncident } from "@/app/actions/incidents";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  incidentStatusConfig,
  incidentImpactConfig,
  componentStatusConfig,
  formatDate,
} from "@/lib/status";
import type { Database } from "@/types/database";

type Incident = Database["public"]["Tables"]["incidents"]["Row"];
type IncidentUpdate = Database["public"]["Tables"]["incident_updates"]["Row"];

export function IncidentDetail({
  pageId,
  incident,
  updates,
  affectedComponents,
}: {
  pageId: string;
  incident: Incident;
  updates: IncidentUpdate[];
  affectedComponents: { component_id: string; components: { name: string; status: string } | null }[];
}) {
  const statusConfig = incidentStatusConfig[incident.status as keyof typeof incidentStatusConfig];
  const impactConfig = incidentImpactConfig[incident.impact as keyof typeof incidentImpactConfig];

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return await addIncidentUpdate(pageId, incident.id, formData);
    },
    undefined
  );

  const handleDelete = async () => {
    if (!confirm("Delete this incident? This cannot be undone.")) return;
    await deleteIncident(pageId, incident.id);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">{incident.title}</h2>
          <button
            onClick={handleDelete}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Delete
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${impactConfig.color}`}>
            {impactConfig.label} impact
          </span>
        </div>
        <p className="text-xs text-gray-400">
          Started {formatDate(incident.started_at)}
          {incident.resolved_at && <> · Resolved {formatDate(incident.resolved_at)}</>}
        </p>

        {affectedComponents.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1.5">Affected components:</p>
            <div className="flex flex-wrap gap-1.5">
              {affectedComponents.map((ac) => {
                const compStatus = componentStatusConfig[ac.components?.status as keyof typeof componentStatusConfig];
                return (
                  <span
                    key={ac.component_id}
                    className={`text-xs px-2 py-0.5 rounded-full ${compStatus?.bg ?? "bg-gray-50"} ${compStatus?.textColor ?? "text-gray-600"} border ${compStatus?.border ?? "border-gray-200"}`}
                  >
                    {ac.components?.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Update */}
      {incident.status !== "resolved" && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Post update</h3>
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {state.error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="status">New status</Label>
              <select
                id="status"
                name="status"
                defaultValue={incident.status}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="investigating">Investigating</option>
                <option value="identified">Identified</option>
                <option value="monitoring">Monitoring</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                name="message"
                required
                rows={3}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-none"
                placeholder="The issue has been identified. We are applying a fix..."
              />
            </div>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={pending}
            >
              {pending ? "Posting…" : "Post update"}
            </Button>
          </form>
        </div>
      )}

      {/* Timeline */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Timeline</h3>
        <div className="space-y-3">
          {updates.map((update, i) => {
            const updateStatus = incidentStatusConfig[update.status as keyof typeof incidentStatusConfig];
            return (
              <div key={update.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                    i === 0 ? "bg-emerald-500" : "bg-gray-300"
                  }`} />
                  {i < updates.length - 1 && (
                    <div className="w-px flex-1 bg-gray-200 mt-1" />
                  )}
                </div>
                <div className="pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${updateStatus?.color ?? "bg-gray-100 text-gray-600"}`}>
                      {updateStatus?.label ?? update.status}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(update.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700">{update.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <Link href={`/dashboard/${pageId}/incidents`}>
          <Button variant="ghost" size="sm" className="text-gray-500">
            ← Back to incidents
          </Button>
        </Link>
      </div>
    </div>
  );
}
