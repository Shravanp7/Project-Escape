# Project Escape 🚀

**A browser-based, pixel-art space puzzle game.** Guide a drifting spaceship through a sequence of missions by strategically placing and rotating modules. Reach the escape portal before the clock runs out or the ship is lost to the black hole.

**[▶ Play Project Escape](https://project-escape.lovable.app/)**

## Gameplay

- **Five missions:** Training, Cold Start, Ricochet, High Orbit, and Gravity Well.
- **Three placeable modules:** thrusters, anchors, and bumpers, each with different effects on the ship's movement.
- **Limited resources:** plan around each mission's credit budget and countdown.
- **Interactive controls:** place and rotate modules, launch the ship, and retry failed missions.
- **Space-themed effects:** pixel-art visuals, warp transitions, and black-hole sequences.

### How to play

1. Select a module and place it on the board.
2. Rotate it by clicking the module or using the direction controls. Rotation is free.
3. Select **Launch** and watch the ship move across the grid.
4. Reach the portal to complete the mission and unlock the next one.

The mission fails if the ship crosses the event horizon, three modules contact it at once, flight credits run out, or the countdown reaches zero. Removing a placed module refunds its cost.

### Modules

| Module | Effect |
| --- | --- |
| **Thruster** | Pushes the ship when aligned correctly |
| **Anchor** | Holds the ship at the targeted adjacent square |
| **Bumper** | Stops or redirects the ship depending on its orientation |

## Tech stack

- **React + TypeScript** for the interface and game presentation
- **TanStack Start / Router** for the application and routing
- **Tailwind CSS** for styling
- **Vite + Bun** for development and builds
- **Vitest** for automated tests
- **Lovable** for the project's development workflow and deployment

## Run locally

Install [Bun](https://bun.sh/) and clone this repository:

```bash
git clone https://github.com/Shravanp7/project_escape-8c1a610a.git
cd project_escape-8c1a610a
bun install
bun run dev
```

Open the local URL printed by the development server.

### Quality checks

```bash
bun run test
bun run lint
bun run build
```

The repository includes gameplay engine tests and application routing tests. Test and build commands are provided for local verification; passing status is not asserted here.

## Project structure

```text
src/
├── assets/       # Lovable asset references
├── components/   # Shared UI components
├── game/         # Game rules, visuals, effects, and tests
├── hooks/        # React hooks
├── lib/          # Shared utilities and error handling
├── routes/       # Application routes
└── test/         # Test configuration and routing tests
```

**Key files:**
- `src/game/engine.ts` — gameplay rules and simulation
- `src/game/engine.test.ts` — engine tests
- `src/routes/index.tsx` — main game screen
- `src/game/artwork.ts` — artwork loading and fallbacks

## Project history and credits

Project Escape was originally created collaboratively by **Shravan Patil and Anshul Patil** for **Pixathon**, under the theme **“Any puzzle, your rules.”**

This repository is **Shravan's independently maintained version** of that shared hackathon project. The original collaborative work remains credited to both contributors.

Developed with assistance from [Lovable](https://lovable.dev).
