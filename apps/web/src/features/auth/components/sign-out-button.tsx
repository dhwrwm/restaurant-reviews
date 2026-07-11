"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "../api/logout";

interface SignOutButtonProps {
  className?: string;
}

const SignOutButton = ({ className }: SignOutButtonProps) => {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

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
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={className}
    >
      {isSigningOut ? "Signing out..." : "Sign out"}
    </button>
  );
};

export default SignOutButton;
