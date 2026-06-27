"use client";

import { useActionState, useState } from "react";
import { createPage } from "@/app/actions/pages";
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

export function CreatePageDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return await createPage(formData);
    },
    undefined
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-1.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md transition-colors">
        <Plus className="w-4 h-4" />
        New page
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create status page</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4 mt-2">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {state.error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="name">Page name</Label>
            <Input id="name" name="name" required placeholder="Acme Cloud" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">
              URL slug{" "}
              <span className="text-gray-400 font-normal text-xs">(auto-generated)</span>
            </Label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-400">/s/</span>
              <Input id="slug" name="slug" placeholder="acme-cloud" className="flex-1" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Real-time status of our services." />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={pending}
            >
              {pending ? "Creating…" : "Create page"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
