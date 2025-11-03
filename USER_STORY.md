### Timipay – Project User Story Summary

#### As a guest visitor
- I want to understand what Timipay does and how it works, so I can decide whether to sign up.
- I can browse public pages like the home page and a "How it works" guide.
- I see a clear call to action to create an account or sign in.

#### As a new user (sign up and onboarding)
- I want to create an account and verify my email, so I can access my dashboard.
- After verification, I complete onboarding before appearing as a signed-in user in the UI.
- My session persists across refreshes/restarts, so I don’t have to sign in again frequently.

#### As a signed‑in user
- I want a clean dashboard navigation to access key areas (Dashboard, Videos, Withdraw, History).
- I can open the Videos page via `/videos-user` which currently displays a simple placeholder: "hello videos".
- I can navigate the app with consistent top navigation and layout.

#### Non‑Goals / De‑scoped Features (currently removed)
- Reward points and ads tracking were removed (including related database utils and UI).
- Picture‑in‑Picture demos and custom hooks were removed from public pages.
- Legacy video player components and rewarded player routes were deleted to simplify the codebase.

#### Navigation Highlights
- Main routes include: `/`, `/how-it-works`, `/signup`, `/verify`, `/signin`, `/dashboard`, `/videos-user`, `/withdraw`, `/historique`.
- The "Reward" and "Rewarded Player" routes/components were removed.

#### Error‑free Build Target
- All references to removed files (reward logic, PiP hook, video players) have been cleaned up.
- `VideosUser.jsx` is a minimal placeholder for future video features.

#### Technical Notes (High Level)
- Frontend: React with React Router and Material UI components (for certain pages).
- Auth: Supabase client integration with session persistence and auth state handling.
- UI: Shared navbar (`MuiNavbar`) and guest navbar for consistent navigation.

#### Acceptance Criteria
- Visiting `/` or `/how-it-works` loads without errors.
- Signing up, verifying, and signing in work; session restores on reload.
- The sidebar/menu shows entries only for active parts (no Reward/Rewarded Player).
- Visiting `/videos-user` renders the text "hello videos" with no console errors.
- No dangling imports or broken routes from removed features.
