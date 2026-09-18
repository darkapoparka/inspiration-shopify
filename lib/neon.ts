import { neon } from "@neondatabase/serverless";

import { createDemoState, type DemoState } from "@/lib/demo-data";

export const isDatabaseConfigured = () => Boolean(process.env.DATABASE_URL);

const getSql = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(process.env.DATABASE_URL);
};

export async function ensureDemoSchema() {
  const sql = getSql();
  await sql`
    create table if not exists dealer_demo_workspaces (
      id uuid primary key,
      state jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;
}

export async function getOrCreateWorkspace(id: string): Promise<DemoState> {
  const sql = getSql();
  const rows = await sql`select state from dealer_demo_workspaces where id = ${id}::uuid limit 1`;
  if (rows[0]?.state) return rows[0].state as DemoState;

  const state = createDemoState();
  await sql`
    insert into dealer_demo_workspaces (id, state)
    values (${id}::uuid, ${JSON.stringify(state)}::jsonb)
    on conflict (id) do nothing
  `;
  return state;
}

export async function saveWorkspace(id: string, state: DemoState) {
  const sql = getSql();
  await sql`
    insert into dealer_demo_workspaces (id, state, updated_at)
    values (${id}::uuid, ${JSON.stringify(state)}::jsonb, now())
    on conflict (id) do update
      set state = excluded.state,
          updated_at = now()
  `;
}

export async function resetWorkspace(id: string): Promise<DemoState> {
  const state = createDemoState();
  await saveWorkspace(id, state);
  return state;
}
