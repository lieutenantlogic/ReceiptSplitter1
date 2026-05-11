import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export default function NotFound() {
  return (
    <AppShell>
      <main className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col justify-center px-4 text-center">
        <p className="text-sm font-medium text-brand dark:text-mint">404</p>
        <h1 className="mt-3 text-4xl font-semibold">Split not found</h1>
        <p className="mt-3 text-ink/64 dark:text-white/64">This receipt split may have been deleted or the link is incomplete.</p>
        <Link href="/upload" className="button-primary mx-auto mt-7">
          Start a new split
        </Link>
      </main>
    </AppShell>
  );
}
