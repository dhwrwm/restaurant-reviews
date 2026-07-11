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
import { deleteRestaurant } from "../api/delete-restaurant";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteRestaurantDialog({
  id,
  name,
  open,
  onToggleAction,
}: {
  id: string;
  name: string;
  open: boolean;
  onToggleAction: () => void;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteRestaurant(id);
      onToggleAction();
      toast.success(`"${name}" was deleted.`);
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
          <DialogTitle>Delete restaurant</DialogTitle>
          <DialogDescription>
            Delete <strong>{name}</strong>? <br />
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
