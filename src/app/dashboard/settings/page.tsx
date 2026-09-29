import Link from "next/link";
import { requireCustomer } from "@/lib/auth/session";
import { PageTitle } from "@/components/dashboard/shell";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { Card } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";

export const metadata = { title: "Account settings" };

export default async function SettingsPage() {
  const { customer, viewer } = await requireCustomer("/dashboard/settings");
  if (!customer) return null;
  return (
    <div className="max-w-3xl space-y-6">
      <PageTitle title="Account settings" description={viewer.user.email} />
      <Card className="p-6 sm:p-8">
        <ProfileForm customer={customer} />
      </Card>
      <Card className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-medium">Password</p>
          <p className="text-sm text-mist-400">Set or change the password for {viewer.user.email}.</p>
        </div>
        <Link href="/update-password" className={buttonStyles({ variant: "outline", size: "sm" })}>
          Change password
        </Link>
      </Card>
      <Card className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-medium">Sign out</p>
          <p className="text-sm text-mist-400">End your session on this device.</p>
        </div>
        <form action="/auth/signout" method="post">
          <button className={buttonStyles({ variant: "danger", size: "sm" })}>Sign out</button>
        </form>
      </Card>
    </div>
  );
}
