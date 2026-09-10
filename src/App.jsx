import { useEffect, useMemo, useState } from 'react';
import ModelViewer from './components/ModelViewer';

const LOCAL_PASSWORD = 'maruti800';
const STORAGE_KEY = 'maruti800AutomotiveDiary';
const LOGIN_STORAGE_KEY = 'maruti800DiaryUnlocked';

const defaultData = {
  vehicles: [
    {
      id: 'maruti-800',
      name: 'Maruti Suzuki 800',
      vehicle: {
        name: 'Maruti Suzuki 800',
        engine: 'F8B inline 3, carburetted',
        variant: 'Type 2',
        transmission: 'Manual (verify exact spec)',
        odometer: 'To record',
        nextServiceDue: '2026-10-15',
        tyres: 'To record current size, brand, tread, and pressure',
        notes: 'Engineering diary and component encyclopedia for the Maruti 800.',
      },
      futurePlans: [
        'Rebuild carburettor and verify fuel delivery behaviour',
        'Inspect ignition timing and distributor condition',
        'Document cooling system performance and thermostat operation',
        'Capture all component photographs with labels',
      ],
      diaryEntries: [
        {
          id: 1,
          date: '2026-09-10',
          title: 'Project setup',
          category: 'Diary',
          summary: 'Initialized the automotive diary app and organized the GLB assets.',
          details: 'Preserved source model files and created working copies for future modelling and component labelling.',
        },
        {
          id: 2,
          date: '2026-09-10',
          title: 'Power flow milestone',
          category: 'Engineering study',
          summary: 'Defined the first major subsystem path from tank to wheels.',
          details: 'The plan is to record fuel, combustion, drivetrain, and wheel delivery relationships in a structured way.',
        },
      ],
      modelUrl: '/models/maruti_800_ac.glb',
    },
    {
      id: 'ignis',
      name: 'Suzuki Ignis',
      vehicle: {
        name: 'Suzuki Ignis',
        engine: 'K-Series petrol',
        variant: '2022 reference',
        transmission: 'Manual / Automatic (verify exact spec)',
        odometer: 'To record',
        nextServiceDue: '2026-11-01',
        tyres: 'To record current size, brand, tread, and pressure',
        notes: 'Reference vehicle for comparison, benchmarking, and learning.',
      },
      futurePlans: [
        'Compare steering and suspension layout to the Maruti 800',
        'Document drive-by-wire and safety differences',
        'Capture the chassis and comfort improvements',
      ],
      diaryEntries: [
        {
          id: 1,
          date: '2026-09-10',
          title: 'Reference study started',
          category: 'Engineering study',
          summary: 'Added the Ignis as a comparison vehicle alongside the Maruti 800.',
          details: 'This gives the diary a second vehicle entry for benchmarking and component comparison work.',
        },
      ],
      modelUrl: '/models/2022_suzuki_ignis.glb',
    },
  ],
};

function App() {
  const [data, setData] = useState(() => {
    if (typeof window === 'undefined') {
      return defaultData;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultData;
  });

  const [currentVehicleId, setCurrentVehicleId] = useState('maruti-800');
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return localStorage.getItem(LOGIN_STORAGE_KEY) === 'true';
  });
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [newEntry, setNewEntry] = useState({
    title: '',
    category: 'Diary',
    summary: '',
    details: '',
  });

  const [activeNav, setActiveNav] = useState('overview');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (data.vehicles.length === 0) {
      return;
    }

    if (!data.vehicles.some((vehicle) => vehicle.id === currentVehicleId)) {
      setCurrentVehicleId(data.vehicles[0].id);
    }
  }, [currentVehicleId, data.vehicles]);

  const activeVehicle = useMemo(
    () => data.vehicles.find((vehicle) => vehicle.id === currentVehicleId) ?? data.vehicles[0],
    [currentVehicleId, data.vehicles]
  );

  const stats = useMemo(
    () => [
      { label: 'Diary entries', value: activeVehicle.diaryEntries.length },
      { label: 'Future plans', value: activeVehicle.futurePlans.length },
      { label: 'Next service', value: activeVehicle.vehicle.nextServiceDue },
    ],
    [activeVehicle]
  );

  const handleLogin = () => {
    if (password === LOCAL_PASSWORD) {
      setUnlocked(true);
      setLoginError('');
      localStorage.setItem(LOGIN_STORAGE_KEY, 'true');
      return;
    }

    setLoginError('Incorrect password.');
  };

  const updateVehicleField = (field, value) => {
    setData((current) => ({
      ...current,
      vehicles: current.vehicles.map((vehicle) =>
        vehicle.id === currentVehicleId
          ? {
              ...vehicle,
              vehicle: {
                ...vehicle.vehicle,
                [field]: value,
              },
            }
          : vehicle
      ),
    }));
  };

  const handleNavClick = (sectionId) => {
    setActiveNav(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const addFuturePlan = () => {
    setData((current) => ({
      ...current,
      vehicles: current.vehicles.map((vehicle) =>
        vehicle.id === currentVehicleId
          ? {
              ...vehicle,
              futurePlans: [...vehicle.futurePlans, 'New future plan'],
            }
          : vehicle
      ),
    }));
  };

  const updateFuturePlan = (index, value) => {
    setData((current) => ({
      ...current,
      vehicles: current.vehicles.map((vehicle) =>
        vehicle.id === currentVehicleId
          ? {
              ...vehicle,
              futurePlans: vehicle.futurePlans.map((plan, planIndex) =>
                planIndex === index ? value : plan
              ),
            }
          : vehicle
      ),
    }));
  };

  const addEntry = () => {
    if (!newEntry.title.trim()) {
      return;
    }

    setData((current) => ({
      ...current,
      vehicles: current.vehicles.map((vehicle) =>
        vehicle.id === currentVehicleId
          ? {
              ...vehicle,
              diaryEntries: [
                {
                  id: Date.now(),
                  date: new Date().toISOString().slice(0, 10),
                  ...newEntry,
                },
                ...vehicle.diaryEntries,
              ],
            }
          : vehicle
      ),
    }));

    setNewEntry({ title: '', category: 'Diary', summary: '', details: '' });
  };

  if (!unlocked) {
    return (
      <div className="login-shell">
        <div className="login-card">
          <p className="eyebrow">Automotive diary</p>
          <h1>Enter local password</h1>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleLogin();
              }
            }}
          />
          <button className="primary-button" onClick={handleLogin}>
            Open diary
          </button>
          {loginError && <p className="login-error">{loginError}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <h1>Automotive Diary</h1>
          <p>Vehicle logbook</p>
        </div>

        <nav className="nav">
          <button
            className={`nav-item ${activeNav === 'overview' ? 'active' : ''}`}
            onClick={() => handleNavClick('overview')}
          >
            Overview
          </button>
          <button
            className={`nav-item ${activeNav === 'diary' ? 'active' : ''}`}
            onClick={() => handleNavClick('diary')}
          >
            Diary
          </button>
          <button
            className={`nav-item ${activeNav === 'service' ? 'active' : ''}`}
            onClick={() => handleNavClick('service')}
          >
            Service
          </button>
          <button
            className={`nav-item ${activeNav === 'model' ? 'active' : ''}`}
            onClick={() => handleNavClick('model')}
          >
            Model
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Vehicle record</p>
            <h2>{activeVehicle.vehicle.name}</h2>
          </div>

          <div className="topbar-actions">
            <select
              value={currentVehicleId}
              onChange={(event) => setCurrentVehicleId(event.target.value)}
              className="vehicle-select"
            >
              {data.vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </option>
              ))}
            </select>
            <button className="primary-button" onClick={addEntry}>Add diary entry</button>
          </div>
        </header>

        <section className="stats-grid" aria-label="Vehicle statistics">
          {stats.map((stat) => (
            <div key={stat.label} className="stats-card">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </section>

        <section className="panel-grid" id="overview">
          <div className="panel">
            <h3>Vehicle baseline</h3>
            <div className="kv-grid">
              <div>
                <label>Engine</label>
                <input
                  value={activeVehicle.vehicle.engine}
                  onChange={(event) => updateVehicleField('engine', event.target.value)}
                />
              </div>
              <div>
                <label>Variant</label>
                <input
                  value={activeVehicle.vehicle.variant}
                  onChange={(event) => updateVehicleField('variant', event.target.value)}
                />
              </div>
              <div>
                <label>Transmission</label>
                <input
                  value={activeVehicle.vehicle.transmission}
                  onChange={(event) => updateVehicleField('transmission', event.target.value)}
                />
              </div>
              <div>
                <label>Odometer</label>
                <input
                  value={activeVehicle.vehicle.odometer}
                  onChange={(event) => updateVehicleField('odometer', event.target.value)}
                />
              </div>
              <div>
                <label>Tyres</label>
                <input
                  value={activeVehicle.vehicle.tyres}
                  onChange={(event) => updateVehicleField('tyres', event.target.value)}
                />
              </div>
              <div>
                <label>Next service due</label>
                <input
                  type="date"
                  value={activeVehicle.vehicle.nextServiceDue}
                  onChange={(event) => updateVehicleField('nextServiceDue', event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="panel">
            <h3>Current notes</h3>
            <textarea
              value={activeVehicle.vehicle.notes}
              rows={8}
              onChange={(event) => updateVehicleField('notes', event.target.value)}
            />
          </div>
        </section>

        <section className="panel" id="service">
          <div className="section-header">
            <h3>Future plans</h3>
            <button className="secondary-button" onClick={addFuturePlan}>Add plan</button>
          </div>
          <ul className="list">
            {activeVehicle.futurePlans.map((plan, index) => (
              <li key={`${plan}-${index}`}>
                <input
                  value={plan}
                  onChange={(event) => updateFuturePlan(index, event.target.value)}
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="panel panel-stack">
          <h3>New diary entry</h3>
          <div className="form-grid">
            <input
              placeholder="Title"
              value={newEntry.title}
              onChange={(event) => setNewEntry((current) => ({ ...current, title: event.target.value }))}
            />
            <select
              value={newEntry.category}
              onChange={(event) => setNewEntry((current) => ({ ...current, category: event.target.value }))}
            >
              <option>Diary</option>
              <option>Service</option>
              <option>Engineering study</option>
              <option>Parts change</option>
            </select>
            <input
              placeholder="Short summary"
              value={newEntry.summary}
              onChange={(event) => setNewEntry((current) => ({ ...current, summary: event.target.value }))}
            />
            <textarea
              placeholder="Details"
              rows={4}
              value={newEntry.details}
              onChange={(event) => setNewEntry((current) => ({ ...current, details: event.target.value }))}
            />
          </div>
        </section>

        <section className="panel" id="diary">
          <h3>Recent diary entries</h3>
          <div className="entry-list">
            {activeVehicle.diaryEntries.map((entry) => (
              <article key={entry.id} className="entry-card">
                <div className="entry-header">
                  <span className="pill">{entry.category}</span>
                  <span>{entry.date}</span>
                </div>
                <h4>{entry.title}</h4>
                <p>{entry.summary}</p>
                <small>{entry.details}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="panel" id="model">
          <h3>3D model viewer</h3>
          <div className="model-section">
            <div className="model-viewer-wrap">
              <ModelViewer url={activeVehicle.modelUrl} />
            </div>
            <div className="model-meta">
              <p>Drag to rotate, scroll to zoom, and right-drag to pan.</p>
              <div className="model-list">
                <div className="model-item">
                  <strong>{activeVehicle.name}</strong>
                  <a href={activeVehicle.modelUrl} target="_blank" rel="noreferrer">
                    {activeVehicle.modelUrl}
                  </a>
                  <span>Current selected vehicle model</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
