import { attachDatabasePool } from "@neon/functions";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
attachDatabasePool(pool);

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_STATE_BYTES = 262_144;

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type, x-demo-session",
  "access-control-max-age": "86400",
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "x-content-type-options": "nosniff"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders });
}

function isDemoState(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      Array.isArray(value.vehicles) &&
      Array.isArray(value.leads) &&
      Array.isArray(value.appointments) &&
      value.settings &&
      typeof value.settings === "object" &&
      Array.isArray(value.activity)
  );
}

async function readBody(request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_STATE_BYTES) throw new Error("payload-too-large");
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_STATE_BYTES) throw new Error("payload-too-large");
  return text ? JSON.parse(text) : {};
}

const dealerDeskFunction = {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const sessionId = request.headers.get("x-demo-session") || "";
    if (!UUID_PATTERN.test(sessionId)) {
      return json({ error: "A valid demo session is required." }, 400);
    }

    try {
      if (request.method === "GET") {
        const { rows } = await pool.query(
          "select state from dealer_demo_workspaces where id = $1::uuid limit 1",
          [sessionId]
        );
        return json({ state: rows[0]?.state ?? null, persistence: "neon-function" });
      }

      if (request.method === "POST") {
        const body = await readBody(request);
        if (!["init", "save", "reset"].includes(body.action)) {
          return json({ error: "Unsupported action." }, 400);
        }
        if (!isDemoState(body.state)) {
          return json({ error: "Invalid demo state." }, 400);
        }

        await pool.query(
          `insert into dealer_demo_workspaces (id, state, updated_at)
           values ($1::uuid, $2::jsonb, now())
           on conflict (id) do update
             set state = excluded.state,
                 updated_at = now()`,
          [sessionId, JSON.stringify(body.state)]
        );
        return json({ state: body.state, persistence: "neon-function" });
      }

      return json({ error: "Method not allowed." }, 405);
    } catch (error) {
      if (error instanceof Error && error.message === "payload-too-large") {
        return json({ error: "Demo state exceeds the allowed size." }, 413);
      }
      console.error("DealerDesk function error", error);
      return json({ error: "The demo workspace could not be processed." }, 500);
    }
  }
};

export default dealerDeskFunction;
