# Maruti 800 Automotive Diary

This project now includes a desktop app foundation for an automotive diary, engineering encyclopedia, and service planner.

## Stack

- React + Vite for the UI
- Electron for the desktop application
- Vercel-friendly architecture for a future web deployment

## Run locally

1. Install dependencies:
   `npm install`
2. Start the desktop app in development mode:
   `npm run dev`
3. Build the production frontend:
   `npm run build`
4. Package the desktop app:
   `npm run package`

## Future web architecture

The app is structured so it can later be adapted into a Vercel-hosted web app using:

- React + Vite frontend
- Supabase or local JSON/SQLite persistence
- Static hosting on Vercel
- Optional serverless functions for uploads, reminders, and service planning

## Project goals

- Record every change made to the Maruti 800
- Track next service due dates
- Maintain a component encyclopedia with photographs and explanations
- Keep engine, tyre, and subsystem records organized
- Plan future restorations and upgrades
