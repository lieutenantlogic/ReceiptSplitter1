import { AppShell } from "@/components/app-shell";
import { UploadFlow } from "@/components/upload-flow";

export default function UploadPage() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6">
        <div className="mb-7">
          <p className="text-sm font-medium text-brand dark:text-mint">New split</p>
          <h1 className="mt-2 text-4xl font-semibold">Upload a receipt</h1>
          <p className="mt-3 max-w-2xl text-ink/64 dark:text-white/64">
            Use a clear photo with the receipt edges visible. You can edit every extracted item before sharing.
          </p>
        </div>
        <UploadFlow />
      </main>
    </AppShell>
  );
}
