# Architecture & Implementation Specs

> [!NOTE]
> **Implementation Target: Swift (iOS)**
> While this codebase is in TypeScript/React, it serves as the functional specification for the Native iOS App. All logic, data structures, and UI patterns described below should be translated to Swift/SwiftUI.

---

## 🔀 Dual Architecture Overview

The STATS App implements **two distinct architectural modes** that share the same UI layer but differ fundamentally in their data sources and authentication requirements:

### 🌐 Mode 1: Visitor Mode (Demo/Guest Experience)
**Purpose:** Showcase the full application capabilities without requiring user authentication or database connection.

**Characteristics:**
- ✅ **No authentication required** - Instant access to all features
- ✅ **Static demo data** - Pre-populated with realistic sample data (e.g., "Jeffrey" persona)
- ✅ **Read-only experience** - Users cannot modify data
- ✅ **Zero backend dependency** - Fully functional offline
- ✅ **Onboarding preview** - Allows exploration before commitment

**Use Cases:**
- First-time visitors exploring the app
- App Store preview/demo mode
- Testing and development
- Offline demonstrations

---

### 🔐 Mode 2: Authenticated Mode (Supabase-Connected Users)
**Purpose:** Provide personalized, persistent data management for registered users.

**Characteristics:**
- 🔒 **Authentication required** - Email/password login via Supabase Auth
- 🗄️ **Live database connection** - Real-time sync with Supabase PostgreSQL
- ✏️ **Full CRUD operations** - Users create, read, update, delete their data
- 🔄 **Multi-device sync** - Data accessible across devices
- 🛡️ **Row-Level Security (RLS)** - Users can only access their own data
- 📊 **Advanced features** - AI analysis, Edge Functions, user search, connections

**Use Cases:**
- Registered users managing their personal data
- Long-term tracking and analytics
- Social features (connections, comparisons)
- Data persistence and history

---

## 📂 Directory Structure (Prototype)

```
/app
├── page.tsx                # Root page - Auth router (login check)
├── login/page.tsx          # Authentication page (Supabase Auth UI)
├── onboarding/page.tsx     # New user setup flow
└── auth/callback/route.ts  # OAuth callback handler

/components
├── Views/                  # Main Screens (ViewControllers)
│   ├── HomeView.tsx        # Dashboard Hub - Harmony Score + Modules
│   ├── MapView.tsx         # World/Travel Map - Mapbox Integration
│   ├── PhysioView.tsx      # Health Metrics - Sleep, Sport, Nutrition
│   ├── SocialView.tsx      # Social Sphere & Rankings - TrueCircle
│   ├── ProView.tsx         # Career & Finance - Net Worth, Skills
│   ├── ProfileView.tsx     # User Profile (ViewSheet overlay)
│   └── SettingsView.tsx    # App Settings (ViewSheet overlay)
├── Modals/                 # Detail Views (Sheet Presentations)
│   ├── Modal.tsx           # Reusable accessible modal base
│   ├── HarmonyHistoryModal.tsx
│   ├── CareerGoalModal.tsx
│   └── CountryDetailModal.tsx
├── Cards/                  # Reusable UI Components
│   ├── PhysioCard.tsx
│   ├── StatCard.tsx
│   └── ComparisonCard.tsx
└── UI/                     # Core Design System
    ├── ViewSheet.tsx
    ├── SwipeableCard.tsx
    └── BottomSheet.tsx

/contexts
├── AuthContext.tsx         # 🔑 Authentication state provider (Supabase session)
├── ThemeContext.tsx        # Dark/Light mode management
└── LanguageContext.tsx     # i18n (FR/EN)

/hooks                      # 🔀 DUAL-MODE DATA HOOKS
├── useHealthData.ts        # Sleep, Sport, Nutrition data fetching
├── useSocialData.ts        # Contacts, Connections, Rankings
├── useTravelData.ts        # Countries, Trips
├── useFinancialData.ts     # Assets, Career, Skills
└── useProfileData.ts       # User profile and avatar

/data
├── mockData.ts             # 🌐 VISITOR MODE - Demo data source
├── demoHealthData.ts       # Demo health records
├── demoSocialData.ts       # Demo contacts and social graph
└── demoTravelData.ts       # Demo trips and countries

/utils
└── supabase/
    └── client.ts           # 🔐 Supabase client initialization

/supabase
├── functions/              # Edge Functions
│   └── ai-analyst/         # AI-powered data analysis
└── migrations/             # Database schema migrations
```

---

## 🏗️ Architectural Patterns

### 1. Authentication Flow & Mode Detection

The application automatically detects which mode to operate in based on authentication state:

```typescript
// AuthContext.tsx - Core authentication provider
const { user, session, loading } = useAuth()

if (user) {
  // 🔐 AUTHENTICATED MODE
  // - Fetch data from Supabase
  // - Enable write operations
  // - Show user-specific features
} else {
  // 🌐 VISITOR MODE
  // - Load demo data from /data/mockData.ts
  // - Display read-only interface
  // - Show "Login to save changes" prompts
}
```

**Authentication Provider Responsibilities:**
- Initialize Supabase auth session on mount
- Listen for auth state changes (`onAuthStateChange`)
- Provide `user`, `session`, `loading`, and `signOut` to all components
- Persist session across page reloads

---

### 2. Data Fetching Hooks (Dual-Mode Pattern)

All data hooks follow this **intelligent fallback pattern**:

#### Example: `useHealthData()` Hook

```typescript
export function useHealthData(): HealthData {
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([])
  const [isDemo, setIsDemo] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      // 1️⃣ Check authentication status
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // 🌐 VISITOR MODE - Load demo data
        setSleepRecords(DEMO_SLEEP_RECORDS)
        setIsDemo(true)
        setIsLoading(false)
        return
      }

      // 🔐 AUTHENTICATED MODE - Fetch from Supabase
      setIsDemo(false)
      const { data, error } = await supabase
        .from('sleep_records')
        .select('*')
        .eq('user_id', user.id)  // RLS ensures data isolation
        .order('date', { ascending: false })
        .limit(30)

      if (data) setSleepRecords(data)
      
      // Fallback on error
      if (error) {
        console.error(error)
        setSleepRecords(DEMO_SLEEP_RECORDS)
        setIsDemo(true)
      }
      
      setIsLoading(false)
    }

    fetchData()
  }, [])

  return { sleepRecords, isLoading, isDemo, refetch: fetchData }
}
```

**Pattern Applied to All Hooks:**
- ✅ `useHealthData()` - Sleep, Sport, Body, Nutrition
- ✅ `useSocialData()` - Contacts, Connections, Rankings
- ✅ `useTravelData()` - Countries, Trips, Locations
- ✅ `useFinancialData()` - Assets, Career Goals, Skills
- ✅ `useProfileData()` - User profile, avatar, username

---

### 3. Supabase Database Schema (Authenticated Mode Only)

#### Core Tables (PostgreSQL)

```sql
-- Users table (managed by Supabase Auth)
auth.users
  - id (uuid, primary key)
  - email
  - created_at

-- User profiles (extended metadata)
public.profiles
  - user_id (uuid, references auth.users)
  - username (text, unique)
  - full_name (text)
  - avatar_url (text)
  - bio (text)
  - created_at (timestamp)

-- Health module tables
public.sleep_records
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - date (date)
  - duration (integer) -- minutes
  - quality_score (integer) -- 1-100
  - deep_sleep (integer) -- minutes
  - rem_sleep (integer) -- minutes

public.sport_sessions
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - date (date)
  - activity_type (text) -- 'running', 'cycling', etc.
  - duration (integer) -- minutes
  - distance (numeric) -- km
  - calories (integer)

public.body_measurements
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - date (date)
  - weight (numeric) -- kg
  - body_fat (numeric) -- percentage
  - muscle_mass (numeric) -- kg

-- Social module tables
public.contacts
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - name (text)
  - category (text) -- 'intimate', 'close', 'casual', 'acquaintance'
  - last_interaction (date)
  - trust_level (integer) -- 1-10

public.connections
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - connected_user_id (uuid, references auth.users)
  - status (text) -- 'pending', 'accepted', 'blocked'
  - created_at (timestamp)

-- Travel module tables
public.countries
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - country_code (text) -- ISO 3166-1 alpha-2
  - visit_count (integer)
  - total_days (integer)
  - first_visit (date)
  - last_visit (date)

public.trips
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - country_code (text)
  - start_date (date)
  - end_date (date)
  - trip_type (text) -- 'leisure', 'business'

-- Finance module tables
public.assets
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - asset_type (text) -- 'real_estate', 'stocks', 'crypto', 'savings'
  - value (numeric)
  - currency (text) -- 'EUR', 'USD', etc.
  - last_updated (timestamp)

public.career_goals
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - target_position (text)
  - target_salary (numeric)
  - target_date (date)
  - probability (numeric) -- 0-1
```

#### Row-Level Security (RLS) Policies

All tables enforce strict data isolation:

```sql
-- Example RLS policy for sleep_records
CREATE POLICY "Users can only view their own sleep records"
  ON sleep_records
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own sleep records"
  ON sleep_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**Benefits:**
- 🛡️ Automatic data isolation - no manual checks needed
- 🔒 Database-enforced security - impossible to bypass
- 🚀 Simplified application code - no complex permission logic

---

### 4. Navigation & Gesture System

- **TabBar Navigation:** 
  - Horizontal swipe gestures on TabBar change active view
  - Built with `framer-motion` drag handlers
  - iOS Translation: Use `UIPageViewController` or custom gesture recognizers
  
- **ViewSheet Overlays:**
  - Profile and Settings use full-screen overlays instead of navigation pushes
  - Swipe-down to dismiss with spring animations
  - iOS Translation: `.sheet()` presentation with `interactiveDismissalDisabled(false)`
  
- **Modal System:**
  - All modals support swipe-to-close gesture
  - Drag only when scrolled to top to prevent conflicts
  - iOS Translation: Native `.sheet()` with drag indicator
  
- **Swipeable Cards:**
  - Contact cards reveal actions on swipe (call, message, remind)
  - iOS Translation: Custom `UICollectionViewCell` with pan gesture or SwiftUI `DragGesture`

---

## 🔄 Data Flow Diagrams

### Visitor Mode Flow
```
User Opens App
      ↓
No Auth Session Detected
      ↓
AuthContext: user = null
      ↓
useHealthData() checks user
      ↓
user === null → Load DEMO_SLEEP_RECORDS
      ↓
Component Renders with Demo Data
      ↓
UI shows "👁️ Visitor Mode" indicator
```

### Authenticated Mode Flow
```
User Logs In (Supabase Auth)
      ↓
Session Created & Stored
      ↓
AuthContext: user = { id, email, ... }
      ↓
useHealthData() checks user
      ↓
user !== null → Query Supabase
      ↓
SELECT * FROM sleep_records WHERE user_id = ...
      ↓
RLS Policy Validates user_id = auth.uid()
      ↓
Component Renders with User's Real Data
      ↓
UI enables Write/Edit buttons
```

---

## 🎨 UI Design System

- **Styling:** Glassmorphism 2.0 and modern clean UI
- **Components:**
  - **StatCard:** Standardizes metric displays
  - **ProgressBar:** Uniform progress visualization
  - **SectionHeader:** Consistent typography for sections
  - **ViewSheet:** Full-screen overlay with drag handle and swipe-down dismiss
  - **SwipeableCard:** Swipe-to-reveal action buttons (iOS Mail-style)
  - **Animations:** Prototype uses CSS/Framer Motion; iOS should use SwiftUI native animations

---

## 📱 iOS Translation Notes

### Data Persistence Strategy

**Visitor Mode:**
- Store demo data in Swift structs/enums
- No persistence needed (ephemeral)

**Authenticated Mode:**
- Use **SwiftData** (iOS 17+) or **CoreData** for local caching
- Sync with Supabase on network availability
- Implement offline-first architecture:
  1. User edits data locally
  2. Changes queued for sync
  3. Background sync when online
  4. Conflict resolution on server

### Authentication (iOS)
```swift
import Supabase

let supabase = SupabaseClient(
    supabaseURL: URL(string: "https://xxx.supabase.co")!,
    supabaseKey: "your-anon-key"
)

// Check auth status
if let session = try await supabase.auth.session {
    // Authenticated mode
    let userId = session.user.id
    fetchUserData(userId)
} else {
    // Visitor mode
    loadDemoData()
}
```

### Gesture Implementation
- Use `UIPanGestureRecognizer` or SwiftUI `DragGesture` for swipe detection
- Implement velocity-based thresholds (200pt/s) for reliable recognition
- Add haptic feedback on gesture completion (`UIImpactFeedbackGenerator`)
- Respect system accessibility settings (VoiceOver, Reduce Motion)

---

## 🔐 Security & Privacy

### Visitor Mode
- ✅ No personal data stored or transmitted
- ✅ No authentication credentials required
- ✅ Safe for public demonstrations

### Authenticated Mode
- 🔒 **Transport Security:** HTTPS/TLS for all API calls
- 🔒 **Database Security:** RLS policies enforce user isolation
- 🔒 **Password Security:** Supabase Auth handles hashing/salting
- 🔒 **Token Security:** JWT tokens with automatic expiration
- 🔒 **API Security:** Edge Functions validate JWT before execution
- 🔒 **Privacy:** User can request data export or deletion (GDPR compliant)

---

## 🚀 Advanced Features (Authenticated Mode Only)

### Edge Functions
- **ai-analyst:** Groq-powered AI analysis of user data
  - Analyzes all user metrics (health, social, travel, finance)
  - Returns personalized insights and recommendations
  - Uses `llama-3.1-8b-instant` model
  - Excludes sensitive PII (name, email, phone) from analysis

### Real-Time Features
- **Live Updates:** Supabase Realtime subscriptions for instant data sync
- **Presence:** See which friends are online (future feature)
- **Collaborative Rankings:** Live social leaderboards

### Social Features
- **User Search:** Find friends by username
- **Connections:** Send/accept connection requests
- **Comparisons:** Compare stats with connections
- **Privacy Controls:** Control who sees what data

