import { useState } from "react";
import {
  calculateDrivetrain,
  observations,
  studyStates,
  systems,
} from "../engineering";
import { Icon } from "./UI";

export function Atlas({
  active,
  updateActive,
  systemId,
  setSystemId,
  studied,
  openEntry,
}) {
  const currentSystem = systems.find((s) => s.id === systemId);
  const study = active.studies[systemId] || {
    status: "Not started",
    notes: "",
  };
  function saveStudy(field, value) {
    updateActive((v) => ({
      ...v,
      studies: {
        ...v.studies,
        [systemId]: { ...v.studies[systemId], [field]: value },
      },
    }));
  }
  return (
    <>
      <div className="atlas-progress panel">
        <Icon name="layers" />
        <span>
          <strong>{studied} of 18</strong> subsystems explored
        </span>
        <div className="progress-track">
          <span style={{ width: `${(studied / 18) * 100}%` }} />
        </div>
        <span className="mono">{Math.round((studied / 18) * 100)}%</span>
      </div>
      <div className="atlas-layout">
        <div className="panel system-list">
          {systems.map((s, i) => (
            <button
              key={s.id}
              className={systemId === s.id ? "selected" : ""}
              aria-pressed={systemId === s.id}
              onClick={() => setSystemId(s.id)}
            >
              <span className="mono">{String(i + 1).padStart(2, "0")}</span>
              <span>{s.name}</span>
              <span
                className={`system-state ${active.studies[s.id]?.status && active.studies[s.id]?.status !== "Not started" ? "started" : ""}`}
              />
            </button>
          ))}
        </div>
        <article className="panel system-detail">
          <div className="section-heading">
            <span className="badge">{currentSystem.group}</span>
          </div>
          <h2>{currentSystem.name}</h2>
          <p className="system-question">{currentSystem.question}</p>
          <div className="system-components">
            <div>
              {currentSystem.components.split(" · ").map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
          </div>
          <label>
            Study progress
            <select
              value={study.status || "Not started"}
              onChange={(e) => saveStudy("status", e.target.value)}
            >
              {studyStates.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Engineering notes
            <textarea
              rows={8}
              value={study.notes || ""}
              onChange={(e) => saveStudy("notes", e.target.value)}
              placeholder="Notes"
            />
          </label>
          <button
            className="secondary-button"
            onClick={() =>
              openEntry({
                title: `${currentSystem.name} study`,
                category: "Engineering study",
                summary: currentSystem.question,
                details: study.notes || "",
              })
            }
          >
            Add study to log <Icon name="plus" size={16} />
          </button>
        </article>
      </div>
    </>
  );
}

export function ServicePlan({ active, updateActive, editBaseline }) {
  const [planText, setPlanText] = useState("");
  const completed = active.futurePlans.filter((p) => p.done).length;
  const percent = active.futurePlans.length
    ? Math.round((completed / active.futurePlans.length) * 100)
    : 0;
  return (
    <div className="service-layout">
      <div>
        <article className="panel plan-panel">
          <div className="section-heading">
            <h2>Tasks</h2>
            <span className="badge">
              {active.futurePlans.length - completed} open
            </span>
          </div>
          <div className="progress-label">
            <span>
              {completed} of {active.futurePlans.length} completed
            </span>
            <span className="mono">{percent}%</span>
          </div>
          <div className="progress-track">
            <span style={{ width: `${percent}%` }} />
          </div>
          <div className="task-list">
            {active.futurePlans.map((plan, index) => (
              <div className={`task ${plan.done ? "done" : ""}`} key={plan.id}>
                <input
                  type="checkbox"
                  aria-label={`Complete task: ${plan.text}`}
                  checked={plan.done}
                  onChange={(e) =>
                    updateActive((v) => ({
                      ...v,
                      futurePlans: v.futurePlans.map((p) =>
                        p.id === plan.id ? { ...p, done: e.target.checked } : p,
                      ),
                    }))
                  }
                />
                <input
                  className="task-text"
                  aria-label={`Task ${index + 1}`}
                  value={plan.text}
                  onChange={(e) =>
                    updateActive((v) => ({
                      ...v,
                      futurePlans: v.futurePlans.map((p) =>
                        p.id === plan.id ? { ...p, text: e.target.value } : p,
                      ),
                    }))
                  }
                />
                <span className="mono">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
          <form
            className="add-plan"
            onSubmit={(e) => {
              e.preventDefault();
              if (!planText.trim()) return;
              updateActive((v) => ({
                ...v,
                futurePlans: [
                  ...v.futurePlans,
                  {
                    id: crypto.randomUUID(),
                    text: planText.trim(),
                    done: false,
                  },
                ],
              }));
              setPlanText("");
            }}
          >
            <input
              aria-label="New workshop task"
              placeholder="New task"
              value={planText}
              onChange={(e) => setPlanText(e.target.value)}
              required
            />
            <button className="primary-button" aria-label="Add workshop task">
              <Icon name="plus" size={19} />
            </button>
          </form>
        </article>
        {active.id === "maruti-800" && (
          <article className="panel observations-panel">
            <h2>Observations</h2>
            {observations.map((o, i) => (
              <div key={o}>
                <span className="mono accent">0{i + 1}</span>
                <p>{o}</p>
              </div>
            ))}
          </article>
        )}
      </div>
      <article className="panel baseline-card">
        <div className="section-heading">
          <h2>Vehicle baseline</h2>
          <button
            className="icon-button"
            aria-label="Edit vehicle baseline"
            onClick={editBaseline}
          >
            <Icon name="edit" size={17} />
          </button>
        </div>
        <dl>
          {[
            ["engine", "Engine"],
            ["variant", "Variant"],
            ["transmission", "Transmission"],
            ["odometer", "Odometer"],
            ["tyres", "Wheels & tyres"],
          ].map(([key, label]) => (
            <div key={key}>
              <dt>{label}</dt>
              <dd>{active.vehicle[key] || "Not recorded"}</dd>
            </div>
          ))}
        </dl>
        <label>
          Next service date
          <input
            type="date"
            value={active.vehicle.nextServiceDue}
            onChange={(e) =>
              updateActive((v) => ({
                ...v,
                vehicle: { ...v.vehicle, nextServiceDue: e.target.value },
              }))
            }
          />
        </label>
      </article>
    </div>
  );
}

export function CalculationLab({ openEntry }) {
  const [calculation, setCalculation] = useState({
    torque: 60,
    rpm: 3000,
    gear: 1.3,
    finalDrive: 4.1,
    efficiency: 85,
    diameter: 530,
  });
  const results = calculateDrivetrain(calculation);
  return (
    <>
      <div className="lab-layout">
        <article className="panel lab-inputs">
          <h2>Inputs</h2>
          {[
            ["torque", "Engine torque", "N·m"],
            ["rpm", "Engine speed", "rpm"],
            ["gear", "Gear ratio", ": 1"],
            ["finalDrive", "Final-drive ratio", ": 1"],
            ["efficiency", "Drivetrain efficiency", "%"],
            ["diameter", "Rolling tyre diameter", "mm"],
          ].map(([key, label, unit]) => (
            <label key={key}>
              {label}
              <div className="unit-input">
                <input
                  type="number"
                  min="0.001"
                  max={key === "efficiency" ? 100 : undefined}
                  step="any"
                  value={calculation[key]}
                  onChange={(e) =>
                    setCalculation((c) => ({ ...c, [key]: e.target.value }))
                  }
                />
                <span>{unit}</span>
              </div>
            </label>
          ))}
        </article>
        <article className="panel lab-results">
          <h2>Results</h2>
          {results ? (
            <>
              <div className="result">
                <span>Engine power</span>
                <strong className="mono">
                  {results.power.toFixed(2)} <small>kW</small>
                </strong>
                <code>P = T × 2π × rpm / 60,000</code>
              </div>
              <div className="result">
                <span>Combined driven-wheel torque</span>
                <strong className="mono">
                  {results.wheelTorque.toFixed(1)} <small>N·m</small>
                </strong>
                <code>Tw = T × gear × final drive × η</code>
              </div>
              <div className="result">
                <span>Theoretical road speed</span>
                <strong className="mono accent">
                  {results.speed.toFixed(1)} <small>km/h</small>
                </strong>
                <code>v = rpm × π × D × 60 / (gear × final drive × 10⁶)</code>
              </div>
              <button
                className="secondary-button"
                onClick={() =>
                  openEntry({
                    title: "Drivetrain calculation",
                    category: "Engineering study",
                    confidence: "Hypothesis",
                    summary: `${results.power.toFixed(2)} kW · ${results.wheelTorque.toFixed(1)} N·m at wheels · ${results.speed.toFixed(1)} km/h (theoretical)`,
                    details: `Illustrative inputs, not vehicle measurements: torque ${calculation.torque} N·m; engine speed ${calculation.rpm} rpm; gear ${calculation.gear}; final drive ${calculation.finalDrive}; efficiency ${calculation.efficiency}%; diameter ${calculation.diameter} mm. Assumes no slip.`,
                  })
                }
              >
                Record calculation <Icon name="book" size={17} />
              </button>
            </>
          ) : (
            <div className="empty-state">
              <p>
                Enter positive values for every input, with efficiency at or
                below 100%.
              </p>
            </div>
          )}
        </article>
      </div>
    </>
  );
}
