export const componentStatusConfig = {
  operational: {
    label: "Operational",
    color: "bg-emerald-500",
    textColor: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  degraded: {
    label: "Degraded Performance",
    color: "bg-yellow-400",
    textColor: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },
  partial_outage: {
    label: "Partial Outage",
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
  major_outage: {
    label: "Major Outage",
    color: "bg-red-500",
    textColor: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  maintenance: {
    label: "Under Maintenance",
    color: "bg-blue-400",
    textColor: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
} as const;

export const incidentStatusConfig = {
  investigating: { label: "Investigating", color: "bg-red-100 text-red-700" },
  identified: { label: "Identified", color: "bg-orange-100 text-orange-700" },
  monitoring: { label: "Monitoring", color: "bg-yellow-100 text-yellow-700" },
  resolved: { label: "Resolved", color: "bg-emerald-100 text-emerald-700" },
} as const;

export const incidentImpactConfig = {
  none: { label: "None", color: "bg-gray-100 text-gray-600" },
  minor: { label: "Minor", color: "bg-yellow-100 text-yellow-700" },
  major: { label: "Major", color: "bg-orange-100 text-orange-700" },
  critical: { label: "Critical", color: "bg-red-100 text-red-700" },
} as const;

export function getOverallStatus(
  statuses: (keyof typeof componentStatusConfig)[]
): keyof typeof componentStatusConfig {
  if (statuses.includes("major_outage")) return "major_outage";
  if (statuses.includes("partial_outage")) return "partial_outage";
  if (statuses.includes("maintenance")) return "maintenance";
  if (statuses.includes("degraded")) return "degraded";
  return "operational";
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(date));
}

export function formatRelative(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
