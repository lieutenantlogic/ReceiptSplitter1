import { createWorker } from "tesseract.js";

export type ParsedReceiptItem = {
  name: string;
  price: number;
};

const ignoredWords = ["subtotal", "total", "tax", "tip", "balance", "amount", "visa", "mastercard", "change", "cash"];

export function parseReceiptText(text: string): ParsedReceiptItem[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const items: ParsedReceiptItem[] = [];
  for (const line of lines) {
    const priceMatch = line.match(/(?:\$?\s*)(\d{1,4}[.,]\d{2})(?!.*\d)/);
    if (!priceMatch) continue;

    const price = Number(priceMatch[1].replace(",", "."));
    if (!Number.isFinite(price)) continue;

    const rawName = line.slice(0, priceMatch.index).replace(/[^a-zA-Z0-9 '&.-]/g, " ").replace(/\s+/g, " ").trim();
    const lower = rawName.toLowerCase();
    if (!rawName || ignoredWords.some((word) => lower.includes(word))) continue;

    items.push({ name: titleCase(rawName), price });
  }

  return items.slice(0, 40);
}

export async function extractReceiptItems(buffer: Buffer, lang = "eng") {
  const worker = await createWorker(lang);
  try {
    const result = await worker.recognize(buffer);
    return {
      text: result.data.text,
      items: parseReceiptText(result.data.text)
    };
  } finally {
    await worker.terminate();
  }
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace(/\bAnd\b/g, "and");
}
