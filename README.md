# Project Escape 🚀

An interactive space puzzle game where you guide a drifting spaceship through cosmic obstacles to reach an escape portal.

## 🎮 Play the Game

[**▶ Play Project Escape**](https://project-escape.lovable.app/)

Play directly in your browser — no installation required.

## ✨ Features

- Five handcrafted puzzle missions with increasing difficulty.
- Strategic module placement and rotation.
- Physics-inspired movement and collision mechanics.
- Credit-based resource management.
- A countdown timer that adds challenge.
- Tested solutions for every level.
- A pixelated visual style with cosmic environments.

## 🕹️ How to Play

1. Place modules on the board to guide the spaceship.
2. Click a module or use the arrow controls to rotate it. Rotating is free.
3. Press **Launch**. The ship moves until a module stops it or changes its direction.
4. Reach the portal before your time or credits run out.

## 🧩 Modules

| Module | Description |
|---|---|
| **Thruster** | Pushes a nearby ship when correctly aligned. |
| **Anchor** | Holds the ship in the square its glowing face points toward. |
| **Bumper** | Stops the ship on its padded side and reflects it from other sides. |

## 💥 How You Lose

The mission fails if:

- The ship reaches the glowing bottom row (the event horizon).
- Three modules touch the ship at once.
- You run out of credits during flight.
- The timer reaches zero.

Removing a module restores its full cost. After a failed mission, select **Try Again** to restart.

## 🌌 Levels

Play through five missions:

1. Training
2. Cold Start
3. Ricochet
4. High Orbit
5. Gravity Well

Complete **Gravity Well** to unlock the exit screen, where you can replay or return to the launch screen.
Every level has a tested solution within its credit budget.

##  About the Project:

Project Escape is a space-themed puzzle game collaboratively conceptualized and developed using Lovable, where players guide a drifting spaceship toward an escape portal by arranging in-game modules. We worked together to enhance the gameplay experience by redesigning in-game items with pixelated visuals, increasing the difficulty of puzzle levels, adding sound effects, and improving the visual effects of falling into the void. I also maintained my personal GitHub repository and updated its documentation, making the project easier to explore and showcase.

## 🛠️ Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Vitest
- Lovable

## 💻 Run the Game Locally

### Prerequisites

- [Node.js](https://nodejs.org/)
- npm

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/Shravanp7/project_escape-8c1a610a.git
cd project_escape-8c1a610a
npm install
npm run dev

This makes the commands readable and lets someone copy them into their terminal.

### 2. Check the test command

Your README says:

```bash
bunx vitest run

## 🎨 Visual Design

Visual effects use small canvases scaled up to create a pixelated aesthetic.

## 👥 Credits

Created by **Shravan Patil and Anshul Patil** for **Pixathon**, with the theme *“Any puzzle, your rules.”*

Built with [Lovable](https://lovable.dev).

