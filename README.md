
# Receipt Splitter

A modern full-stack MVP for splitting restaurant receipts from an uploaded photo. It uses Next.js, TypeScript, Tailwind CSS, Node API routes, Tesseract OCR, and SQLite persisted through `sql.js`.

## Features

- Upload or capture a receipt image
- OCR extraction for item names and prices
- Editable receipt item list
- Assign items to people
- Automatic subtotal, tax, tip, and per-person totals
- Shareable split-session links
- Mobile-first UI with dark mode
- Sample seed data
- Validation and API error handling

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The `dev` script seeds the local SQLite database if it is empty, then starts Next.js. The database file is created at `./data/receipt-splitter.sqlite` unless `DATABASE_PATH` is changed.

## Demo

<img width="1920" height="910" alt="gif2" src="https://github.com/user-attachments/assets/e543ebd4-bf97-4258-be2c-9823777bfd92" />



## Environment

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_PATH=./data/receipt-splitter.sqlite
OCR_LANG=eng
```

## Useful Commands

```bash
npm run dev
npm run build
npm run typecheck
npm run db:seed
```

## Pages

- `/` landing page
- `/upload` receipt upload and OCR
- `/split/[id]` bill splitting workspace
- `/summary/[id]` shareable summary

## Notes

OCR quality depends on receipt image clarity. The parser includes a conservative cleanup pass for common restaurant receipt formats, and the split editor keeps every extracted item editable so users can correct messy scans quickly.

# ReceiptSplitter1
Snap a photo of a receipt and split the bill in seconds. This app pulls out items automatically, lets you assign them to friends, and shows exactly who owes what, no more awkward math at the table.

