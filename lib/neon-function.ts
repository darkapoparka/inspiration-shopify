import { createDemoState, type DemoState } from "@/lib/demo-data";

const DEFAULT_FUNCTION_URL =
  "https://br-raspy-glade-b1owr2rh-dealerdesk.compute.c-5.eu-central-1.aws.neon.tech";
const FUNCTION_URL = (process.env.NEXT_PUBLIC_DEALERDESK_API_URL ?? DEFAULT_FUNCTION_URL).replace(/\/$/, "");
const SESSION_KEY = "dealerdesk-cloud-session-v2";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type FunctionPayload = {
  state: DemoState | null;
  persistence: "neon-function";
};

export const isCloudFunctionConfigured = () => Boolean(FUNCTION_URL);

function getSessionId() {
  const existing = window.localStorage.getItem(SESSION_KEY) ?? "";
  if (UUID_PATTERN.test(existing)) return existing;
  const sessionId = crypto.randomUUID();
  window.localStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}

function headers(sessionId: string) {
  return {
    "content-type": "application/json",
    "x-demo-session": sessionId
  };
}

async function parseResponse(response: Response): Promise<FunctionPayload> {
  const payload = (await response.json().catch(() => null)) as FunctionPayload | { error?: string } | null;
  if (!response.ok) {
    const message = payload && "error" in payload ? payload.error : undefined;
    throw new Error(message ?? `Cloud demo request failed (${response.status})`);
  }
  return payload as FunctionPayload;
}

async function writeWorkspace(sessionId: string, action: "init" | "save" | "reset", state: DemoState) {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: headers(sessionId),
    body: JSON.stringify({ action, state }),
    cache: "no-store"
  });
  const payload = await parseResponse(response);
  return payload.state ?? state;
}

export async function loadCloudWorkspace(): Promise<DemoState> {
  const sessionId = getSessionId();
  const response = await fetch(FUNCTION_URL, {
    headers: headers(sessionId),
    cache: "no-store"
  });
  const payload = await parseResponse(response);
  if (payload.state) return payload.state;
  return writeWorkspace(sessionId, "init", createDemoState());
}

export async function saveCloudWorkspace(state: DemoState) {
  await writeWorkspace(getSessionId(), "save", state);
}

export async function resetCloudWorkspace(): Promise<DemoState> {
  const state = createDemoState();
  return writeWorkspace(getSessionId(), "reset", state);
}
