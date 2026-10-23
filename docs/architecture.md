# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier: Keep routing and display in React components. Use the shared API client for relative `/api` requests and expose loading, empty, and accessible error states in each capability view.
- Logic tier: Keep Express routes thin; put request validation, reference checks, and capability-specific behavior in the service layer. Return deliberate 4xx responses for invalid input or missing users instead of leaking Mongoose cast errors as 500s.
- Data tier: Enforce required fields and appropriate numeric constraints in Mongoose schemas. Keep seed data idempotent with upserts, and do not clear or overwrite unrelated application records.
- Activity tracking: Accept user and team IDs, activity type, and positive minutes; validate ID format and confirm both records exist before saving. Calculate points at one point per minute, consistent with the seeded activities, and set `occurredAt` when creating the record.
- Team management: Require a name and mascot, default members to an empty array, and preserve provided member references when creating and listing teams.
- Leaderboard: Sum activity points by team, sort totals descending, and return `teamName`, `totalPoints`, and a 1-based rank.
- Workout suggestions: Look up the user by email; prefer workouts matching their fitness goal or recent activity, put the best match first, and include a reason. Return a 4xx response when the email does not match a user.

## Test plan

- `npm run test:data --prefix octofit-tracker/backend`: Checks required model fields, defaults, and idempotent seed behavior. Failures indicate a data contract or seed regression. Last run: 4 failed, 1 passed; the four model validation checks failed and the seed check passed.
- `npm run test:api --prefix octofit-tracker/backend`: Checks activity and team CRUD validation, leaderboard aggregation/ranking, and user-specific workout suggestions. Failures indicate a route/service contract mismatch. Last run: 4 failed; activity/team creation returned 501, the leaderboard was empty, and workout suggestions did not prioritize the matching user's workout.
- `npm test --prefix octofit-tracker/frontend`: Checks API-backed rendering, user-specific requests, and loading, empty, and error states for each route. Failures indicate missing presentation/API integration or state handling. Last run: 15 failed; the capability views still displayed “Implementation pending.”
- `npm run build --prefix octofit-tracker/backend`: TypeScript check for backend source. A failure indicates a backend type error; not run in this documentation-only pass.
- `npm run build --prefix octofit-tracker/frontend`: TypeScript and Vite production build. A failure indicates a frontend type or bundling error; not run in this documentation-only pass.
