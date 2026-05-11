import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { calculateTotals } from "@/lib/calculations";
import { getSession } from "@/lib/db";
import { money } from "@/lib/money";
import { CreditCard, ExternalLink, Pencil, Share2 } from "lucide-react";

export default async function SummaryPage({ params }: { params: { id: string } }) {
  const session = await getSession(params.id);
  if (!session) notFound();

  const totals = calculateTotals(session);
  const subtotal = session.items.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal + session.tax + session.tip;

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand dark:text-mint">Share summary</p>
            <h1 className="mt-2 text-4xl font-semibold">{session.title}</h1>
          </div>
          <Link href={`/split/${session.id}`} className="button-secondary">
            <Pencil size={17} /> Edit split
          </Link>
        </div>

        <section className="panel overflow-hidden">
          <div className="border-b border-line p-5 dark:border-white/10 sm:p-7">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm text-ink/58 dark:text-white/58">Total bill</p>
                <p className="mt-2 text-5xl font-semibold">{money(total, session.currency)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white dark:bg-mint dark:text-ink">
                <Share2 size={21} />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
              <Stat label="Subtotal" value={money(subtotal, session.currency)} />
              <Stat label="Tax" value={money(session.tax, session.currency)} />
              <Stat label="Tip" value={money(session.tip, session.currency)} />
            </div>
          </div>

          <div className="divide-y divide-line dark:divide-white/10">
            {totals.map((person) => (
              <div key={person.id} className="p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{person.name}</h2>
                    <p className="mt-1 text-sm text-ink/58 dark:text-white/58">
                      Items {money(person.subtotal, session.currency)} · Tax {money(person.tax, session.currency)} · Tip{" "}
                      {money(person.tip, session.currency)}
                    </p>
                  </div>
                  <p className="text-2xl font-semibold">{money(person.total, session.currency)}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    className="button-secondary py-2"
                    href={`https://venmo.com/?txn=pay&amount=${person.total.toFixed(2)}&note=${encodeURIComponent(session.title)}`}
                    target="_blank"
                  >
                    <CreditCard size={16} /> Venmo
                  </a>
                  <a
                    className="button-secondary py-2"
                    href={`https://www.paypal.com/paypalme/?amount=${person.total.toFixed(2)}`}
                    target="_blank"
                  >
                    <ExternalLink size={16} /> PayPal
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line p-3 dark:border-white/10">
      <p className="text-xs text-ink/50 dark:text-white/50">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
