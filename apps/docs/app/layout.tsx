import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";

export const metadata: Metadata = {
  title: {
    default: "Restaurant Reviews Docs",
    template: "%s – Restaurant Reviews Docs",
  },
  description: "Engineering documentation for the Restaurant Review Platform.",
};

const navbar = <Navbar logo={<b>Restaurant Reviews Docs</b>} />;

const footer = (
  <Footer>{new Date().getFullYear()} © Restaurant Review Platform.</Footer>
);

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout navbar={navbar} pageMap={await getPageMap()} footer={footer}>
          {children}
        </Layout>
      </body>
    </html>
  );
}
