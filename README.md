# STATS App - Personal Life Analytics Platform

> [!IMPORTANT]
> **Native iOS/Swift Implementation Required**
> This repository contains the **React/Next.js functional prototype** of the STATS App. It serves as the interactive specification for the final product.
>
> **The production application must be implemented entirely in Swift** (SwiftUI/UIKit) to leverage native iOS frameworks (HealthKit, MapKit, SceneKit, CoreData) and ensure premium performance on Apple devices.

---

## Vision

STATS is not just a habit tracker; it is a **Quantified Self** dashboard that treats life as a high-performance role-playing game. It aggregates disparate data points—health biometrics, social interactions, travel history, and financial growth—into a unified, aesthetically stunning interface.

The goal is to provide **Actionable Intelligence** on the user's life balance, using the "TrueCircle" philosophy to visualize social proximity, **Logarithmic Charts** for data visualization, and "Life Modules" to track personal development.

---

## � Quick Navigation

**Understanding the Dual Architecture:**
- **[docs/architecture/MODES.md](./docs/architecture/MODES.md)** - Quick reference guide to Visitor vs Authenticated modes
- **[docs/architecture/ARCHITECTURE.md](./docs/architecture/ARCHITECTURE.md)** - Complete technical specifications with database schema
- **[docs/architecture/ARCHITECTURE_FR.md](./docs/architecture/ARCHITECTURE_FR.md)** - Spécifications techniques en français
- **[docs/guides/VISUAL_GUIDE.md](./docs/guides/VISUAL_GUIDE.md)** - Visual diagrams and flowcharts
- **Below:** Feature comparison table, setup instructions, and module documentation

**Key Concepts:**
- The STATS App operates in **two distinct modes** sharing the same UI

---

## Authentication Required

**STATS requires user authentication.** All features are connected to Supabase:

- **Personal Data:** All modules (Health, Travel, Social, Career) fetch from Supabase
- **Row-Level Security:** Users can only access their own data
- **No Demo Mode:** Unauthenticated users are redirected to `/landing`
- **Onboarding:** New users complete profile setup before accessing the app

---
---

## HomeView Dynamic Modules

The HomeView displays 4 core modules with **real-time data from Supabase**:

| Module | Data Source | % Calculation | Subtitle |
|--------|------------|---------------|----------|
| **Santé (A)** | `useHealthData` | Avg sleep + activity scores | `X entrées` |
| **Monde (B)** | `useTravelData` | `countries / 195 × 100` | `X pays visités` |
| **Social (E)** | `useSocialData` | `friends / 50 × 100` | `X connexions` |
| **Carrière (D)** | `useProfileData` | jobTitle + company | Job title |

**Empty State:** New users see 0% for all modules until they add data.

---

## Application Modules

The application is divided into 5 core modules, each representing a pillar of the user's life.

### Module A: Health (Physio)
*Complete biometric and lifestyle tracking.*
- **Sleep Analysis:** Tracks duration, quality, deep/REM cycles, and awakenings.
- **Physio Metrics:** Resting heart rate (RHR), HRV, VO2 Max, and recovery scores.
- **Nutrition & Hydration:** Macro tracking (Protein/Carbs/Fat) and water intake.
- **AI Integration:** **PhysioView** analysis powered by Groq/Llama 3, providing personalized health insights.
- **Goal System:** Interactive "ring" interfaces for setting and hitting daily targets.
- **iOS Roadmap:** Direct integration with **HealthKit** to auto-populate data from Apple Watch.

### Module B: World (Exploration)
*Travel log and global footprint analysis.*
- **Interactive Map:** Mapbox-integrated 3D interactive map showing visited countries with custom styling.
- **Country Stats:** Detailed breakdown per country (Total visits, days spent, regions explored).
- **Trip Journal:** Chronological log of trips (Leisure vs Business) with distance calculations.
- **Heatmap:** Visualization of "conquered" territories.
- **Logarithmic Charts:** Visualization of travel history using logarithmic scales for better data density handling.
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

### Module E: Social (TrueCircle)
*Dunbar's Number visualization and relationship management.*
- **The Sphere:** A 3D "Liquid Glass" sphere visualizing social proximity.
- **Two-Tier System:** Categorization into **Inner Circle** (Close Friends) and **Friends** (Extended Network), with managed permissions.
- **Friend Management:** Add, remove, and categorize friends via `UserSearchModal` and `FriendProfileModal`.
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

## Gesture Navigation System

STATS implements a **modern gesture-based navigation system** that enhances the native mobile experience:

### Core Gestures
- **TabBar Swipe Navigation**
  - Swipe **right** on the bottom TabBar → Next tab (Health → Social → Home → World → Career)
  - Swipe **left** on the bottom TabBar → Previous tab
  - Isolated to TabBar only to avoid conflicts with 3D sphere interactions

- **ViewSheet Overlays** (Profile & Settings)
  - Swipe **down** from handle to dismiss
  - Full-screen overlay with smooth spring animations
  - Drag handle indicates interactivity

- **Modal Swipe-to-Close**
  - All modals support swipe-down gesture to dismiss
  - Only allows drag when content is scrolled to top

- **Contact Swipe Actions**
  - Swipe **left** on contact → Reveal Message & Remind actions
  - Swipe **right** on contact → Reveal Call action
  - iOS-style reveal animations with color-coded buttons

### Implementation Notes
- Built with `framer-motion` for smooth, physics-based animations
- Touch-optimized with `touchAction: 'pan-y'` to prevent horizontal scroll conflicts
- Threshold-based detection (velocity + offset) for reliable gesture recognition

---

## Technical Architecture (Prototype)

### Directory Structure

```
/app
├── page.tsx                     # Root router - Auth state check
├── login/page.tsx               # Supabase Auth UI
├── onboarding/page.tsx          # New user setup (username, avatar)
└── auth/callback/route.ts       # OAuth callback handler

/components
├── Views/                       # Full-screen page controllers
│   ├── HomeView.tsx             # Dashboard Hub - Harmony Score
│   ├── MapView.tsx              # World/Travel Map - Mapbox
│   ├── PhysioView.tsx           # Health Metrics
│   ├── SocialView.tsx           # Social Sphere & Rankings
│   ├── ProView.tsx              # Career & Finance
│   ├── ProfileView.tsx          # User Profile (ViewSheet)
│   └── SettingsView.tsx         # App Settings (ViewSheet)
├── Modals/                      # Sheet overlays (Detail views)
│   ├── UserSearchModal.tsx      # Find users and send requests
│   ├── FriendProfileModal.tsx   # Friend details and management
│   ├── CompareWithFriendModal.tsx # Compare stats with friends
│   ├── HarmonyHistoryModal.tsx  # Harmony Score analysis (AI)
│   ├── LogarithmicHistoryChart.tsx # Advanced data visualization
│   └── [Other feature-specific modals...]
├── Cards/                       # Reusable widgets (StatCard, PhysioCard)
├── UI/                          # Atomic design elements (Buttons, Headers)
└── Visualizations/              # Three.js/Canvas complex renderings

/contexts
├── AuthContext.tsx              # Authentication state provider
│                                # - Manages Supabase session
│                                # - Provides user, session, loading, signOut
│                                # - Triggers mode detection
├── ThemeContext.tsx             # Dark/Light mode management
└── LanguageContext.tsx          # i18n (FR/EN)

/hooks                           # DUAL-MODE DATA HOOKS
├── useHealthData.ts             # Sleep, Sport, Nutrition
│                                # - Checks user auth state
│                                # - If authenticated: Query Supabase
│                                # - If visitor: Load DEMO_SLEEP_RECORDS
├── useSocialData.ts             # Contacts, Connections, Rankings
├── useTravelData.ts             # Countries, Trips
├── useFinancialData.ts          # Assets, Career, Skills
└── useProfileData.ts            # User profile, avatar, username

/data                            # VISITOR MODE DATA SOURCE
├── mockData.ts                  # Main demo profile (Jeffrey) and all Demo Data
└── worldData.ts                 # ISO codes and global travel data

/utils
└── supabase/
    └── client.ts                # Supabase client initialization

/supabase                        # AUTHENTICATED MODE BACKEND
├── functions/                   # Edge Functions
│   └── ai-analyst/              # Groq AI-powered data analysis
│       └── index.ts             # Analyzes user data, returns insights
└── migrations/                  # Database schema migrations
    └── *.sql                    # Table definitions, RLS policies
```

### Data Flow Architecture

#### Visitor Mode Data Flow

```
User Opens App
      ↓
AuthContext Initializes
      ↓
supabase.auth.getSession() → null (No session)
      ↓
AuthContext: { user: null, session: null, loading: false }
      ↓
Components Render
      ↓
useHealthData() Hook Executes
      ↓
const { user } = await supabase.auth.getUser()
      ↓
user === null 
      ↓
Load DEMO_SLEEP_RECORDS from /data/demoHealthData.ts
      ↓
setState({ sleepRecords: DEMO_SLEEP_RECORDS, isDemo: true })
      ↓
PhysioView Renders with Demo Data
      ↓
UI shows " Viewing Demo Data" badge
      ↓
All "Add Entry" buttons disabled or show "Login to Track"
```

**Characteristics:**
- **Instant load** - No network calls
- **Offline-first** - No backend dependency
- **Privacy-safe** - No sensitive data transmitted
- **Marketing tool** - Showcases full UI without commitment

---

#### Authenticated Mode Data Flow

```
User Logs In via /login
      ↓
Supabase Auth: signInWithPassword(email, password)
      ↓
Session Created: { access_token: "...", user: { id, email, ... } }
      ↓
Session Stored in Local Storage (handled by Supabase)
      ↓
AuthContext: onAuthStateChange fires
      ↓
setState({ user: session.user, session: session })
      ↓
Components Re-render with user !== null
      ↓
useHealthData() Hook Re-executes
      ↓
const { user } = await supabase.auth.getUser()
      ↓
user !== null  (user.id = "uuid-1234-...")
      ↓
Query Supabase:
  SELECT * FROM sleep_records 
  WHERE user_id = 'uuid-1234-...' 
  ORDER BY date DESC 
  LIMIT 30
      ↓
 RLS Policy Check:
  POLICY: auth.uid() = user_id
   ALLOWED (user can only see their own data)
      ↓
Database Returns: [{ id, user_id, date, duration, ... }, ...]
      ↓
setState({ sleepRecords: data, isDemo: false })
      ↓
PhysioView Renders with User's Real Data
      ↓
UI shows user's avatar and username
      ↓
All "Add Entry" buttons enabled
      ↓
User clicks "Add Sleep Entry"
      ↓
INSERT INTO sleep_records (user_id, date, duration, ...) 
VALUES ('uuid-1234-...', '2026-01-06', 480, ...)
      ↓
 RLS Policy Check:
  POLICY: auth.uid() = user_id
   ALLOWED
      ↓
Data Saved to Database
      ↓
useHealthData() refetch() → UI updates
```

**Characteristics:**
- **Secure** - RLS ensures data isolation
- **Real-time** - Can subscribe to changes (Supabase Realtime)
- **Persistent** - Data survives sessions, devices
- **Scalable** - Supports millions of entries per user

---

### Supabase Database Schema (Authenticated Mode)

See `ARCHITECTURE.md` for complete schema details. Key tables:

**Authentication:**
- `auth.users` - Managed by Supabase Auth (email, password hash, etc.)

**User Data:**
- `profiles` - Extended user metadata (username, avatar_url, bio)
- `sleep_records` - Sleep duration, quality, deep/REM cycles
- `sport_sessions` - Workouts, activity type, calories
- `body_measurements` - Weight, body fat, muscle mass
- `contacts` - Social connections (TrueCircle)
- `connections` - Friend requests, accepted/pending connections
- `countries` - Visited countries, visit counts
- `trips` - Travel log (start date, end date, type)
- `assets` - Financial portfolio (real estate, stocks, crypto)
- `career_goals` - Professional targets and probabilities

**Security:**
- All tables protected by **Row-Level Security (RLS)** policies
- Users can only access rows where `user_id = auth.uid()`
- Automatic enforcement at database level (impossible to bypass)

---

### Authentication & Security

**Visitor Mode:**
- No credentials required
- No data stored
- Safe for public demonstrations

**Authenticated Mode:**
- **Email/Password:** Supabase Auth with bcrypt hashing
- **Session Management:** JWT tokens (1 hour default expiry, auto-refresh)
- **Transport:** HTTPS/TLS for all API calls
- **Database:** RLS policies enforce user isolation
- **Edge Functions:** JWT validation before execution
- **Privacy:** User data never shared; GDPR-compliant export/deletion available

---

### Technology Stack

**Frontend (Prototype):**
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom CSS (Glassmorphism)
- **Animations:** Framer Motion
- **3D Rendering:** Three.js (Social sphere, Map globe)
- **Maps:** Mapbox GL JS (World module)
- **i18n:** Context-based (FR/EN)

**Backend (Authenticated Mode):**
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth (JWT-based)
- **Storage:** Supabase Storage (for avatars)
- **Edge Functions:** Deno Deploy (for AI Analyst)
- **Edge Functions:** Deno Deploy (for AI Analyst)
- **AI:** Groq API (`llama-3.1-8b-instant`) with Multilingual Support (FR/EN/ES)
- **Real-time:** Supabase Realtime (optional)

**Production Target:**
- **iOS:** Swift + SwiftUI/UIKit
- **iOS Frameworks:** HealthKit, MapKit, SceneKit, CoreData/SwiftData
- **Backend:** Same (Supabase) or native CloudKit



---

## Mode Comparison Table

| Feature                        | **Visitor Mode**                          | **Authenticated Mode**                     |
|--------------------------------|---------------------------------------------|----------------------------------------------|
| **Authentication**             | Not required                              | Email/password via Supabase Auth          |
| **Data Source**                | Static JSON files (`/data/`)                | Supabase PostgreSQL database                 |
| **Data Persistence**           | None (ephemeral)                          | Permanent (multi-device sync)             |
| **Data Ownership**             | Demo persona ("Jeffrey")                    | User's personal data                         |
| **Create/Edit Data**           | Read-only                                 | Full CRUD operations                      |
| **Backend Dependency**         | None (offline-first)                      | Requires internet (offline cache planned) |
| **Security**                   | N/A (no real data)                          | RLS policies, JWT tokens, HTTPS          |
| **AI Analysis**                | Not available                             | Groq-powered insights (Edge Function)     |
| **Social Features**            | Demo contacts only (no actions)           | Search users, send requests, compare      |
| **User Search**                | Not available                             | Find friends by username                  |
| **Profile Customization**      | Fixed demo profile                        | Custom avatar, username, bio              |
| **Data Export/Deletion**       | N/A                                         | GDPR-compliant export/deletion            |
| **Real-time Sync**             | N/A                                         | Supabase Realtime (optional)              |
| **Performance**                | Instant (no network)                      | Network-dependent (typically <500ms)      |
| **Use Case**                   | Demo, preview, offline showcase             | Long-term tracking, analytics, social        |
| **Cost**                       | Free (no backend)                           | Supabase free tier or paid (per usage)       |
| **Privacy**                    | Zero data collection                      | User data stored (secured by RLS)         |
| **Multi-language Support**     | FR/EN/ES                                  | FR/EN/ES                                  |
| **Dark Mode**                  | Supported                                 | Supported                                 |
| **Gesture Navigation**         | Fully functional                          | Fully functional                          |
| **Logarithmic Charts**         | Supported (Demo Data)                     | Supported (Real Data)                     |

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

### Running in Visitor Mode (Default)

The app will **automatically run in Visitor Mode** if no Supabase credentials are configured or if you're not logged in.

- No additional setup required
- Demo data loads automatically
- Fully functional UI
- Login button redirects to `/login` page (requires Supabase setup)

**To test Visitor Mode:**
1. Ensure you're not logged in (or clear browser local storage)
2. Navigate to `http://localhost:3000`
3. Explore all modules with demo data (Jeffrey persona)

---

### Running in Authenticated Mode

To enable the full Supabase-powered experience:

#### 1. Set Up Supabase Project
1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key from **Settings → API**

#### 2. Configure Environment Variables
Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### 3. Run Database Migrations
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations (creates tables, RLS policies)
supabase db push
```

**Note:** Migration files are located in `/supabase/migrations/`. If migrations don't exist yet, you'll need to create them based on the schema documented in `ARCHITECTURE.md`.

#### 4. (Optional) Deploy Edge Functions
```bash
# Deploy AI Analyst function
supabase functions deploy ai-analyst

# Set Groq API key secret
supabase secrets set GROQ_API_KEY=your-groq-api-key
```

#### 5. Test Authenticated Mode
1. Restart the dev server (`npm run dev`)
2. Navigate to `http://localhost:3000/login`
3. Sign up with email/password
4. Complete onboarding (username, avatar)
5. Your data is now stored in Supabase!

**Verify RLS is Working:**
- Open Supabase dashboard → Table Editor → `sleep_records`
- You should only see rows where `user_id` matches your authenticated user ID
- Try creating a second account → each user sees only their own data

---

### Switching Between Modes

**Switch to Visitor Mode:**
- Click "Sign Out" in Settings
- Or clear browser local storage: `localStorage.clear()`

**Switch to Authenticated Mode:**
- Click "Login" button
- Sign in with your credentials

The app automatically detects auth state and loads the appropriate data source.

---

## Accessibility (Phase 6 Specs)

- **Semantic HTML:** Correct use of `<h1>` through `<h3>` for screen reader hierarchy.
- **ARIA Labeling:** Interactive elements (even WebGL canvases) must have descriptive `aria-labels`.
- **Keyboard Navigation:** Full focus trap support in modals and logical tab indexing.
- **Reduced Motion:** Respect system settings for users sensitive to parallax/3D motion.
