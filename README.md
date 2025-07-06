# Worklynesia

Worklynesia is a modern HR management platform that helps Indonesian companies manage remote (WFH) and on-site employees while giving HR administrators real-time visibility into attendance, tasks, and overall workforce performance.

## Key Features

- Daily check-in / check-out with geo-tagged & selfie validation
- Task & OKR tracking with progress dashboards
- Real-time workforce timeline for HR admins and team leads
- Role-based access (Employee, Team Lead, HR Admin, Super Admin)
- Exportable reports (Excel / PDF)

## Tech Stack

This repository is a Turborepo monorepo powered by:

- Next.js for the `web` (employee) and `admin` (HR) applications
- TypeScript everywhere
- React-Query & Zustand for state management
- Material UI
- Turborepo for build orchestration
- ESLint / Prettier

## Repository Structure

```text
apps/
  web/    # Employee web / PWA
  admin/  # HR Admin dashboard
packages/
  ui/     # Shared React component library
  eslint-config/
  tsconfig/
```

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy environment variables:

   ```bash
   cp apps/web/.env.example apps/web/.env.local
   cp apps/admin/.env.example apps/admin/.env.local
   ```

3. Run all apps in development mode:

   ```bash
   pnpm turbo dev
   ```

   Open `http://localhost:3000` (web) and `http://localhost:3001` (admin) in your browser.

## Building for Production

```bash
pnpm turbo build
```

## Deployment

Each app can be deployed individually (Vercel, Netlify, etc.) or together with Docker. See `apps/*/Dockerfile` for an example configuration.

## Contributing

Pull requests are welcome! Please open an issue first to discuss major changes.

## License

MIT

---

> This project started from the official Turborepo starter template. Refer to the Turborepo documentation if you need deeper monorepo usage details.
