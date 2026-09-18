"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import {
  createDemoState,
  leadStages,
  type Appointment,
  type DealerSettings,
  type DemoState,
  type Lead,
  type LeadStage,
  type Vehicle
} from "@/lib/demo-data";

type BackendMode = "loading" | "browser" | "neon";

type DemoContextValue = {
  state: DemoState;
  setState: Dispatch<SetStateAction<DemoState>>;
  backendMode: BackendMode;
  saving: boolean;
  lastSaved: string;
  resetDemo: () => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, "id" | "stockNo" | "views" | "leads" | "daysInStock">) => void;
  patchVehicle: (id: string, patch: Partial<Vehicle>) => void;
  addLead: (lead: Omit<Lead, "id" | "lastContact">) => void;
  patchLead: (id: string, patch: Partial<Lead>) => void;
  moveLead: (id: string, direction: -1 | 1) => void;
  addAppointment: (appointment: Omit<Appointment, "id">) => void;
  patchSettings: (patch: Partial<DealerSettings>) => void;
  vehicleById: (id: string) => Vehicle | undefined;
  leadById: (id: string) => Lead | undefined;
  formatMoney: (value: number) => string;
};

const DemoContext = createContext<DemoContextValue | null>(null);
const STORAGE_KEY = "dealerdesk-demo-state-v1";

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(() => createDemoState());
  const [backendMode, setBackendMode] = useState<BackendMode>("loading");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState("Not saved yet");
  const hydrated = useRef(false);

  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      try {
        const response = await fetch("/api/demo", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load demo workspace");
        const payload = (await response.json()) as { mode: "browser" | "neon"; state: DemoState };
        if (!active) return;

        if (payload.mode === "browser") {
          const local = window.localStorage.getItem(STORAGE_KEY);
          if (local) {
            try {
              setState(JSON.parse(local) as DemoState);
            } catch {
              setState(payload.state);
            }
          } else {
            setState(payload.state);
          }
        } else {
          setState(payload.state);
        }
        setBackendMode(payload.mode);
      } catch {
        const local = window.localStorage.getItem(STORAGE_KEY);
        if (local) {
          try {
            setState(JSON.parse(local) as DemoState);
          } catch {
            setState(createDemoState());
          }
        }
        setBackendMode("browser");
      } finally {
        hydrated.current = true;
      }
    };
    void hydrate();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated.current || backendMode === "loading") return;

    setSaving(true);
    const timer = window.setTimeout(async () => {
      try {
        if (backendMode === "neon") {
          const response = await fetch("/api/demo", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "save", state })
          });
          if (!response.ok) throw new Error("Unable to save demo state");
        } else {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
        setLastSaved(new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date()));
      } finally {
        setSaving(false);
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [backendMode, state]);

  const resetDemo = useCallback(async () => {
    setSaving(true);
    try {
      if (backendMode === "neon") {
        const response = await fetch("/api/demo", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "reset" })
        });
        if (!response.ok) throw new Error("Unable to reset demo");
        const payload = (await response.json()) as { state: DemoState };
        setState(payload.state);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
        setState(createDemoState());
      }
      setLastSaved("Demo reset");
    } finally {
      setSaving(false);
    }
  }, [backendMode]);

  const addVehicle = useCallback<DemoContextValue["addVehicle"]>((vehicle) => {
    setState((current) => {
      const number = 2400 + current.vehicles.length + 1;
      return {
        ...current,
        vehicles: [
          {
            ...vehicle,
            id: crypto.randomUUID(),
            stockNo: `DD-${number}`,
            views: 0,
            leads: 0,
            daysInStock: 0
          },
          ...current.vehicles
        ]
      };
    });
  }, []);

  const patchVehicle = useCallback((id: string, patch: Partial<Vehicle>) => {
    setState((current) => ({
      ...current,
      vehicles: current.vehicles.map((vehicle) => (vehicle.id === id ? { ...vehicle, ...patch } : vehicle))
    }));
  }, []);

  const addLead = useCallback<DemoContextValue["addLead"]>((lead) => {
    setState((current) => ({
      ...current,
      leads: [{ ...lead, id: crypto.randomUUID(), lastContact: "Just now" }, ...current.leads],
      activity: [
        {
          id: crypto.randomUUID(),
          label: "New lead added",
          detail: lead.name,
          at: "Just now",
          tone: "green"
        },
        ...current.activity
      ].slice(0, 8)
    }));
  }, []);

  const patchLead = useCallback((id: string, patch: Partial<Lead>) => {
    setState((current) => ({
      ...current,
      leads: current.leads.map((lead) => (lead.id === id ? { ...lead, ...patch } : lead))
    }));
  }, []);

  const moveLead = useCallback((id: string, direction: -1 | 1) => {
    setState((current) => ({
      ...current,
      leads: current.leads.map((lead) => {
        if (lead.id !== id) return lead;
        const index = leadStages.indexOf(lead.stage);
        const next = Math.max(0, Math.min(leadStages.length - 1, index + direction));
        return { ...lead, stage: leadStages[next] as LeadStage, lastContact: "Just now" };
      })
    }));
  }, []);

  const addAppointment = useCallback<DemoContextValue["addAppointment"]>((appointment) => {
    setState((current) => ({
      ...current,
      appointments: [{ ...appointment, id: crypto.randomUUID() }, ...current.appointments]
    }));
  }, []);

  const patchSettings = useCallback((patch: Partial<DealerSettings>) => {
    setState((current) => ({ ...current, settings: { ...current.settings, ...patch } }));
  }, []);

  const vehicleMap = useMemo(() => new Map(state.vehicles.map((vehicle) => [vehicle.id, vehicle])), [state.vehicles]);
  const leadMap = useMemo(() => new Map(state.leads.map((lead) => [lead.id, lead])), [state.leads]);

  const value = useMemo<DemoContextValue>(() => ({
    state,
    setState,
    backendMode,
    saving,
    lastSaved,
    resetDemo,
    addVehicle,
    patchVehicle,
    addLead,
    patchLead,
    moveLead,
    addAppointment,
    patchSettings,
    vehicleById: (id) => vehicleMap.get(id),
    leadById: (id) => leadMap.get(id),
    formatMoney: (amount) => new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: state.settings.currency,
      maximumFractionDigits: 0
    }).format(amount)
  }), [
    state,
    backendMode,
    saving,
    lastSaved,
    resetDemo,
    addVehicle,
    patchVehicle,
    addLead,
    patchLead,
    moveLead,
    addAppointment,
    patchSettings,
    vehicleMap,
    leadMap
  ]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("useDemo must be used within DemoProvider");
  return value;
}
