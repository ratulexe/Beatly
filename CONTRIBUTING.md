# Contributing to Beatly

We welcome contributions to Beatly! Please read this guide before submitting your changes.

## Development Setup

1. Make sure you have Docker and Docker Compose installed.
2. Clone the repository and run `docker-compose up --build` to start all services locally.
3. If running natively without Docker, refer to the README.md for Node.js setup.

## Branching Strategy

- `main`: Production-ready code.
- `develop`: Integration branch for upcoming releases.
- `feature/*`: New features (e.g., `feature/achievements-ui`).
- `fix/*`: Bug fixes (e.g., `fix/cache-invalidation`).

Please submit all Pull Requests against the `develop` branch.

## Coding Standards

### Backend (Node.js/Express)
- Use ES Modules (`import`/`export`).
- Use Winston for all logging (no `console.log` in production code).
- Never commit sensitive environment variables or secrets.
- Write unit tests using the native Node.js test runner (`node:test`).

### Frontend (React/Vite)
- Use functional components and hooks.
- Use Tailwind CSS for all styling.
- Ensure all heavy routes are lazy-loaded via `React.lazy` and `Suspense`.
- Wrap all network-bound or complex components in `ErrorBoundary`.
- Write tests using Vitest and React Testing Library.

## Submitting a Pull Request
1. Fork the repo and create your branch from `develop`.
2. Ensure `npm test` passes in both `/frontend` and `/backend`.
3. Ensure the linter passes without warnings.
4. Describe your changes clearly in the PR description.
