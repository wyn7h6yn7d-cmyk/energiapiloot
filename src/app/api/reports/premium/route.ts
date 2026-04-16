import { NextResponse } from "next/server";

/**
 * Future: generate signed URL or stream PDF for unlocked users (cookie `ep_unlock=full`).
 */
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "pdf_not_live",
      message: "Premium PDF aruanne lisandub pärast makset ja lukustuse kontrolli.",
    },
    { status: 501 }
  );
}
