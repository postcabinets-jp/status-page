"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: string } | undefined, formData: FormData) => {
      return await resetPassword(formData);
    },
    undefined
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email and we&apos;ll send a reset link.
          </p>
        </div>

        {state?.success ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
            {state.success}
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {state.error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={pending}
            >
              {pending ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/login" className="text-emerald-600 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
