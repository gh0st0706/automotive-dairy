# Maruti 800 Automotive Journal

A browser-based engineering journal and workshop for documenting the Maruti 800, with a Suzuki Ignis reference model. The same React and Vite app can also be packaged as a Windows desktop application with Electron.

## Features

- Interactive 3D vehicle inspection with camera presets and wireframe mode
- Searchable engineering diary with measurements, units, and confidence labels
- Fuel logbook that converts spend to litres and calculates each full-tank interval in km/L
- Subsystem atlas, service plans, and drivetrain calculation tools
- JSON export for backing up a workspace

## Run locally

Requires Node.js 20 or newer.

```sh
npm install
npm run dev       # Start Vite and the Electron desktop window
npm run build     # Create the static site in dist/
npm run preview   # Preview the production site locally
npm run package   # Build a portable Windows application in release/
```

To run only the browser app during development, use `npx vite --port 4173 --strictPort`.

## Deploy to Vercel

This is a static Vite site. Import the GitHub repository into Vercel and use these project settings (also recorded in `vercel.json`):

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

Vercel builds the browser app on each push to the connected branch. The Electron desktop build is not part of the Vercel deployment.

## Workspace data and privacy

Journal records are stored in the current browser or desktop app's local storage. The static Vercel deployment does not upload or sync records to a server. Fuel quantity is amount paid divided by price per litre; mileage is the odometer distance since the previous fill divided by litres purchased. The first fill sets the baseline, so log full-tank fills for a meaningful km/L result. Each browser and origin has separate data; use **Export workspace** to download a JSON backup before clearing browser data or moving to another device. The site has no account system or server-side access control, so anyone using the same browser profile can access its saved journal. Do not enter sensitive personal identifiers.

## Open source and assets

The application source is released under the MIT License in `LICENSE`. Font licence texts are included in `public/licenses/` and `src/assets/fonts/`.

The vehicle model files are provided as project assets in `public/models/` and `model/`. Their original source and redistribution terms have not yet been recorded. They are **not covered by the MIT License**; confirm their rights before redistributing or reusing them. The models are visual references, not dimensionally calibrated drawings.

## Contributing

Issues and pull requests are welcome. Keep observations, measurements, and hypotheses clearly distinguished, include units and test conditions for measurements, and avoid publishing VINs, registration documents, addresses, or other private identifiers.

Technical guidance is educational and is not a substitute for the vehicle's service manual or a qualified mechanic. Follow safe workshop practices when inspecting or repairing a vehicle.
