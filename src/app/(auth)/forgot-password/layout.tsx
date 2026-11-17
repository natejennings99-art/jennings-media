import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page itself is a client component, so its metadata lives here: keep it
// out of search results and stop it reusing the homepage title.
export const metadata: Metadata = { title: "Reset password", robots: { index: false }, alternates: { canonical: "/forgot-password" } };

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}
