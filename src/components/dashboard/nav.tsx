"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function DashboardNav({ user }: { user: User }) {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-500 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">StatusPage</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit" className="text-gray-600">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}

export function PageNav({ pageId, slug }: { pageId: string; slug: string }) {
  const pathname = usePathname();

  const links = [
    { href: `/dashboard/${pageId}`, label: "Overview" },
    { href: `/dashboard/${pageId}/incidents`, label: "Incidents" },
    { href: `/dashboard/${pageId}/maintenance`, label: "Maintenance" },
    { href: `/dashboard/${pageId}/settings`, label: "Settings" },
  ];

  return (
    <nav className="flex items-center gap-1 border-b border-gray-200 mb-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
      {links.map((link) => {
        const isActive = link.href === `/dashboard/${pageId}`
          ? pathname === link.href
          : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? "border-emerald-500 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <div className="ml-auto pb-2">
        <a
          href={`/s/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-emerald-600 hover:underline"
        >
          View public page →
        </a>
      </div>
    </nav>
  );
}
