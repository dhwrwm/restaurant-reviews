"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "../api/logout";
import type { CurrentUser } from "../api/me";

interface UserMenuProps {
  user: CurrentUser;
}

export default function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const initial = user.email.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await logout();
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 rounded-full outline-none"
          />
        }
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
          title={user.email}
        >
          {initial}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <div className="px-1.5 py-1 text-xs font-medium text-gray-600">
          {user.name}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isSigningOut}
          className="cursor-pointer"
          onClick={handleSignOut}
        >
          {isSigningOut ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
