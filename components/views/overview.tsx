"use client";

import { Icon } from "@/components/icon";
import { useDemo } from "@/components/demo-context";
import { Avatar, Badge, Button, Card, MetricDelta, PageHeader } from "@/components/ui";

export function OverviewView({
  onAddVehicle,
  onAddLead,
  onNavigate
}: {
  onAddVehicle: () => void;
  onAddLead: () => void;
  onNavigate: (view: string) => void;
}) {
  const { state, formatMoney, vehicleById, leadById } = useDemo();
  const activeVehicles = state.vehicles.filter((vehicle) => vehicle.status !== "Sold");
  const openLeads = state.leads.filter((lead) => !["Won", "Lost"].includes(lead.stage));
  const inventoryValue = activeVehicles.reduce((total, vehicle) => total + vehicle.price, 0);
  const soldValue = state.leads.filter((lead) => lead.stage === "Won").reduce((total, lead) => total + lead.value, 0);
  const upcoming = [...state.appointments].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const topVehicles = [...state.vehicles].sort((a, b) => b.views - a.views).slice(0, 4);

  const revenue = [42, 48, 44, 61, 57, 72, 68, 81, 76, 92, 88, 104];
  const maxRevenue = Math.max(...revenue);
  const points = revenue.map((value, index) => `${(index / (revenue.length - 1)) * 100},${45 - (value / maxRevenue) * 38}`).join(" ");

  return (
    <>
      <PageHeader
        eyebrow="Saturday, 19 September"
        title="Good morning, Alex"
        description="Here is what is happening across your showroom today."
        actions={
          <>
            <Button icon="users" onClick={onAddLead}>Add lead</Button>
            <Button icon="plus" variant="primary" onClick={onAddVehicle}>Add vehicle</Button>
          </>
        }
      />

      <section className="metric-grid" aria-label="Dealership summary">
        <Card className="metric-card">
          <div className="metric-topline">
            <span className="metric-icon metric-icon-green"><Icon name="car" width={19} height={19} /></span>
            <MetricDelta>8.2%</MetricDelta>
          </div>
          <p className="metric-label">Active inventory</p>
          <strong className="metric-value">{activeVehicles.length}</strong>
          <p className="metric-note">{state.vehicles.filter((vehicle) => vehicle.status === "Draft").length} drafts waiting for review</p>
        </Card>

        <Card className="metric-card">
          <div className="metric-topline">
            <span className="metric-icon metric-icon-blue"><Icon name="users" width={19} height={19} /></span>
            <MetricDelta>14.6%</MetricDelta>
          </div>
          <p className="metric-label">Open sales leads</p>
          <strong className="metric-value">{openLeads.length}</strong>
          <p className="metric-note">{state.leads.filter((lead) => lead.stage === "New").length} require a first response</p>
        </Card>

        <Card className="metric-card">
          <div className="metric-topline">
            <span className="metric-icon metric-icon-purple"><Icon name="money" width={19} height={19} /></span>
            <MetricDelta>5.4%</MetricDelta>
          </div>
          <p className="metric-label">Inventory value</p>
          <strong className="metric-value metric-value-money">{formatMoney(inventoryValue)}</strong>
          <p className="metric-note">Across published and reserved stock</p>
        </Card>

        <Card className="metric-card">
          <div className="metric-topline">
            <span className="metric-icon metric-icon-amber"><Icon name="calendar" width={19} height={19} /></span>
            <Badge tone="amber">Today</Badge>
          </div>
          <p className="metric-label">Upcoming appointments</p>
          <strong className="metric-value">{state.appointments.length}</strong>
          <p className="metric-note">Test drives, inspections and callbacks</p>
        </Card>
      </section>

      <section className="dashboard-grid dashboard-grid-main">
        <Card className="panel revenue-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Sales performance</p>
              <h2>Revenue overview</h2>
            </div>
            <select className="compact-select" defaultValue="12m" aria-label="Revenue period">
              <option value="12m">Last 12 months</option>
              <option value="6m">Last 6 months</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
          <div className="revenue-summary">
            <div>
              <span>Closed sales</span>
              <strong>{formatMoney(soldValue || 46900)}</strong>
            </div>
            <MetricDelta>18.3% vs previous period</MetricDelta>
          </div>
          <div className="line-chart" aria-label="Monthly revenue trend">
            <div className="chart-grid-lines" aria-hidden="true"><span /><span /><span /><span /></div>
            <svg viewBox="0 0 100 50" preserveAspectRatio="none" role="img" aria-label="Revenue rising across twelve months">
              <defs>
                <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={`0,50 ${points} 100,50`} fill="url(#chartFill)" />
              <polyline points={points} vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="chart-months"><span>Oct</span><span>Dec</span><span>Feb</span><span>Apr</span><span>Jun</span><span>Sep</span></div>
          </div>
        </Card>

        <Card className="panel appointments-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Schedule</p>
              <h2>Next appointments</h2>
            </div>
            <button className="text-button" type="button" onClick={() => onNavigate("calendar")}>View calendar</button>
          </div>
          <div className="appointment-list">
            {upcoming.slice(0, 4).map((appointment) => {
              const lead = leadById(appointment.leadId);
              const vehicle = vehicleById(appointment.vehicleId);
              return (
                <div className="appointment-row" key={appointment.id}>
                  <div className="appointment-time"><strong>{appointment.time}</strong><span>{formatAppointmentDay(appointment.date)}</span></div>
                  <div className="appointment-divider" />
                  <div className="appointment-copy">
                    <div className="appointment-title"><strong>{appointment.type}</strong><Badge tone={appointment.status === "Confirmed" ? "green" : "amber"}>{appointment.status}</Badge></div>
                    <p>{lead?.name ?? "Customer"} · {vehicle ? `${vehicle.make} ${vehicle.model}` : "Vehicle"}</p>
                  </div>
                  <Avatar name={appointment.assignee} size="sm" />
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <section className="dashboard-grid dashboard-grid-bottom">
        <Card className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Inventory engagement</p>
              <h2>Top-performing listings</h2>
            </div>
            <button className="text-button" type="button" onClick={() => onNavigate("inventory")}>All inventory</button>
          </div>
          <div className="performance-list">
            {topVehicles.map((vehicle, index) => (
              <button className="performance-row" key={vehicle.id} type="button" onClick={() => onNavigate("inventory")}> 
                <span className="vehicle-rank">{index + 1}</span>
                <span className="vehicle-thumb"><Icon name="car" width={23} height={23} /></span>
                <span className="performance-name"><strong>{vehicle.make} {vehicle.model}</strong><small>{vehicle.year} · {vehicle.stockNo}</small></span>
                <span className="performance-stat"><strong>{vehicle.views.toLocaleString()}</strong><small>views</small></span>
                <span className="performance-stat"><strong>{vehicle.leads}</strong><small>leads</small></span>
                <Icon name="chevronRight" width={16} height={16} />
              </button>
            ))}
          </div>
        </Card>

        <Card className="panel activity-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Live operations</p>
              <h2>Recent activity</h2>
            </div>
            <button className="icon-button" type="button" aria-label="More activity options"><Icon name="more" width={18} height={18} /></button>
          </div>
          <div className="activity-list">
            {state.activity.map((item) => (
              <div className="activity-row" key={item.id}>
                <span className={`activity-dot activity-dot-${item.tone}`} />
                <div><strong>{item.label}</strong><p>{item.detail}</p></div>
                <time>{item.at}</time>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  );
}

function formatAppointmentDay(value: string) {
  const date = new Date(`${value}T12:00:00`);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return new Intl.DateTimeFormat("en", { weekday: "short", day: "numeric" }).format(date);
}
