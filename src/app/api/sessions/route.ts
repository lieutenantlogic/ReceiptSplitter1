import { NextResponse } from "next/server";
import { createSession } from "@/lib/db";
import { createSessionSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid split data." }, { status: 400 });
    }
    const session = await createSession(parsed.data);
    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not create the split." }, { status: 500 });
  }
}
