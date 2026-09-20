# 🛰️ SomaiyaSat & SomaiyaPod Mission Control

> **Autonomous Inter-Satellite Data Routing, Telemetry Monitoring & Express.js Ground Station Control**

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite 8](https://img.shields.io/badge/Vite-8.2-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Express 5](https://img.shields.io/badge/Express-5.2-000000?style=flat-square&logo=express)](https://expressjs.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](#license)

**SomaiyaSat (KJS-SRS-01)** is a PocketQube satellite (5cm form factor) designed for Low Earth Orbit (LEO) demonstration of autonomous inter-satellite communication routing, telemetry streaming, and dynamic radio payload management. 

This repository houses the complete **Mission Control Application**, combining a high-performance React 19 single-page dashboard with a modular **Express.js REST API** backend for persistent pass scheduling, payload queueing, satellite telemetry, and RF transceiver configurations.

---

## 🚀 What the Project Does

The SomaiyaSat Mission Control platform provides space engineers and students with an interactive ground control system to:

- **Monitor Telemetry**: Track real-time satellite battery levels, signal strength, temperature, and orbit degradation with live sparkline history.
- **Schedule Ground Station Passes**: Compute and store upcoming orbital pass windows using structured inputs or natural language coordinate strings (e.g., `19.0760 N, 72.8777 E tomorrow at 4pm`).
- **Manage Radio Payloads**: Control bandwidth allocation and priority queues across TT&C, SSTV (Image Downlink), Codec2 (Voice), and M17 digital modes.
- **Configure RF Transceivers**: Remotely tune uplink/downlink frequencies, transmit power limits, and operational downtime windows.
- **Track External Spacecraft**: Visualize real-time live ISS (International Space Station) orbital telemetry fetched from public REST endpoints.

---

## ✨ Why the Project is Useful

- **Autonomous Routing Engine**: Simulates onboard AI policy agents that adjust payload priority dynamically based on battery reserve and signal degradation.
- **Role-Based Operational Safety**: Implements Admin (full read-write ground command authority) and Student (read-only telemetry monitoring) modes.
- **Modular Express Architecture**: Built using decoupled Express.js routes, custom validation middleware, and structured JSON error handlers suitable for third-year computer engineering & aerospace lab studies (Experiment No. 06).
- **Dual API Demonstration**: Seamlessly integrates local mission REST services alongside third-party public satellite APIs.

---

## 🛠️ Architecture & Tech Stack

```
SomaiyaSat Mission Control
├── Frontend (Port 5173)    ──> React 19 + Vite + Axios / Fetch + Vanilla CSS
└── Express Backend (Port 3000) ──> Express 5 + CORS + Modular Routers + JSON Persistence
```

### Core Technologies

- **Frontend**: React 19, Vite 8, JavaScript (ES6+/JSX), Vanilla CSS (Cyberpunk/Sci-Fi aesthetics), Axios & native Fetch.
- **Backend**: Node.js, Express.js (CommonJS `.cjs`), CORS middleware.
- **Data Persistence**: Lightweight JSON database engine (`server/data/db.json`).

---

## 📦 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18.0.0 or higher) and **npm** installed on your system.

```bash
node -v
npm -v
```

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/osh-mkumar/SomaiyaSat.git
   cd SomaiyaSat
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

### Running the Application

Launch both the **Vite Frontend** (`http://localhost:5173`) and the **Express Backend** (`http://localhost:3000`) concurrently:

```bash
npm run dev
```

Terminal output confirm services:
```
[0] VITE v8.2.0 ready in 150 ms
[0] ➜ Local: http://localhost:5173/
[1] SomaiyaSat Express API running on port 3000
```

---

## 📡 Express API Endpoints Reference

The backend exposes the following modular REST endpoints under `/api`:

| Method | Endpoint | Description | Validation / Payload |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | API status check | Returns `{ success: true, message: ... }` |
| **GET** | `/api/satellites` | List all satellites | Array of satellite records |
| **GET** | `/api/satellites/:id` | Fetch specific satellite | Satellite object by ID |
| **POST** | `/api/satellites` | Create satellite record | Requires `name`, `battery` (0-100), `signal` (0-100), `temp`, `orbit` |
| **PUT** | `/api/satellites/:id` | Update satellite record | Validates updated satellite attributes |
| **DELETE**| `/api/satellites/:id` | Delete satellite record | Removes satellite from database |
| **GET** | `/api/payloads` | List payload queue | Array of active payloads |
| **POST** | `/api/payloads` | Create payload record | Requires `name`, `type`, `priority`, `size`, `status` |
| **GET** | `/api/passes` | List scheduled passes | Array of scheduled pass windows |
| **POST** | `/api/passes` | Schedule pass | Validates coordinates (Lat -90..90, Lon -180..180) and time |
| **DELETE**| `/api/passes/:id` | Cancel scheduled pass | Removes pass from schedule |
| **GET** | `/api/config` | Get RF configuration | Transceiver frequency, bandwidth, power, downtime |
| **PUT** | `/api/config` | Update RF configuration | Validates frequency limits and power budget |

---

## 💻 Available Scripts

- `npm run dev`: Runs Vite frontend and Express server concurrently.
- `npm run server`: Runs the Express backend server independently on port `3000`.
- `npm run build`: Compiles production bundle using Vite.
- `npm run lint`: Runs code quality checks using `oxlint`.
- `npm run preview`: Previews the production build locally.

---

## 📁 Repository Structure

```
SomaiyaSat/
├── server/
│   ├── app.cjs                 # Express app initialization & error handling
│   ├── data/
│   │   └── db.json             # JSON database store
│   ├── middleware/
│   │   ├── validation.cjs      # Request payload validation middleware
│   │   └── errorHandler.cjs    # 400, 404, 500 error response handlers
│   ├── routes/
│   │   ├── satellites.cjs      # Satellite CRUD router
│   │   ├── payloads.cjs        # Payload manager router
│   │   ├── passes.cjs          # Pass scheduling router
│   │   └── config.cjs          # RF configuration router
│   └── utils/
│       └── database.cjs        # JSON read/write persistence helper
├── src/
│   ├── components/             # React dashboard UI components
│   ├── services/
│   │   └── satelliteApi.js     # Axios / Fetch API client layer
│   ├── utils/
│   │   └── Validation.js       # Client-side input validators
│   ├── App.jsx                 # Application root & tab layout
│   └── App.css                 # Cyberpunk UI design system
├── package.json
└── vite.config.js
```

---

## 🤝 Contributing & Maintainers

Contributions, issues, and feature requests are welcome!

1. Fork the project repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

### Maintainer

Developed for the **SomaiyaSat Space Team** mission control division.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
