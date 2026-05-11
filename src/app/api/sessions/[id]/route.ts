import { NextResponse } from "next/server";
import { getSession, updateSession } from "@/lib/db";
import { sessionUpdateSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getSession(params.id);
  if (!session) return NextResponse.json({ error: "Split session not found." }, { status: 404 });
  return NextResponse.json({ session });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const parsed = sessionUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid split data." }, { status: 400 });
    }
    const session = await updateSession(params.id, parsed.data);
    if (!session) return NextResponse.json({ error: "Split session not found." }, { status: 404 });
    return NextResponse.json({ session });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not update the split." }, { status: 500 });
  }
}
