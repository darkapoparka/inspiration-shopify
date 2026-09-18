"use client";

import { useMemo, useState } from "react";

import { useDemo } from "@/components/demo-context";
import { Icon } from "@/components/icon";
import { Avatar, Badge, Button, Card, Drawer, PageHeader } from "@/components/ui";
import { leadStages, type LeadStage } from "@/lib/demo-data";

export function LeadsView({ onAddLead }: { onAddLead: () => void }) {
  const { state, formatMoney, vehicleById, patchLead, moveLead } = useDemo();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = state.leads.find((lead) => lead.id === selectedId);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return state.leads;
    return state.leads.filter((lead) => {
      const vehicle = vehicleById(lead.vehicleId);
      return [lead.name, lead.email, lead.phone, lead.source, lead.stage, vehicle?.make, vehicle?.model]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [query, state.leads, vehicleById]);

  const activeValue = state.leads
    .filter((lead) => !["Won", "Lost"].includes(lead.stage))
    .reduce((sum, lead) => sum + lead.value, 0);
  const won = state.leads.filter((lead) => lead.stage === "Won");
  const winRate = Math.round((won.length / Math.max(1, state.leads.filter((lead) => ["Won", "Lost"].includes(lead.stage)).length)) * 100);

  return (
    <>
      <PageHeader
        eyebrow="Customer relationships"
        title="Sales pipeline"
        description="Track every enquiry from first contact through test drive, negotiation and sale."
        actions={<Button icon="plus" variant="primary" onClick={onAddLead}>Add lead</Button>}
      />

      <section className="lead-summary-grid">
        <Card className="lead-summary-card">
          <span>Open opportunities</span>
          <strong>{state.leads.filter((lead) => !["Won", "Lost"].includes(lead.stage)).length}</strong>
          <small>{state.leads.filter((lead) => lead.stage === "New").length} new today</small>
        </Card>
        <Card className="lead-summary-card">
          <span>Pipeline value</span>
          <strong>{formatMoney(activeValue)}</strong>
          <small>Potential vehicle revenue</small>
        </Card>
        <Card className="lead-summary-card">
          <span>Win rate</span>
          <strong>{winRate || 50}%</strong>
          <small>Across closed opportunities</small>
        </Card>
        <Card className="lead-summary-card">
          <span>Average response</span>
          <strong>12 min</strong>
          <small className="success-text">4 min faster this week</small>
        </Card>
      </section>

      <div className="pipeline-toolbar">
        <label className="search-field pipeline-search">
          <Icon name="search" width={17} height={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customers, vehicles or sources" />
        </label>
        <div className="pipeline-toolbar-right">
          <button className="button button-secondary" type="button"><Icon name="filter" width={16} height={16} /><span>Filters</span></button>
          <div className="team-stack" aria-label="Sales team"><Avatar name="Alex Morgan" size="sm" /><Avatar name="Nikolay Ivanov" size="sm" /><span>+2</span></div>
        </div>
      </div>

      <section className="pipeline-board" aria-label="Lead pipeline">
        {leadStages.map((stage) => {
          const leads = filtered.filter((lead) => lead.stage === stage);
          const total = leads.reduce((sum, lead) => sum + lead.value, 0);
          return (
            <div className={`pipeline-column pipeline-${slug(stage)}`} key={stage}>
              <header className="pipeline-column-header">
                <div><span className="stage-dot" /><strong>{stage}</strong><em>{leads.length}</em></div>
                <button className="icon-button" type="button" aria-label={`${stage} options`}><Icon name="more" width={17} height={17} /></button>
              </header>
              <p className="pipeline-value">{formatMoney(total)}</p>
              <div className="lead-card-list">
                {leads.map((lead) => {
                  const vehicle = vehicleById(lead.vehicleId);
                  const index = leadStages.indexOf(lead.stage);
                  return (
                    <article className="lead-card" key={lead.id}>
                      <button className="lead-card-main" type="button" onClick={() => setSelectedId(lead.id)}>
                        <div className="lead-card-top"><Avatar name={lead.name} /><span><strong>{lead.name}</strong><small>{lead.lastContact}</small></span><PriorityBadge priority={lead.priority} /></div>
                        <div className="lead-vehicle"><span className="lead-vehicle-icon"><Icon name="car" width={19} height={19} /></span><span><strong>{vehicle ? `${vehicle.make} ${vehicle.model}` : "General enquiry"}</strong><small>{vehicle?.stockNo ?? "No vehicle selected"}</small></span></div>
                        <div className="lead-card-meta"><Badge tone="neutral">{lead.source}</Badge><strong>{formatMoney(lead.value)}</strong></div>
                      </button>
                      <footer className="lead-card-footer">
                        <button type="button" disabled={index === 0} onClick={() => moveLead(lead.id, -1)} aria-label="Move lead back"><Icon name="chevronLeft" width={15} height={15} /></button>
                        <span className="assignee-chip"><Avatar name={lead.assignee} size="sm" />{lead.assignee === "Unassigned" ? "Assign" : lead.assignee.split(" ")[0]}</span>
                        <button type="button" disabled={index === leadStages.length - 1} onClick={() => moveLead(lead.id, 1)} aria-label="Move lead forward"><Icon name="chevronRight" width={15} height={15} /></button>
                      </footer>
                    </article>
                  );
                })}
                {leads.length === 0 ? <div className="pipeline-empty"><Icon name="users" width={20} height={20} /><span>No leads</span></div> : null}
              </div>
            </div>
          );
        })}
      </section>

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        eyebrow={selected ? `${selected.source} lead` : "Lead"}
        title={selected?.name ?? "Lead details"}
      >
        {selected ? (
          <div className="lead-drawer-content">
            <div className="lead-profile-card">
              <Avatar name={selected.name} size="lg" />
              <div><strong>{selected.name}</strong><p>Interested in {vehicleById(selected.vehicleId)?.make} {vehicleById(selected.vehicleId)?.model}</p></div>
              <PriorityBadge priority={selected.priority} />
            </div>
            <div className="contact-actions">
              <a href={`tel:${selected.phone}`}><Icon name="phone" width={17} height={17} />Call</a>
              <a href={`mailto:${selected.email}`}><Icon name="mail" width={17} height={17} />Email</a>
              <button type="button"><Icon name="calendar" width={17} height={17} />Schedule</button>
            </div>
            <div className="drawer-section">
              <h3>Contact information</h3>
              <dl className="definition-list">
                <div><dt>Phone</dt><dd>{selected.phone}</dd></div>
                <div><dt>Email</dt><dd>{selected.email}</dd></div>
                <div><dt>Source</dt><dd>{selected.source}</dd></div>
                <div><dt>Assigned to</dt><dd>{selected.assignee}</dd></div>
              </dl>
            </div>
            <div className="drawer-section">
              <label className="field-label" htmlFor="lead-stage">Pipeline stage</label>
              <select id="lead-stage" className="form-control" value={selected.stage} onChange={(event) => patchLead(selected.id, { stage: event.target.value as LeadStage, lastContact: "Just now" })}>
                {leadStages.map((stage) => <option key={stage}>{stage}</option>)}
              </select>
            </div>
            <div className="drawer-section">
              <h3>Opportunity</h3>
              <div className="opportunity-card">
                <span className="vehicle-table-thumb"><Icon name="car" width={28} height={28} /></span>
                <div><strong>{vehicleById(selected.vehicleId)?.make} {vehicleById(selected.vehicleId)?.model}</strong><small>{vehicleById(selected.vehicleId)?.variant}</small></div>
                <strong>{formatMoney(selected.value)}</strong>
              </div>
            </div>
            <div className="drawer-section">
              <label className="field-label" htmlFor="lead-note">Sales notes</label>
              <textarea id="lead-note" className="form-control note-area" value={selected.note} onChange={(event) => patchLead(selected.id, { note: event.target.value })} />
              <p className="field-help">Changes save automatically in this demo workspace.</p>
            </div>
            <div className="drawer-actions"><Button icon="calendar">Book test drive</Button><Button icon="check" variant="primary" onClick={() => patchLead(selected.id, { stage: "Won", lastContact: "Just now" })}>Mark as won</Button></div>
          </div>
        ) : null}
      </Drawer>
    </>
  );
}

function PriorityBadge({ priority }: { priority: "Low" | "Medium" | "High" }) {
  return <Badge tone={priority === "High" ? "red" : priority === "Medium" ? "amber" : "neutral"}>{priority}</Badge>;
}

function slug(value: string) {
  return value.toLowerCase().replaceAll(" ", "-");
}
