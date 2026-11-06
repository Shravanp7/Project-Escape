<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Agent rules
- Puzzle rules live as pure functions in src/game/engine.ts (step()) with tests in engine.test.ts; UI only renders and ticks. Why: keeps rules testable and every level provably solvable.
- Black/white hole effects draw on tiny canvases scaled up with image-rendering: pixelated. Why: real pixelation instead of CSS blur.
- Directional module faces share engine predicates with canvas feedback; all placed modules use one rotation control. Why: keeps visual direction consistent with the actual rules.
- Uploaded module artwork is served through asset pointers and loaded lazily for canvas drawing, with procedural fallbacks. Why: avoids browser-only imports during SSR and keeps play usable while images load.
- The final mission transitions to ExitScreen; exiting returns to the launch screen rather than closing a browser tab. Why: browser tabs cannot reliably be closed by game code.
- Victory-only space details use an opt-in Starfield variant and scoped overlay effects. Why: decorative polish must not affect gameplay screens or change victory layout dimensions.
- Timeout pauses flight and runs UfoCapture before the normal time-loss screen without changing refunds or countdown limits. Why: the cinematic cannot race the simulation.
- Screen transitions lock editing/navigation and own cancellable timers; white-hole emergence includes background and footer. Why: avoids stale level changes and disconnected screen fragments.
- Levels are validated in engine.test.ts by simulating a recorded solution; each budget must be at least the cheapest solution's cost. Budgets follow the user's progression (2 coins on Training, +3 per mission) and may exceed the cheapest solution. Why: guarantees hard levels stay solvable while coins escalate as the user wants.
- Full-screen overlays (start, loss, exit) scroll internally with safe centering instead of clipping. Why: short laptop windows must never cut off their content.
- On md+ screens at least 500px tall the game screen fits one window (no page scroll): the board is sized from measured row height on resize only, and panel text scales down via --fs until panels fit. Why: users must see everything without scrolling, and the board must not jump mid-flight.
