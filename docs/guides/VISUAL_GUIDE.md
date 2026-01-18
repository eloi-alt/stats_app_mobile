# 🎨 STATS App - Guide Visuel de l'Architecture Dual-Mode

## 🔍 Vue d'Ensemble Rapide

```
┌─────────────────────────────────────────────────────────────────────┐
│                         STATS APP                                   │
│                  Personal Life Analytics Platform                   │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │
                    ┌────────────▼────────────┐
                    │    AuthContext          │
                    │  Détecte l'état auth    │
                    └────────────┬────────────┘
                                 │
                ┌────────────────┴────────────────┐
                │                                 │
                ▼                                 ▼
    ┏━━━━━━━━━━━━━━━━━━━━┓         ┏━━━━━━━━━━━━━━━━━━━━━┓
    ┃  🌐 MODE VISITEUR  ┃         ┃ 🔐 MODE AUTHENTIFIÉ ┃
    ┃   (Demo/Guest)     ┃         ┃   (Supabase Users)  ┃
    ┗━━━━━━━━━━━━━━━━━━━━┛         ┗━━━━━━━━━━━━━━━━━━━━━┛
            │                                   │
            ▼                                   ▼
    ┌───────────────┐                  ┌────────────────┐
    │ Fichiers JSON │                  │ PostgreSQL DB  │
    │  /data/*.ts   │                  │   Supabase     │
    └───────────────┘                  └────────────────┘
            │                                   │
            ▼                                   ▼
    ┌───────────────┐                  ┌────────────────┐
    │  Données Démo │                  │ Données Réelles│
    │   "Jeffrey"   │                  │  Utilisateur   │
    └───────────────┘                  └────────────────┘
            │                                   │
            └───────────────┬───────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Interface UI │
                    │  (Identique)  │
                    └───────────────┘
```

---

## 📊 Comparaison Visuelle

### 🌐 MODE VISITEUR

```
┌─────────────────────────────────────────┐
│         CARACTÉRISTIQUES                │
├─────────────────────────────────────────┤
│ ✅ Aucune authentification requise      │
│ ✅ Données démo pré-chargées            │
│ ✅ Fonctionne 100% hors ligne           │
│ ✅ Chargement instantané (~200ms)       │
│ ❌ Lecture seule (pas de sauvegarde)    │
│ ❌ Pas de fonctionnalités IA            │
│ ❌ Pas de social (recherche, connexions)│
└─────────────────────────────────────────┘

FLUX DE DONNÉES:
┌──────────┐
│ Ouvre App│
└────┬─────┘
     │
     ▼
┌─────────────┐
│ user = null │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Charge fichiers  │
│  JSON locaux     │
│ mockData.ts      │
│ demoHealthData.ts│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Affiche données  │
│ démo (Jeffrey)   │
│ Badge "👁️ Demo"  │
└──────────────────┘
```

---

### 🔐 MODE AUTHENTIFIÉ

```
┌─────────────────────────────────────────┐
│         CARACTÉRISTIQUES                │
├─────────────────────────────────────────┤
│ ✅ Authentification email/password      │
│ ✅ Base de données PostgreSQL           │
│ ✅ CRUD complet (Create/Read/Update/Del)│
│ ✅ Sync multi-appareils                 │
│ ✅ Sécurité RLS (Row-Level Security)    │
│ ✅ Analyse IA (Edge Functions)          │
│ ✅ Social (recherche, connexions)       │
│ ⚠️  Requiert connexion internet         │
└─────────────────────────────────────────┘

FLUX DE DONNÉES:
┌──────────┐
│ Se login │
└────┬─────┘
     │
     ▼
┌─────────────────┐
│ Supabase Auth   │
│ Crée JWT token  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ user = { id, .. }│
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│ Query PostgreSQL:    │
│ SELECT * FROM table  │
│ WHERE user_id = ...  │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ RLS Policy Check ✅  │
│ auth.uid() = user_id │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Affiche données      │
│ réelles utilisateur  │
│ Avatar personnalisé  │
└──────────────────────┘
```

---

## 🗂️ Sources de Données

### Mode Visiteur 🌐

```
📁 /data/
├── 📄 mockData.ts
│   ├── ThomasMorel (Jeffrey Persona)
│   ├── moduleA (Health: Sleep, Sport, Nutrition)
│   ├── moduleC (Finance: Assets, Career)
│   └── Performance (Global & Module Scores)
│
└── 📄 worldData.ts
    ├── USER_TRIPS (Eloi/Demo Trips)
    ├── FRIENDS_DATA (Travel profiles for friends)
    └── COUNTRY_CODES (ISO mappings)
```

---

### Mode Authentifié 🔐

```
🗄️ Supabase PostgreSQL Database
├── auth.users (Géré par Supabase Auth)
│   ├── id (uuid)
│   ├── email
│   └── encrypted_password
│
├── 👤 public.profiles
│   ├── user_id → auth.users.id
│   ├── username (unique)
│   ├── avatar_url
│   └── bio
│
├── 💤 public.sleep_records
│   ├── id, user_id, date
│   ├── duration, quality
│   └── deep_sleep, rem_sleep
│
├── 🏃 public.sport_sessions
│   ├── id, user_id, date
│   ├── activity_type, duration
│   └── distance, calories
│
├── 👥 public.friendships
│   ├── id, user_id, friend_id
│   ├── rank (proche/amis)
│   └── created_at
│
├── 🔗 public.friend_requests
│   ├── id, sender_id
│   ├── receiver_id
│   └── status (pending/accepted)
│
├── 🌍 public.countries
│   ├── id, user_id
│   ├── country_code (ISO)
│   └── visit_count, total_days
│
└── 💰 public.assets
    ├── id, user_id
    ├── asset_type
    └── value, currency

+ RLS Policies sur chaque table:
  POLICY "Users see only their data"
  USING (auth.uid() = user_id)
```

---

## 🔐 Sécurité Row-Level Security (RLS)

### Principe

```
Sans RLS (❌ DANGEREUX):
┌─────────────────────────────────────┐
│ SELECT * FROM sleep_records         │
│ → Renvoie TOUTES les données        │
│   de TOUS les utilisateurs !!       │
└─────────────────────────────────────┘

Avec RLS (✅ SÉCURISÉ):
┌─────────────────────────────────────┐
│ SELECT * FROM sleep_records         │
│ WHERE user_id = auth.uid()          │
│ → RLS applique AUTOMATIQUEMENT      │
│   le filtre sur user_id             │
│ → Renvoie uniquement les données    │
│   de l'utilisateur authentifié      │
└─────────────────────────────────────┘
```

### Exemple Concret

```sql
-- Création table
CREATE TABLE sleep_records (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  date DATE,
  duration INTEGER,
  quality INTEGER
);

-- Activation RLS
ALTER TABLE sleep_records ENABLE ROW LEVEL SECURITY;

-- Politique SELECT (lecture)
CREATE POLICY "Users can view own records"
  ON sleep_records
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique INSERT (création)
CREATE POLICY "Users can insert own records"
  ON sleep_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique UPDATE (modification)
CREATE POLICY "Users can update own records"
  ON sleep_records
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Politique DELETE (suppression)
CREATE POLICY "Users can delete own records"
  ON sleep_records
  FOR DELETE
  USING (auth.uid() = user_id);
```

**Résultat:**
- ✅ User A ne peut voir QUE ses propres enregistrements
- ✅ User B ne peut voir QUE ses propres enregistrements
- ❌ User A ne peut PAS voir les données de User B
- ❌ Impossible de contourner, même en modifiant le code client

---

## 🧬 Pattern de Hook Dual-Mode

Tous les hooks de données suivent ce pattern :

```typescript
// Template générique
export function useModuleData() {
  const [data, setData] = useState([])
  const [isDemo, setIsDemo] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      
      try {
        // 1️⃣ Vérifier authentification
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          // 🌐 MODE VISITEUR
          setData(DEMO_DATA)
          setIsDemo(true)
          setIsLoading(false)
          return // Sortie anticipée
        }

        // 🔐 MODE AUTHENTIFIÉ
        setIsDemo(false)
        
        // 2️⃣ Query Supabase
        const { data, error } = await supabase
          .from('table_name')
          .select('*')
          .eq('user_id', user.id) // Filtrage auto
          .order('date', { ascending: false })
          .limit(30)

        if (data) setData(data)
        
        // Fallback en cas d'erreur
        if (error) {
          console.error(error)
          setData(DEMO_DATA)
          setIsDemo(true)
        }
        
      } catch (err) {
        // Fallback sur erreur réseau
        console.error(err)
        setData(DEMO_DATA)
        setIsDemo(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, isLoading, isDemo, refetch: fetchData }
}
```

### Hooks Implémentés

```
✅ useHealthData()     → sleep_records, sport_sessions, body_measurements
✅ useSocialData()     → friendships, friend_requests, rankings
✅ useTravelData()     → countries, trips, locations
✅ useFinancialData()  → assets, career_goals, skills
✅ useProfileData()    → profiles (username, avatar)
```

---

## 🎯 Indicateurs UI par Mode

### Mode Visiteur 🌐

```
┌─────────────────────────────────────┐
│ 🌐 STATS App                  👁️ │ ← Badge "Démo"
├─────────────────────────────────────┤
│                                     │
│  📷 Avatar: jeffrey.jpg             │
│  👤 Nom: Jeffrey                    │
│  📧 Email: demo@example.com         │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 💤 Sommeil (30 jours)         │ │
│  │ ─────────────────────         │ │
│  │ Moyenne: 7h 30min             │ │
│  │ Qualité: 85/100               │ │
│  │                               │ │
│  │ [➕ Ajouter] ← DÉSACTIVÉ      │ │ ← Bouton grisé
│  │ 💡 "Connectez-vous pour       │ │
│  │    sauvegarder vos données"   │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

---

### Mode Authentifié 🔐

```
┌─────────────────────────────────────┐
│ 🔐 STATS App                  ⚙️  │ ← Pas de badge démo
├─────────────────────────────────────┤
│                                     │
│  📷 Avatar: user_avatar.jpg         │ ← Avatar personnalisé
│  👤 Nom: @votre_username            │ ← Nom choisi
│  📧 Email: vous@email.com           │ ← Votre email
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 💤 Sommeil (30 jours)         │ │
│  │ ─────────────────────         │ │
│  │ Moyenne: 6h 45min             │ │ ← VOS données
│  │ Qualité: 78/100               │ │
│  │                               │ │
│  │ [➕ Ajouter] ← ACTIF ✅       │ │ ← Bouton cliquable
│  │                               │ │
│  │ Dernière synchro: Il y a 2min │ │ ← Indicateur sync
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔄 Cycle de Vie de l'Application

### Démarrage Initial

```
┌──────────────┐
│ npm run dev  │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Next.js démarre  │
└──────┬───────────┘
       │
       ▼
┌──────────────────────────┐
│ AuthContext s'initialise │
└──────┬───────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ supabase.auth.getSession()  │
└──────┬──────────────────────┘
       │
       ├─→ Session trouvée? ─────────────┐
       │                                  │
       │ Non                              │ Oui
       ▼                                  ▼
┌──────────────┐              ┌────────────────────┐
│ user = null  │              │ user = { id, ... } │
└──────┬───────┘              └────────┬───────────┘
       │                               │
       ▼                               ▼
┌──────────────┐              ┌────────────────────┐
│ 🌐 MODE      │              │ 🔐 MODE            │
│ VISITEUR     │              │ AUTHENTIFIÉ        │
└──────────────┘              └────────────────────┘
```

---

### Transition Visiteur → Authentifié

```
MODE VISITEUR 🌐
      │
      │ User clique "Login"
      ▼
┌──────────────┐
│ Page /login  │
└──────┬───────┘
       │
       │ Saisit email/password
       ▼
┌────────────────────────┐
│ Supabase Auth:         │
│ signInWithPassword()   │
└──────┬─────────────────┘
       │
       │ Authentification réussie
       ▼
┌────────────────────────┐
│ Session créée          │
│ JWT stocké localStorage│
└──────┬─────────────────┘
       │
       │ AuthContext détecte changement
       ▼
┌────────────────────────┐
│ onAuthStateChange()    │
│ user = session.user    │
└──────┬─────────────────┘
       │
       │ Tous les hooks se ré-exécutent
       ▼
┌────────────────────────┐
│ useHealthData() détecte│
│ user !== null          │
└──────┬─────────────────┘
       │
       │ Bascule source de données
       ▼
┌────────────────────────┐
│ Query Supabase au lieu │
│ de charger DEMO_DATA   │
└──────┬─────────────────┘
       │
       ▼
MODE AUTHENTIFIÉ 🔐
```

---

### Transition Authentifié → Visiteur

```
MODE AUTHENTIFIÉ 🔐
      │
      │ User clique "Sign Out"
      ▼
┌────────────────────┐
│ supabase.auth.     │
│ signOut()          │
└──────┬─────────────┘
       │
       │ Session supprimée
       ▼
┌────────────────────────┐
│ onAuthStateChange()    │
│ user = null            │
└──────┬─────────────────┘
       │
       │ Tous les hooks se ré-exécutent
       ▼
┌────────────────────────┐
│ useHealthData() détecte│
│ user === null          │
└──────┬─────────────────┘
       │
       │ Bascule source de données
       ▼
┌────────────────────────┐
│ Charge DEMO_DATA au    │
│ lieu de query Supabase │
└──────┬─────────────────┘
       │
       ▼
MODE VISITEUR 🌐
```

---

## 📁 Structure Complète du Projet

```
STATS_APP/
│
├── 📄 README.md                    # Vue d'ensemble principale
├── 📄 ARCHITECTURE.md              # Specs techniques complètes (EN)
├── 📄 ARCHITECTURE_FR.md           # Specs techniques complètes (FR)
├── 📄 MODES.md                     # Guide rapide dual-mode (EN)
└── 📄 VISUAL_GUIDE.md              # Ce fichier (guide visuel)
│
├── /app                            # Next.js App Router
│   ├── page.tsx                    # 🚦 Point d'entrée (auth router)
│   ├── login/page.tsx              # 🔐 Page de connexion
│   ├── onboarding/page.tsx         # 👤 Setup nouveau compte
│   └── auth/callback/route.ts      # OAuth callback
│
├── /components
│   ├── /Views                      # Écrans principaux
│   │   ├── HomeView.tsx            # Dashboard (Harmony score)
│   │   ├── PhysioView.tsx          # Module Santé
│   │   ├── SocialView.tsx          # Module Social
│   │   ├── MapView.tsx             # Module Monde
│   │   └── ProView.tsx             # Module Carrière
│   │
│   ├── /Modals                     # Modales détails
│   ├── /Cards                      # Composants réutilisables
│   └── /UI                         # Design system
│
├── /contexts
│   ├── AuthContext.tsx             # 🔑 Gestion authentification
│   ├── ThemeContext.tsx            # 🎨 Dark/Light mode
│   └── LanguageContext.tsx         # 🌐 i18n FR/EN
│
├── /hooks                          # 🔀 HOOKS DUAL-MODE
│   ├── useHealthData.ts            # 💤 Données santé
│   ├── useSocialData.ts            # 👥 Données social (friendships)
│   ├── useTravelData.ts            # 🌍 Données voyages
│   ├── useFinancialData.ts         # 💰 Données finance
│   └── useProfileData.ts           # 👤 Profil utilisateur
│
├── /data                           # 🌐 DONNÉES MODE VISITEUR
│   ├── mockData.ts                 # Profil Jeffrey
│   ├── demoHealthData.ts           # Sommeil, sport, nutrition
│   ├── demoSocialData.ts           # Friendships, requests
│   ├── demoTravelData.ts           # Pays, voyages
│   └── demoFinancialData.ts        # Actifs, carrière
│
├── /utils
│   └── /supabase
│       └── client.ts               # 🔐 Client Supabase
│
└── /supabase                       # 🔐 BACKEND MODE AUTHENTIFIÉ
    ├── /functions                  # Edge Functions
    │   └── ai-analyst/             # Analyse IA (Groq)
    └── /migrations                 # Schéma DB
        └── *.sql                   # Tables + RLS policies
```

---

## 🎓 Concepts Clés à Retenir

### 1. Un Seul Codebase, Deux Expériences

```
              📱 Interface UI
                    │
    ┌───────────────┴───────────────┐
    │                               │
    ▼                               ▼
🌐 VISITEUR                   🔐 AUTHENTIFIÉ
Données démo                  Données réelles
Fichiers locaux               Base de données
Hors ligne                    Cloud sync
Lecture seule                 CRUD complet
```

### 2. Détection Automatique du Mode

```typescript
// Simple check partout dans l'app
const { user } = useAuth()

if (user) {
  // Mode authentifié
} else {
  // Mode visiteur
}
```

### 3. Sécurité par Défaut (RLS)

```sql
-- Appliqué automatiquement sur TOUTES les requêtes
WHERE user_id = auth.uid()

-- ✅ User A voit ses données
-- ✅ User B voit ses données
-- ❌ User A ne peut PAS voir données de User B
```

### 4. Fallback Gracieux

```typescript
try {
  // Essayer mode authentifié
  data = await fetchFromSupabase()
} catch (error) {
  // Fallback sur mode visiteur
  data = DEMO_DATA
}
```

---

## 🚀 Checklist Développeur

### Pour Tester Mode Visiteur
- [ ] Effacer `localStorage`
- [ ] Rafraîchir page
- [ ] Vérifier affichage "Jeffrey"
- [ ] Vérifier boutons "Ajouter" désactivés
- [ ] Vérifier badge "👁️ Demo"

### Pour Tester Mode Authentifié
- [ ] Configurer `.env.local` avec credentials Supabase
- [ ] Créer un compte sur `/login`
- [ ] Compléter onboarding
- [ ] Ajouter une entrée de données
- [ ] Vérifier dans dashboard Supabase
- [ ] Créer 2e compte → vérifier isolation données

### Pour Vérifier Sécurité RLS
- [ ] Créer compte A et ajouter données
- [ ] Créer compte B et ajouter données différentes
- [ ] Se connecter avec A → voir SEULEMENT données de A
- [ ] Se connecter avec B → voir SEULEMENT données de B
- [ ] Vérifier dans SQL Editor : `SELECT * FROM table` renvoie uniquement données du compte authentifié

---

**Dernière mise à jour :** 6 janvier 2026  
**Auteur :** Documentation STATS App  
**Version :** 1.0 (Architecture Dual-Mode)
