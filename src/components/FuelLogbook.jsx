import { useState } from "react";
import { calculateFuelEconomy, localDate } from "../engineering";
import { Icon } from "./UI";

export default function FuelLogbook({ active, updateActive }) {
  const [fill, setFill] = useState({
    date: localDate(),
    odometer: "",
    amountPaid: "",
    pricePerLitre: "",
  });
  const [error, setError] = useState("");
  const records = calculateFuelEconomy(active.fuelEntries || []);
  const latest = records.at(-1);
  const litres = Number(fill.amountPaid) / Number(fill.pricePerLitre);
  const distance = Number(fill.odometer) - (latest?.odometer ?? 0);
  const previewMileage =
    latest && Number.isFinite(distance) && distance > 0 && litres > 0
      ? distance / litres
      : null;

  function saveFill(event) {
    event.preventDefault();
    const odometer = Number(fill.odometer);
    const amountPaid = Number(fill.amountPaid);
    const pricePerLitre = Number(fill.pricePerLitre);
    if (
      !fill.date ||
      !Number.isFinite(odometer) ||
      odometer < 0 ||
      !Number.isFinite(amountPaid) ||
      amountPaid <= 0 ||
      !Number.isFinite(pricePerLitre) ||
      pricePerLitre <= 0
    ) {
      setError("Enter a date, odometer reading, fuel cost, and price per litre.");
      return;
    }
    if (latest && odometer <= latest.odometer) {
      setError(
        "The odometer must be higher than the last fill (" +
          latest.odometer.toLocaleString("en-IN") +
          " km).",
      );
      return;
    }
    updateActive((vehicle) => ({
      ...vehicle,
      fuelEntries: [
        ...(vehicle.fuelEntries || []),
        {
          id: crypto.randomUUID(),
          date: fill.date,
          odometer,
          amountPaid,
          pricePerLitre,
        },
      ],
    }));
    setFill({ date: localDate(), odometer: "", amountPaid: "", pricePerLitre: "" });
    setError("");
  }

  function removeFill(id) {
    if (
      !window.confirm(
        "Remove this fuel fill? Mileage intervals will be recalculated.",
      )
    )
      return;
    updateActive((vehicle) => ({
      ...vehicle,
      fuelEntries: vehicle.fuelEntries.filter((item) => item.id !== id),
    }));
  }

  return (
    <div className="fuel-page">
      <p className="fuel-intro">
        Record each full-tank fill. Litres are calculated from the amount paid
        and pump price; mileage uses the kilometres since the previous fill.
      </p>
      <section className="fuel-summary" aria-label="Fuel economy summary">
        <article className="panel fuel-metric">
          <span>Latest mileage</span>
          <strong className="mono accent">
            {latest?.kmPerLitre != null ? latest.kmPerLitre.toFixed(2) : "—"}
            <small> km/L</small>
          </strong>
          <small>
            {latest?.kmPerLitre != null
              ? "Most recent full-tank interval"
              : "Log two fills to calculate mileage"}
          </small>
        </article>
        <article className="panel fuel-metric">
          <span>Latest fill</span>
          <strong className="mono">
            {latest ? latest.litres.toFixed(2) : "—"}<small> L</small>
          </strong>
          <small>
            {latest
              ? `₹${latest.amountPaid.toLocaleString("en-IN")} at ₹${latest.pricePerLitre.toFixed(2)}/L`
              : "Fuel amount will be converted to litres"}
          </small>
        </article>
        <article className="panel fuel-metric">
          <span>Fill records</span>
          <strong className="mono">{records.length}</strong>
          <small>
            {latest
              ? `Latest odometer: ${latest.odometer.toLocaleString("en-IN")} km`
              : "First fill sets the odometer baseline"}
          </small>
        </article>
      </section>
      <div className="fuel-layout">
        <form className="panel fuel-form" onSubmit={saveFill}>
          <div>
            <span className="eyebrow">NEW RECORD</span>
            <h2>Log a fuel fill</h2>
          </div>
          <label>
            Fill date
            <input
              type="date"
              value={fill.date}
              onChange={(event) =>
                setFill((current) => ({ ...current, date: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Odometer reading
            <div className="unit-input">
              <input
                aria-label="Odometer reading in kilometres"
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g. 84520"
                value={fill.odometer}
                onChange={(event) =>
                  setFill((current) => ({ ...current, odometer: event.target.value }))
                }
                required
              />
              <span>km</span>
            </div>
          </label>
          <label>
            Amount paid
            <div className="unit-input">
              <input
                aria-label="Total amount paid for fuel in rupees"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 1000"
                value={fill.amountPaid}
                onChange={(event) =>
                  setFill((current) => ({ ...current, amountPaid: event.target.value }))
                }
                required
              />
              <span>₹</span>
            </div>
          </label>
          <label>
            Petrol price per litre
            <div className="unit-input">
              <input
                aria-label="Petrol price per litre in rupees"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 103.50"
                value={fill.pricePerLitre}
                onChange={(event) =>
                  setFill((current) => ({
                    ...current,
                    pricePerLitre: event.target.value,
                  }))
                }
                required
              />
              <span>₹/L</span>
            </div>
          </label>
          {Number.isFinite(litres) && litres > 0 && (
            <div className="fuel-preview" aria-live="polite">
              <span>Amount converted to fuel</span>
              <strong className="mono">{litres.toFixed(2)} L</strong>
              {previewMileage != null && (
                <small>
                  Estimated interval: {distance.toFixed(1)} km ·{" "}
                  {previewMileage.toFixed(2)} km/L
                </small>
              )}
            </div>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="primary-button">
            <Icon name="plus" size={17} /> Save fuel fill
          </button>
          <p className="fuel-method">
            For accurate km/L, fill the tank to the same level each time. The
            first record is the baseline; mileage is calculated from the
            distance between consecutive fills.
          </p>
        </form>
        <section className="fuel-history" aria-label="Fuel fill history">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FULL-TANK LOG</span>
              <h2>Fill history</h2>
            </div>
            <span className="mono muted">{records.length} FILLS</span>
          </div>
          {records.length ? (
            [...records].reverse().map((record) => (
              <article className="panel fuel-record" key={record.id}>
                <div className="fuel-record-heading">
                  <time className="mono">{record.date}</time>
                  <button
                    className="text-button"
                    onClick={() => removeFill(record.id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="fuel-record-stats">
                  <div>
                    <span>Odometer</span>
                    <strong className="mono">
                      {record.odometer.toLocaleString("en-IN")} <small>km</small>
                    </strong>
                  </div>
                  <div>
                    <span>Fuel added</span>
                    <strong className="mono">
                      {record.litres.toFixed(2)} <small>L</small>
                    </strong>
                  </div>
                  <div>
                    <span>Amount paid</span>
                    <strong className="mono">
                      ₹{record.amountPaid.toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <div>
                    <span>Distance</span>
                    <strong className="mono">
                      {record.distance == null
                        ? "Baseline"
                        : `${record.distance.toLocaleString("en-IN")} km`}
                    </strong>
                  </div>
                </div>
                <div className="fuel-record-result">
                  <strong className="mono">
                    {record.kmPerLitre == null
                      ? "First fill · baseline"
                      : `${record.kmPerLitre.toFixed(2)} km/L`}
                  </strong>
                  <span>
                    {record.kmPerLitre == null
                      ? `Petrol price ₹${record.pricePerLitre.toFixed(2)}/L`
                      : `${record.distance.toLocaleString("en-IN")} km ÷ ${record.litres.toFixed(2)} L`}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <div className="panel empty-state fuel-empty">
              <Icon name="fuel" size={27} />
              <p>
                No fuel fills recorded yet. Add your first fill to set the
                odometer baseline.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
