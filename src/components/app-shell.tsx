"use client";

import Link from "next/link";
import { Moon, ReceiptText, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { dark, toggleDark } = useTheme();

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-ink text-white dark:bg-white dark:text-ink">
            <ReceiptText size={18} />
          </span>
          Receipt Splitter
        </Link>
        <button aria-label="Toggle dark mode" className="button-secondary h-10 w-10 p-0" onClick={toggleDark}>
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>
      {children}
    </div>
  );
}
