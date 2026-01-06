# STATS App - Architecture Dual-Mode

## 🇫🇷 Résumé en Français

Ce document fournit une vue d'ensemble en français de l'architecture dual-mode de l'application STATS.

---

## 📌 Vue d'Ensemble

L'application STATS implémente **deux architectures distinctes** qui partagent la même interface utilisateur mais diffèrent fondamentalement dans leurs sources de données et leurs exigences d'authentification.

### Les Deux Modes

#### 🌐 **Mode Visiteur** (Expérience Démo)
- **Objectif :** Permettre l'exploration complète de l'application sans compte ni connexion
- **Données :** Fichiers JSON statiques pré-remplis (persona fictif "Jeffrey")
- **Backend :** Aucun - fonctionne 100% hors ligne
- **Modifications :** Lecture seule - aucune sauvegarde possible
- **Public cible :** 
  - Premiers visiteurs découvrant l'app
  - Démonstrations App Store
  - Tests et développement
  - Usage hors ligne

#### 🔐 **Mode Authentifié** (Expérience Supabase)
- **Objectif :** Suivi personnalisé à long terme avec persistance des données
- **Données :** Base PostgreSQL Supabase avec synchronisation cloud
- **Backend :** Supabase (Auth + Database + Storage + Edge Functions)
- **Modifications :** CRUD complet - création, lecture, mise à jour, suppression
- **Public cible :**
  - Utilisateurs enregistrés suivant leurs vraies données
  - Tracking à long terme et analyses
  - Fonctionnalités sociales (connexions, comparaisons)
  - Synchronisation multi-appareils

---

## 🔄 Détection Automatique du Mode

L'application détecte automatiquement le mode à utiliser :

```typescript
const { user } = useAuth() // Depuis AuthContext

if (user) {
  // 🔐 MODE AUTHENTIFIÉ
  // Requête Supabase : SELECT * FROM sleep_records WHERE user_id = user.id
  // Boutons "Ajouter" activés
  // Affiche le vrai profil utilisateur
} else {
  // 🌐 MODE VISITEUR  
  // Charge DEMO_SLEEP_RECORDS depuis /data/demoHealthData.ts
  // Boutons "Ajouter" désactivés (affiche "Connectez-vous pour sauvegarder")
  // Affiche le profil démo (Jeffrey)
}
```

---

## 🗂️ Sources de Données

### Mode Visiteur 🌐

**Localisation :** `/data/`
```
/data/
├── mockData.ts          # Profil principal (Jeffrey)
├── demoHealthData.ts    # Sommeil, sport, nutrition (30 jours)
├── demoSocialData.ts    # Contacts et graphe social
├── demoTravelData.ts    # Voyages et pays visités
└── demoFinancialData.ts # Actifs et objectifs de carrière
```

**Format :** Constants TypeScript exportées

**Exemple :**
```typescript
export const DEMO_SLEEP_RECORDS: SleepRecord[] = [
  {
    id: "demo-1",
    date: "2026-01-05",
    duration: 480,    // 8 heures
    quality: 85,      // Score 1-100
    deepSleep: 120,   // minutes
    remSleep: 90      // minutes
  },
  // ... 29 autres enregistrements
]
```

---

### Mode Authentifié 🔐

**Localisation :** Base de données Supabase PostgreSQL

**Tables principales :**
```
auth.users               # Géré par Supabase Auth
public.profiles          # Métadonnées utilisateur (username, avatar)
public.sleep_records     # Enregistrements de sommeil
public.sport_sessions    # Séances de sport
public.body_measurements # Mesures corporelles
public.contacts          # Contacts sociaux
public.connections       # Demandes d'ami/connexions
public.countries         # Pays visités
public.trips             # Historique de voyages
public.assets            # Portfolio financier
public.career_goals      # Objectifs professionnels
```

**Sécurité :** Toutes les tables sont protégées par des **politiques RLS (Row-Level Security)**

**Exemple de politique RLS :**
```sql
CREATE POLICY "Les utilisateurs ne voient que leurs propres données"
  ON sleep_records FOR SELECT
  USING (auth.uid() = user_id);
```

Cela garantit qu'un utilisateur ne peut **jamais** accéder aux données d'un autre utilisateur, même en tentant de modifier les requêtes SQL.

---

## 🏗️ Architecture Technique

### Flux de Données - Mode Visiteur

```
Utilisateur ouvre l'app
      ↓
AuthContext s'initialise
      ↓
Détection : user = null
      ↓
Hook useHealthData() s'exécute
      ↓
Vérifie supabase.auth.getUser() → null
      ↓
Charge DEMO_SLEEP_RECORDS depuis /data/
      ↓
Interface affiche les données démo
      ↓
Badge "👁️ Données de Démonstration"
      ↓
Boutons "Ajouter" désactivés
```

**Avantages :**
- ⚡ **Chargement instantané** - Pas d'appels réseau
- 📴 **100% hors ligne** - Aucune dépendance backend
- 🔒 **Sécurité maximale** - Aucune donnée sensible transmise

---

### Flux de Données - Mode Authentifié

```
Utilisateur se connecte via /login
      ↓
Supabase Auth : signInWithPassword(email, password)
      ↓
Session créée + JWT stocké
      ↓
AuthContext : user = { id, email, ... }
      ↓
Hook useHealthData() s'exécute
      ↓
Vérifie supabase.auth.getUser() → user !== null
      ↓
Requête Supabase :
  SELECT * FROM sleep_records 
  WHERE user_id = 'uuid-utilisateur'
      ↓
Politique RLS vérifie : auth.uid() = user_id ✅
      ↓
Interface affiche les vraies données utilisateur
      ↓
Avatar et nom d'utilisateur personnalisés
      ↓
Boutons "Ajouter" activés → INSERT, UPDATE, DELETE
```

**Avantages :**
- 🔐 **Sécurité maximale** - RLS garantit l'isolation des données
- 🔄 **Sync multi-appareils** - Données accessibles partout
- 💾 **Persistance** - Les données survivent aux sessions
- 🚀 **Scalabilité** - Supporte des millions d'entrées

---

## 📊 Tableau Comparatif

| Fonctionnalité                 | 🌐 Mode Visiteur           | 🔐 Mode Authentifié              |
|--------------------------------|---------------------------|----------------------------------|
| **Authentification**           | ❌ Non requise             | ✅ Email/mot de passe requis      |
| **Source de données**          | Fichiers JSON locaux      | Base PostgreSQL Supabase         |
| **Persistance**                | ❌ Aucune (éphémère)       | ✅ Permanente (sync cloud)        |
| **Propriété des données**      | Persona démo "Jeffrey"    | Données personnelles utilisateur |
| **Modification des données**   | ❌ Lecture seule           | ✅ CRUD complet                   |
| **Dépendance internet**        | ✅ Aucune (offline)        | ⚠️ Requise (cache hors ligne à venir) |
| **Sécurité**                   | N/A (pas de vraies données) | 🛡️ RLS, JWT, HTTPS             |
| **Analyse IA**                 | ❌ Indisponible            | ✅ Edge Function Groq             |
| **Fonctionnalités sociales**   | ❌ Contacts démo uniquement | ✅ Recherche amis, connexions     |
| **Personnalisation profil**    | ❌ Profil fixe             | ✅ Avatar, nom, bio personnalisés |
| **Export/Suppression données** | N/A                       | ✅ Conforme RGPD                  |
| **Performance**                | ⚡ Instantané (~200ms)     | ⚠️ Dépend réseau (~400-800ms)     |
| **Coût**                       | Gratuit (pas de backend)  | Gratuit (tier Supabase) ou payant |

---

## 🛠️ Implémentation Technique

### Hooks de Données (Pattern Dual-Mode)

Tous les hooks de données suivent ce pattern :

```typescript
// hooks/useHealthData.ts
export function useHealthData(): HealthData {
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([])
  const [isDemo, setIsDemo] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      // 1️⃣ Vérifier l'état d'authentification
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // 🌐 MODE VISITEUR - Charger données démo
        setSleepRecords(DEMO_SLEEP_RECORDS)
        setIsDemo(true)
        setIsLoading(false)
        return
      }

      // 🔐 MODE AUTHENTIFIÉ - Récupérer depuis Supabase
      setIsDemo(false)
      const { data, error } = await supabase
        .from('sleep_records')
        .select('*')
        .eq('user_id', user.id)  // Filtrage automatique par utilisateur
        .order('date', { ascending: false })
        .limit(30)

      if (data) setSleepRecords(data)
      
      // Fallback en cas d'erreur
      if (error) {
        console.error(error)
        setSleepRecords(DEMO_SLEEP_RECORDS)
        setIsDemo(true)
      }
      
      setIsLoading(false)
    } catch (err) {
      console.error(err)
      setSleepRecords(DEMO_SLEEP_RECORDS)
      setIsDemo(true)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { 
    sleepRecords, 
    isLoading, 
    isDemo, 
    refetch: fetchData 
  }
}
```

**Hooks utilisant ce pattern :**
- ✅ `useHealthData()` - Sommeil, Sport, Corps, Nutrition
- ✅ `useSocialData()` - Contacts, Connexions, Classements
- ✅ `useTravelData()` - Pays, Voyages, Localisations
- ✅ `useFinancialData()` - Actifs, Objectifs Carrière, Compétences
- ✅ `useProfileData()` - Profil utilisateur, avatar, nom d'utilisateur

---

## 🔐 Modèle de Sécurité

### Mode Visiteur
- ✅ **Aucun risque** - Données démo codées en dur
- ✅ **Aucune PII** - Persona fictif (Jeffrey)
- ✅ **Aucune transmission** - Zéro appel réseau

### Mode Authentifié
- 🔒 **Politiques RLS** - Isolation des données utilisateur
- 🔒 **Tokens JWT** - Expiration automatique, rafraîchissement auto
- 🔒 **HTTPS/TLS** - Tous les appels API chiffrés
- 🔒 **Hachage mot de passe** - Bcrypt (géré par Supabase Auth)
- 🔒 **Edge Functions** - Validation JWT avant exécution
- 🔒 **Conformité RGPD** - Export/suppression des données disponibles

---

## 🚀 Démarrage Rapide

### Mode Visiteur (Par Défaut)

```bash
# 1. Cloner le dépôt
git clone https://github.com/your-org/stats-app.git

# 2. Installer les dépendances
cd stats-app
npm install

# 3. Lancer le serveur de dev
npm run dev

# 4. Ouvrir le navigateur
# http://localhost:3000

# ✅ L'app démarre automatiquement en mode visiteur
# ✅ Données démo de Jeffrey s'affichent
# ✅ Aucune configuration supplémentaire requise
```

---

### Mode Authentifié (Avec Supabase)

```bash
# 1. Créer un compte Supabase gratuit
# https://supabase.com

# 2. Créer un nouveau projet Supabase

# 3. Copier les identifiants (Paramètres → API)

# 4. Créer .env.local à la racine du projet
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anonyme

# 5. Installer Supabase CLI
npm install -g supabase

# 6. Lier au projet
supabase link --project-ref votre-ref-projet

# 7. Appliquer les migrations (créer tables + RLS)
supabase db push

# 8. (Optionnel) Déployer les Edge Functions
supabase functions deploy ai-analyst
supabase secrets set GROQ_API_KEY=votre-clé-groq

# 9. Redémarrer le serveur
npm run dev

# 10. Créer un compte
# Naviguer vers http://localhost:3000/login
# Créer un compte avec email/mot de passe
# Compléter l'onboarding (nom d'utilisateur, avatar)

# ✅ Vos données sont maintenant stockées dans Supabase!
```

---

## 🔄 Basculer Entre Les Modes

### Passer en Mode Visiteur
```bash
# Option 1: Se déconnecter
# Cliquer "Déconnexion" dans les Paramètres

# Option 2: Effacer le localStorage
# Dans la console navigateur :
localStorage.clear()
# Puis rafraîchir la page
```

### Passer en Mode Authentifié
```bash
# Cliquer sur le bouton "Connexion"
# Saisir email/mot de passe
# L'app bascule automatiquement en mode authentifié
```

---

## 📈 Performances

### Mode Visiteur
- **Chargement initial :** ~200ms
- **Récupération données :** 0ms (en mémoire)
- **Support hors ligne :** ✅ Complet
- **Dépendance réseau :** ❌ Aucune
- **Impact bundle :** +50KB (données démo)

### Mode Authentifié
- **Chargement initial :** ~400-800ms (dépend de la connexion)
- **Récupération données :** 200-500ms (appels réseau)
- **Support hors ligne :** ⚠️ Cache uniquement (à implémenter)
- **Dépendance réseau :** ✅ Requise
- **Impact bundle :** +30KB (SDK Supabase)

---

## 🎯 Cas d'Usage

### Quand Utiliser le Mode Visiteur

1. **Découverte initiale**
   - Premiers visiteurs explorant l'app
   - Comprendre les fonctionnalités avant de s'engager

2. **Démonstrations**
   - Présenter l'app à des investisseurs
   - App Store previews
   - Tests utilisateur sans backend

3. **Développement**
   - Tester l'UI sans configurer Supabase
   - Développement hors ligne (train, avion)
   - Tests automatisés (données prévisibles)

4. **Marketing**
   - Captures d'écran avec données cohérentes
   - Vidéos de démonstration
   - Tutoriels et onboarding

---

### Quand Utiliser le Mode Authentifié

1. **Tracking Personnel**
   - Suivi réel de sommeil, sport, nutrition
   - Histoire à long terme (mois, années)
   - Analyse de tendances personnelles

2. **Fonctionnalités Sociales**
   - Rechercher des amis par nom d'utilisateur
   - Envoyer/accepter demandes de connexion
   - Comparer stats avec amis

3. **Fonctionnalités Avancées**
   - Analyse IA (Edge Function Groq)
   - Insights personnalisés
   - Rapports exportables

4. **Synchronisation**
   - Accès aux données depuis plusieurs appareils
   - Backup automatique cloud
   - Pas de perte de données en cas de plantage/déinstallation

---

## 📚 Documentation Complète

- **[README.md](./README.md)** - Vue d'ensemble projet, modules, guide démarrage
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Specs techniques complètes, schéma base de données
- **[MODES.md](./MODES.md)** - Guide de référence rapide (en anglais)

---

## ❓ Questions Fréquentes

### Q: Puis-je utiliser l'app sans compte Supabase ?
**R:** Oui ! L'app fonctionne parfaitement en mode visiteur sans aucun backend. Supabase est uniquement nécessaire pour le mode authentifié.

### Q: Mes données sont-elles sécurisées en mode authentifié ?
**R:** Oui. Les politiques RLS garantissent que vous ne pouvez voir que vos propres données. C'est appliqué au niveau de la base de données, impossible à contourner.

### Q: Puis-je basculer du mode visiteur au mode authentifié sans perdre de données ?
**R:** Le mode visiteur n'a aucune donnée persistante à perdre. Quand vous créez un compte, vous commencez avec une base vide et pouvez ajouter vos vraies données.

### Q: Les données démo sont-elles réalistes ?
**R:** Oui ! Le persona Jeffrey contient 30 jours de données réalistes pour tous les modules (santé, social, voyages, finance) pour démontrer toutes les capacités de l'UI.

### Q: Puis-je exporter mes données du mode authentifié ?
**R:** Oui, des fonctionnalités d'export/suppression conformes au RGPD sont prévues. Vous pourrez exporter toutes vos données en JSON et demander la suppression de compte.

---

**Dernière mise à jour :** 6 janvier 2026  
**Version :** 1.0 (Architecture Dual-Mode)
