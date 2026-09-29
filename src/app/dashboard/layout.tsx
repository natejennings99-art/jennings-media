import type { Metadata } from "next";
import { CalendarCheck, Heart, Home, ImageDown, LayoutDashboard, LifeBuoy, Receipt, Settings, Share2, Wallet } from "lucide-react";
import { AppShell, type NavItem } from "@/components/dashboard/shell";
import { requireUser } from "@/lib/auth/session";
import { features } from "@/lib/env";
import { redirect } from "next/navigation";

// Always render per request: every page here depends on the signed-in user.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: { default: "Dashboard", template: "%s · Client dashboard" }, robots: { index: false } };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Shoots", icon: CalendarCheck },
  { href: "/dashboard/media", label: "Media downloads", icon: ImageDown },
  { href: "/dashboard/invoices", label: "Invoices", icon: Receipt },
  { href: "/dashboard/payments", label: "Payments", icon: Wallet },
  { href: "/dashboard/properties", label: "Properties", icon: Home },
  { href: "/dashboard/favorites", label: "Favorite services", icon: Heart },
  { href: "/dashboard/referrals", label: "Refer & earn", icon: Share2 },
  { href: "/dashboard/settings", label: "Account settings", icon: Settings },
  { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
];

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  if (!features.supabase) redirect("/login");
  const viewer = await requireUser("/dashboard");
  if (viewer.isAdmin && !viewer.customer) redirect("/admin");
  const c = viewer.customer;
  const name = c ? `${c.first_name} ${c.last_name}`.trim() : (viewer.user.user_metadata?.full_name as string | undefined) ?? "";
  return (
    <AppShell area="client" nav={NAV} user={{ name, email: viewer.user.email ?? "" }}>
      {c ? (
        children
      ) : (
        <div className="mx-auto max-w-lg rounded-3xl border border-amber-400/30 bg-amber-400/10 p-8 text-center">
          <h1 className="text-xl font-medium">Verify your email to continue</h1>
          <p className="mt-2 text-sm text-mist-300">We sent a confirmation link to {viewer.user.email}. Once verified, your bookings will appear here automatically.</p>
        </div>
      )}
    </AppShell>
  );
}
