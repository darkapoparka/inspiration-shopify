# DealerDesk CRM

A reusable, client-facing car-dealership CRM and admin-dashboard demo.

This is **not** the internal Cars lead/project board. It is the product shown to dealership prospects alongside the three website designs.

## Included modules

- Dealership overview and KPI dashboard
- Vehicle inventory with filtering, CSV export, publishing, reservation and sold states
- Customer sales pipeline from new enquiry through test drive, negotiation and sale
- Test-drive, inspection, callback and finance-meeting calendar
- Inventory, acquisition and funnel analytics
- Customer-facing website controls and live preview
- Dealership profile, team, preferences and integration settings
- Functional add/edit/reset interactions

## Demo persistence

The application supports two modes:

1. **Browser demo** — used automatically when `DATABASE_URL` is absent. Changes are stored in `localStorage`.
2. **Neon demo** — enabled by setting a Neon PostgreSQL `DATABASE_URL`. Each visitor receives an isolated workspace identified by an HTTP-only UUID cookie. Demo data is stored as JSONB and can be reset without affecting other visitors.

No real dealership or customer data belongs in the public demo.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Run all quality checks:

```bash
npm run check
```

## Environment

Copy `.env.example` to `.env.local` and set:

```env
DATABASE_URL=postgresql://...
```

The app remains fully interactive without a database.

## Deployment

The canonical CRM should be deployed once. Every dealership preview FAB should open that same public deployment in a new tab under the label `CRM / Admin`.

Do not clone or customize this dashboard for each lead. Client-specific implementations can be created after a sale with the appropriate licensing and production requirements.
