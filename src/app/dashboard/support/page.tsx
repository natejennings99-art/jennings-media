import { Mail, Phone } from "lucide-react";
import { requireCustomer } from "@/lib/auth/session";
import { getSettings } from "@/lib/data/public";
import { PageTitle } from "@/components/dashboard/shell";
import { SupportForm } from "@/components/dashboard/support-form";
import { Faq } from "@/components/marketing/faq";
import { Card } from "@/components/ui/card";
import { FAQS } from "@/lib/content/site";
import { formatPhone } from "@/lib/utils";

export const metadata = { title: "Support" };

export default async function SupportPage() {
  await requireCustomer("/dashboard/support");
  const settings = await getSettings();
  return (
    <div className="space-y-8">
      <PageTitle title="Support" description="We usually reply within a few business hours." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 sm:p-8 lg:col-span-2">
          <SupportForm />
        </Card>
        <Card className="space-y-4 p-6 text-sm">
          <p className="font-medium">Reach us directly</p>
          {settings.email && (
            <a href={`mailto:${settings.email}`} className="flex items-center gap-2.5 text-mist-300 hover:text-bone-50">
              <Mail className="size-4 text-gold-300" /> {settings.email}
            </a>
          )}
          {settings.phone && (
            <a href={`tel:${settings.phone}`} className="flex items-center gap-2.5 text-mist-300 hover:text-bone-50">
              <Phone className="size-4 text-gold-300" /> {formatPhone(settings.phone)}
            </a>
          )}
        </Card>
      </div>
      <Faq items={FAQS} />
    </div>
  );
}
