# Workspace Intelligence Guidelines

- **Canvas & Spatial Workflow**: 
  - Users create entities in the 2D `CanvasEditor` (logic layer).
  - These entities are synchronized to the `SpatialView` (3D rendering layer).
  - Use the **AI Architect** (Wand icon in Canvas) to generate complex scenes from text prompts.
  - Switch to **Player Mode** (User icon in Spatial) to enter a First-Person view.
  - Save entities as **Prefabs** to reuse them across the scene.

- **Terminal Commands**:
  - `/clone <url>`: Clones an external repo to `external-source`.
  - `/github`: Synchronizes the workspace with the upstream GitHub repository.
  - `/build`: Runs `npm install && npm run build` in `external-source`.
  - `/deploy`: Generates a distribution manifest.
  - `/test`: Runs workspace integrity tests.
  - `/spatial`: Switches to Spatial view mode.
  - `/engine`: Switches to Merged Engine view.
  - `/clear`: Clears terminal history.
  - `/theme:toggle`: Swaps light/dark themes.

- **Global Search & Navigation**:
  - `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux) opens the **Command Nexus**.
  - Use it to search for commands, trigger AI tasks, or jump to specific views.
  - Type `/` to see a list of all available system commands.
