# SomaiyaSat & SomaiyaPod Mission Profile

**Autonomous Inter-Satellite Data Routing & Payload System**

SomaiyaSat is a PocketQube satellite designed to demonstrate autonomous communication scheduling and intelligent payload management. Operating alongside SomaiyaPod, the spacecraft validates deployment, initializes flight software, and begins telemetry transmission automatically.

The onboard AI continuously evaluates communication quality, available battery power, and payload priorities to maximize data return during limited ground station visibility windows.

## Technical Parameters

- **Mission ID**: KJS-SRS-01
- **Orbit**: Low Earth Orbit (LEO)
- **Form Factor**: PocketQube (5cm Unit)
- **Power Budget**: < 1.0W Average
- **AI Subsystem**: Decision Tree / Policy Agent
- **Primary Frequencies**: Amateur HAM Bands

## Key Features

1. **Autonomous Routing Engine**: The onboard scheduler determines which subsystem should receive communication bandwidth based on battery percentage, signal quality, queue urgency, and mission objectives.
2. **Dynamic Mode Switching**: e.g., if Battery < 25%, enables power saving and suspends imaging.
3. **Payload Operations**: Priority scheduling for TT&C (Housekeeping), SSTV (Image Downlink), Codec2 (Voice), and M17 (Digital Communication).

## Tech Stack
- **Frontend**: React 19, Vite
- **Data Fetching**: Axios
- **Mock Backend**: `json-server` for local telemetry and payload data
- **External API**: Integration with ISS tracking API for orbit visualization.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server (runs both Vite frontend and json-server mock backend):
   ```bash
   npm run dev
   ```

3. The app will be available at `http://localhost:5173`. The mock API runs on `http://localhost:3001`.

## UI Components Overview
- **TopBar**: User authentication/role management (Admin, User, etc.).
- **Sidebar**: Navigation between the Mission Dashboard, Telemetry, Payloads, External Data, and AI Routing engine tabs.
- **Mission Dashboard Grid**: Contains real-time overview via `RFPanel`, `TelemetryPanel`, and `OrbitPanel`.
- **Payloads Panel**: Visualizes queue and payload execution status.
- **External Data Panel**: Pulls and displays external satellite data (like ISS positions).

## Scripts

- `npm run dev`: Starts the React app and JSON mock server concurrently.
- `npm run build`: Builds the app for production.
- `npm run lint`: Runs Oxlint.
- `npm run preview`: Previews the production build.
- `npm run api`: Starts the JSON server independently.
