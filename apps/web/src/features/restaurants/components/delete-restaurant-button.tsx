"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";

const DeleteRestaurantDialog = dynamic(() =>
  import("./delete-restaurant-dialog").then(
    (mod) => mod.DeleteRestaurantDialog,
  ),
);

export function DeleteRestaurantButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [hasOpened, setHasOpened] = useState(false);

  const onToggle = () => {
    setHasOpened((_o) => !_o);
  };

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => {
          setHasOpened(true);
        }}
      >
        Delete
      </Button>
      {hasOpened && (
        <DeleteRestaurantDialog
          id={id}
          name={name}
          open={hasOpened}
          onToggleAction={onToggle}
        />
      )}
    </>
  );
}
