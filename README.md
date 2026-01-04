# STATS App - Personal Life Analytics Platform

> [!IMPORTANT]
> **Native iOS/Swift Implementation Required**
> This repository contains the **React/Next.js functional prototype** of the STATS App. It serves as the interactive specification for the final product.
>
> **The production application must be implemented entirely in Swift** (SwiftUI/UIKit) to leverage native iOS frameworks (HealthKit, MapKit, SceneKit, CoreData) and ensure premium performance on Apple devices.

## Vision
STATS is not just a habit tracker; it is a **Quantified Self** dashboard that treats life as a high-performance role-playing game. It aggregates disparate data points—health biometrics, social interactions, travel history, and financial growth—into a unified, aesthetically stunning interface.

The goal is to provide **Actionable Intelligence** on the user's life balance, using the "TrueCircle" philosophy to visualize social proximity and "Life Modules" to track personal development.

---

## Application Modules

The application is divided into 5 core modules, each representing a pillar of the user's life.

### Module A: Health (Physio)
*Complete biometric and lifestyle tracking.*
- **Sleep Analysis:** Tracks duration, quality, deep/REM cycles, and awakenings.
- **Physio Metrics:** Resting heart rate (RHR), HRV, VO2 Max, and recovery scores.
- **Nutrition & Hydration:** Macro tracking (Protein/Carbs/Fat) and water intake.
- **Goal System:** Interactive "ring" interfaces for setting and hitting daily targets.
- **iOS Roadmap:** Direct integration with **HealthKit** to auto-populate data from Apple Watch.

### Module B: World (Exploration)
*Travel log and global footprint analysis.*
- **Interactive Map:** Mapbox-integrated 3D interactive map showing visited countries with custom styling.
- **Country Stats:** Detailed breakdown per country (Total visits, days spent, regions explored).
- **Trip Journal:** Chronological log of trips (Leisure vs Business) with distance calculations.
- **Heatmap:** Visualization of "conquered" territories.
- **iOS Roadmap:** **MapKit** for native rendering and **CoreLocation** for automatic visit detection.

### Module C: Growth (Finance & Career)
*Financial health and professional development.*
- **Asset Allocation:** Breakdown of net worth (Real Estate, Stocks, Crypto, Savings).
- **Financial Projections:** Interactive charts simulating future wealth based on savings rates.
- **Career Roadmap:** Title progression planning with probability calculators.
- **Skill Tree:** Endorsement-based skill verification system.
- **iOS Roadmap:** **Swift Charts** for high-performance financial visualizations and **LocalAuthentication** (FaceID) for privacy.

### Module D: Achievements (Gamification)
*Life milestones and rewards.*
- **Rarity System:** Badges classified by rarity (Common to Legendary).
- **Categories:** Physical, Mental, Social, Exploration rewards.
- **Progress Tracking:** XP bars for leveling up different life areas.

### � Module E: Social (TrueCircle)
*Dunbar's Number visualization and relationship management.*
- **The Sphere:** A 3D "Liquid Glass" sphere visualizing social proximity. Inner nodes = closer friends.
- **Dunbar Circles:** Categorization of contacts (Intimates, Close Friends, Casual, Acquaintances).
- **Interactions:** Tracking "Time Since Last Contact" to prompt reconnections.
- **Rankings:** Leaderboards for social activity and fitness comparisons.
- **iOS Roadmap:** **SceneKit** or **Metal** for rendering the 3D sphere natively with 60fps performance.

---

## Design System & UX Philosophy

- **Aesthetics:** "Glassmorphism 2.0" — heavily reliant on blur effects (`backdrop-filter`), translucent layers, and soft, dynamic shadows.
- **Interactivity:** Every element is "alive". Cards hover, buttons press deeply, and charts animate on entry.
- **Liquid Physics:** Profile pictures and spheres use a custom "emulsion" effect (implemented in Shader code) to feel organic and fluid.
- **3D First:** The primary navigation for Social and World views relies on spatial manipulation (rotating spheres/globes).
- **Dark Mode & Semantic Theming:** 
  - Comprehensive dark mode support with automatic system detection.
  - Using **Semantic Color Tokens** (iOS System Colors) for consistent theming.
  - Zero-flash implementation with intelligent background persistence.

---

## Technical Architecture (Prototype)

### Directory Structure
```
/components
  /Views         # Full-screen page controllers (Home, Map, Social, Pro)
  /Modals        # Sheet overlays (Detail views, Editors)
  /Cards         # Reusable widgets (StatCard, PhysioCard)
  /UI            # Atomic design elements (Buttons, Headers)
  /UI            # Atomic design elements (Buttons, Headers)
  /Visualizations # Three.js/Canvas complex renderings
/contexts        # React Context providers (Theme, Language)
/data
  mockData.ts    # The Single Source of Truth for user profile state
```

### Data Flow
- **Prototype:** React Context + Static JSON (`mockData.ts`).
- **Production (iOS):**
  - **Local Persistence:** CoreData / SwiftData models mirroring `UserProfile.ts`.
  - **Remote Sync:** CloudKit or Firebase for multi-device sync.

---

## Getting Started (Prototype)

This is a **Next.js 14** application using **TypeScript** and **Tailwind CSS**.

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/stats-app.git
   ```
2. Install dependencies:
   ```bash
   cd stats-app
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Accessibility (Phase 6 Specs)

- **Semantic HTML:** Correct use of `<h1>` through `<h3>` for screen reader hierarchy.
- **ARIA Labeling:** Interactive elements (even WebGL canvases) must have descriptive `aria-labels`.
- **Keyboard Navigation:** Full focus trap support in modals and logical tab indexing.
- **Reduced Motion:** Respect system settings for users sensitive to parallax/3D motion.
