"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Check, Copy, Loader2, Plus, Share2, Trash2 } from "lucide-react";
import { calculateTotals } from "@/lib/calculations";
import { createId } from "@/lib/ids";
import { money } from "@/lib/money";
import type { SplitSession } from "@/lib/types";

export function SplitEditor({ initialSession }: { initialSession: SplitSession }) {
  const [session, setSession] = useState(initialSession);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(true);
  const [isPending, startTransition] = useTransition();
  const totals = useMemo(() => calculateTotals(session), [session]);
  const subtotal = session.items.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/summary/${session.id}`;

  function patch(next: SplitSession) {
    setSaved(false);
    setSession(next);
  }

  function save() {
    startTransition(async () => {
      setError(null);
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session)
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Could not save this split.");
        return;
      }
      setSession(payload.session);
      setSaved(true);
    });
  }

  async function copyShareLink() {
    await navigator.clipboard.writeText(shareUrl);
    setSaved(true);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
      <section className="space-y-5">
        <div className="panel p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-4">
            <input
              className="control sm:col-span-2"
              value={session.title}
              onChange={(event) => patch({ ...session, title: event.target.value })}
            />
            <input
              className="control"
              type="number"
              min="0"
              step="0.01"
              value={session.tax}
              onChange={(event) => patch({ ...session, tax: Number(event.target.value) })}
            />
            <input
              className="control"
              type="number"
              min="0"
              step="0.01"
              value={session.tip}
              onChange={(event) => patch({ ...session, tip: Number(event.target.value) })}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {session.people.map((person) => (
              <input
                key={person.id}
                className="control max-w-40 py-2"
                value={person.name}
                onChange={(event) =>
                  patch({
                    ...session,
                    people: session.people.map((row) => (row.id === person.id ? { ...row, name: event.target.value } : row))
                  })
                }
              />
            ))}
            <button
              className="button-secondary py-2"
              onClick={() => patch({ ...session, people: [...session.people, { id: createId("person"), name: "New person" }] })}
            >
              <Plus size={16} /> Person
            </button>
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="border-b border-line p-5 dark:border-white/10 sm:p-6">
            <h1 className="text-2xl font-semibold">Assign items</h1>
            <p className="mt-1 text-sm text-ink/58 dark:text-white/58">OCR is a head start. Edit the line items and choose who ordered what.</p>
          </div>
          <div className="divide-y divide-line dark:divide-white/10">
            {session.items.map((item) => (
              <div key={item.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_8rem_10rem_2.5rem] sm:items-center sm:p-5">
                <input
                  className="control"
                  value={item.name}
                  onChange={(event) =>
                    patch({
                      ...session,
                      items: session.items.map((row) => (row.id === item.id ? { ...row, name: event.target.value } : row))
                    })
                  }
                />
                <input
                  className="control"
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.price}
                  onChange={(event) =>
                    patch({
                      ...session,
                      items: session.items.map((row) => (row.id === item.id ? { ...row, price: Number(event.target.value) } : row))
                    })
                  }
                />
                <select
                  className="control"
                  value={item.assignedTo ?? ""}
                  onChange={(event) =>
                    patch({
                      ...session,
                      items: session.items.map((row) => (row.id === item.id ? { ...row, assignedTo: event.target.value || null } : row))
                    })
                  }
                >
                  <option value="">Shared/Unassigned</option>
                  {session.people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
                <button
                  aria-label="Remove item"
                  className="button-secondary h-10 w-10 p-0"
                  onClick={() => patch({ ...session, items: session.items.filter((row) => row.id !== item.id) })}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3 border-t border-line p-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <button
              className="button-secondary"
              onClick={() =>
                patch({
                  ...session,
                  items: [...session.items, { id: createId("item"), name: "New item", price: 0, assignedTo: session.people[0]?.id ?? null }]
                })
              }
            >
              <Plus size={17} /> Add item
            </button>
            <p className="text-sm text-ink/60 dark:text-white/60">Subtotal {money(subtotal, session.currency)}</p>
          </div>
        </div>
      </section>

      <aside className="space-y-5 lg:sticky lg:top-5 lg:self-start">
        <section className="panel p-5">
          <p className="text-sm text-ink/58 dark:text-white/58">Total owed</p>
          <p className="mt-2 text-4xl font-semibold">{money(subtotal + session.tax + session.tip, session.currency)}</p>
          <div className="mt-5 space-y-3">
            {totals.map((person) => (
              <div key={person.id} className="rounded-2xl border border-line p-3 dark:border-white/10">
                <div className="flex justify-between gap-3">
                  <span className="font-medium">{person.name}</span>
                  <span className="font-semibold">{money(person.total, session.currency)}</span>
                </div>
                <p className="mt-1 text-xs text-ink/52 dark:text-white/52">
                  {money(person.subtotal, session.currency)} items · {money(person.tax + person.tip, session.currency)} tax/tip
                </p>
              </div>
            ))}
          </div>
        </section>

        {error ? <p className="rounded-2xl bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">{error}</p> : null}

        <button className="button-primary w-full" onClick={save} disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
          {saved ? "Saved" : "Save split"}
        </button>
        <button className="button-secondary w-full" onClick={copyShareLink}>
          <Copy size={17} /> Copy share link
        </button>
        <Link className="button-secondary w-full" href={`/summary/${session.id}`}>
          <Share2 size={17} /> Open summary
        </Link>
      </aside>
    </div>
  );
}
