export type VehicleStatus = "Published" | "Draft" | "Reserved" | "Sold";
export type LeadStage = "New" | "Contacted" | "Qualified" | "Test drive" | "Negotiation" | "Won" | "Lost";
export type Priority = "Low" | "Medium" | "High";

export type Vehicle = {
  id: string;
  stockNo: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  body: string;
  color: string;
  status: VehicleStatus;
  views: number;
  leads: number;
  daysInStock: number;
  featured: boolean;
  published: boolean;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleId: string;
  source: string;
  stage: LeadStage;
  value: number;
  priority: Priority;
  lastContact: string;
  note: string;
  assignee: string;
};

export type Appointment = {
  id: string;
  leadId: string;
  vehicleId: string;
  type: "Test drive" | "Callback" | "Inspection" | "Finance meeting";
  date: string;
  time: string;
  assignee: string;
  status: "Confirmed" | "Pending" | "Completed";
};

export type DealerSettings = {
  name: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  currency: "EUR" | "BGN";
  accent: string;
  showFinancing: boolean;
  showTradeIn: boolean;
  autoPublish: boolean;
};

export type DemoState = {
  vehicles: Vehicle[];
  leads: Lead[];
  appointments: Appointment[];
  settings: DealerSettings;
  activity: Array<{ id: string; label: string; detail: string; at: string; tone: "green" | "blue" | "amber" | "neutral" }>;
};

const day = (offset: number) => {
  const value = new Date();
  value.setDate(value.getDate() + offset);
  return value.toISOString().slice(0, 10);
};

export function createDemoState(): DemoState {
  return {
    vehicles: [
      {
        id: "veh-001",
        stockNo: "DD-2401",
        make: "BMW",
        model: "X5",
        variant: "xDrive40i M Sport",
        year: 2023,
        price: 78900,
        mileage: 28400,
        fuel: "Petrol",
        transmission: "Automatic",
        body: "SUV",
        color: "Carbon Black",
        status: "Published",
        views: 1842,
        leads: 14,
        daysInStock: 18,
        featured: true,
        published: true
      },
      {
        id: "veh-002",
        stockNo: "DD-2402",
        make: "Mercedes-Benz",
        model: "GLE 450",
        variant: "4MATIC AMG Line",
        year: 2022,
        price: 84900,
        mileage: 35600,
        fuel: "Petrol hybrid",
        transmission: "Automatic",
        body: "SUV",
        color: "Obsidian Black",
        status: "Reserved",
        views: 1620,
        leads: 11,
        daysInStock: 24,
        featured: true,
        published: true
      },
      {
        id: "veh-003",
        stockNo: "DD-2403",
        make: "Audi",
        model: "A6 Avant",
        variant: "50 TDI quattro S line",
        year: 2021,
        price: 52900,
        mileage: 61200,
        fuel: "Diesel",
        transmission: "Automatic",
        body: "Estate",
        color: "Daytona Grey",
        status: "Published",
        views: 1147,
        leads: 8,
        daysInStock: 31,
        featured: false,
        published: true
      },
      {
        id: "veh-004",
        stockNo: "DD-2404",
        make: "Porsche",
        model: "Cayenne",
        variant: "E-Hybrid Platinum Edition",
        year: 2022,
        price: 109500,
        mileage: 21400,
        fuel: "Plug-in hybrid",
        transmission: "Automatic",
        body: "SUV",
        color: "Crayon",
        status: "Published",
        views: 2388,
        leads: 19,
        daysInStock: 12,
        featured: true,
        published: true
      },
      {
        id: "veh-005",
        stockNo: "DD-2405",
        make: "Volkswagen",
        model: "Golf R",
        variant: "4MOTION",
        year: 2023,
        price: 46900,
        mileage: 18900,
        fuel: "Petrol",
        transmission: "Automatic",
        body: "Hatchback",
        color: "Lapiz Blue",
        status: "Draft",
        views: 0,
        leads: 0,
        daysInStock: 2,
        featured: false,
        published: false
      },
      {
        id: "veh-006",
        stockNo: "DD-2406",
        make: "Volvo",
        model: "XC90",
        variant: "B5 AWD Ultimate",
        year: 2022,
        price: 69900,
        mileage: 43200,
        fuel: "Diesel hybrid",
        transmission: "Automatic",
        body: "SUV",
        color: "Denim Blue",
        status: "Published",
        views: 979,
        leads: 6,
        daysInStock: 42,
        featured: false,
        published: true
      },
      {
        id: "veh-007",
        stockNo: "DD-2407",
        make: "Land Rover",
        model: "Range Rover Sport",
        variant: "D300 Dynamic SE",
        year: 2023,
        price: 119900,
        mileage: 27200,
        fuel: "Diesel hybrid",
        transmission: "Automatic",
        body: "SUV",
        color: "Santorini Black",
        status: "Published",
        views: 2105,
        leads: 16,
        daysInStock: 16,
        featured: true,
        published: true
      },
      {
        id: "veh-008",
        stockNo: "DD-2408",
        make: "Tesla",
        model: "Model Y",
        variant: "Long Range AWD",
        year: 2022,
        price: 41900,
        mileage: 48700,
        fuel: "Electric",
        transmission: "Automatic",
        body: "SUV",
        color: "Pearl White",
        status: "Sold",
        views: 1734,
        leads: 13,
        daysInStock: 27,
        featured: false,
        published: false
      }
    ],
    leads: [
      {
        id: "lead-001",
        name: "Daniel Carter",
        email: "daniel@example.com",
        phone: "+359 88 555 1024",
        vehicleId: "veh-001",
        source: "Website",
        stage: "New",
        value: 78900,
        priority: "High",
        lastContact: "8 min ago",
        note: "Asked about trade-in value and delivery this week.",
        assignee: "Alex Morgan"
      },
      {
        id: "lead-002",
        name: "Mila Petrova",
        email: "mila@example.com",
        phone: "+359 89 443 2210",
        vehicleId: "veh-004",
        source: "Phone",
        stage: "Contacted",
        value: 109500,
        priority: "High",
        lastContact: "34 min ago",
        note: "Interested in finance options with 30% deposit.",
        assignee: "Nikolay Ivanov"
      },
      {
        id: "lead-003",
        name: "Stefan Wilson",
        email: "stefan@example.com",
        phone: "+359 87 222 0911",
        vehicleId: "veh-003",
        source: "Marketplace",
        stage: "Qualified",
        value: 52900,
        priority: "Medium",
        lastContact: "Today, 10:42",
        note: "Vehicle history sent. Waiting for test-drive confirmation.",
        assignee: "Alex Morgan"
      },
      {
        id: "lead-004",
        name: "Elena Georgieva",
        email: "elena@example.com",
        phone: "+359 88 711 9090",
        vehicleId: "veh-007",
        source: "Instagram",
        stage: "Test drive",
        value: 119900,
        priority: "High",
        lastContact: "Today, 09:20",
        note: "Test drive booked. Bringing current vehicle for appraisal.",
        assignee: "Nikolay Ivanov"
      },
      {
        id: "lead-005",
        name: "Martin Cole",
        email: "martin@example.com",
        phone: "+359 89 316 4200",
        vehicleId: "veh-002",
        source: "Referral",
        stage: "Negotiation",
        value: 84900,
        priority: "High",
        lastContact: "Yesterday",
        note: "Offer sent with winter wheel package included.",
        assignee: "Alex Morgan"
      },
      {
        id: "lead-006",
        name: "Viktoria Kaneva",
        email: "viktoria@example.com",
        phone: "+359 88 201 6634",
        vehicleId: "veh-006",
        source: "Website",
        stage: "New",
        value: 69900,
        priority: "Medium",
        lastContact: "1 hr ago",
        note: "Requested a walkaround video.",
        assignee: "Unassigned"
      },
      {
        id: "lead-007",
        name: "George Hill",
        email: "george@example.com",
        phone: "+359 87 908 7441",
        vehicleId: "veh-005",
        source: "Walk-in",
        stage: "Won",
        value: 46900,
        priority: "Medium",
        lastContact: "2 days ago",
        note: "Deposit paid. Handover scheduled.",
        assignee: "Nikolay Ivanov"
      },
      {
        id: "lead-008",
        name: "Petar Stoyanov",
        email: "petar@example.com",
        phone: "+359 89 112 6880",
        vehicleId: "veh-001",
        source: "Facebook",
        stage: "Lost",
        value: 78900,
        priority: "Low",
        lastContact: "5 days ago",
        note: "Purchased another vehicle.",
        assignee: "Alex Morgan"
      }
    ],
    appointments: [
      { id: "apt-001", leadId: "lead-004", vehicleId: "veh-007", type: "Test drive", date: day(0), time: "11:30", assignee: "Nikolay Ivanov", status: "Confirmed" },
      { id: "apt-002", leadId: "lead-003", vehicleId: "veh-003", type: "Callback", date: day(0), time: "14:00", assignee: "Alex Morgan", status: "Confirmed" },
      { id: "apt-003", leadId: "lead-002", vehicleId: "veh-004", type: "Finance meeting", date: day(1), time: "10:15", assignee: "Nikolay Ivanov", status: "Pending" },
      { id: "apt-004", leadId: "lead-006", vehicleId: "veh-006", type: "Inspection", date: day(1), time: "15:45", assignee: "Alex Morgan", status: "Confirmed" },
      { id: "apt-005", leadId: "lead-001", vehicleId: "veh-001", type: "Test drive", date: day(2), time: "12:00", assignee: "Alex Morgan", status: "Pending" },
      { id: "apt-006", leadId: "lead-007", vehicleId: "veh-005", type: "Inspection", date: day(3), time: "09:30", assignee: "Nikolay Ivanov", status: "Confirmed" }
    ],
    settings: {
      name: "DealerDesk Demo Showroom",
      phone: "+359 2 555 0100",
      email: "sales@dealerdesk.demo",
      address: "12 Showroom Boulevard, Sofia",
      workingHours: "Mon–Sat, 09:00–19:00",
      currency: "EUR",
      accent: "#166534",
      showFinancing: true,
      showTradeIn: true,
      autoPublish: false
    },
    activity: [
      { id: "act-001", label: "New website enquiry", detail: "Daniel Carter · BMW X5", at: "8 min ago", tone: "green" },
      { id: "act-002", label: "Vehicle reserved", detail: "Mercedes-Benz GLE 450", at: "42 min ago", tone: "blue" },
      { id: "act-003", label: "Test drive confirmed", detail: "Elena Georgieva · Range Rover Sport", at: "1 hr ago", tone: "amber" },
      { id: "act-004", label: "Price updated", detail: "Audi A6 Avant · €52,900", at: "3 hrs ago", tone: "neutral" }
    ]
  };
}

export const leadStages: LeadStage[] = ["New", "Contacted", "Qualified", "Test drive", "Negotiation", "Won", "Lost"];
