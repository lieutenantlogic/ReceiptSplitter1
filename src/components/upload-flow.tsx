"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Plus, ScanLine, Upload } from "lucide-react";
import { createId } from "@/lib/ids";
import { money } from "@/lib/money";

type DraftItem = { id: string; name: string; price: number };

export function UploadFlow() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<DraftItem[]>([]);
  const [title, setTitle] = useState("Dinner receipt");
  const [tax, setTax] = useState(0);
  const [tip, setTip] = useState(0);
  const [people, setPeople] = useState("Me, Friend");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.price || 0), 0), [items]);

  async function runOcr() {
    if (!file) {
      setError("Choose a receipt photo first.");
      return;
    }
    setBusy(true);
    setError(null);
    const formData = new FormData();
    formData.append("receipt", file);
    const response = await fetch("/api/ocr", { method: "POST", body: formData });
    const payload = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(payload.error ?? "OCR failed. Try a clearer photo.");
      return;
    }
    setItems(
      payload.items.length
        ? payload.items.map((item: { name: string; price: number }) => ({ ...item, id: createId("draft") }))
        : [{ id: createId("draft"), name: "Receipt item", price: 0 }]
    );
  }

  async function createSplit() {
    setBusy(true);
    setError(null);
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        tax,
        tip,
        people: people.split(",").map((name) => name.trim()).filter(Boolean),
        items: items.map(({ name, price }) => ({ name, price: Number(price) }))
      })
    });
    const payload = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(payload.error ?? "Could not create the split.");
      return;
    }
    router.push(`/split/${payload.session.id}`);
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="panel p-5 sm:p-6">
        <label className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed border-ink/20 bg-mist/70 p-6 text-center transition hover:border-brand dark:border-white/15 dark:bg-white/[0.04]">
          <input
            className="sr-only"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-white/10">
            <Camera size={24} />
          </div>
          <h2 className="mt-4 text-xl font-semibold">{file ? file.name : "Drop in a receipt photo"}</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60 dark:text-white/60">
            JPG, PNG, or a camera capture. OCR runs in the Node API route.
          </p>
          <span className="button-secondary mt-5">
            <Upload size={17} /> Choose image
          </span>
        </label>
        <button className="button-primary mt-4 w-full" onClick={runOcr} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" size={18} /> : <ScanLine size={18} />}
          Extract items
        </button>
        {error ? <p className="mt-4 rounded-2xl bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">{error}</p> : null}
      </div>

      <div className="panel p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="control sm:col-span-2" value={title} onChange={(event) => setTitle(event.target.value)} />
          <input className="control" value={people} onChange={(event) => setPeople(event.target.value)} />
          <input className="control" value="USD" readOnly />
          <input className="control" type="number" min="0" step="0.01" value={tax} onChange={(event) => setTax(Number(event.target.value))} placeholder="Tax" />
          <input className="control" type="number" min="0" step="0.01" value={tip} onChange={(event) => setTip(Number(event.target.value))} placeholder="Tip" />
        </div>

        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_7rem] gap-2">
              <input
                className="control"
                value={item.name}
                onChange={(event) => setItems((current) => current.map((row) => (row.id === item.id ? { ...row, name: event.target.value } : row)))}
              />
              <input
                className="control"
                type="number"
                min="0"
                step="0.01"
                value={item.price}
                onChange={(event) => setItems((current) => current.map((row) => (row.id === item.id ? { ...row, price: Number(event.target.value) } : row)))}
              />
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button className="button-secondary" onClick={() => setItems((current) => [...current, { id: createId("draft"), name: "New item", price: 0 }])}>
            <Plus size={17} /> Add item
          </button>
          <div className="text-sm text-ink/60 dark:text-white/60">Subtotal {money(subtotal)}</div>
        </div>

        <button className="button-primary mt-5 w-full" onClick={createSplit} disabled={busy || items.length === 0}>
          Create split
        </button>
      </div>
    </section>
  );
}
