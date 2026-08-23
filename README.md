# Operations Tracker · Mobile-first UI

Offline/local mobile-first prototype for Siddhant Jain’s process house workflow. It prioritises phone use for floor, store, and supervisor tasks while remaining usable on desktop. No database, external API, CDN, framework, or sign-in is required.

## Included

- Owner/director overview with stage pipeline, recent lots, attention items, and output snapshot
- Lot pipeline with a Kanban stage board, list toggle, search, clickable lot detail, and multi-stage lot visibility
- Lot detail journey with job-card / QR simulation, stage history, loss, operator, and dispatch context
- Digital job card with recipes/chemical issue, samples/approvals, QC/packing reconciliation, and owner-only stage costing
- Parties lookup
- Scan & entry flow with simulated QR scan, meter entry, roll count, partial completion toggle, reprocess option, notes, and save confirmation
- Chemical store with stock levels and traceable issue log
- Owner-only costing and margin view
- Profile switcher for Owner/Director, Floor Supervisor, and Production Worker personas
- Responsive layout for desktop and smaller screens

## Run on Windows

### Direct open

Double-click `index.html`. The UI works without a server.

### Local server

1. Install Node.js LTS if needed.
2. Open PowerShell in this folder.
3. Run `npm start`.
4. Open [http://127.0.0.1:5175](http://127.0.0.1:5175).
5. Stop with `Ctrl+C`.

No internet connection is needed once the files are present.

## Structure

```text
index.html    App shell and navigation
styles.css    Responsive visual system and components
app.js        Seed data, views, interactions, and demo state
server.js     Optional dependency-free local static server
package.json  npm start script
README.md     Setup and scope notes
```

## Demo path

Start at Overview, open `LOT-24081`, then use `Scan & entry → Simulate QR scan → Save stage entry`. Visit Chemical store for inventory context and Costing for the private owner view. All actions show local confirmations.

## Next production steps

Connect a local API/database, add role permissions, durable lot/stage schemas, QR generation/printing, photo storage, append-only event history, and local backup/export.
