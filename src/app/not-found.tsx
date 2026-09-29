import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="font-mono text-sm text-gold-300">404</p>
        <h1 className="mt-4 text-5xl font-medium tracking-[-0.05em]">This room isn&rsquo;t on the tour.</h1>
        <p className="mt-4 text-mist-400">The page you&rsquo;re looking for moved or never existed.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className={buttonStyles({ variant: "outline" })}>
            Home
          </Link>
          <Link href="/book" className={buttonStyles()}>
            Book a Shoot
          </Link>
        </div>
      </div>
    </div>
  );
}
