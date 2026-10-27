export const systems = [
  [
    "air",
    "Air induction",
    "Air cleaner · intake hose · carburettor · manifold",
    "How does throttle position change airflow?",
    "Air",
  ],
  [
    "fuel",
    "Fuel delivery",
    "Tank · lines · filter · mechanical pump · float chamber",
    "How is fuel pressure and float level controlled?",
    "Fuel",
  ],
  [
    "combustion",
    "Combustion",
    "Cylinders · pistons · valves · spark plugs",
    "What occurs during each 180° of crank rotation?",
    "Power",
  ],
  [
    "ignition",
    "Ignition",
    "Coil · distributor · leads · plugs · timing mechanism",
    "How is one spark routed to the correct cylinder?",
    "Electrical",
  ],
  [
    "cooling",
    "Cooling",
    "Radiator · pump · thermostat · fan · hoses",
    "How does coolant temperature control circulation?",
    "Thermal",
  ],
  [
    "oil",
    "Lubrication",
    "Sump · pickup · pump · galleries · filter",
    "How does oil reach loaded bearings after startup?",
    "Fluid",
  ],
  [
    "starting",
    "Starting",
    "Battery · ignition switch · solenoid · starter",
    "Why does the starter need high current and gear reduction?",
    "Electrical",
  ],
  [
    "charging",
    "Charging",
    "Alternator · regulator · belt · battery",
    "How is system voltage maintained as load changes?",
    "Electrical",
  ],
  [
    "clutch",
    "Clutch",
    "Flywheel · friction disc · pressure plate · release system",
    "How is engine torque progressively coupled?",
    "Power",
  ],
  [
    "gearbox",
    "Gearbox",
    "Input/output shafts · gear pairs · synchronisers",
    "How do ratios trade wheel speed for torque?",
    "Power",
  ],
  [
    "drive",
    "Final drive",
    "Differential · crown wheel · pinion · driveshafts",
    "How can driven wheels rotate at different speeds?",
    "Power",
  ],
  [
    "steering",
    "Steering",
    "Wheel · column · rack · tie rods · knuckles",
    "How is steering-wheel motion converted into road-wheel angle?",
    "Chassis",
  ],
  [
    "front",
    "Front suspension",
    "Struts · springs · arms · joints",
    "Which components locate the wheel and carry load?",
    "Chassis",
  ],
  [
    "rear",
    "Rear suspension",
    "Springs · dampers · links / axle arrangement",
    "How are vertical motion and body roll controlled?",
    "Chassis",
  ],
  [
    "brakes",
    "Brakes",
    "Pedal · booster · master cylinder · lines · calipers / drums",
    "How is pedal force multiplied and distributed?",
    "Chassis",
  ],
  [
    "wheels",
    "Wheels & tyres",
    "Rims · tyres · bearings · hubs",
    "How do pressure and alignment influence grip and wear?",
    "Chassis",
  ],
  [
    "body",
    "Body & structure",
    "Shell · subframes · mounts · closures",
    "Where do powertrain and suspension loads enter the body?",
    "Structure",
  ],
  [
    "instruments",
    "Instruments",
    "Fuel gauge · temperature indication · warning lamps",
    "How does each sender become a dashboard indication?",
    "Electrical",
  ],
].map(([id, name, components, question, group]) => ({
  id,
  name,
  components,
  question,
  group,
}));

export const studyStates = [
  "Not started",
  "Located",
  "Studied",
  "Measured",
  "Modelled",
  "Verified",
];
export const powerFlow = [
  {
    id: "fuel",
    name: "Fuel delivery",
    part: "Tank → pump",
    input: "Stored fuel",
    output: "Fuel supplied to the carburettor",
    question:
      "Trace the fuel path. Identify the filter, lines, and pump on the actual vehicle.",
  },
  {
    id: "air",
    name: "Mixture formation",
    part: "Carburettor → intake",
    input: "Air + fuel",
    output: "Combustible mixture",
    question:
      "Locate the throttle linkage and trace the intake path. Record what is visible and what still needs verification.",
  },
  {
    id: "combustion",
    name: "Energy conversion",
    part: "Cylinder → crankshaft",
    input: "Mixture + ignition",
    output: "Rotational mechanical work",
    question:
      "Explain the connection from piston to connecting rod to crankshaft. Mark concealed components explicitly.",
  },
  {
    id: "gearbox",
    name: "Torque transfer",
    part: "Clutch → gearbox",
    input: "Engine rotation",
    output: "Rotation at a selected ratio",
    question:
      "Follow the flywheel, clutch, and gearbox sequence. Verify transmission specifications from the vehicle record.",
  },
  {
    id: "drive",
    name: "Road contact",
    part: "Differential → wheels",
    input: "Gearbox output",
    output: "Drive at the front wheels",
    question:
      "Locate the driveshafts and wheel hubs. Explain how the differential allows different wheel speeds.",
  },
];

export const observations = [
  "Rough cold idle, with occasional stalling; smoother after warming.",
  "Fuel-gauge response has been questionable.",
  "Accelerator cable previously resisted returning and was replaced.",
  "Rhythmic exhaust water vapour and dark residue have been observed.",
];

export function localDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function daysUntil(date, today = localDate()) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const difference =
    (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) /
    86400000;
  return Number.isFinite(difference) ? Math.round(difference) : null;
}

export function normalizeData(value) {
  if (!value || !Array.isArray(value.vehicles) || !value.vehicles.length)
    throw new Error("No vehicle records found.");
  const ids = new Set();
  return {
    ...value,
    vehicles: value.vehicles.map((v) => {
      if (
        !v.id ||
        typeof v.id !== "string" ||
        ids.has(v.id) ||
        !v.vehicle ||
        typeof v.vehicle !== "object" ||
        !Array.isArray(v.diaryEntries) ||
        !Array.isArray(v.futurePlans)
      )
        throw new Error("Invalid vehicle record.");
      ids.add(v.id);
      const vehicle = { ...v.vehicle };
      for (const field of [
        "name",
        "engine",
        "variant",
        "transmission",
        "odometer",
        "nextServiceDue",
        "tyres",
        "notes",
      ]) {
        if (typeof vehicle[field] !== "string") vehicle[field] = "";
      }
      const diaryEntries = v.diaryEntries.map((entry) => {
        if (
          !entry ||
          !["string", "number"].includes(typeof entry.id) ||
          typeof entry.title !== "string" ||
          typeof entry.date !== "string" ||
          !Number.isFinite(Date.parse(`${entry.date}T12:00:00Z`))
        )
          throw new Error("Invalid diary entry.");
        for (const field of [
          "category",
          "summary",
          "details",
          "confidence",
          "unit",
          "conditions",
        ]) {
          if (entry[field] != null && typeof entry[field] !== "string")
            throw new Error("Invalid diary text.");
        }
        if (
          entry.value != null &&
          !["string", "number"].includes(typeof entry.value)
        )
          throw new Error("Invalid measurement value.");
        return { category: "Diary", summary: "", details: "", ...entry };
      });
      const futurePlans = v.futurePlans.map((plan, index) => {
        if (typeof plan === "string")
          return { id: `${v.id}-plan-${index}`, text: plan, done: false };
        if (
          !plan ||
          typeof plan.text !== "string" ||
          typeof plan.id !== "string" ||
          typeof plan.done !== "boolean"
        )
          throw new Error("Invalid workshop task.");
        return { ...plan };
      });
      if (v.fuelEntries != null && !Array.isArray(v.fuelEntries))
        throw new Error("Invalid fuel logbook.");
      const fuelEntries = (v.fuelEntries || []).map((fill) => {
        if (
          !fill ||
          !["string", "number"].includes(typeof fill.id) ||
          typeof fill.date !== "string" ||
          !Number.isFinite(Date.parse(`${fill.date}T12:00:00Z`)) ||
          !Number.isFinite(Number(fill.odometer)) ||
          Number(fill.odometer) < 0 ||
          !Number.isFinite(Number(fill.amountPaid)) ||
          Number(fill.amountPaid) <= 0 ||
          !Number.isFinite(Number(fill.pricePerLitre)) ||
          Number(fill.pricePerLitre) <= 0
        )
          throw new Error("Invalid fuel fill record.");
        return {
          ...fill,
          odometer: Number(fill.odometer),
          amountPaid: Number(fill.amountPaid),
          pricePerLitre: Number(fill.pricePerLitre),
        };
      });
      const studies = v.studies || {};
      if (typeof studies !== "object" || Array.isArray(studies))
        throw new Error("Invalid subsystem studies.");
      for (const item of Object.values(studies)) {
        if (
          !item ||
          typeof item !== "object" ||
          (item.notes != null && typeof item.notes !== "string") ||
          (item.status != null && !studyStates.includes(item.status))
        )
          throw new Error("Invalid subsystem study.");
      }
      return {
        ...v,
        name: typeof v.name === "string" ? v.name : vehicle.name,
        vehicle,
        diaryEntries,
        fuelEntries,
        studies,
        futurePlans,
      };
    }),
  };
}

export function calculateFuelEconomy(entries) {
  return [...entries]
    .sort(
      (a, b) =>
        a.odometer - b.odometer || a.date.localeCompare(b.date),
    )
    .map((fill, index, sorted) => {
      const litres = fill.amountPaid / fill.pricePerLitre;
      const previous = sorted[index - 1];
      const distance = previous ? fill.odometer - previous.odometer : null;
      return {
        ...fill,
        litres,
        distance,
        kmPerLitre: distance != null && distance > 0 ? distance / litres : null,
      };
    });
}

export function calculateDrivetrain({
  torque,
  rpm,
  gear,
  finalDrive,
  efficiency,
  diameter,
}) {
  const values = [torque, rpm, gear, finalDrive, efficiency, diameter].map(
    Number,
  );
  if (values.some((v) => !Number.isFinite(v) || v <= 0) || values[4] > 100)
    return null;
  const [t, r, g, f, e, d] = values;
  const output = {
    power: (t * r * 2 * Math.PI) / 60000,
    wheelTorque: (t * g * f * e) / 100,
    speed: ((r / (g * f)) * Math.PI * (d / 1000) * 60) / 1000,
  };
  return Object.values(output).every(Number.isFinite) ? output : null;
}
