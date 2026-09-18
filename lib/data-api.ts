import { createDemoState, type DemoState } from "@/lib/demo-data";

const DEFAULT_DATA_API_URL =
  "https://ep-weathered-term-b1tp8vey.apirest.c-5.eu-central-1.aws.neon.tech/dealerdesk/rest/v1";
const DEFAULT_DATA_API_TOKEN =
  "eyJhbGciOiJSUzI1NiIsImtpZCI6ImRlYWxlcmRlc2stZGVtby0yMDI2IiwidHlwIjoiSldUIn0.eyJpc3MiOiJkZWFsZXJkZXNrLWNybS1kZW1vIiwic3ViIjoicHVibGljLWRlbW8iLCJhdWQiOiJkZWFsZXJkZXNrLWNybS1kZW1vIiwicm9sZSI6ImRlYWxlcmRlc2tfYW5vbiIsImlhdCI6MTc4OTc3MzczOCwibmJmIjoxNzg5NzczNjc4LCJleHAiOjIxMDUxMzM3Mzh9.FmyMmbRA6MoL2VSCItdJHKCPaNVCWNbhbnB1IJgwKzAszXY0U9yyy4617tON6kcf8xwhsqJECEY-cPMj8ZkAN5ZHrbzq-99z04ki7hHHebZIsDIVzwEawZ31jH56kpgy5nWr-B0xB2-Jb9ZUE_YhrvihIvMYSlPAcbcMQGWPctl9O0JT5Z-Q-qxw1g-dBG2E8iD5yspNl_6ETxPU5Qyew0GguCn9qmP8DrrniNZdbe999Dl1lsfeMwjsgmxUs77Vj8kF-2mLH7B1ynrDheYElAdUCb3vUnj4kXviBlMRAHi9CxEXyYA3-3gbcSLGLkjvdzKjN8nCPRsuk9XZChXIrw";
const DATA_API_URL = (process.env.NEXT_PUBLIC_NEON_DATA_API_URL ?? DEFAULT_DATA_API_URL).replace(/\/$/, "");
const DATA_API_TOKEN = process.env.NEXT_PUBLIC_NEON_DATA_API_TOKEN ?? DEFAULT_DATA_API_TOKEN;
const SESSION_KEY = "dealerdesk-cloud-session-v1";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type WorkspaceRow = { state: DemoState };

export const isDataApiConfigured = () => Boolean(DATA_API_URL && DATA_API_TOKEN);

function getSessionId() {
  const existing = window.localStorage.getItem(SESSION_KEY) ?? "";
  if (UUID_PATTERN.test(existing)) return existing;
  const sessionId = crypto.randomUUID();
  window.localStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}

function requestHeaders(sessionId: string, prefer?: string) {
  const headers: Record<string, string> = {
    authorization: `Bearer ${DATA_API_TOKEN}`,
    "content-type": "application/json",
    "x-demo-session": sessionId
  };
  if (prefer) headers.prefer = prefer;
  return headers;
}

function rowUrl(sessionId: string, select = "state") {
  const params = new URLSearchParams({ id: `eq.${sessionId}`, select });
  return `${DATA_API_URL}/dealer_demo_workspaces?${params}`;
}

async function readWorkspace(sessionId: string): Promise<DemoState | null> {
  const response = await fetch(rowUrl(sessionId), {
    headers: requestHeaders(sessionId),
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`Cloud demo read failed (${response.status})`);
  const rows = (await response.json()) as WorkspaceRow[];
  return rows[0]?.state ?? null;
}

async function insertWorkspace(sessionId: string, state: DemoState) {
  const response = await fetch(`${DATA_API_URL}/dealer_demo_workspaces`, {
    method: "POST",
    headers: requestHeaders(sessionId, "return=representation"),
    body: JSON.stringify({ id: sessionId, state })
  });

  if (response.status === 409) {
    const concurrentState = await readWorkspace(sessionId);
    if (concurrentState) return concurrentState;
  }
  if (!response.ok) throw new Error(`Cloud demo creation failed (${response.status})`);
  const rows = (await response.json()) as WorkspaceRow[];
  return rows[0]?.state ?? state;
}

export async function loadDataApiWorkspace(): Promise<DemoState> {
  const sessionId = getSessionId();
  const existing = await readWorkspace(sessionId);
  if (existing) return existing;
  return insertWorkspace(sessionId, createDemoState());
}

export async function saveDataApiWorkspace(state: DemoState) {
  const sessionId = getSessionId();
  const response = await fetch(rowUrl(sessionId, "id"), {
    method: "PATCH",
    headers: requestHeaders(sessionId, "return=minimal"),
    body: JSON.stringify({ state })
  });
  if (!response.ok) throw new Error(`Cloud demo save failed (${response.status})`);
}

export async function resetDataApiWorkspace(): Promise<DemoState> {
  const state = createDemoState();
  await saveDataApiWorkspace(state);
  return state;
}
