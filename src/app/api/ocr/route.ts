import { NextResponse } from "next/server";
import { extractReceiptItems } from "@/lib/ocr";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const receipt = formData.get("receipt");
    if (!(receipt instanceof File)) {
      return NextResponse.json({ error: "Upload a receipt image." }, { status: 400 });
    }
    if (!receipt.type.startsWith("image/")) {
      return NextResponse.json({ error: "Receipt must be an image file." }, { status: 400 });
    }
    if (receipt.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 8MB." }, { status: 413 });
    }

    const buffer = Buffer.from(await receipt.arrayBuffer());
    const result = await extractReceiptItems(buffer, process.env.OCR_LANG || "eng");
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "OCR failed. Try another image or enter items manually." }, { status: 500 });
  }
}
