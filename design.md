# SomaiyaSat Mission Control - Design Document

This document outlines the visual identity, UI interaction patterns, layout structure, and component design principles for the SomaiyaSat Mission Control application.

## 1. Visual Identity & Theme

The application adheres to a clean, modern **aerospace mission-control aesthetic**. It avoids playful or consumer-centric styling (like glassmorphism, heavy gradients, or rounded cartoon aesthetics) in favor of high-contrast, technical precision.

### Color Palette

- **Background (Primary):** Dark Navy (`#08111f`)
- **Panel Background:** Lighter Navy (`#0a1426`)
- **Border/Divider:** Deep Blue (`#1a2b4c`)
- **Text (Main):** Off-White (`#e2e8f0`)
- **Text (Muted/Secondary):** Slate Gray (`#64748b`)
- **Accent (Technical):** Cyan (`#00cfff`) - Used for highlights, active tabs, and primary borders.
- **Status Colors:**
  - **Nominal / Success:** Green (`#10b981` or `#50fa7b`)
  - **Warning / Medium Priority:** Orange/Yellow (`#ffb86c`)
  - **Critical / Error:** Red (`#ef4444` or `#ff5555`)

### Typography

- **Headers & Technical Labels:** Monospace fonts (e.g., `Courier New`, `Courier`) to emphasize data and system logs.
- **Body Text:** Sans-serif (`Segoe UI`, `Roboto`) for readability in dense informational panels.

## 2. Layout Structure

The layout is designed to maximize data visibility without overwhelming the operator. It uses a fixed-height, full-viewport structure preventing external scrolling.

1. **Top Bar:** Houses mission-critical global information (Mission Time, Connection Status) and User Role Management (Admin/Student toggle).
2. **Sidebar Navigation:** A persistent vertical menu allowing swift switching between major functional areas (Mission Dashboard, Telemetry, Payloads, External Data, AI Routing). Active states are highlighted with cyan borders and subtle backgrounds.
3. **Content Area:** The main workspace. Depending on the active tab, this area renders either legacy informational components or the dynamic Mission Dashboard Grid.
4. **Mission Dashboard Grid:** A responsive CSS Grid layout displaying multiple panels concurrently (RF Configuration, Telemetry Summary, Orbital Pass).

## 3. UI Interaction Patterns

The application extensively uses advanced interaction patterns to keep the operator engaged in the current context without unnecessary page reloads.

### A. Inlays (In-page Editing)
- **Use Case:** RF Configuration & Mission Form.
- **Behavior:** The panel defaults to a read-only "Summary" state. When an Admin clicks "Edit Configuration", the panel smoothly transitions into a form (inputs, selects, sliders) taking up the exact same spatial footprint. 
- **UX Benefit:** Prevents context loss by avoiding modal popups for primary configuration tasks.

### B. Overlays (Modals & Details)
- **Use Case:** Telemetry Settings, Satellite Detail Cards.
- **Behavior:** Centered modals with a dark, semi-transparent blur backdrop (`backdrop-filter: blur(4px)`). The main dashboard remains visible underneath to maintain situational awareness.
- **UX Benefit:** Focuses user attention on specific drill-down data or critical threshold configurations while keeping the global state visible.

### C. Virtual Pages (Tabbed Sub-views)
- **Use Case:** Orbital Pass (Live, Next Pass, History), AI Routing (Decision Queue, Current Decision, History), Payloads (Queued, Transmitting, Completed).
- **Behavior:** Secondary navigation embedded directly within panels. Clicking a tab swaps the content area of that specific panel without altering the surrounding dashboard layout.
- **UX Benefit:** Consolidates complex tools into single panels, dramatically reducing screen clutter.

### D. Drag and Drop
- **Use Case:** RF Payload Manager (Transmission Queue).
- **Behavior:** Utilizes native HTML5 drag-and-drop. Payload items display a `≡` drag handle. Admins can visually reorder the queue.
- **Constraints:** System-critical payloads (e.g., `TT&C`, `Housekeeping`) are locked (`🔒`) and cannot be moved, ensuring the UI prevents invalid mission configurations.

## 4. Component Design Principles

- **Borders & Corners:** Sharp, 4px border-radius maximum. Thick borders are avoided; instead, 1px solid lines with cyan accents define hierarchy.
- **Feedback & States:** 
  - Buttons and interactive elements feature subtle transition effects (`0.3s`). 
  - Hover states often lighten borders or apply a faint cyan box-shadow (`box-shadow: 0 0 15px rgba(0, 207, 255, 0.5)`).
- **Role-Based Rendering:** UI components intelligently adapt based on the user's role. For example, "Student" users see read-only text or disabled states for settings and drag-and-drop handles, whereas "Admin" users receive full interactive controls.

## 5. Responsive Behavior

While optimized for desktop mission-control displays, the application degrades gracefully:
- The `mission-dashboard-grid` shifts from a multi-column layout to a single column on smaller screens (`max-width: 900px`).
- The sidebar transforms into a horizontally scrolling navigation bar at the top of the content area to preserve vertical real estate.
