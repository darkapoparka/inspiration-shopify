import { randomUUID } from "node:crypto";

const endpoint = (
  process.env.DEALERDESK_FUNCTION_URL ??
  "https://br-raspy-glade-b1owr2rh-dealerdesk.compute.c-5.eu-central-1.aws.neon.tech"
).replace(/\/$/, "");
const primarySession = randomUUID();
const isolatedSession = randomUUID();

const seed = {
  vehicles: [{ id: "qa-vehicle", make: "QA", model: "Vehicle" }],
  leads: [],
  appointments: [],
  settings: {
    name: "DealerDesk Function QA",
    phone: "+359 000 000 000",
    email: "qa@dealerdesk.demo",
    address: "Demo address",
    accent: "#166534",
    currency: "EUR",
    workingHours: "09:00–18:00",
    autoPublish: false,
    showFinancing: true,
    showTradeIn: true
  },
  activity: []
};

async function call(sessionId, init) {
  const response = await fetch(endpoint, {
    ...init,
    headers: {
      "content-type": "application/json",
      "x-demo-session": sessionId,
      ...(init?.headers ?? {})
    }
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${init?.method ?? "GET"} ${response.status}: ${JSON.stringify(payload)}`);
  }
  return payload;
}

try {
  const firstRead = await call(primarySession);
  if (firstRead.state !== null) throw new Error("Fresh session returned existing state.");

  const initialized = await call(primarySession, {
    method: "POST",
    body: JSON.stringify({ action: "init", state: seed })
  });
  if (initialized.state?.settings?.name !== seed.settings.name) {
    throw new Error("Initial workspace state was not persisted.");
  }

  const readBack = await call(primarySession);
  if (readBack.state?.vehicles?.[0]?.model !== "Vehicle") {
    throw new Error("Workspace could not be read back.");
  }

  const updated = {
    ...seed,
    settings: { ...seed.settings, name: "DealerDesk Function Updated" }
  };
  await call(primarySession, {
    method: "POST",
    body: JSON.stringify({ action: "save", state: updated })
  });

  const updatedRead = await call(primarySession);
  if (updatedRead.state?.settings?.name !== "DealerDesk Function Updated") {
    throw new Error("Workspace update was not persisted.");
  }

  const isolatedRead = await call(isolatedSession);
  if (isolatedRead.state !== null) {
    throw new Error("A different session could read the first session's workspace.");
  }

  console.log(JSON.stringify({
    ok: true,
    endpoint,
    persistence: updatedRead.persistence,
    createReadUpdate: "passed",
    sessionIsolation: "passed"
  }));
} finally {
  await call(primarySession, {
    method: "POST",
    body: JSON.stringify({ action: "delete" })
  }).catch(() => undefined);
  await call(isolatedSession, {
    method: "POST",
    body: JSON.stringify({ action: "delete" })
  }).catch(() => undefined);
}
