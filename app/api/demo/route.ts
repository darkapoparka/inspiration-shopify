import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { createDemoState, type DemoState } from "@/lib/demo-data";
import {
  ensureDemoSchema,
  getOrCreateWorkspace,
  isDatabaseConfigured,
  resetWorkspace,
  saveWorkspace
} from "@/lib/neon";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "dealerdesk_demo_session";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isDemoState = (value: unknown): value is DemoState => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DemoState>;
  return (
    Array.isArray(candidate.vehicles) &&
    Array.isArray(candidate.leads) &&
    Array.isArray(candidate.appointments) &&
    Boolean(candidate.settings)
  );
};

const sessionFromRequest = (request: Request) => {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`));
  const candidate = match?.[1] ? decodeURIComponent(match[1]) : "";
  return UUID_PATTERN.test(candidate) ? candidate : randomUUID();
};

const withSessionCookie = (response: NextResponse, sessionId: string) => {
  response.cookies.set(COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/"
  });
  return response;
};

export async function GET(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ mode: "browser", state: createDemoState() });
  }

  const sessionId = sessionFromRequest(request);
  await ensureDemoSchema();
  const state = await getOrCreateWorkspace(sessionId);
  return withSessionCookie(NextResponse.json({ mode: "neon", state }), sessionId);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { action?: "save" | "reset"; state?: unknown }
    | null;

  if (!body?.action) {
    return NextResponse.json({ error: "Missing action" }, { status: 400 });
  }

  if (!isDatabaseConfigured()) {
    const state = body.action === "reset" ? createDemoState() : body.state;
    if (!isDemoState(state)) {
      return NextResponse.json({ error: "Invalid demo state" }, { status: 400 });
    }
    return NextResponse.json({ mode: "browser", state });
  }

  const sessionId = sessionFromRequest(request);
  await ensureDemoSchema();

  if (body.action === "reset") {
    const state = await resetWorkspace(sessionId);
    return withSessionCookie(NextResponse.json({ mode: "neon", state }), sessionId);
  }

  if (!isDemoState(body.state)) {
    return NextResponse.json({ error: "Invalid demo state" }, { status: 400 });
  }

  await saveWorkspace(sessionId, body.state);
  return withSessionCookie(NextResponse.json({ mode: "neon", state: body.state }), sessionId);
}
