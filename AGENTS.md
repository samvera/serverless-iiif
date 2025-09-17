# Repository Guidelines

## Project Structure & Module Organization
- `src/`: TypeScript Lambda handler and helpers (`index.ts`, `helpers.ts`, `resolvers.ts`, `error.ts`, `streamify.ts`).
- `tests/`: Jest tests (`*.test.ts`) and `__mocks/`.
- `sam/`: AWS SAM templates (`template.yml`) and flavors (`standalone/`, `cloudfront/`).
- `scripts/`: Dev scripts (e.g., custom Jest runner).
- `docs/`, `examples/`, `dependencies/`: Documentation, IaC examples, and packaged deps/layers.
- Build artifacts live in `.aws-sam/` (do not commit).

## Build, Test, and Development Commands
- `npm test`: Run Jest in watch mode locally; single run on CI.
- `npm run test-coverage`: Jest with coverage reporting.
- `npm run lint` / `npm run lint-fix`: Lint TypeScript and auto-fix where possible.
- `npm run build:ts`: Type-check and transpile with `tsc`.
- `npm run build`: SAM build of the Lambda using containers (requires Docker + SAM CLI).
- `npm run deploy` / `npm run deploy-guided`: Deploy via SAM using `deploy.yml`.

## Coding Style & Naming Conventions
- Language: TypeScript. Indent with 2 spaces (`.editorconfig`).
- Linting: ESLint (typescript-eslint, jest, node, promise). Run `npm run lint` before PRs.
- Filenames: `*.ts` in `src/`; tests as `*.test.ts` in `tests/`.
- Prefer camelCase for variables/functions; PascalCase for types/classes; avoid one-letter names.

## Testing Guidelines
- Framework: Jest + ts-jest (`jest.config.js`).
- Location and names: `tests/**/*.test.ts`.
- Mock AWS: use `aws-sdk-client-mock` for S3 (`@aws-sdk/client-s3`). Avoid real AWS calls.
- Coverage: aim for meaningful coverage of `src/**/*.ts` (`collectCoverageFrom`).

## Commit & Pull Request Guidelines
- Branch from `main`; do not create a `master` branch.
- Commits: present tense, concise subject, explanatory body when helpful; reference issues (e.g., "Closes #123").
- PRs: describe intent, link issues, include tests, and note infra/template changes. Ensure CI, lint, and tests pass.

## Security & Configuration Tips
- Configuration via env vars: `tiffBucket`, `resolverTemplate`, `density`, `pyramidLimit`, `preflight`, `forceHost`, `debugBorder`, `pageThreshold`, and CORS (`corsAllow*`).
- Local dev: load values with `.env` (uses `dotenv`). Do not commit secrets.
- SAM/Docker required for builds that match Lambda architecture.

