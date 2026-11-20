FOCUSFLOW PRO — MULTI-LAYER PRODUCTIVITY DASHBOARD
===================================================

TECH STACK
- HTML5
- CSS3
- Vanilla JavaScript (no React, Vue, Bootstrap, Tailwind or other framework)
- Browser localStorage for persistence

PROJECT STRUCTURE
- index.html  : all dashboard views and interface structure
- style.css   : complete theme, responsive layout, transitions and animations
- app.js      : navigation, task manager, timer, planner, habits, insights, settings
- README.txt  : this guide

HOW TO RUN
1. Extract FocusFlow_Pro.zip.
2. Open the extracted folder in Visual Studio Code.
3. Open index.html.
4. Recommended: use the VS Code Live Server extension and click "Go Live".
5. You can also double-click index.html to open it directly in a browser.

FEATURES THAT WORK
1. Multi-view navigation: Overview, My Tasks, Smart Planner, Focus Room, Insights, Habits and Settings.
2. Add tasks with priority and due date.
3. Complete, uncomplete, search, filter and delete tasks.
4. Dashboard priority preview and live statistics.
5. Focus timer with 25, 15 and 5 minute modes, pause, resume and reset.
6. Focus minutes are recorded when a focus session finishes.
7. Smart planner uses your pending tasks, selected time and energy level to create a schedule.
8. Habit tracker with daily check-off state.
9. Weekly task-completion chart and insights.
10. Local suggestion assistant with rotating productivity tips.
11. Dark/light theme.
12. Display-name settings.
13. Export all app data to JSON.
14. Reset local workspace with confirmation.
15. Responsive mobile sidebar and layout.
16. CSS entrance transitions, hover lift, animated focus ring, pulsing status indicators, modal animation and toast notifications.

IMPORTANT PROJECT EXPLANATION
This is a front-end productivity dashboard with a rule-based "smart assistant" demo.
It does NOT call a real AI model. A real AI integration requires a secure backend
to protect API keys. The current version intentionally remains fully usable with
only HTML, CSS and JavaScript.

DATA
Tasks, habits, theme, display name, and focus totals are saved in localStorage
inside the browser. Data is local to the browser/device. Use Settings > Export
your data to download a JSON backup before clearing browser data.

CUSTOMISATION
- Colors and visual styling: edit the CSS variables at the top of style.css.
- Sample tasks and habits: edit the defaults object near the top of app.js.
- Productivity suggestions: edit the nudges array in app.js.
- Add new navigation views: add a nav link, a section with id "view-yourname",
  and include the route name in navigate() in app.js.
