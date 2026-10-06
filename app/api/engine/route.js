// GET /api/engine — the shared pattern engine (protected/pallet-engine.js).
//
// Loaded by both builders with <script src="/api/engine">. Same access rule
// as the builders themselves: logged in, with an active subscription or trial.
// The file lives outside /public so it can't be fetched without logging in.

import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/subscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const access = await getAccess(supabase, user.id);
  if (!access.allowed) return new NextResponse("Subscription required", { status: 403 });

  const filePath = path.join(process.cwd(), "protected", "pallet-engine.js");
  const js = await readFile(filePath, "utf8");

  return new NextResponse(js, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      // Never cache: the engine must always match the builder page it's
      // loaded with, right after every deploy.
      "Cache-Control": "no-store",
    },
  });
}
