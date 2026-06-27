import Link from "next/link";
import { signUp } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Create account — StatusPage" };

export default function RegisterPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-2 text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
        <AuthForm action={signUp} submitLabel="Create account" />
        <p className="mt-4 text-xs text-center text-gray-400">
          Free, open-source, no credit card required.
        </p>
      </div>
    </div>
  );
}
