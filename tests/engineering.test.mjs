import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateDrivetrain,
  daysUntil,
  normalizeData,
} from "../src/engineering.js";

const vehicle = {
  id: "test",
  vehicle: { name: "My car", notes: "Keep my notes" },
  diaryEntries: [
    {
      id: 1,
      date: "2026-09-10",
      title: "Original entry",
      details: "Keep my evidence",
    },
  ],
  futurePlans: ["Original task"],
};
test("legacy records migrate without losing notes, entries, or task text", () => {
  const original = { vehicles: [structuredClone(vehicle)] };
  const before = structuredClone(original);
  const migrated = normalizeData(original);
  assert.deepEqual(original, before);
  assert.equal(migrated.vehicles[0].vehicle.notes, "Keep my notes");
  assert.equal(
    migrated.vehicles[0].diaryEntries[0].details,
    "Keep my evidence",
  );
  assert.deepEqual(migrated.vehicles[0].futurePlans[0], {
    id: "test-plan-0",
    text: "Original task",
    done: false,
  });
  assert.deepEqual(normalizeData(migrated), migrated);
});
test("malformed saved records are rejected before the app can overwrite them", () => {
  for (const value of [
    null,
    {},
    { vehicles: [] },
    { vehicles: [vehicle, vehicle] },
    { vehicles: [{ ...vehicle, futurePlans: [null] }] },
    { vehicles: [{ ...vehicle, diaryEntries: [null] }] },
    { vehicles: [{ ...vehicle, studies: { fuel: { notes: 12 } } }] },
  ])
    assert.throws(() => normalizeData(value));
});
test("service countdown uses calendar days and handles missing or overdue dates", () => {
  assert.equal(daysUntil("2026-10-15", "2026-09-11"), 34);
  assert.equal(daysUntil("2026-09-10", "2026-09-11"), -1);
  assert.equal(daysUntil("2026-09-11", "2026-09-11"), 0);
  assert.equal(daysUntil("2027-01-01", "2026-12-31"), 1);
  assert.equal(daysUntil(""), null);
  assert.equal(daysUntil("not a date"), null);
});
const inputs = {
  torque: 100,
  rpm: 6000,
  gear: 2,
  finalDrive: 4,
  efficiency: 80,
  diameter: 500,
};
test("drivetrain equations preserve units and the speed/torque tradeoff", () => {
  const result = calculateDrivetrain(inputs);
  assert.ok(Math.abs(result.power - 20 * Math.PI) < 1e-9);
  assert.equal(result.wheelTorque, 640);
  assert.ok(Math.abs(result.speed - 22.5 * Math.PI) < 1e-9);
  const doubledRatio = calculateDrivetrain({ ...inputs, gear: 4 });
  assert.equal(doubledRatio.wheelTorque, 2 * result.wheelTorque);
  assert.equal(doubledRatio.speed, result.speed / 2);
  assert.equal(doubledRatio.power, result.power);
  assert.equal(
    calculateDrivetrain({ ...inputs, efficiency: 100 }).speed,
    result.speed,
  );
});
test("invalid or unbounded calculation inputs produce no plausible-looking result", () => {
  for (const change of [
    { rpm: "" },
    { torque: -1 },
    { gear: 0 },
    { efficiency: 101 },
    { diameter: "abc" },
    { torque: Infinity },
    { torque: 1e308, rpm: 1e308 },
  ])
    assert.equal(calculateDrivetrain({ ...inputs, ...change }), null);
});
