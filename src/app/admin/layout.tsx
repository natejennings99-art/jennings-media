import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BadgePercent, CalendarDays, Camera, ClipboardList, CreditCard, FileText, Image as ImageIcon, Inbox, LayoutDashboard,
  Layers, MessageSquareQuote, Package, Settings, ShoppingBag, Tags, Users, Home, ExternalLink,
} from "lucide-react";
import { AppShell, type NavItem } from "@/components/dashboard/shell";
import { requireAdmin } from "@/lib/auth/session";
import { features } from "@/lib/env";
import { buttonStyles } from "@/components/ui/button";

// Always render per request: every page here depends on the signed-in user.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  if (!features.supabase) redirect("/login");
  const { viewer, supabase } = await requireAdmin();
  const [{ count: requested }, { count: leads }] = await Promise.all([
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "requested"),
    supabase.from("contact_leads").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);
  const nav: NavItem[] = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/bookings", label: "Bookings", icon: ClipboardList, badge: requested ?? 0 },
    { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/properties", label: "Properties", icon: Home },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/media", label: "Media", icon: ImageIcon },
    { href: "/admin/services", label: "Services", icon: Camera },
    { href: "/admin/packages", label: "Packages", icon: Package },
    { href: "/admin/pricing", label: "Pricing & add-ons", icon: Layers },
    { href: "/admin/invoices", label: "Invoices", icon: FileText },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/discounts", label: "Discount codes", icon: BadgePercent },
    { href: "/admin/portfolio", label: "Portfolio", icon: Tags },
    { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
    { href: "/admin/leads", label: "Contact leads", icon: Inbox, badge: leads ?? 0 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];
  const name = (viewer.user.user_metadata?.full_name as string | undefined) ?? "Studio admin";
  return (
    <AppShell
      area="admin"
      nav={nav}
      user={{ name, email: viewer.user.email ?? "" }}
      topAction={
        <Link href="/" target="_blank" className={buttonStyles({ variant: "outline", size: "sm" })}>
          View site <ExternalLink className="size-3.5" />
        </Link>
      }
    >
      {children}
    </AppShell>
  );
}
