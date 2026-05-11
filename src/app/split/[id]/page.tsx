import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SplitEditor } from "@/components/split-editor";
import { getSession } from "@/lib/db";

export default async function SplitPage({ params }: { params: { id: string } }) {
  const session = await getSession(params.id);
  if (!session) notFound();

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        <SplitEditor initialSession={session} />
      </main>
    </AppShell>
  );
}
