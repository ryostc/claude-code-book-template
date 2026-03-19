# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser-based Breakout (block-breaking) game written in vanilla HTML/CSS/JavaScript (Japanese UI). No build tools, no dependencies, no package manager — just static files served directly in a browser.

## Running the Game

Open `breakout/index.html` directly in a browser, or serve it with any static file server:

```bash
npx serve .
# or
python3 -m http.server
```

## Architecture

- `breakout/index.html` — game shell: canvas element, score/lives display, CSS styling, loads `main.js`
- `breakout/main.js` — all game logic: game loop (`requestAnimationFrame`), physics, collision detection, input handling

### Game Loop (`main.js`)

`startGame()` initializes state and kicks off the loop. Each frame calls `update()` then `draw()`.

- **update()** — moves paddle (keyboard/mouse/touch), moves ball, handles wall/paddle/block collisions, checks win/lose conditions
- **draw()** — renders blocks, paddle (gradient), and ball to canvas

Paddle angle is determined by where the ball hits relative to paddle center (`hit` variable), capped at `maxSpeed = 5.6`.

## Dev Environment

The devcontainer installs Node.js, GitHub CLI, and Playwright's Chromium dependencies (`post_create.sh`). Playwright is available for browser automation/testing if needed.
