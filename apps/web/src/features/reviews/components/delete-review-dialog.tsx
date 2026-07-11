"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteReview } from "../api/delete-review";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteReviewDialog({
  id,
  open,
  onToggleAction,
  onDeleted,
}: {
  id: string;
  open: boolean;
  onToggleAction: () => void;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteReview(id);
      onToggleAction();
      onDeleted();
      toast.success("Your review was deleted.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onToggleAction}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete review</DialogTitle>
          <DialogDescription>
            Delete your review? <br />
            This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Yes, delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
