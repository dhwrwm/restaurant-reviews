import type { Metadata } from "next";
import "./globals.css";
import Header from "./header";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/features/auth/api/me";
import { Toaster } from "@/components/ui/sonner";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const description =
  "Browse restaurants, filter by cuisine and rating, and read reviews from real diners.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description,
  openGraph: {
    siteName: SITE_NAME,
    title: SITE_NAME,
    description,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={cn("h-full", "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col">
        <Header user={user} />
        <main className="flex-1 container">{children}</main>

        <footer className="bg-gray-800 h-20 mt-10">
          <div className="container">
            <div className="text-white text-sm my-4">Restaurant Reviews</div>
          </div>
        </footer>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
