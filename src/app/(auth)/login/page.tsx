import Link from "next/link";
import { signIn } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Sign in — StatusPage" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <span className="font-semibold text-gray-900">StatusPage</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Sign in to your account</h1>
          <p className="mt-2 text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-emerald-600 hover:underline font-medium">
              Create one free
            </Link>
          </p>
        </div>
        <AuthForm action={signIn} submitLabel="Sign in" searchParams={searchParams} />
      </div>
    </div>
  );
}
