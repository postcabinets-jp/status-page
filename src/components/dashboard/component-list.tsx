"use client";

import { useTransition } from "react";
import { updateComponentStatus, deleteComponent } from "@/app/actions/components";
import { componentStatusConfig } from "@/lib/status";
import type { Database } from "@/types/database";

type Component = Database["public"]["Tables"]["components"]["Row"];

export function ComponentList({
  pageId,
  components,
}: {
  pageId: string;
  components: Component[];
}) {
  if (components.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-dashed border-gray-200 rounded-xl">
        <p className="text-sm text-gray-500">No components yet. Add your first component above.</p>
      </div>
    );
  }

  // Group by group_name
  const groups: Record<string, Component[]> = {};
  for (const c of components) {
    const key = c.group_name ?? "";
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  }

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([groupName, groupComponents]) => (
        <div key={groupName}>
          {groupName && (
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {groupName}
            </h3>
          )}
          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
            {groupComponents.map((component) => (
              <ComponentRow key={component.id} pageId={pageId} component={component} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ComponentRow({ pageId, component }: { pageId: string; component: Component }) {
  const [isPending, startTransition] = useTransition();
  const statusConfig = componentStatusConfig[component.status as keyof typeof componentStatusConfig];

  const handleStatusChange = (newStatus: string) => {
    startTransition(() => {
      updateComponentStatus(pageId, component.id, newStatus);
    });
  };

  const handleDelete = () => {
    if (!confirm(`Delete "${component.name}"? This cannot be undone.`)) return;
    startTransition(() => {
      deleteComponent(pageId, component.id);
    });
  };

  return (
    <div className={`flex items-center justify-between px-4 py-3 ${isPending ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-3">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusConfig.color}`} />
        <div>
          <p className="text-sm font-medium text-gray-900">{component.name}</p>
          {component.description && (
            <p className="text-xs text-gray-400">{component.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={component.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-700 bg-white"
          disabled={isPending}
        >
          {Object.entries(componentStatusConfig).map(([value, config]) => (
            <option key={value} value={value}>
              {config.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleDelete}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors px-1"
          disabled={isPending}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
