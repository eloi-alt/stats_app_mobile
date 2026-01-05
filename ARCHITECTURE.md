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
│   ├── ProView.tsx     # Career & Finance
│   ├── ProfileView.tsx # User Profile (ViewSheet overlay)
│   └── SettingsView.tsx # App Settings (ViewSheet overlay)
├── Modals/             # Detail Views (Sheet Presentations)
│   ├── Modal.tsx       # Reusable accessible modal base with swipe-to-close
│   ├── HarmonyHistoryModal.tsx # Harmony score details
│   ├── CareerGoalModal.tsx
│   ├── CountryDetailModal.tsx
│   └── ...
├── Cards/              # Reusable UI Components (SwiftUI Views)
│   ├── PhysioCard.tsx
│   ├── StatCard.tsx
│   ├── ComparisonCard.tsx
│   └── ...
└── UI/                 # Core Design System
    ├── ViewSheet.tsx      # Full-screen overlay with swipe-down dismiss
    ├── SwipeableCard.tsx  # Card with left/right swipe action reveals
    ├── BottomSheet.tsx    # Draggable bottom sheet
    ├── ProgressBar.tsx
    └── SectionHeader.tsx
```

## Architectural Patterns

### 1. View Architecture
- **Web:** Views are large components managing their own state.
- **iOS Translation:** Each `View` component should map to a `UIViewController` or a main `View` in SwiftUI.
- **State Management:** The current `useState` hooks represent the local `@State` or `@ObservedObject` needed in Swift.

### 2. Navigation & Gesture System
- **TabBar Navigation:** 
  - Horizontal swipe gestures on TabBar change active view
  - Built with `framer-motion` drag handlers
  - iOS Translation: Use `UIPageViewController` or custom gesture recognizers
  
- **ViewSheet Overlays:**
  - Profile and Settings use full-screen overlays instead of navigation pushes
  - Swipe-down to dismiss with spring animations
  - iOS Translation: `.sheet()` presentation with custom `interactiveDismissalDisabled(false)`
  
- **Modal System:**
  - All modals support swipe-to-close gesture
  - Drag only when scrolled to top to prevent conflicts
  - iOS Translation: Native `.sheet()` with drag indicator
  
- **Swipeable Cards:**
  - Contact cards reveal actions on swipe (call, message, remind)
  - iOS Translation: Custom `UICollectionViewCell` with pan gesture or SwiftUI `DragGesture`

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
  - **ViewSheet:** Full-screen overlay with drag handle and swipe-down dismiss.
  - **SwipeableCard:** Swipe-to-reveal action buttons (iOS Mail-style).
  - **Animations:** Prototype uses CSS/Framer Motion; iOS should use SwiftUI native animations (`withAnimation`, `.transition`, `.gesture`).

## Gesture Implementation Notes (iOS)
When translating gesture navigation to Swift:
- Use `UIPanGestureRecognizer` or SwiftUI `DragGesture` for swipe detection
- Implement velocity-based thresholds (200pt/s) for reliable recognition
- Add haptic feedback on gesture completion (`UIImpactFeedbackGenerator`)
- Respect system accessibility settings (VoiceOver, Reduce Motion)

