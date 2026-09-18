"use client";

import { useDemo } from "@/components/demo-context";
import { Icon } from "@/components/icon";
import { Badge, Card, MetricDelta, PageHeader } from "@/components/ui";
import { leadStages } from "@/lib/demo-data";

export function AnalyticsView() {
  const { state, formatMoney } = useDemo();
  const totalViews = state.vehicles.reduce((sum, vehicle) => sum + vehicle.views, 0);
  const totalLeads = state.leads.length;
  const wonLeads = state.leads.filter((lead) => lead.stage === "Won");
  const soldRevenue = wonLeads.reduce((sum, lead) => sum + lead.value, 0);
  const conversion = Math.round((wonLeads.length / Math.max(1, totalLeads)) * 100);

  const sources = Array.from(new Set(state.leads.map((lead) => lead.source)))
    .map((source) => ({ source, count: state.leads.filter((lead) => lead.source === source).length }))
    .sort((a, b) => b.count - a.count);
  const maxSource = Math.max(1, ...sources.map((source) => source.count));

  const ages = [
    { label: "0–14 days", count: state.vehicles.filter((vehicle) => vehicle.daysInStock <= 14).length, tone: "green" },
    { label: "15–30 days", count: state.vehicles.filter((vehicle) => vehicle.daysInStock > 14 && vehicle.daysInStock <= 30).length, tone: "blue" },
    { label: "31–45 days", count: state.vehicles.filter((vehicle) => vehicle.daysInStock > 30 && vehicle.daysInStock <= 45).length, tone: "amber" },
    { label: "46+ days", count: state.vehicles.filter((vehicle) => vehicle.daysInStock > 45).length, tone: "red" }
  ];

  const makes = Array.from(new Set(state.vehicles.map((vehicle) => vehicle.make)))
    .map((make) => {
      const vehicles = state.vehicles.filter((vehicle) => vehicle.make === make);
      return {
        make,
        views: vehicles.reduce((sum, vehicle) => sum + vehicle.views, 0),
        leads: vehicles.reduce((sum, vehicle) => sum + vehicle.leads, 0),
        value: vehicles.reduce((sum, vehicle) => sum + vehicle.price, 0)
      };
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  return (
    <>
      <PageHeader
        eyebrow="Business intelligence"
        title="Analytics"
        description="Understand inventory performance, lead quality and the health of your sales funnel."
        actions={
          <div className="date-range-control">
            <button type="button"><Icon name="calendar" width={16} height={16} />Last 30 days<Icon name="chevronDown" width={14} height={14} /></button>
          </div>
        }
      />

      <section className="metric-grid analytics-metrics">
        <Card className="metric-card">
          <div className="metric-topline"><span className="metric-icon metric-icon-green"><Icon name="eye" width={19} height={19} /></span><MetricDelta>12.4%</MetricDelta></div>
          <p className="metric-label">Listing views</p><strong className="metric-value">{totalViews.toLocaleString()}</strong><p className="metric-note">Across all published inventory</p>
        </Card>
        <Card className="metric-card">
          <div className="metric-topline"><span className="metric-icon metric-icon-blue"><Icon name="users" width={19} height={19} /></span><MetricDelta>9.8%</MetricDelta></div>
          <p className="metric-label">New enquiries</p><strong className="metric-value">{totalLeads}</strong><p className="metric-note">From website and external channels</p>
        </Card>
        <Card className="metric-card">
          <div className="metric-topline"><span className="metric-icon metric-icon-purple"><Icon name="trend" width={19} height={19} /></span><MetricDelta>{conversion || 13}%</MetricDelta></div>
          <p className="metric-label">Lead-to-sale conversion</p><strong className="metric-value">{conversion || 13}%</strong><p className="metric-note">Closed opportunities in this period</p>
        </Card>
        <Card className="metric-card">
          <div className="metric-topline"><span className="metric-icon metric-icon-amber"><Icon name="money" width={19} height={19} /></span><Badge tone="green">On target</Badge></div>
          <p className="metric-label">Revenue won</p><strong className="metric-value metric-value-money">{formatMoney(soldRevenue || 46900)}</strong><p className="metric-note">From completed vehicle sales</p>
        </Card>
      </section>

      <section className="analytics-grid">
        <Card className="panel funnel-panel">
          <div className="panel-header"><div><p className="panel-kicker">Conversion</p><h2>Sales funnel</h2></div><button className="icon-button" type="button"><Icon name="more" width={18} height={18} /></button></div>
          <div className="funnel-list">
            {leadStages.slice(0, 6).map((stage, index) => {
              const count = state.leads.filter((lead) => lead.stage === stage).length;
              const width = Math.max(28, 100 - index * 11);
              return (
                <div className="funnel-row" key={stage}>
                  <div className="funnel-label"><span>{stage}</span><strong>{count}</strong></div>
                  <div className="funnel-track"><span style={{ width: `${width}%` }} /></div>
                  <small>{index === 0 ? "100%" : `${Math.max(12, 100 - index * 16)}%`}</small>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="panel source-panel">
          <div className="panel-header"><div><p className="panel-kicker">Acquisition</p><h2>Leads by source</h2></div><Badge tone="neutral">{totalLeads} total</Badge></div>
          <div className="source-chart">
            {sources.map((source, index) => (
              <div className="source-row" key={source.source}>
                <div><span className={`source-dot source-${index % 5}`} />{source.source}</div>
                <div className="source-bar"><span className={`source-${index % 5}`} style={{ width: `${(source.count / maxSource) * 100}%` }} /></div>
                <strong>{source.count}</strong>
              </div>
            ))}
          </div>
        </Card>

        <Card className="panel stock-age-panel">
          <div className="panel-header"><div><p className="panel-kicker">Inventory health</p><h2>Stock ageing</h2></div></div>
          <div className="stock-age-chart">
            <div className="donut-chart" style={{ background: `conic-gradient(#15803d 0 28%, #2563eb 28% 56%, #d97706 56% 88%, #dc2626 88% 100%)` }}>
              <div><strong>{state.vehicles.filter((vehicle) => vehicle.status !== "Sold").length}</strong><span>active</span></div>
            </div>
            <div className="stock-age-legend">
              {ages.map((age) => <div key={age.label}><span className={`legend-dot legend-${age.tone}`} /><span>{age.label}</span><strong>{age.count}</strong></div>)}
            </div>
          </div>
          <div className="insight-callout"><Icon name="sparkles" width={18} height={18} /><p><strong>Pricing opportunity</strong><span>One vehicle is approaching the 45-day ageing target.</span></p></div>
        </Card>

        <Card className="panel make-performance-panel">
          <div className="panel-header"><div><p className="panel-kicker">Inventory engagement</p><h2>Performance by make</h2></div><button className="text-button" type="button">View report</button></div>
          <div className="make-table">
            <div className="make-table-head"><span>Make</span><span>Views</span><span>Leads</span><span>Stock value</span></div>
            {makes.map((make) => (
              <div className="make-row" key={make.make}>
                <span className="make-name"><i>{make.make.slice(0, 2).toUpperCase()}</i><strong>{make.make}</strong></span>
                <span>{make.views.toLocaleString()}</span><span>{make.leads}</span><strong>{formatMoney(make.value)}</strong>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  );
}
