import Link from "next/link";
import dynamic from "next/dynamic";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getCurrentUser, type CurrentUser } from "@/features/auth/api/me";
import { Role } from "types";

const SignOutButton = dynamic(
  () => import("@/features/auth/components/sign-out-button"),
);
const UserMenu = dynamic(() => import("@/features/auth/components/user-menu"));

const ownerLinks = [
  { href: "/my-restaurants", label: "My Restaurants" },
  { href: "/add-restaurant", label: "Add Restaurant" },
];

const guestLinks = [
  { href: "/login", label: "Sign in" },
  { href: "/register", label: "Register" },
];

interface HeaderProps {
  user: CurrentUser | null;
}

// Resolves the current user itself so RootLayout doesn't have to await it
// before returning JSX — that would block the static shell (and the page's
// own data fetch below it) behind an auth round trip on every request.
// Rendered inside a <Suspense> boundary in layout.tsx.
export async function HeaderWithUser() {
  const user = await getCurrentUser();
  return <Header user={user} />;
}

// Matches HeaderWithUser's markup dimensions so swapping between the two
// doesn't shift the layout.
export function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="h-16 flex items-center justify-between container">
        <div className="leading-loose">
          <Link href="/" className="font-bold text-lg md:text-2xl">
            Restaurant Reviews
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Header({ user }: HeaderProps) {
  const initial = user?.email.charAt(0).toUpperCase();
  const navLinks = user?.role === Role.OWNER ? ownerLinks : [];

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="h-16 flex items-center justify-between container">
        <div className="leading-loose">
          <Link href="/" className="font-bold text-lg md:text-2xl">
            Restaurant Reviews
          </Link>
        </div>

        <nav className="hidden md:flex items-center justify-between py-4">
          <div className="leading-loose flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="text-sm font-semibold text-primary px-3"
              >
                {label}
              </Link>
            ))}

            {user ? (
              <div className="pl-3">
                <UserMenu user={user} />
              </div>
            ) : (
              guestLinks.map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-sm font-semibold text-primary px-3"
                >
                  {label}
                </Link>
              ))
            )}
          </div>
        </nav>

        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden" />
            }
          >
            <Menu />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-white">
            <SheetHeader>
              <SheetTitle>Restaurant Reviews</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {navLinks.map(({ href, label }) => (
                <SheetClose
                  key={label}
                  nativeButton={false}
                  render={
                    <Link
                      href={href}
                      className="text-sm font-semibold text-primary py-2"
                    />
                  }
                >
                  {label}
                </SheetClose>
              ))}

              {user ? (
                <>
                  <SignOutButton className="text-sm font-semibold text-primary py-2 text-left" />
                </>
              ) : (
                guestLinks.map(({ href, label }) => (
                  <SheetClose
                    key={label}
                    nativeButton={false}
                    render={
                      <Link
                        href={href}
                        className="text-sm font-semibold text-primary py-2"
                      />
                    }
                  >
                    {label}
                  </SheetClose>
                ))
              )}
            </nav>
            {user && (
              <SheetFooter>
                <div className="flex items-center gap-2 py-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {initial}
                  </span>
                  <span className="text-sm text-gray-600">{user.name}</span>
                </div>
              </SheetFooter>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
