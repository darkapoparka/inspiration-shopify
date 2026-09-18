"use client";

import { useMemo, useState } from "react";

import { useDemo } from "@/components/demo-context";
import { Icon } from "@/components/icon";
import { Badge, Button, Card, Drawer, PageHeader } from "@/components/ui";
import type { VehicleStatus } from "@/lib/demo-data";

const statuses: Array<"All" | VehicleStatus> = ["All", "Published", "Draft", "Reserved", "Sold"];

export function InventoryView({ onAddVehicle }: { onAddVehicle: () => void }) {
  const { state, formatMoney, patchVehicle } = useDemo();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | VehicleStatus>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = state.vehicles.find((vehicle) => vehicle.id === selectedId);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return state.vehicles.filter((vehicle) => {
      const statusMatch = status === "All" || vehicle.status === status;
      const queryMatch = !needle || [vehicle.make, vehicle.model, vehicle.variant, vehicle.stockNo, vehicle.year]
        .join(" ")
        .toLowerCase()
        .includes(needle);
      return statusMatch && queryMatch;
    });
  }, [query, state.vehicles, status]);

  const exportCsv = () => {
    const header = ["Stock", "Vehicle", "Year", "Price", "Mileage", "Status", "Published"];
    const rows = filtered.map((vehicle) => [
      vehicle.stockNo,
      `${vehicle.make} ${vehicle.model} ${vehicle.variant}`,
      vehicle.year,
      vehicle.price,
      vehicle.mileage,
      vehicle.status,
      vehicle.published ? "Yes" : "No"
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "dealerdesk-inventory.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        eyebrow="Showroom operations"
        title="Vehicle inventory"
        description="Manage stock, publication status, pricing and listing performance from one place."
        actions={
          <>
            <Button icon="download" onClick={exportCsv}>Export CSV</Button>
            <Button icon="plus" variant="primary" onClick={onAddVehicle}>Add vehicle</Button>
          </>
        }
      />

      <section className="inventory-summary-grid">
        <Card className="inventory-summary-card">
          <span className="summary-icon summary-icon-green"><Icon name="car" width={18} height={18} /></span>
          <div><strong>{state.vehicles.filter((vehicle) => vehicle.status !== "Sold").length}</strong><span>Vehicles in stock</span></div>
        </Card>
        <Card className="inventory-summary-card">
          <span className="summary-icon summary-icon-blue"><Icon name="eye" width={18} height={18} /></span>
          <div><strong>{state.vehicles.reduce((sum, vehicle) => sum + vehicle.views, 0).toLocaleString()}</strong><span>Total listing views</span></div>
        </Card>
        <Card className="inventory-summary-card">
          <span className="summary-icon summary-icon-amber"><Icon name="clock" width={18} height={18} /></span>
          <div><strong>{Math.round(state.vehicles.filter((vehicle) => vehicle.status !== "Sold").reduce((sum, vehicle) => sum + vehicle.daysInStock, 0) / Math.max(1, state.vehicles.filter((vehicle) => vehicle.status !== "Sold").length))} days</strong><span>Average stock age</span></div>
        </Card>
        <Card className="inventory-summary-card">
          <span className="summary-icon summary-icon-purple"><Icon name="money" width={18} height={18} /></span>
          <div><strong>{formatMoney(state.vehicles.filter((vehicle) => vehicle.status !== "Sold").reduce((sum, vehicle) => sum + vehicle.price, 0))}</strong><span>Stock value</span></div>
        </Card>
      </section>

      <Card className="table-panel inventory-panel">
        <div className="table-toolbar">
          <div className="segmented-control" role="tablist" aria-label="Inventory status">
            {statuses.map((item) => (
              <button
                className={status === item ? "active" : ""}
                key={item}
                type="button"
                onClick={() => setStatus(item)}
              >
                {item}
                <span>{item === "All" ? state.vehicles.length : state.vehicles.filter((vehicle) => vehicle.status === item).length}</span>
              </button>
            ))}
          </div>
          <div className="toolbar-actions">
            <label className="search-field inventory-search">
              <Icon name="search" width={17} height={17} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stock, make or model" />
            </label>
            <button className="icon-button bordered" type="button" aria-label="Open filters"><Icon name="filter" width={17} height={17} /></button>
          </div>
        </div>

        <div className="desktop-table-wrap">
          <table className="data-table inventory-table">
            <thead>
              <tr>
                <th className="checkbox-cell"><input type="checkbox" aria-label="Select all vehicles" /></th>
                <th>Vehicle</th>
                <th>Price</th>
                <th>Status</th>
                <th>Performance</th>
                <th>Stock age</th>
                <th className="actions-cell"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td className="checkbox-cell"><input type="checkbox" aria-label={`Select ${vehicle.make} ${vehicle.model}`} /></td>
                  <td>
                    <button className="vehicle-cell" type="button" onClick={() => setSelectedId(vehicle.id)}>
                      <span className={`vehicle-table-thumb vehicle-hue-${(vehicle.year + vehicle.model.length) % 4}`}><Icon name="car" width={28} height={28} /></span>
                      <span><strong>{vehicle.make} {vehicle.model}</strong><small>{vehicle.variant} · {vehicle.year} · {vehicle.stockNo}</small></span>
                    </button>
                  </td>
                  <td><strong className="table-price">{formatMoney(vehicle.price)}</strong><small className="table-subline">{vehicle.mileage.toLocaleString()} km</small></td>
                  <td><StatusBadge status={vehicle.status} /></td>
                  <td>
                    <div className="performance-inline">
                      <span><Icon name="eye" width={14} height={14} /> {vehicle.views.toLocaleString()}</span>
                      <span><Icon name="users" width={14} height={14} /> {vehicle.leads}</span>
                    </div>
                  </td>
                  <td><strong>{vehicle.daysInStock} days</strong><small className={`table-subline ${vehicle.daysInStock > 35 ? "warning-text" : ""}`}>{vehicle.daysInStock > 35 ? "Review pricing" : "Within target"}</small></td>
                  <td className="actions-cell"><button className="icon-button" type="button" aria-label={`Open ${vehicle.make} ${vehicle.model}`} onClick={() => setSelectedId(vehicle.id)}><Icon name="more" width={18} height={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mobile-inventory-list">
          {filtered.map((vehicle) => (
            <button className="mobile-vehicle-card" key={vehicle.id} type="button" onClick={() => setSelectedId(vehicle.id)}>
              <span className="mobile-vehicle-top">
                <span className="vehicle-table-thumb"><Icon name="car" width={26} height={26} /></span>
                <span className="mobile-vehicle-name"><strong>{vehicle.make} {vehicle.model}</strong><small>{vehicle.year} · {vehicle.stockNo}</small></span>
                <StatusBadge status={vehicle.status} />
              </span>
              <span className="mobile-vehicle-bottom">
                <strong>{formatMoney(vehicle.price)}</strong>
                <span>{vehicle.mileage.toLocaleString()} km</span>
                <span>{vehicle.views.toLocaleString()} views</span>
              </span>
            </button>
          ))}
        </div>

        <div className="table-footer"><span>Showing {filtered.length} of {state.vehicles.length} vehicles</span><div><button disabled type="button"><Icon name="chevronLeft" width={15} height={15} /></button><button className="active" type="button">1</button><button disabled type="button"><Icon name="chevronRight" width={15} height={15} /></button></div></div>
      </Card>

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        eyebrow={selected?.stockNo}
        title={selected ? `${selected.make} ${selected.model}` : "Vehicle"}
      >
        {selected ? (
          <div className="vehicle-drawer-content">
            <div className="drawer-vehicle-hero"><Icon name="car" width={72} height={72} /><Badge tone={selected.featured ? "purple" : "neutral"}>{selected.featured ? "Featured listing" : "Standard listing"}</Badge></div>
            <div className="drawer-price-row"><div><span>Advertised price</span><strong>{formatMoney(selected.price)}</strong></div><StatusBadge status={selected.status} /></div>
            <div className="detail-grid">
              <Detail label="Year" value={String(selected.year)} />
              <Detail label="Mileage" value={`${selected.mileage.toLocaleString()} km`} />
              <Detail label="Fuel" value={selected.fuel} />
              <Detail label="Transmission" value={selected.transmission} />
              <Detail label="Body" value={selected.body} />
              <Detail label="Colour" value={selected.color} />
            </div>
            <div className="drawer-section">
              <h3>Listing controls</h3>
              <label className="switch-row"><span><strong>Published on website</strong><small>Customers can discover this vehicle.</small></span><input type="checkbox" checked={selected.published} onChange={(event) => patchVehicle(selected.id, { published: event.target.checked, status: event.target.checked && selected.status === "Draft" ? "Published" : selected.status })} /><i /></label>
              <label className="switch-row"><span><strong>Featured on homepage</strong><small>Show this vehicle in the featured collection.</small></span><input type="checkbox" checked={selected.featured} onChange={(event) => patchVehicle(selected.id, { featured: event.target.checked })} /><i /></label>
            </div>
            <div className="drawer-section">
              <label className="field-label" htmlFor="vehicle-status">Vehicle status</label>
              <select id="vehicle-status" className="form-control" value={selected.status} onChange={(event) => patchVehicle(selected.id, { status: event.target.value as VehicleStatus, published: event.target.value === "Published" || event.target.value === "Reserved" })}>
                <option>Published</option><option>Draft</option><option>Reserved</option><option>Sold</option>
              </select>
            </div>
            <div className="drawer-actions"><Button icon="external">Preview listing</Button><Button icon="edit" variant="primary">Edit vehicle</Button></div>
          </div>
        ) : null}
      </Drawer>
    </>
  );
}

function StatusBadge({ status }: { status: VehicleStatus }) {
  const tone = status === "Published" ? "green" : status === "Reserved" ? "blue" : status === "Sold" ? "purple" : "neutral";
  return <Badge tone={tone}>{status}</Badge>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="detail-item"><span>{label}</span><strong>{value}</strong></div>;
}
