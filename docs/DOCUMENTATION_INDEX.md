# 📚 Documentation Index - STATS App

## Vue d'Ensemble de la Documentation

Ce répertoire contient une documentation complète sur l'architecture dual-mode de l'application STATS. Chaque document a un objectif spécifique.

---

## 🗂️ Documents Disponibles

### 1️⃣ **README.md** (Principal)
- **Langue :** Anglais 🇬🇧
- **Niveau :** Débutant à Intermédiaire
- **Objectif :** Vue d'ensemble du projet entier
- **Contenu :**
  - Vision et philosophie de l'app
  - Description des 5 modules (Health, World, Growth, Social, Achievements)
  - **Section détaillée sur les deux architectures**
  - Tableau comparatif Mode Visiteur vs. Mode Authentifié
  - Instructions de démarrage (Getting Started)
  - Guide de configuration Supabase
  - Instructions pour basculer entre les modes
  - Design system et UX
  
**👉 Commencez ici si vous découvrez le projet**

---

### 2️⃣ **ARCHITECTURE.md** (Technique Complet)
- **Langue :** Anglais 🇬🇧
- **Niveau :** Intermédiaire à Avancé
- **Objectif :** Spécifications techniques complètes
- **Contenu :**
  - Explication approfondie de l'architecture dual-mode
  - Structure détaillée des répertoires avec annotations
  - Pattern des hooks de données (Dual-Mode Pattern)
  - **Schéma complet de la base de données Supabase**
  - Définition des tables PostgreSQL
  - **Politiques RLS (Row-Level Security)** avec exemples SQL
  - Flow de données pour les deux modes (diagrammes textuels)
  - Modèle de sécurité et chiffrement
  - Edge Functions (AI Analyst)
  - Notes de traduction iOS/Swift
  
**👉 Lisez ceci pour comprendre l'implémentation technique**

---

### 3️⃣ **MODES.md** (Guide de Référence Rapide)
- **Langue :** Anglais 🇬🇧
- **Niveau :** Tous niveaux
- **Objectif :** Reference rapide sur les deux modes
- **Contenu :**
  - Quand utiliser Mode Visiteur vs. Mode Authentifié
  - Diagramme Mermaid du flux de détection de mode
  - Implémentation technique (code TypeScript)
  - Localisation des sources de données
  - Modèle de sécurité (Visiteur vs. Authentifié)
  - Indicateurs UI par mode
  - Tableau de comparaison des performances
  - Chemin de migration Visiteur → Authentifié
  - Instructions de test pour les deux modes
  - FAQ

**👉 Consultez ceci comme aide-mémoire ou référence rapide**

---

### 4️⃣ **ARCHITECTURE_FR.md** (Technique Complet en Français)
- **Langue :** Français 🇫🇷
- **Niveau :** Intermédiaire à Avancé
- **Objectif :** Traduction française complète de l'architecture
- **Contenu :**
  - **Identique à ARCHITECTURE.md mais en français**
  - Vue d'ensemble des deux modes
  - Détection automatique du mode
  - Sources de données détaillées
  - Architecture technique avec flux de données
  - Schéma base de données Supabase
  - Modèle de sécurité RLS
  - Implémentation des hooks
  - Tableau comparatif
  - Guide de démarrage rapide
  - Cas d'usage détaillés
  - Questions fréquentes (FAQ)

**👉 Lisez ceci si vous préférez le français pour les détails techniques**

---

### 5️⃣ **VISUAL_GUIDE.md** (Guide Visuel)
- **Langue :** Français 🇫🇷
- **Niveau :** Tous niveaux
- **Objectif :** Explication visuelle avec diagrammes ASCII
- **Contenu :**
  - **Diagrammes ASCII** de l'architecture globale
  - Comparaison visuelle des deux modes
  - Représentation graphique des sources de données
  - **Diagrammes de flux** (cycle de vie, transitions)
  - Exemples visuels de sécurité RLS
  - Pattern de hook avec code commenté
  - Indicateurs UI mockup (ASCII art)
  - Structure complète du projet (arborescence visuelle)
  - Checklist développeur
  - Concepts clés avec schémas

**👉 Parfait pour les apprenants visuels ou pour une compréhension rapide**

---

### 6️⃣ **DOCUMENTATION_INDEX.md** (Ce fichier)
- **Langue :** Français 🇫🇷
- **Niveau :** Tous niveaux
- **Objectif :** Navigation et vue d'ensemble de la documentation
- **Contenu :**
  - Liste de tous les documents disponibles
  - Objectif de chaque document
  - Parcours de lecture recommandés
  - Matrice de décision

**👉 Utilisez ceci pour naviguer dans la documentation**

---

## 🧭 Parcours de Lecture Recommandés

### Pour Découvrir le Projet

```
1. README.md
   └─→ Section "🔀 Two Architectures, One Experience"
       └─→ Tableau comparatif Mode Visiteur vs. Authentifié

2. MODES.md (référence rapide)
   └─→ FAQ pour questions spécifiques

3. VISUAL_GUIDE.md (si besoin de visualisation)
```

---

### Pour Implémenter les Fonctionnalités

```
1. ARCHITECTURE.md (EN) ou ARCHITECTURE_FR.md (FR)
   └─→ Section "Data Fetching Hooks (Dual-Mode Pattern)"
       └─→ Exemple de useHealthData()

2. MODES.md
   └─→ Section "Technical Implementation"

3. Consulter le code source:
   └─→ /hooks/useHealthData.ts (exemple réel)
```

---

### Pour Comprendre la Sécurité

```
1. ARCHITECTURE.md (EN) ou ARCHITECTURE_FR.md (FR)
   └─→ Section "Supabase Database Schema"
       └─→ Row-Level Security (RLS) Policies

2. VISUAL_GUIDE.md
   └─→ Section "🔐 Sécurité Row-Level Security (RLS)"
       └─→ Diagrammes "Sans RLS" vs "Avec RLS"

3. MODES.md
   └─→ Section "Security Model"
```

---

### Pour Setup Local

```
1. README.md
   └─→ Section "Getting Started (Prototype)"
       └─→ Sous-section "🌐 Running in Visitor Mode"
       └─→ Sous-section "🔐 Running in Authenticated Mode"

2. ARCHITECTURE_FR.md
   └─→ Section "🚀 Démarrage Rapide"
```

---

### Pour Débugger

```
1. MODES.md
   └─→ Section "Testing Both Modes"
       └─→ Testing Visitor Mode
       └─→ Testing Authenticated Mode

2. VISUAL_GUIDE.md
   └─→ Section "🚀 Checklist Développeur"

3. ARCHITECTURE.md
   └─→ Section "Data Flow Diagrams"
       └─→ Comparer flux attendu vs. actuel
```

---

## 🎯 Matrice de Décision : Quel Document Lire ?

| Je veux...                                  | Document Recommandé           | Langue |
|---------------------------------------------|-------------------------------|--------|
| Comprendre le concept global                | README.md                     | 🇬🇧 EN  |
| Référence rapide sur les modes              | MODES.md                      | 🇬🇧 EN  |
| Spécifications techniques complètes         | ARCHITECTURE.md               | 🇬🇧 EN  |
| Spécifications techniques en français       | ARCHITECTURE_FR.md            | 🇫🇷 FR  |
| Visualiser l'architecture                   | VISUAL_GUIDE.md               | 🇫🇷 FR  |
| Configurer localement                       | README.md (Getting Started)   | 🇬🇧 EN  |
| Comprendre la sécurité RLS                  | ARCHITECTURE.md ou FR version | 🇬🇧/🇫🇷 |
| Implémenter un nouveau module               | ARCHITECTURE.md + code source | 🇬🇧 EN  |
| Tester les deux modes                       | MODES.md                      | 🇬🇧 EN  |
| Guide visuel avec diagrammes                | VISUAL_GUIDE.md               | 🇫🇷 FR  |
| Naviguer dans la documentation              | DOCUMENTATION_INDEX.md (ceci) | 🇫🇷 FR  |

---

## 📋 Résumé des Concepts Clés

### Concept 1 : Deux Architectures, Une Interface

```
┌─────────────────────────────────────┐
│         INTERFACE UI (Unique)       │
└───────────┬─────────────────────────┘
            │
     ┌──────┴──────┐
     │ AuthContext │ ← Détecte le mode
     └──────┬──────┘
            │
   ┌────────┴────────┐
   │                 │
   ▼                 ▼
MODE VISITEUR    MODE AUTHENTIFIÉ
Fichiers JSON    Base Supabase
Demo "Jeffrey"   Vraies données
```

### Concept 2 : Détection Automatique

```typescript
const { user } = useAuth()
// user === null  → Mode Visiteur
// user !== null  → Mode Authentifié
```

### Concept 3 : Sécurité RLS

```sql
-- Automatiquement appliqué sur CHAQUE requête
WHERE user_id = auth.uid()
```

---

## 🗃️ Structure de la Documentation

```
STATS_APP/
│
├── 📄 README.md                      ← Vue d'ensemble principale (racine)
├── 📄 CONTRIBUTING.md                ← Guide de contribution
│
└── 📁 docs/                          ← Documentation technique
    ├── 📄 DOCUMENTATION_INDEX.md     ← Ce fichier (navigation)
    │
    ├── 📁 architecture/              ← Spécifications techniques
    │   ├── 📄 ARCHITECTURE.md        ← Specs techniques (EN)
    │   ├── 📄 ARCHITECTURE_FR.md     ← Specs techniques (FR)
    │   └── 📄 MODES.md               ← Référence rapide dual-mode
    │
    ├── 📁 guides/                    ← Guides pratiques
    │   └── 📄 VISUAL_GUIDE.md        ← Guide visuel avec diagrammes
    │
    └── 📁 reference/                 ← Documentation de référence
        ├── 📄 HOMEVIEW_AUDIT.md      ← Audit du composant HomeView
        ├── 📄 IOS26_BASE.md          ← Base iOS 26
        └── 📄 LIQUID_GLASS_SWIFT.md  ← Implémentation Swift Liquid Glass
```

---

## ✅ Checklist de Lecture Complète

Pour maîtriser complètement l'architecture dual-mode, lisez dans cet ordre :

1. [ ] **README.md** - Section "Two Architectures, One Experience"
2. [ ] **MODES.md** - Tout le document (référence rapide)
3. [ ] **VISUAL_GUIDE.md** - Diagrammes et concepts visuels
4. [ ] **ARCHITECTURE.md** (EN) ou **ARCHITECTURE_FR.md** (FR) - Détails techniques
5. [ ] Code source dans `/hooks/` - Voir implémentation réelle
6. [ ] Tester localement les deux modes

---

## 🆘 Besoin d'Aide ?

### Par Type de Question

**"Comment l'app sait-elle quel mode utiliser ?"**
→ MODES.md - Section "How Mode Detection Works"
→ VISUAL_GUIDE.md - Section "🔄 Cycle de Vie de l'Application"

**"Quelles sont les différences entre les modes ?"**
→ README.md - Tableau comparatif
→ VISUAL_GUIDE.md - Section "📊 Comparaison Visuelle"

**"Comment fonctionne la sécurité RLS ?"**
→ ARCHITECTURE.md - Section "Row-Level Security (RLS) Policies"
→ VISUAL_GUIDE.md - Section "🔐 Sécurité Row-Level Security"

**"Comment implémenter un nouveau module ?"**
→ ARCHITECTURE.md - Section "Data Fetching Hooks (Dual-Mode Pattern)"
→ Code source : `/hooks/useHealthData.ts` (exemple de référence)

**"Comment configurer Supabase localement ?"**
→ README.md - Section "Running in Authenticated Mode"
→ ARCHITECTURE_FR.md - Section "🚀 Démarrage Rapide"

**"Pourquoi mes données ne se chargent pas ?"**
→ MODES.md - Section "Testing Both Modes"
→ VISUAL_GUIDE.md - Section "🚀 Checklist Développeur"

---

## 🔄 Mise à Jour de la Documentation

**Dernière mise à jour :** 6 janvier 2026  
**Version :** 1.0 (Architecture Dual-Mode)

### Changelog

- **2026-01-06 :** 
  - ✅ Création de la documentation complète dual-mode
  - ✅ README.md mis à jour avec section architecture
  - ✅ ARCHITECTURE.md créé avec specs complètes
  - ✅ MODES.md créé comme référence rapide
  - ✅ ARCHITECTURE_FR.md créé (traduction française)
  - ✅ VISUAL_GUIDE.md créé avec diagrammes ASCII
  - ✅ DOCUMENTATION_INDEX.md créé (ce fichier)

---

## 📞 Contact & Contributions

Pour toute question sur la documentation ou suggestion d'amélioration, consultez les documents dans l'ordre recommandé ci-dessus.

**Principe :** La documentation est le code. Si le code change, la documentation doit être mise à jour immédiatement.

---

**Bonne lecture ! 📖**
