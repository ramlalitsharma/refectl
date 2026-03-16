# Games Module Structure

Each game lives in its own folder with a clear split between frontend, core logic, and backend placeholders.

Example:

- `games/tic-tac-toe/`
  - `frontend/` UI components, hooks, and view logic
  - `core/` shared game engine, rules, and types
  - `backend/` server-side handlers, persistence, multiplayer, or leaderboards

Current games:

- `games/ludo/`
- `games/tic-tac-toe/`
- `games/chess/`
- `games/snake/`

When adding a new game, create a new folder under `games/` using the game name, and follow the same structure.
