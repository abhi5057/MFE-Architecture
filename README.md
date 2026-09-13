# MFE-Architecture

Local-first enterprise banking monorepo using **React + TypeScript + Tailwind CSS + Webpack 5 Module Federation**.

## Workspace structure

- `apps/host-app` (port `3000`) — shell container, login flow, dashboard routing, theme/auth contexts, remote orchestration.
- `apps/dashboard-mfe` (port `3001`) — exposes `./DashboardWidget` with account and transaction summary.
- `apps/transfer-mfe` (port `3002`) — exposes `./TransferWidget` with transfer form and event dispatch.
- `apps/bills-mfe` (port `3003`) — exposes `./BillsWidget` with utility bill management UI.

## Features

- pnpm workspace monorepo.
- Strict TypeScript config and functional components.
- Tailwind-based responsive UI (grid/flexbox).
- Module Federation with React/ReactDOM singleton sharing.
- Window `CustomEvent` pub/sub bus:
  - `transfer-mfe` dispatches `banking:transfer-completed`.
  - `dashboard-mfe` listens and applies live balance deduction.
- Host query-parameter driven deep linking (`/dashboard?view=dashboard|transfer|bills`) with back/forward support.

## Run locally

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```
