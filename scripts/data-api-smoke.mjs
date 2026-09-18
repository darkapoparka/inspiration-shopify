import { randomUUID } from "node:crypto";

const endpoint =
  process.env.NEON_DATA_API_URL ??
  "https://ep-weathered-term-b1tp8vey.apirest.c-5.eu-central-1.aws.neon.tech/dealerdesk/rest/v1";
const sessionId = randomUUID();
const otherSessionId = randomUUID();
const tableUrl = `${endpoint.replace(/\/$/, "")}/dealer_demo_workspaces`;
const headers = {
  "content-type": "application/json",
  "x-demo-session": sessionId
};
const rowUrl = `${tableUrl}?id=eq.${sessionId}&select=id,state`;

async function expectOk(response, label) {
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${label} failed (${response.status}): ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

const before = await expectOk(await fetch(rowUrl, { headers }), "initial read");
if (!Array.isArray(before) || before.length !== 0) {
  throw new Error("A new random session unexpectedly returned an existing workspace.");
}

const seededState = {
  vehicles: [{ id: "smoke-vehicle", make: "QA", model: "Vehicle" }],
  leads: [],
  appointments: [],
  settings: { name: "DealerDesk API smoke" },
  activity: []
};
await expectOk(
  await fetch(tableUrl, {
    method: "POST",
    headers: { ...headers, prefer: "return=representation" },
    body: JSON.stringify({ id: sessionId, state: seededState })
  }),
  "workspace creation"
);

const afterInsert = await expectOk(await fetch(rowUrl, { headers }), "read after creation");
if (afterInsert?.[0]?.state?.settings?.name !== "DealerDesk API smoke") {
  throw new Error("Created workspace could not be read back through its session policy.");
}

const updatedState = {
  ...seededState,
  settings: { name: "DealerDesk API updated" }
};
await expectOk(
  await fetch(rowUrl, {
    method: "PATCH",
    headers: { ...headers, prefer: "return=minimal" },
    body: JSON.stringify({ state: updatedState })
  }),
  "workspace update"
);

const afterUpdate = await expectOk(await fetch(rowUrl, { headers }), "read after update");
if (afterUpdate?.[0]?.state?.settings?.name !== "DealerDesk API updated") {
  throw new Error("Updated workspace state was not persisted.");
}

const isolatedRead = await expectOk(
  await fetch(`${tableUrl}?id=eq.${sessionId}&select=id`, {
    headers: {
      "content-type": "application/json",
      "x-demo-session": otherSessionId
    }
  }),
  "cross-session read"
);
if (!Array.isArray(isolatedRead) || isolatedRead.length !== 0) {
  throw new Error("Row-level security exposed one demo session to another session.");
}

await expectOk(
  await fetch(`${tableUrl}?id=eq.${sessionId}`, {
    method: "DELETE",
    headers: { ...headers, prefer: "return=minimal" }
  }),
  "workspace cleanup"
);

console.log(JSON.stringify({
  ok: true,
  endpoint,
  sessionIsolation: "passed",
  createReadUpdateDelete: "passed"
}));
