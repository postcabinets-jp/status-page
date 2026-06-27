"use client";

import { useActionState, useState, useTransition } from "react";
import { createMaintenance, deleteMaintenance, updateMaintenanceStatus } from "@/app/actions/maintenances";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/status";
import type { Database } from "@/types/database";

type Maintenance = Database["public"]["Tables"]["maintenances"]["Row"];

const maintenanceStatusConfig = {
  scheduled: { label: "Scheduled", color: "bg-blue-50 text-blue-700 border-blue-200" },
  in_progress: { label: "In Progress", color: "bg-orange-50 text-orange-700 border-orange-200" },
  completed: { label: "Completed", color: "bg-gray-50 text-gray-600 border-gray-200" },
} as const;

export function MaintenanceList({
  pageId,
  maintenances,
}: {
  pageId: string;
  maintenances: Maintenance[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      const result = await createMaintenance(pageId, formData);
      if (!result?.error) setOpen(false);
      return result;
    },
    undefined
  );

  const upcoming = maintenances.filter((m) => m.status !== "completed");
  const past = maintenances.filter((m) => m.status === "completed");

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-700">Maintenance windows</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center justify-center gap-1.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Schedule maintenance
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule maintenance window</DialogTitle>
            </DialogHeader>
            <form action={formAction} className="space-y-4 mt-2">
              {state?.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {state.error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="maint-title">Title</Label>
                <Input id="maint-title" name="title" required placeholder="Database upgrade to PostgreSQL 17" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maint-desc">Description</Label>
                <textarea
                  id="maint-desc"
                  name="description"
                  rows={2}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-none"
                  placeholder="Brief description of the maintenance work and expected impact."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="maint-start">Start</Label>
                  <Input id="maint-start" name="scheduled_start" type="datetime-local" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="maint-end">End</Label>
                  <Input id="maint-end" name="scheduled_end" type="datetime-local" required />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={pending}>
                  {pending ? "Scheduling…" : "Schedule"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {upcoming.length === 0 && past.length === 0 ? (
        <div className="text-center py-12 bg-white border border-dashed border-gray-200 rounded-xl">
          <p className="text-sm text-gray-400">No maintenance windows scheduled.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Upcoming & Active ({upcoming.length})
              </h3>
              <div className="space-y-2">
                {upcoming.map((m) => (
                  <MaintenanceCard key={m.id} maintenance={m} pageId={pageId} />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Completed ({past.length})
              </h3>
              <div className="space-y-2">
                {past.map((m) => (
                  <MaintenanceCard key={m.id} maintenance={m} pageId={pageId} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MaintenanceCard({
  maintenance,
  pageId,
}: {
  maintenance: Maintenance;
  pageId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const statusConfig = maintenanceStatusConfig[maintenance.status as keyof typeof maintenanceStatusConfig];

  const handleStatusChange = (newStatus: string) => {
    startTransition(() => {
      updateMaintenanceStatus(pageId, maintenance.id, newStatus);
    });
  };

  const handleDelete = () => {
    if (!confirm(`Delete "${maintenance.title}"? This cannot be undone.`)) return;
    startTransition(() => {
      deleteMaintenance(pageId, maintenance.id);
    });
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-xl px-4 py-3 ${isPending ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
            <p className="text-sm font-medium text-gray-900">{maintenance.title}</p>
          </div>
          {maintenance.description && (
            <p className="text-xs text-gray-500 mb-1">{maintenance.description}</p>
          )}
          <p className="text-xs text-gray-400">
            {formatDate(maintenance.scheduled_start)} → {formatDate(maintenance.scheduled_end)}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {maintenance.status !== "completed" && (
            <select
              value={maintenance.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
              disabled={isPending}
            >
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          )}
          <button
            onClick={handleDelete}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            disabled={isPending}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
