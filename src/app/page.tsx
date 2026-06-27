import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-500 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="font-semibold text-gray-900">StatusPage</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/postcabinets-jp/status-page"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              GitHub
            </a>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-gray-600">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                Get started free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Open-source · Free · Self-hosted
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
            The status page your users{" "}
            <span className="text-emerald-600">actually trust</span>
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            Replace Instatus ($15–149/mo) with a self-hosted status page. Free, open-source,
            no component limits, maintenance windows included.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
                Create your status page
              </Button>
            </Link>
            <a
              href="https://vercel.com/new/clone?repository-url=https://github.com/postcabinets-jp/status-page&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Supabase%20project%20credentials&project-name=status-page&repository-name=status-page"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Deploy your own
              </Button>
            </a>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            No credit card. MIT license. Own your data.
          </p>
        </div>
      </section>

      {/* Status page mockup */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">Acme Cloud Platform</h2>
              <p className="text-sm text-gray-500">Real-time status of our services</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
              <span className="text-sm font-semibold text-emerald-700">All Systems Operational</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
              {[
                { name: "API Gateway", status: "operational", uptime: "100.00%" },
                { name: "Web App", status: "operational", uptime: "99.98%" },
                { name: "PostgreSQL Database", status: "operational", uptime: "100.00%" },
                { name: "CDN / Edge Network", status: "degraded", uptime: "99.43%" },
              ].map((c) => (
                <div key={c.name} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        c.status === "operational" ? "bg-emerald-400" : "bg-yellow-400"
                      }`}
                    />
                    <span className="text-sm text-gray-900">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex gap-0.5 h-4">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-sm ${
                            c.status === "degraded" && i === 28
                              ? "bg-yellow-400"
                              : "bg-emerald-400"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{c.uptime}</span>
                    <span
                      className={`text-xs font-medium ${
                        c.status === "operational" ? "text-emerald-600" : "text-yellow-600"
                      }`}
                    >
                      {c.status === "operational" ? "Operational" : "Degraded"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Everything Instatus charges for, free.
          </h2>
          <p className="text-gray-500 text-center mb-10 text-sm">
            Instatus starts at $15/mo and locks key features behind higher tiers.
            StatusPage OSS gives you everything, zero cost.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: "Unlimited components",
                desc: "No artificial limits. Monitor your entire infrastructure — API, DB, CDN, webhooks, anything.",
                icon: "Grid",
              },
              {
                title: "Incident lifecycle",
                desc: "Investigating → Identified → Monitoring → Resolved. Full timeline with timestamped updates.",
                icon: "Bell",
              },
              {
                title: "Maintenance windows",
                desc: "Schedule planned downtime in advance. Instatus charges $49/mo for this. Ours: free.",
                icon: "Calendar",
              },
              {
                title: "90-day uptime bars",
                desc: "Per-component uptime history visualized. Users see exactly what happened and when.",
                icon: "Chart",
              },
              {
                title: "Email subscriptions",
                desc: "Users subscribe to get notified on incidents and maintenance without polling the page.",
                icon: "Mail",
              },
              {
                title: "Own your data",
                desc: "Supabase PostgreSQL. No vendor lock-in. Export anytime. Run on your own infrastructure.",
                icon: "Lock",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-emerald-600 text-xs font-bold">{f.icon[0]}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            StatusPage OSS vs. Instatus
          </h2>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-700 font-semibold">Feature</th>
                  <th className="text-center px-4 py-3 text-gray-700 font-semibold">StatusPage OSS</th>
                  <th className="text-center px-4 py-3 text-gray-700 font-semibold">Instatus Starter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["Price", "Free", "$15/mo"],
                  ["Components", "Unlimited", "25 max"],
                  ["Incident management", "Yes", "Yes"],
                  ["Maintenance windows", "Yes", "Business plan only"],
                  ["Email subscriptions", "Yes", "Limited"],
                  ["90-day uptime history", "Yes", "Yes"],
                  ["Custom domain", "Self-hosted", "$49/mo"],
                  ["Data ownership", "Full (your DB)", "Instatus servers"],
                  ["Open-source", "MIT", "No"],
                ].map(([feat, ours, theirs]) => (
                  <tr key={feat} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{feat}</td>
                    <td className="px-4 py-3 text-center text-emerald-600 font-medium">{ours}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{theirs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Deploy CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Deploy in 5 minutes</h2>
          <p className="text-gray-400 mb-8 text-sm">
            One-click deploy to Vercel. Connect your Supabase project. Done.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://vercel.com/new/clone?repository-url=https://github.com/postcabinets-jp/status-page&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Supabase%20project%20credentials&project-name=status-page&repository-name=status-page"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 76 65" fill="none">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="#000" />
              </svg>
              Deploy with Vercel
            </a>
            <a
              href="https://github.com/postcabinets-jp/status-page"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-gray-700 text-gray-300 font-medium px-6 py-3 rounded-lg hover:border-gray-500 transition-colors text-sm"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-4 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <span>© 2026 POST CABINETS. MIT License.</span>
          <div className="flex gap-4">
            <a href="https://github.com/postcabinets-jp/status-page" className="hover:text-gray-600">
              GitHub
            </a>
            <Link href="/login" className="hover:text-gray-600">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
