"use client";

import { useActionState, useState } from "react";
import { createComponent } from "@/app/actions/components";
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

export function AddComponentDialog({ pageId }: { pageId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      const result = await createComponent(pageId, formData);
      if (!result?.error) setOpen(false);
      return result;
    },
    undefined
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-1.5 text-sm font-medium border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
        <Plus className="w-3.5 h-3.5" />
        Add component
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add component</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4 mt-2">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {state.error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="comp-name">Name</Label>
            <Input id="comp-name" name="name" required placeholder="API Gateway" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="comp-desc">Description</Label>
            <Input id="comp-desc" name="description" placeholder="REST / GraphQL endpoint" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="comp-group">Group</Label>
            <Input id="comp-group" name="group_name" placeholder="Core Infrastructure" />
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
              {pending ? "Adding…" : "Add component"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
