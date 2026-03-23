Marvel_ARCHIVE // 
Marvel_ARCHIVE is a high-performance, browser-based tactical intelligence dashboard for the game Marvel Rivals. Designed with a "Stark-Industrial" Cyber HUD aesthetic, it parses real-time data to provide A–Z intelligence on Heroes, Team-Up abilities, and Map layouts.

Live Demo | Report Bug

⚡ Technical Deep Dive
This project goes beyond simple API fetching. It focuses on performance, procedural UI generation, and a bespoke user experience built from scratch.

1. Dynamic Logic Layer
Rather than hard-coding categories, I built a Custom Logic Engine that:

Parses the API response to dynamically generate filter categories (e.g., Duelist, Strategist, Vanguard).

Sorts and maps complex character relationships (Team-Up bonuses) into a readable UI format.

2. Tactical UI Engine (Procedural Design)
To achieve the "OS" feel without heavy images:

Implemented a Randomized HUD Decoration system in JavaScript.

Every Hero card generates unique UI accents, scan lines, and "processing" progress bars on the fly.

Design Style: High-contrast tactical industrial, inspired by modern "Riot" and "Stark" UI schemes.

3. Procedural Audio (Web Audio API)
To ensure total immersion, I moved away from static MP3 samples:

Created a Custom Synthesizer using the Web Audio API.

Generates real-time Sine/Triangle wave oscillators for hover and click SFX.

This keeps the project lightweight and "procedural."

4. Zero-Library Component Architecture
Developed Interactive Modals for deep-dive stats using vanilla JS and CSS.

No external UI libraries (like Bootstrap or Tailwind) were used, ensuring a tiny footprint and maximum control over the "Cyber HUD" look.

🛠️ Tech Stack
HTML5/CSS3: Advanced Grid/Flexbox and CSS Variables for the "Tactical" theme.

JavaScript (Vanilla): Core logic, API integration, and DOM manipulation.

Web Audio API: Procedural sound synthesis.

Marvel Rivals API: Data source for Heroes, Abilities, and Stats.
