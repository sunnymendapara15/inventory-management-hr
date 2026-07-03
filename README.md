# Inventory Management HR

A lightweight **React + .NET** inventory management system targeted at IT companies where HR manages asset tracking. Operations can be done with no login—just add and list inventories with quantities.

## Architecture

- **Backend:** ASP.NET Core minimal API that stores inventory data in a local SQLite database (`inventory.db`).
- **Frontend:** React (Vite) single-page app that talks to the API to list stocks, add items, and adjust quantities.

## Getting started

### Backend

```bash
cd InventoryApi
dotnet restore
dotnet run
```

By default, the API runs on `http://localhost:5237` (or a dynamically assigned port). You can adjust the `appsettings.json` or pass `--urls` if you need a fixed port to avoid conflicts.

### Frontend

```bash
cd inventory-ui
npm install
npm run dev -- --host
```

This starts the Vite dev server (defaults to `http://localhost:5173`) and proxies requests to the backend via the configured base URL.

### API surface

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | Returns all inventory records. |
| POST | `/api/inventory` | Adds a new item and quantity. Expects `{ name, description, quantity }`. |
| PATCH | `/api/inventory/{id}/quantity` | Changes quantity. Use `{ adjustment }` to add/subtract or set `newQuantity`. |

All responses carry simple success/failure payloads so the React UI can display status feedback.

## Notes for HR

- No login is required; anyone with access to the machines running the app can manage inventory.
- Quantities default to whole numbers. Update operations allow adding or subtracting stock as needed.
- The SQLite file `inventory.db` lives next to the backend executable; back it up if you need persistence across deployments.
