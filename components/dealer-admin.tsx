"use client";

import { useMemo, useState } from "react";

import { useDemo } from "@/components/demo-context";
import { Icon, type IconName } from "@/components/icon";
import { Avatar, Badge, Button, Modal } from "@/components/ui";
import { AnalyticsView } from "@/components/views/analytics";
import { CalendarView } from "@/components/views/calendar";
import { InventoryView } from "@/components/views/inventory";
import { LeadsView } from "@/components/views/leads";
import { OverviewView } from "@/components/views/overview";
import { SettingsView } from "@/components/views/settings";
import { WebsiteView } from "@/components/views/website";
import type { Lead, Vehicle, VehicleStatus } from "@/lib/demo-data";

type View = "overview" | "inventory" | "leads" | "calendar" | "analytics" | "website" | "settings";

type NavItem = { id: View; label: string; icon: IconName; badge?: string };

const primaryNav: NavItem[] = [
  { id: "overview", label: "Overview", icon: "home" },
  { id: "inventory", label: "Inventory", icon: "car" },
  { id: "leads", label: "Sales leads", icon: "users" },
  { id: "calendar", label: "Appointments", icon: "calendar" },
  { id: "analytics", label: "Analytics", icon: "chart" }
];

const secondaryNav: NavItem[] = [
  { id: "website", label: "Website", icon: "monitor" },
  { id: "settings", label: "Settings", icon: "settings" }
];

export function DealerAdmin() {
  const {
    state,
    backendMode,
    saving,
    lastSaved,
    resetDemo,
    addVehicle,
    addLead,
    vehicleById
  } = useDemo();
  const [view, setView] = useState<View>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const searchResults = useMemo(() => {
    const needle = globalQuery.trim().toLowerCase();
    if (needle.length < 2) return { vehicles: [], leads: [] };
    return {
      vehicles: state.vehicles.filter((vehicle) => [vehicle.make, vehicle.model, vehicle.variant, vehicle.stockNo].join(" ").toLowerCase().includes(needle)).slice(0, 4),
      leads: state.leads.filter((lead) => [lead.name, lead.email, lead.phone, lead.source].join(" ").toLowerCase().includes(needle)).slice(0, 4)
    };
  }, [globalQuery, state.leads, state.vehicles]);

  const navigate = (next: View | string) => {
    setView(next as View);
    setMobileOpen(false);
    setGlobalQuery("");
  };

  const submitVehicle = (formData: FormData) => {
    const status = String(formData.get("status")) as VehicleStatus;
    addVehicle({
      make: String(formData.get("make")),
      model: String(formData.get("model")),
      variant: String(formData.get("variant")),
      year: Number(formData.get("year")),
      price: Number(formData.get("price")),
      mileage: Number(formData.get("mileage")),
      fuel: String(formData.get("fuel")),
      transmission: String(formData.get("transmission")),
      body: String(formData.get("body")),
      color: String(formData.get("color")),
      status,
      featured: false,
      published: status === "Published" || status === "Reserved"
    });
    setVehicleModalOpen(false);
    navigate("inventory");
  };

  const submitLead = (formData: FormData) => {
    const vehicleId = String(formData.get("vehicleId"));
    const vehicle = vehicleById(vehicleId);
    addLead({
      name: String(formData.get("name")),
      email: String(formData.get("email")),
      phone: String(formData.get("phone")),
      vehicleId,
      source: String(formData.get("source")),
      stage: "New",
      value: vehicle?.price ?? 0,
      priority: String(formData.get("priority")) as Lead["priority"],
      note: String(formData.get("note") ?? ""),
      assignee: String(formData.get("assignee"))
    });
    setLeadModalOpen(false);
    navigate("leads");
  };

  const renderView = () => {
    switch (view) {
      case "inventory": return <InventoryView onAddVehicle={() => setVehicleModalOpen(true)} />;
      case "leads": return <LeadsView onAddLead={() => setLeadModalOpen(true)} />;
      case "calendar": return <CalendarView />;
      case "analytics": return <AnalyticsView />;
      case "website": return <WebsiteView />;
      case "settings": return <SettingsView />;
      default: return <OverviewView onAddVehicle={() => setVehicleModalOpen(true)} onAddLead={() => setLeadModalOpen(true)} onNavigate={navigate} />;
    }
  };

  return (
    <div className="admin-shell">
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <span className="brand-mark"><Icon name="car" width={23} height={23} /></span>
          <span className="brand-word">Dealer<span>Desk</span></span>
          <button className="sidebar-close" type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><Icon name="x" width={20} height={20} /></button>
        </div>

        <button className="workspace-switcher" type="button">
          <span className="workspace-logo">DD</span>
          <span><strong>Demo Showroom</strong><small>Dealership workspace</small></span>
          <Icon name="chevronDown" width={15} height={15} />
        </button>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <p>OPERATIONS</p>
          {primaryNav.map((item) => (
            <button className={view === item.id ? "active" : ""} key={item.id} type="button" onClick={() => navigate(item.id)}>
              <Icon name={item.icon} width={18} height={18} />
              <span>{item.label}</span>
              {item.id === "leads" ? <em>{state.leads.filter((lead) => lead.stage === "New").length}</em> : null}
            </button>
          ))}
          <p>CHANNELS</p>
          {secondaryNav.map((item) => (
            <button className={view === item.id ? "active" : ""} key={item.id} type="button" onClick={() => navigate(item.id)}>
              <Icon name={item.icon} width={18} height={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="demo-card">
          <span className="demo-card-icon"><Icon name="sparkles" width={18} height={18} /></span>
          <div><strong>Interactive CRM demo</strong><p>Changes are isolated to your demo workspace.</p></div>
          <button type="button" onClick={() => void resetDemo()}><Icon name="refresh" width={14} height={14} />Reset data</button>
        </div>

        <div className="sidebar-user">
          <Avatar name="Alex Morgan" />
          <span><strong>Alex Morgan</strong><small>Owner</small></span>
          <button className="icon-button" type="button" aria-label="Account menu"><Icon name="more" width={18} height={18} /></button>
        </div>
      </aside>

      {mobileOpen ? <button className="sidebar-backdrop" type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation" /> : null}

      <div className="admin-main">
        <header className="topbar">
          <button className="mobile-menu-button" type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Icon name="menu" width={22} height={22} /></button>
          <div className="global-search-wrap">
            <label className="global-search">
              <Icon name="search" width={17} height={17} />
              <input value={globalQuery} onChange={(event) => setGlobalQuery(event.target.value)} placeholder="Search vehicles, customers and stock…" />
              <kbd>⌘ K</kbd>
            </label>
            {globalQuery.trim().length >= 2 ? (
              <div className="search-results">
                {searchResults.vehicles.length ? <p>VEHICLES</p> : null}
                {searchResults.vehicles.map((vehicle) => <button key={vehicle.id} type="button" onClick={() => navigate("inventory")}><span className="search-result-icon"><Icon name="car" width={17} height={17} /></span><span><strong>{vehicle.make} {vehicle.model}</strong><small>{vehicle.stockNo} · {vehicle.year}</small></span><Icon name="chevronRight" width={14} height={14} /></button>)}
                {searchResults.leads.length ? <p>CUSTOMERS</p> : null}
                {searchResults.leads.map((lead) => <button key={lead.id} type="button" onClick={() => navigate("leads")}><span className="search-result-icon"><Icon name="users" width={17} height={17} /></span><span><strong>{lead.name}</strong><small>{lead.stage} · {lead.source}</small></span><Icon name="chevronRight" width={14} height={14} /></button>)}
                {!searchResults.vehicles.length && !searchResults.leads.length ? <div className="no-search-results">No matching records</div> : null}
              </div>
            ) : null}
          </div>
          <div className="topbar-actions">
            <span className={`save-indicator ${saving ? "saving" : ""}`}><i />{saving ? "Saving…" : `Saved ${lastSaved}`}</span>
            <Badge tone={backendMode === "neon" ? "green" : backendMode === "loading" ? "amber" : "blue"}>{backendMode === "neon" ? "Cloud demo" : backendMode === "loading" ? "Loading" : "Browser demo"}</Badge>
            <button className="icon-button topbar-icon" type="button" aria-label="Notifications"><Icon name="bell" width={19} height={19} /><i className="notification-dot" /></button>
            <div className="profile-menu-wrap">
              <button className="profile-button" type="button" onClick={() => setProfileOpen((open) => !open)}><Avatar name="Alex Morgan" /><Icon name="chevronDown" width={14} height={14} /></button>
              {profileOpen ? <div className="profile-menu"><strong>Alex Morgan</strong><span>alex@dealerdesk.demo</span><hr /><button type="button" onClick={() => navigate("settings")}>Workspace settings</button><button type="button" onClick={() => void resetDemo()}>Reset demo data</button></div> : null}
            </div>
          </div>
        </header>

        <main className="admin-content">{renderView()}</main>
      </div>

      <Modal open={vehicleModalOpen} onClose={() => setVehicleModalOpen(false)} title="Add vehicle" description="Create a new stock record for your showroom." wide>
        <form id="vehicle-form" className="form-grid" action={submitVehicle}>
          <label className="form-field"><span>Make</span><input className="form-control" name="make" placeholder="BMW" required /></label>
          <label className="form-field"><span>Model</span><input className="form-control" name="model" placeholder="X5" required /></label>
          <label className="form-field form-field-full"><span>Variant</span><input className="form-control" name="variant" placeholder="xDrive40i M Sport" required /></label>
          <label className="form-field"><span>Year</span><input className="form-control" name="year" type="number" min="1990" max="2030" defaultValue="2024" required /></label>
          <label className="form-field"><span>Price</span><input className="form-control" name="price" type="number" min="0" placeholder="65000" required /></label>
          <label className="form-field"><span>Mileage (km)</span><input className="form-control" name="mileage" type="number" min="0" placeholder="25000" required /></label>
          <label className="form-field"><span>Fuel</span><select className="form-control" name="fuel"><option>Petrol</option><option>Diesel</option><option>Petrol hybrid</option><option>Diesel hybrid</option><option>Plug-in hybrid</option><option>Electric</option></select></label>
          <label className="form-field"><span>Transmission</span><select className="form-control" name="transmission"><option>Automatic</option><option>Manual</option></select></label>
          <label className="form-field"><span>Body type</span><select className="form-control" name="body"><option>SUV</option><option>Saloon</option><option>Estate</option><option>Hatchback</option><option>Coupe</option><option>Convertible</option><option>Van</option></select></label>
          <label className="form-field"><span>Colour</span><input className="form-control" name="color" placeholder="Metallic black" required /></label>
          <label className="form-field"><span>Initial status</span><select className="form-control" name="status"><option>Draft</option><option>Published</option><option>Reserved</option></select></label>
          <div className="inline-form-actions form-field-full"><Button type="button" onClick={() => setVehicleModalOpen(false)}>Cancel</Button><Button type="submit" icon="plus" variant="primary">Add vehicle</Button></div>
        </form>
      </Modal>

      <Modal open={leadModalOpen} onClose={() => setLeadModalOpen(false)} title="Add sales lead" description="Capture a new customer enquiry and assign it to the team.">
        <form id="lead-form" className="form-grid" action={submitLead}>
          <label className="form-field form-field-full"><span>Customer name</span><input className="form-control" name="name" placeholder="Full name" required /></label>
          <label className="form-field"><span>Email</span><input className="form-control" name="email" type="email" placeholder="customer@example.com" required /></label>
          <label className="form-field"><span>Phone</span><input className="form-control" name="phone" placeholder="+359…" required /></label>
          <label className="form-field form-field-full"><span>Vehicle of interest</span><select className="form-control" name="vehicleId" required>{state.vehicles.filter((vehicle) => vehicle.status !== "Sold").map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model} · {vehicle.stockNo}</option>)}</select></label>
          <label className="form-field"><span>Source</span><select className="form-control" name="source"><option>Website</option><option>Phone</option><option>Walk-in</option><option>Marketplace</option><option>Facebook</option><option>Instagram</option><option>Referral</option></select></label>
          <label className="form-field"><span>Priority</span><select className="form-control" name="priority"><option>Medium</option><option>High</option><option>Low</option></select></label>
          <label className="form-field form-field-full"><span>Assign to</span><select className="form-control" name="assignee"><option>Alex Morgan</option><option>Nikolay Ivanov</option><option>Maya Clark</option><option>Unassigned</option></select></label>
          <label className="form-field form-field-full"><span>Notes</span><textarea className="form-control note-area" name="note" placeholder="What is the customer looking for?" /></label>
          <div className="inline-form-actions form-field-full"><Button type="button" onClick={() => setLeadModalOpen(false)}>Cancel</Button><Button type="submit" icon="users" variant="primary">Add lead</Button></div>
        </form>
      </Modal>
    </div>
  );
}
