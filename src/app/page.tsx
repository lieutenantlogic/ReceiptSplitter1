import Link from "next/link";
import { ArrowRight, Check, ReceiptText, Share2, Sparkles, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";

const steps = [
  { icon: ReceiptText, title: "Scan the receipt", body: "Upload a photo and let OCR pull out item names and prices." },
  { icon: Users, title: "Assign items", body: "Tap through each line item and assign it to the right person." },
  { icon: Share2, title: "Share the split", body: "Send one link with every total, tax, and tip already calculated." }
];

export default function LandingPage() {
  return (
    <AppShell>
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:pt-16">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-medium text-ink/70 backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:text-white/70">
            <Sparkles size={14} />
            Receipt OCR, clean splits, one share link
          </div>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-semibold tracking-normal sm:text-6xl lg:text-7xl">
              Receipt Splitter
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-ink/68 dark:text-white/68">
              Turn a restaurant receipt into a tidy shared bill. Upload a photo, clean up the OCR, assign items, and send the summary before the table starts doing napkin math.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/upload" className="button-primary">
              Start a split <ArrowRight size={18} />
            </Link>
            <Link href="/summary/demo-brunch" className="button-secondary">
              View demo
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {["SQLite MVP", "TypeScript API routes", "Dark mode included"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-ink/70 dark:text-white/70">
                <Check size={16} className="text-mint" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="panel overflow-hidden p-4 sm:p-6">
          <div className="rounded-[18px] bg-ink p-4 text-white dark:bg-white dark:text-ink">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 dark:border-ink/10">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] opacity-55">Share summary</p>
                <h2 className="mt-1 text-2xl font-semibold">Sunday Brunch</h2>
              </div>
              <div className="rounded-2xl bg-white/10 px-3 py-2 text-sm font-semibold dark:bg-ink/10">$65.52</div>
            </div>
            <div className="space-y-3 py-5">
              {[
                ["Ana", "Shakshuka", "$22.52"],
                ["Ben", "Avocado Toast", "$20.41"],
                ["Mira", "Pancakes", "$18.28"]
              ].map(([name, item, total]) => (
                <div key={name} className="flex items-center justify-between rounded-2xl bg-white/8 p-3 dark:bg-ink/5">
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-sm opacity-60">{item}</p>
                  </div>
                  <p className="font-semibold">{total}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-mint/20 p-3 text-sm text-mint dark:text-ink">
              Tax and tip are distributed by each person's item subtotal.
            </div>
          </div>
        </section>
      </main>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-20 sm:px-6 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="panel p-5">
            <step.icon size={22} className="text-brand dark:text-mint" />
            <h3 className="mt-4 font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink/64 dark:text-white/64">{step.body}</p>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
