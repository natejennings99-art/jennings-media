import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/ui/misc";
import { IMAGES } from "@/lib/content/images";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <Link href="/" aria-label="Jennings Media home">
          <Logo />
        </Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">{children}</div>
        <p className="text-[12px] text-mist-600">© {new Date().getFullYear()} Jennings Media</p>
      </div>
      <div className="relative hidden overflow-hidden lg:block">
        <Image src={IMAGES.heroDusk} alt="" fill priority sizes="50vw" className="animate-kenburns object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <p className="max-w-md text-3xl leading-tight font-medium tracking-[-0.04em] text-bone-50">
            Every listing, every file, every invoice — <span className="font-serif font-normal italic text-gold-200">one place.</span>
          </p>
          <p className="mt-4 text-sm text-mist-300">Track shoots, download media and pay invoices from your client dashboard.</p>
        </div>
      </div>
    </div>
  );
}
