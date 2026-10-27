import { useEffect, useRef } from "react";

export function Icon({ name = "grid", size = 20, ...props }) {
  const paths = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    book: (
      <>
        <path d="M4 4h7a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H4zM14 7a3 3 0 0 1 3-3h4v15h-4a3 3 0 0 0-3 2" />
        <path d="M7 8h3M7 12h3" />
      </>
    ),
    layers: <path d="m12 3 10 6-10 6L2 9zM3 14l9 5 9-5M3 18l9 5 9-5" />,
    tool: (
      <path d="M14 6a5 5 0 0 0-6 6L3 17a3 3 0 0 0 4 4l5-5a5 5 0 0 0 6-6l-3 3-4-4z" />
    ),
    activity: <path d="M2 12h4l3-8 5 16 3-8h5" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    plus: <path d="M12 5v14M5 12h14" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />,
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
      </>
    ),
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 6 6" />
      </>
    ),
    fuel: (
      <>
        <path d="M6 21V4h10v17M4 21h14" />
        <path d="M9 8h4M16 7h2l2 2v6a2 2 0 0 0 4 0v-4" />
      </>
    ),
    car: (
      <path d="m4 10 2-6h12l2 6M3 10h18v8H3zM5 18v3M19 18v3M6 14h2M16 14h2" />
    ),
    edit: <path d="m4 16 12-12 4 4L8 20H4zM13 7l4 4" />,
    cube: <path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10M7 4l10 6" />,
    reset: <path d="M3 10a9 9 0 1 1 1 8M3 4v6h6" />,
    pause: <path d="M8 5v14M16 5v14" />,
    play: <path d="m7 4 14 8-14 8z" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name] || paths.grid}
    </svg>
  );
}

export function Modal({ title, children, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      dialog.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="modal-title"
    >
      <div className="modal-inner">
        <header className="section-heading">
          <h2 id="modal-title">{title}</h2>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}

export function Metric({ icon, value, suffix, label, detail }) {
  return (
    <article className="metric panel">
      <div>
        <span>{label}</span>
        <Icon name={icon} size={18} />
      </div>
      <strong className="mono">
        {value}
        <small>{suffix}</small>
      </strong>
      {detail && <p>{detail}</p>}
    </article>
  );
}
export function EmptyState({ text, onClick }) {
  return (
    <div className="empty-state panel">
      <Icon name="book" size={28} />
      <p>{text}</p>
      <button className="secondary-button" onClick={onClick}>
        New log entry <Icon name="plus" size={17} />
      </button>
    </div>
  );
}
export const formatDate = (date) =>
  date
    ? new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not scheduled";

export function EntryForm({ entry, setEntry, onSave, onClose }) {
  return (
    <Modal title="New log entry" onClose={onClose}>
      <form onSubmit={onSave} className="entry-form">
        <label>
          Title
          <input
            autoFocus
            value={entry.title}
            required
            maxLength={180}
            onChange={(e) => setEntry({ ...entry, title: e.target.value })}
            placeholder="e.g. Cold idle observation"
          />
        </label>
        <div className="form-grid">
          <label>
            Category
            <select
              value={entry.category}
              onChange={(e) => setEntry({ ...entry, category: e.target.value })}
            >
              {[
                "Diary",
                "Service",
                "Engineering study",
                "Parts change",
                "Measurement",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input
              required
              type="date"
              value={entry.date}
              onChange={(e) => setEntry({ ...entry, date: e.target.value })}
            />
          </label>
        </div>
        <label>
          Evidence status
          <select
            value={entry.confidence}
            onChange={(e) => setEntry({ ...entry, confidence: e.target.value })}
          >
            {["Observation", "Hypothesis", "Confirmed"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Summary
          <input
            value={entry.summary}
            onChange={(e) => setEntry({ ...entry, summary: e.target.value })}
            placeholder="What did you observe or change?"
          />
        </label>
        <label>
          Details
          <textarea
            rows={4}
            value={entry.details}
            onChange={(e) => setEntry({ ...entry, details: e.target.value })}
            placeholder="Details"
          />
        </label>
        <details
          className="measurement-form"
          open={entry.category === "Measurement" || undefined}
        >
          <summary>
            Attach a measurement{" "}
            <span className="mono">VALUE / UNIT / CONDITIONS</span>
          </summary>
          <div className="form-grid">
            <label>
              Measured value
              <input
                type="number"
                step="any"
                value={entry.value}
                onChange={(e) => setEntry({ ...entry, value: e.target.value })}
              />
            </label>
            <label>
              Unit
              <input
                required={entry.value !== ""}
                placeholder="e.g. V, rpm, °C"
                value={entry.unit}
                onChange={(e) => setEntry({ ...entry, unit: e.target.value })}
              />
            </label>
          </div>
          <label>
            Operating conditions
            <input
              required={entry.value !== ""}
              value={entry.conditions}
              onChange={(e) =>
                setEntry({ ...entry, conditions: e.target.value })
              }
              placeholder="e.g. Engine off, ambient 28 °C; instrument used"
            />
          </label>
        </details>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button">
            Save log entry <Icon name="check" size={17} />
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function BaselineForm({ baseline, setBaseline, onSave, onClose }) {
  return (
    <Modal title="Vehicle baseline" onClose={onClose}>
      <form className="entry-form" onSubmit={onSave}>
        {[
          ["name", "Vehicle name"],
          ["engine", "Engine"],
          ["variant", "Variant"],
          ["transmission", "Transmission"],
          ["odometer", "Odometer"],
          ["tyres", "Wheels & tyres"],
        ].map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              required={key === "name"}
              value={baseline[key]}
              onChange={(e) =>
                setBaseline({ ...baseline, [key]: e.target.value })
              }
            />
          </label>
        ))}
        <label>
          Next service due
          <input
            type="date"
            value={baseline.nextServiceDue}
            onChange={(e) =>
              setBaseline({ ...baseline, nextServiceDue: e.target.value })
            }
          />
        </label>
        <div className="modal-actions">
          <button className="primary-button">
            Save baseline <Icon name="check" size={17} />
          </button>
        </div>
      </form>
    </Modal>
  );
}
