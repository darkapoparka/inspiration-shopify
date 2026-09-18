"use client";

import { useState } from "react";

import { useDemo } from "@/components/demo-context";
import { Icon } from "@/components/icon";
import { Avatar, Badge, Button, Card, PageHeader } from "@/components/ui";

export function SettingsView() {
  const { state, patchSettings } = useDemo();
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <>
      <PageHeader
        eyebrow="Workspace configuration"
        title="Settings"
        description="Manage dealership details, preferences, users and connected sales channels."
        actions={<Button icon={saved ? "check" : "settings"} variant="primary" onClick={save}>{saved ? "Saved" : "Save changes"}</Button>}
      />

      <section className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          <button className="active" type="button"><Icon name="settings" width={17} height={17} />General</button>
          <button type="button"><Icon name="users" width={17} height={17} />Team & roles</button>
          <button type="button"><Icon name="bell" width={17} height={17} />Notifications</button>
          <button type="button"><Icon name="monitor" width={17} height={17} />Integrations</button>
          <button type="button"><Icon name="money" width={17} height={17} />Billing</button>
        </nav>

        <div className="settings-content">
          <Card className="panel settings-section">
            <div className="settings-section-header"><div><h2>Dealership profile</h2><p>These details appear across the CRM and customer-facing website.</p></div><Badge tone="green">Complete</Badge></div>
            <div className="profile-brand-row">
              <div className="profile-logo"><Icon name="car" width={30} height={30} /><span>DD</span></div>
              <div><strong>Dealership logo</strong><p>PNG or WebP with a transparent background.</p><div><Button icon="edit">Upload new</Button><Button variant="ghost">Remove</Button></div></div>
            </div>
            <div className="form-grid settings-form">
              <label className="form-field form-field-full"><span>Dealership name</span><input className="form-control" value={state.settings.name} onChange={(event) => patchSettings({ name: event.target.value })} /></label>
              <label className="form-field"><span>Business phone</span><span className="input-with-icon"><Icon name="phone" width={16} height={16} /><input className="form-control" value={state.settings.phone} onChange={(event) => patchSettings({ phone: event.target.value })} /></span></label>
              <label className="form-field"><span>Sales email</span><span className="input-with-icon"><Icon name="mail" width={16} height={16} /><input className="form-control" value={state.settings.email} onChange={(event) => patchSettings({ email: event.target.value })} /></span></label>
              <label className="form-field form-field-full"><span>Showroom address</span><span className="input-with-icon"><Icon name="location" width={16} height={16} /><input className="form-control" value={state.settings.address} onChange={(event) => patchSettings({ address: event.target.value })} /></span></label>
              <label className="form-field"><span>Working hours</span><input className="form-control" value={state.settings.workingHours} onChange={(event) => patchSettings({ workingHours: event.target.value })} /></label>
              <label className="form-field"><span>Default currency</span><select className="form-control" value={state.settings.currency} onChange={(event) => patchSettings({ currency: event.target.value as "EUR" | "BGN" })}><option value="EUR">EUR — Euro</option><option value="BGN">BGN — Bulgarian lev</option></select></label>
            </div>
          </Card>

          <Card className="panel settings-section">
            <div className="settings-section-header"><div><h2>Inventory preferences</h2><p>Choose how vehicle records move from draft to the public website.</p></div></div>
            <div className="section-control-list compact-controls">
              <label className="switch-row"><span><strong>Automatically publish complete vehicles</strong><small>Publish a listing after all required fields and images are supplied.</small></span><input type="checkbox" checked={state.settings.autoPublish} onChange={(event) => patchSettings({ autoPublish: event.target.checked })} /><i /></label>
              <label className="switch-row"><span><strong>Show finance estimates</strong><small>Display representative monthly payments in vehicle records.</small></span><input type="checkbox" checked={state.settings.showFinancing} onChange={(event) => patchSettings({ showFinancing: event.target.checked })} /><i /></label>
              <label className="switch-row"><span><strong>Accept trade-in requests</strong><small>Allow customers to submit a vehicle for valuation.</small></span><input type="checkbox" checked={state.settings.showTradeIn} onChange={(event) => patchSettings({ showTradeIn: event.target.checked })} /><i /></label>
            </div>
          </Card>

          <Card className="panel settings-section">
            <div className="settings-section-header"><div><h2>Team members</h2><p>People who can access this dealership workspace.</p></div><Button icon="plus">Invite member</Button></div>
            <div className="members-list">
              <div className="member-row"><Avatar name="Alex Morgan" /><div><strong>Alex Morgan</strong><span>alex@dealerdesk.demo</span></div><Badge tone="purple">Owner</Badge><small>Active now</small><button className="icon-button" type="button"><Icon name="more" width={18} height={18} /></button></div>
              <div className="member-row"><Avatar name="Nikolay Ivanov" /><div><strong>Nikolay Ivanov</strong><span>nikolay@dealerdesk.demo</span></div><Badge tone="blue">Manager</Badge><small>12 min ago</small><button className="icon-button" type="button"><Icon name="more" width={18} height={18} /></button></div>
              <div className="member-row"><Avatar name="Maya Clark" /><div><strong>Maya Clark</strong><span>maya@dealerdesk.demo</span></div><Badge tone="neutral">Salesperson</Badge><small>1 hr ago</small><button className="icon-button" type="button"><Icon name="more" width={18} height={18} /></button></div>
            </div>
          </Card>

          <Card className="panel settings-section">
            <div className="settings-section-header"><div><h2>Sales-channel integrations</h2><p>Keep listings and enquiries connected across the services your dealership uses.</p></div></div>
            <div className="integration-list">
              <div className="integration-row"><span className="integration-icon integration-web"><Icon name="monitor" width={21} height={21} /></span><div><strong>Dealership website</strong><p>Inventory publishing and customer enquiries</p></div><Badge tone="green">Connected</Badge><Button>Configure</Button></div>
              <div className="integration-row"><span className="integration-icon integration-market"><Icon name="car" width={21} height={21} /></span><div><strong>Vehicle marketplace feed</strong><p>XML feed for external listing platforms</p></div><Badge tone="amber">Demo</Badge><Button>Configure</Button></div>
              <div className="integration-row"><span className="integration-icon integration-mail"><Icon name="mail" width={21} height={21} /></span><div><strong>Email inbox</strong><p>Match incoming replies to customer records</p></div><Badge tone="neutral">Not connected</Badge><Button variant="primary">Connect</Button></div>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
