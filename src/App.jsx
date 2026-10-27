import { lazy, Suspense, useEffect, useMemo, useState } from "react";
const ModelViewer = lazy(() => import("./components/ModelViewer"));
import {
  BaselineForm,
  EmptyState,
  EntryForm,
  Icon,
  Metric,
  Modal,
  formatDate,
} from "./components/UI";
import {
  Atlas,
  CalculationLab,
  ServicePlan,
} from "./components/EngineeringPages";
import { defaultData } from "./data";
import {
  daysUntil,
  localDate,
  normalizeData,
  powerFlow,
  systems,
} from "./engineering";

const STORAGE_KEY = "maruti800AutomotiveDiary";
const navItems = [
  ["overview", "Workbench", "grid"],
  ["diary", "Engineering log", "book"],
  ["systems", "Subsystem atlas", "layers"],
  ["service", "Service & plans", "tool"],
  ["lab", "Calculation lab", "activity"],
];
const blankEntry = () => ({
  title: "",
  category: "Diary",
  date: localDate(),
  summary: "",
  details: "",
  confidence: "Observation",
  value: "",
  unit: "",
  conditions: "",
});

function App() {
  const [initial] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return {
        data: normalizeData(raw ? JSON.parse(raw) : defaultData),
        error: "",
      };
    } catch {
      return {
        data: normalizeData(defaultData),
        error:
          "Your saved record could not be read. The original is preserved. New changes remain in memory; export a backup to keep them.",
      };
    }
  });
  const [data, setData] = useState(initial.data);
  const [storageError, setStorageError] = useState(initial.error);
  const [vehicleId, setVehicleId] = useState(data.vehicles[0].id);
  const [nav, setNav] = useState("overview");
  const [modal, setModal] = useState(null);
  const [entry, setEntry] = useState(blankEntry);
  const [baseline, setBaseline] = useState({});
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All entries");
  const [systemId, setSystemId] = useState("fuel");
  const [flowIndex, setFlowIndex] = useState(0);
  const [toast, setToast] = useState("");
  const active =
    data.vehicles.find((v) => v.id === vehicleId) || data.vehicles[0];
  const pendingPlans = active.futurePlans.filter((p) => !p.done);
  const studied = systems.filter(
    (s) =>
      active.studies[s.id]?.status &&
      active.studies[s.id].status !== "Not started",
  ).length;
  const days = daysUntil(active.vehicle.nextServiceDue);
  const measurements = active.diaryEntries.filter(
    (e) => e.value !== "" && e.value != null,
  );
  const entries = useMemo(
    () =>
      active.diaryEntries
        .filter(
          (e) =>
            (category === "All entries" || e.category === category) &&
            `${e.title} ${e.summary} ${e.details}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) => b.date.localeCompare(a.date)),
    [active.diaryEntries, query, category],
  );

  useEffect(() => {
    if (initial.error) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setStorageError("");
    } catch {
      setStorageError(
        "Changes are in memory only. Device storage is unavailable or full. Export a backup to keep your work.",
      );
    }
  }, [data, initial.error]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  function updateActive(update) {
    setData((current) => ({
      ...current,
      vehicles: current.vehicles.map((v) =>
        v.id === active.id ? update(v) : v,
      ),
    }));
  }
  function navigate(id) {
    setNav(id);
    setQuery("");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function openEntry(preset = {}) {
    setEntry({ ...blankEntry(), ...preset });
    setModal("entry");
  }
  function editBaseline() {
    setBaseline({ ...active.vehicle });
    setModal("baseline");
  }
  function saveEntry(e) {
    e.preventDefault();
    if (!entry.title.trim()) return;
    updateActive((v) => ({
      ...v,
      diaryEntries: [
        { ...entry, title: entry.title.trim(), id: crypto.randomUUID() },
        ...v.diaryEntries,
      ],
    }));
    setModal(null);
    setToast("Entry added to your engineering log.");
  }
  function exportData(original = false) {
    try {
      const content = original
        ? localStorage.getItem(STORAGE_KEY)
        : JSON.stringify(data, null, 2);
      const url = URL.createObjectURL(
        new Blob([content || ""], { type: "application/json" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `maruti-engineering-${original ? "original-" : ""}${localDate()}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setToast("Backup exported.");
    } catch {
      setToast("Export could not be completed. Device storage is unavailable.");
    }
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <Icon name="activity" size={25} />
          </span>
          <span>WORKSHOP</span>
        </div>
        <nav aria-label="Main navigation">
          {navItems.map(([id, label, icon]) => (
            <button
              key={id}
              aria-label={label}
              title={label}
              className={`nav-item ${nav === id ? "active" : ""}`}
              aria-current={nav === id ? "page" : undefined}
              onClick={() => navigate(id)}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {id === "diary" && (
                <span className="nav-count">{active.diaryEntries.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button onClick={() => exportData()}>
            <Icon name="download" size={17} /> Export workspace
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <strong>{navItems.find(([id]) => id === nav)[1]}</strong>
          </div>
          <div className="topbar-actions">
            <span className="vehicle-select-wrap">
              <Icon name="car" size={18} />
              <select
                aria-label="Select vehicle"
                value={active.id}
                onChange={(e) => {
                  setVehicleId(e.target.value);
                  setModal(null);
                }}
              >
                {data.vehicles.map((v) => (
                  <option value={v.id} key={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </span>
            <div className="compact-actions">
              <button
                aria-label="Export workspace"
                title="Export workspace"
                onClick={() => exportData()}
              >
                <Icon name="download" size={17} />
              </button>
            </div>
          </div>
        </header>
        <main id="main-content" className="main-content">
          {storageError && (
            <div className="storage-warning" role="alert">
              {storageError}
              {initial.error && (
                <button
                  className="text-button"
                  onClick={() => exportData(true)}
                >
                  Export original record
                </button>
              )}
            </div>
          )}
          <section className="page-heading">
            <div>
              <h1>
                {
                  {
                    overview: "Workbench",
                    diary: "Engineering log",
                    systems: "Subsystem atlas",
                    service: "Service & plans",
                    lab: "Calculation lab",
                  }[nav]
                }
              </h1>
            </div>
            <button className="primary-button" onClick={() => openEntry()}>
              <Icon name="plus" size={18} /> New log entry
            </button>
          </section>

          {nav === "overview" && (
            <>
              <section className="overview-grid">
                <article className="vehicle-stage panel">
                  <div className="stage-heading">
                    <div>
                      <h2>{active.vehicle.name}</h2>
                      <span>{active.vehicle.variant}</span>
                    </div>
                  </div>
                  <Suspense
                    fallback={
                      <div className="model-viewer viewer-fallback">
                        Loading...
                      </div>
                    }
                  >
                    <ModelViewer key={active.id} url={active.modelUrl} />
                  </Suspense>
                  <div className="stage-specs">
                    <div>
                      <span>ENGINE BASELINE</span>
                      <strong>{active.vehicle.engine}</strong>
                    </div>
                    <div>
                      <span>TRANSMISSION</span>
                      <strong>{active.vehicle.transmission}</strong>
                    </div>
                    <button
                      className="icon-button"
                      aria-label="Edit vehicle baseline"
                      onClick={editBaseline}
                    >
                      <Icon name="edit" size={18} />
                    </button>
                  </div>
                </article>
                <div className="overview-side">
                  <article className="panel focus-card">
                    <h3>{pendingPlans[0]?.text || "No open tasks"}</h3>
                    <button
                      className="text-button"
                      onClick={() =>
                        navigate(pendingPlans.length ? "service" : "systems")
                      }
                    >
                      {pendingPlans.length ? "Service plan" : "Subsystems"}
                      <Icon name="arrow" size={17} />
                    </button>
                  </article>
                  <article className="panel service-summary">
                    <span className="icon-tile">
                      <Icon name="tool" />
                    </span>
                    <div>
                      <p>Next scheduled service</p>
                      <strong>
                        {formatDate(active.vehicle.nextServiceDue)}
                      </strong>
                      <small
                        className={days !== null && days < 0 ? "overdue" : ""}
                      >
                        {days === null
                          ? "Set a date in your vehicle baseline"
                          : days < 0
                            ? `${Math.abs(days)} days overdue`
                            : days === 0
                              ? "Due today"
                              : `In ${days} days`}{" "}
                        ·{" "}
                        <button onClick={() => navigate("service")}>
                          View
                        </button>
                      </small>
                    </div>
                  </article>
                </div>
              </section>
              <section className="metrics-grid" aria-label="Project progress">
                <Metric
                  icon="book"
                  value={String(active.diaryEntries.length).padStart(2, "0")}
                  label="Log entries"
                />
                <Metric
                  icon="layers"
                  value={String(studied).padStart(2, "0")}
                  suffix="/ 18"
                  label="Subsystems explored"
                />
                <Metric
                  icon="activity"
                  value={String(measurements.length).padStart(2, "0")}
                  label="Measurements recorded"
                />
                <Metric
                  icon="tool"
                  value={String(pendingPlans.length).padStart(2, "0")}
                  label="Open workshop tasks"
                />
              </section>
              <section className="panel flow-panel">
                <div className="section-heading">
                  <div>
                    <h2>Power flow</h2>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => {
                      setSystemId(powerFlow[flowIndex].id);
                      navigate("systems");
                    }}
                  >
                    Open subsystem <Icon name="arrow" size={17} />
                  </button>
                </div>
                <div className="power-flow" aria-label="Power flow stages">
                  {powerFlow.map((stage, index) => (
                    <button
                      key={stage.id}
                      aria-pressed={flowIndex === index}
                      className={`flow-step ${flowIndex === index ? "selected" : ""}`}
                      onClick={() => setFlowIndex(index)}
                    >
                      <span className="flow-top">
                        <span className="flow-number mono">0{index + 1}</span>
                        <Icon
                          name={
                            ["layers", "activity", "activity", "tool", "car"][
                              index
                            ]
                          }
                          size={19}
                        />
                      </span>
                      <strong>{stage.name}</strong>
                      <small>{stage.part}</small>
                      {index < 4 && <span className="flow-arrow">→</span>}
                    </button>
                  ))}
                </div>
              </section>
              <section className="bottom-grid">
                <article className="panel recent-panel">
                  <div className="section-heading">
                    <div>
                      <h2>Recent activity</h2>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => navigate("diary")}
                    >
                      View log <Icon name="arrow" size={16} />
                    </button>
                  </div>
                  {[...active.diaryEntries]
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .slice(0, 3)
                    .map((item) => (
                      <button
                        key={item.id}
                        className="recent-entry"
                        onClick={() => {
                          setEntry(item);
                          setModal("read");
                        }}
                      >
                        <span className="entry-timeline-dot" />
                        <div>
                          <span className="mono">
                            {formatDate(item.date)}{" "}
                            <span> / {item.category}</span>
                          </span>
                          <h3>{item.title}</h3>
                          <p>{item.summary}</p>
                        </div>
                        <Icon name="arrow" size={17} />
                      </button>
                    ))}
                  {!active.diaryEntries.length && (
                    <EmptyState
                      text="Your first observation starts the story."
                      onClick={() => openEntry()}
                    />
                  )}
                </article>
                <article className="panel notes-panel">
                  <div className="section-heading">
                    <div>
                      <h2>Bench notes</h2>
                    </div>
                    <Icon name="edit" size={18} />
                  </div>
                  <label className="sr-only" htmlFor="bench-notes">
                    Current vehicle notes
                  </label>
                  <textarea
                    id="bench-notes"
                    value={active.vehicle.notes}
                    onChange={(e) =>
                      updateActive((v) => ({
                        ...v,
                        vehicle: { ...v.vehicle, notes: e.target.value },
                      }))
                    }
                    placeholder="Notes"
                  />
                </article>
              </section>
            </>
          )}

          {nav === "diary" && (
            <>
              <div className="filter-bar">
                <label className="search-input">
                  <Icon name="search" size={18} />
                  <input
                    aria-label="Search log entries"
                    placeholder="Search observations, parts, experiments…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <select
                  aria-label="Filter entries by category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {[
                    "All entries",
                    "Diary",
                    "Service",
                    "Engineering study",
                    "Parts change",
                    "Measurement",
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <span className="mono muted">{entries.length} RECORDS</span>
              </div>
              <div className="log-grid">
                {entries.map((item) => (
                  <article className="panel log-card" key={item.id}>
                    <div className="section-heading">
                      <span className="badge">{item.category}</span>
                      <time className="mono">{formatDate(item.date)}</time>
                    </div>
                    <h2>{item.title}</h2>
                    <p>{item.summary}</p>
                    {item.value !== "" && item.value != null && (
                      <div className="measurement-value mono">
                        {item.value} <span>{item.unit}</span>
                        <small>
                          {item.conditions || "Conditions not recorded"}
                        </small>
                      </div>
                    )}
                    <div className="log-footer">
                      <span
                        className={`confidence ${item.confidence === "Confirmed" ? "confirmed" : ""}`}
                      >
                        <span className="status-dot" />{" "}
                        {item.confidence || "Observation"}
                      </span>
                      <button
                        className="text-button"
                        onClick={() => {
                          setEntry(item);
                          setModal("read");
                        }}
                      >
                        Read entry <Icon name="arrow" size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {!entries.length && (
                <EmptyState
                  text={
                    query || category !== "All entries"
                      ? "No entries match these filters."
                      : "Start with something you noticed about the car."
                  }
                  onClick={() => openEntry()}
                />
              )}
            </>
          )}
          {nav === "systems" && (
            <Atlas
              active={active}
              updateActive={updateActive}
              systemId={systemId}
              setSystemId={setSystemId}
              studied={studied}
              openEntry={openEntry}
            />
          )}
          {nav === "service" && (
            <ServicePlan
              key={active.id}
              active={active}
              updateActive={updateActive}
              editBaseline={editBaseline}
            />
          )}
          {nav === "lab" && (
            <CalculationLab active={active} openEntry={openEntry} />
          )}
        </main>
      </div>
      {modal === "entry" && (
        <EntryForm
          entry={entry}
          setEntry={setEntry}
          onSave={saveEntry}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "baseline" && (
        <BaselineForm
          baseline={baseline}
          setBaseline={setBaseline}
          onSave={(e) => {
            e.preventDefault();
            updateActive((v) => ({
              ...v,
              name: baseline.name,
              vehicle: baseline,
            }));
            setModal(null);
            setToast("Vehicle baseline updated.");
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "read" && (
        <Modal title={entry.title} onClose={() => setModal(null)}>
          <div className="read-entry">
            <span className="badge">{entry.confidence || "Observation"}</span>
            <p>{entry.summary}</p>
            <div className="entry-details">
              {entry.details || "No additional details recorded."}
            </div>
            {entry.value !== "" && entry.value != null && (
              <div className="measurement-value mono">
                {entry.value} <span>{entry.unit}</span>
                <small>{entry.conditions}</small>
              </div>
            )}
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}
export default App;
