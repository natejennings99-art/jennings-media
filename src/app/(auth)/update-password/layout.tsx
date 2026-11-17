import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page itself is a client component, so its metadata lives here: keep it
// out of search results and stop it reusing the homepage title.
export const metadata: Metadata = { title: "Choose a new password", robots: { index: false }, alternates: { canonical: "/update-password" } };

export default function UpdatePasswordLayout({ children }: { children: ReactNode }) {
  return children;
}
