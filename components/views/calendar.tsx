"use client";

import { useMemo, useState } from "react";

import { useDemo } from "@/components/demo-context";
import { Icon } from "@/components/icon";
import { Avatar, Badge, Button, Card, Modal, PageHeader } from "@/components/ui";
import type { Appointment } from "@/lib/demo-data";

export function CalendarView() {
  const { state, vehicleById, leadById, addAppointment } = useDemo();
  const [modalOpen, setModalOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const days = useMemo(() => {
    const today = new Date();
    const monday = new Date(today);
    const dayIndex = (today.getDay() + 6) % 7;
    monday.setDate(today.getDate() - dayIndex + weekOffset * 7);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date;
    });
  }, [weekOffset]);

  const dayKey = (date: Date) => date.toISOString().slice(0, 10);
  const todayKey = dayKey(new Date());
  const todayAppointments = state.appointments.filter((appointment) => appointment.date === todayKey);

  const submitAppointment = (formData: FormData) => {
    addAppointment({
      leadId: String(formData.get("leadId")),
      vehicleId: String(formData.get("vehicleId")),
      type: String(formData.get("type")) as Appointment["type"],
      date: String(formData.get("date")),
      time: String(formData.get("time")),
      assignee: String(formData.get("assignee")),
      status: "Confirmed"
    });
    setModalOpen(false);
  };

  return (
    <>
      <PageHeader
        eyebrow="Showroom schedule"
        title="Appointments"
        description="Coordinate test drives, inspections, callbacks and finance meetings across the team."
        actions={<Button icon="plus" variant="primary" onClick={() => setModalOpen(true)}>New appointment</Button>}
      />

      <section className="calendar-layout">
        <Card className="calendar-panel">
          <div className="calendar-toolbar">
            <div className="calendar-navigation">
              <button className="icon-button bordered" type="button" onClick={() => setWeekOffset((value) => value - 1)} aria-label="Previous week"><Icon name="chevronLeft" width={17} height={17} /></button>
              <button className="button button-secondary" type="button" onClick={() => setWeekOffset(0)}><span>Today</span></button>
              <button className="icon-button bordered" type="button" onClick={() => setWeekOffset((value) => value + 1)} aria-label="Next week"><Icon name="chevronRight" width={17} height={17} /></button>
              <strong>{formatRange(days[0], days[6])}</strong>
            </div>
            <div className="calendar-view-switch"><button className="active" type="button">Week</button><button type="button">Month</button></div>
          </div>

          <div className="week-grid">
            {days.map((date) => {
              const key = dayKey(date);
              const appointments = state.appointments
                .filter((appointment) => appointment.date === key)
                .sort((a, b) => a.time.localeCompare(b.time));
              return (
                <div className={`week-day ${key === todayKey ? "today" : ""}`} key={key}>
                  <header><span>{new Intl.DateTimeFormat("en", { weekday: "short" }).format(date)}</span><strong>{date.getDate()}</strong></header>
                  <div className="week-day-events">
                    {appointments.map((appointment) => {
                      const lead = leadById(appointment.leadId);
                      const vehicle = vehicleById(appointment.vehicleId);
                      return (
                        <button className={`calendar-event event-${eventTone(appointment.type)}`} key={appointment.id} type="button">
                          <span>{appointment.time}</span>
                          <strong>{appointment.type}</strong>
                          <small>{lead?.name ?? "Customer"}</small>
                          <small>{vehicle ? `${vehicle.make} ${vehicle.model}` : "Vehicle"}</small>
                        </button>
                      );
                    })}
                    {appointments.length === 0 ? <span className="no-events">No appointments</span> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <aside className="calendar-sidebar">
          <Card className="panel agenda-card">
            <div className="panel-header"><div><p className="panel-kicker">Today</p><h2>Agenda</h2></div><Badge tone="green">{todayAppointments.length} events</Badge></div>
            <div className="agenda-list">
              {(todayAppointments.length ? todayAppointments : state.appointments.slice(0, 3)).map((appointment) => {
                const lead = leadById(appointment.leadId);
                const vehicle = vehicleById(appointment.vehicleId);
                return (
                  <div className="agenda-item" key={appointment.id}>
                    <div className="agenda-time"><strong>{appointment.time}</strong><span>{appointment.date === todayKey ? "Today" : formatShortDate(appointment.date)}</span></div>
                    <div className={`agenda-line line-${eventTone(appointment.type)}`} />
                    <div><strong>{appointment.type}</strong><p>{lead?.name}</p><small>{vehicle?.make} {vehicle?.model}</small></div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="panel team-card">
            <div className="panel-header"><div><p className="panel-kicker">Sales team</p><h2>Availability</h2></div></div>
            <div className="team-availability">
              <div><Avatar name="Alex Morgan" /><span><strong>Alex Morgan</strong><small>3 appointments</small></span><Badge tone="green">Available</Badge></div>
              <div><Avatar name="Nikolay Ivanov" /><span><strong>Nikolay Ivanov</strong><small>2 appointments</small></span><Badge tone="amber">Busy</Badge></div>
              <div><Avatar name="Maya Clark" /><span><strong>Maya Clark</strong><small>1 appointment</small></span><Badge tone="green">Available</Badge></div>
            </div>
          </Card>
        </aside>
      </section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create appointment"
        description="Add a test drive, inspection, callback or finance meeting."
      >
        <form id="appointment-form" className="form-grid" action={submitAppointment}>
          <label className="form-field form-field-full"><span>Customer</span><select className="form-control" name="leadId" required>{state.leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.name}</option>)}</select></label>
          <label className="form-field form-field-full"><span>Vehicle</span><select className="form-control" name="vehicleId" required>{state.vehicles.filter((vehicle) => vehicle.status !== "Sold").map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model} · {vehicle.stockNo}</option>)}</select></label>
          <label className="form-field"><span>Appointment type</span><select className="form-control" name="type"><option>Test drive</option><option>Inspection</option><option>Callback</option><option>Finance meeting</option></select></label>
          <label className="form-field"><span>Assigned to</span><select className="form-control" name="assignee"><option>Alex Morgan</option><option>Nikolay Ivanov</option><option>Maya Clark</option></select></label>
          <label className="form-field"><span>Date</span><input className="form-control" type="date" name="date" min={todayKey} defaultValue={todayKey} required /></label>
          <label className="form-field"><span>Time</span><input className="form-control" type="time" name="time" defaultValue="10:00" required /></label>
          <div className="inline-form-actions form-field-full"><Button type="button" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit" icon="calendar" variant="primary">Create appointment</Button></div>
        </form>
      </Modal>
    </>
  );
}

function eventTone(type: Appointment["type"]) {
  if (type === "Test drive") return "green";
  if (type === "Inspection") return "blue";
  if (type === "Finance meeting") return "purple";
  return "amber";
}

function formatRange(start: Date, end: Date) {
  const sameMonth = start.getMonth() === end.getMonth();
  const startText = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(start);
  const endText = new Intl.DateTimeFormat("en", sameMonth ? { day: "numeric", year: "numeric" } : { month: "short", day: "numeric", year: "numeric" }).format(end);
  return `${startText} – ${endText}`;
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${value}T12:00:00`));
}
