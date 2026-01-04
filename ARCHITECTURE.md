# Architecture & Implementation Specs

> [!NOTE]
> **Implementation Target: Swift (iOS)**
> While this codebase is in TypeScript/React, it serves as the functional specification for the Native iOS App. All logic, data structures, and UI patterns described below should be translated to Swift/SwiftUI.

## Directory Structure (Prototype)

```
components/
├── Views/              # Main Screens (ViewControllers)
│   ├── HomeView.tsx    # Dashboard Hub
│   ├── MapView.tsx     # World/Travel Map
│   ├── PhysioView.tsx  # Health Metrics
│   ├── SocialView.tsx  # Social Sphere & Rankings
│   └── ProView.tsx     # Career & Finance
├── Modals/             # Detail Views (Sheet Presentations)
│   ├── Modal.tsx       # Reusable accessible modal base
│   ├── CareerGoalModal.tsx
│   ├── CountryDetailModal.tsx
│   └── ...
├── Cards/              # Reusable UI Components (SwiftUI Views)
│   ├── PhysioCard.tsx
│   ├── StatCard.tsx
│   └── ...
└── UI/                 # Core Design System
    ├── ProgressBar.tsx
    └── SectionHeader.tsx
```

## Architectural Patterns

### 1. View Architecture
- **Web:** Views are large components managing their own state.
- **iOS Translation:** Each `View` component should map to a `UIViewController` or a main `View` in SwiftUI.
- **State Management:** The current `useState` hooks represent the local `@State` or `@ObservedObject` needed in Swift.

### 2. Navigation & Modals
- **Web:** Modals use React Portals (`createPortal`).
- **iOS Translation:** Use native sheet presentations (`.sheet()`, `.fullScreenCover()`) or NavigationStack pushes.
- **Accessibility:** The prototype implements focus trapping and aria-labels, which should map to iOS `AccessibilityModifiers`.

### 3. Data Model
- **Mock Data:** Located in `data/mockData.ts`.
- **iOS Translation:** Define Codable Structs/Classes in Swift matching these interfaces (`UserProfile`, `Trip`, `Skill`, etc.).
- **Persistence:** Prototype uses static data; iOS app should use **CoreData** or **SwiftData** for local persistence.

## UI Design System
- **Styling:** Glassmorphism and modern clean UI.
- **Components:**
  - **StatCard:** Standardizes metric displays.
  - **ProgressBar:** Uniform progress visualization.
  - **SectionHeader:** Consistent typography for sections.
  - **Animations:** Prototype uses CSS/Framer Motion; iOS should use SwiftUI native animations (`withAnimation`, `.transition`).
