# TrueCircle - Documentation des Réglages

Ce document décrit la logique complète permettant d'appliquer les différents réglages de tri, filtrage et affichage dans l'application TrueCircle.

## Table des matières

1. [Filtres](#filtres)
2. [Groupes](#groupes)
3. [Réglages visuels](#réglages-visuels)
4. [Réglages de structure](#réglages-de-structure)
5. [Interactions utilisateur](#interactions-utilisateur)
6. [Fonctionnalités Avancées (Antigravity Engine)](#fonctionnalités-avancées-antigravity-engine)
7. [Fonctions principales](#fonctions-principales)

---

## Recherche

**ID HTML:** `search-input`  
**Variable:** `settings.searchQuery` (string)

**Logique:**
- **Filtrage Temps Réel:**
    - Dès la saisie, les nœuds de la sphère qui ne correspondent pas à la recherche sont masqués (`isNodeVisible` retourne `false`).
    - La correspondance se fait sur le **nom** (insensible à la casse).
- **Liste de Résultats:**
    - Une liste déroulante affiche les 10 premiers résultats correspondants.
    - **Clic sur un résultat :**
        1.  Focalise la caméra sur le nœud.
        2.  Ouvre sa **Carte Profil**.
        3.  Réinitialise la recherche.

**Code:**
```javascript
if (settings.searchQuery) {
    let query = settings.searchQuery.toLowerCase();
    if (!node.name.toLowerCase().includes(query)) return false;
}
```

---

## Filtres

### 1. BY AGE (filter-by-age)

**ID HTML:** `filter-by-age`  
**Variable:** `settings.filterByAge` (boolean)

**Logique:**
- Filtre les nœuds pour n'afficher que ceux dont l'âge est proche de l'âge d'ELOI (20 ans)
- Critère: `Math.abs(node.age - ELOI_AGE) <= 1`
- Affiche uniquement les personnes âgées de 19, 20 ou 21 ans

**Code:**
```javascript
if (settings.filterByAge) {
    if (Math.abs(node.age - ELOI_AGE) > 1) return false;
}
```

---

### 2. OLDEST (filter-oldest)

**ID HTML:** `filter-oldest`  
**Variable:** `settings.filterOldest` (boolean)

**Logique:**
- Filtre pour afficher uniquement les 20% des personnes les plus âgées
- Calcul: `oldestNodes` contient les indices des nœuds triés par âge décroissant
- Exclusif avec `filter-most-recent` (si l'un est activé, l'autre se désactive automatiquement)

**Fonction associée:** `calculateAgeFilters()`
```javascript
function calculateAgeFilters() {
    if (sphereNodes.length === 0) return;
    let sortedByAge = [...sphereNodes].sort((a, b) => b.age - a.age);
    let oldestCount = Math.ceil(sphereNodes.length * 0.2);
    oldestNodes = sortedByAge.slice(0, oldestCount).map(n => n.index);
}
```

**Code de filtrage:**
```javascript
if (settings.filterOldest) {
    if (!oldestNodes.includes(node.index)) return false;
}
```

---

### 3. MOST RECENT (filter-most-recent)

**ID HTML:** `filter-most-recent`  
**Variable:** `settings.filterMostRecent` (boolean)

**Logique:**
- Filtre pour afficher uniquement les 20% des personnes les plus jeunes
- Calcul: `mostRecentNodes` contient les indices des nœuds triés par âge croissant
- Exclusif avec `filter-oldest`

**Fonction associée:** `calculateAgeFilters()`
```javascript
let youngestCount = Math.ceil(sphereNodes.length * 0.2);
mostRecentNodes = sortedByAge.slice(-youngestCount).map(n => n.index);
```

**Code de filtrage:**
```javascript
if (settings.filterMostRecent) {
    if (!mostRecentNodes.includes(node.index)) return false;
}
```

---

### 4. Orphans (filter-orphans)

**ID HTML:** `filter-orphans`  
**Variable:** `settings.filterOrphans` (boolean)

**Logique:**
- Filtre pour afficher uniquement les nœuds "orphelins" (sans connexions)
- Un nœud est considéré comme orphelin s'il n'a aucune connexion dans les rangs actifs
- La propriété `node.isOrphan` est calculée dynamiquement

**Fonction associée:** `identifyOrphans()`
```javascript
function identifyOrphans() {
    // Par défaut, tout le monde est orphelin
    sphereNodes.forEach(node => {
        node.isOrphan = true;
    });

    // On parcourt toutes les connexions actives dans les rangs visibles
    stableConnections.forEach(conn => {
        if (conn.data.rank <= settings.maxRank) {
            // Les participants ne sont plus orphelins
            if (sphereNodes[conn.data.index1]) sphereNodes[conn.data.index1].isOrphan = false;
            if (sphereNodes[conn.data.index2]) sphereNodes[conn.data.index2].isOrphan = false;
        }
    });
}
```

**Code de filtrage:**
```javascript
if (settings.filterOrphans) {
    if (!node.isOrphan) return false;
}
```

---

## Groupes

### 1. FAMILY (group-family)
**ID HTML:** `group-family`  
**Variable:** `settings.groupFamily` (boolean)  
**Logique:** Affiche les nœuds du groupe "FAMILY".

### 2. WORK (group-work)
**ID HTML:** `group-work`  
**Variable:** `settings.groupWork` (boolean)  
**Logique:** Affiche les nœuds du groupe "WORK".

### 3. FRIENDS (group-friends)
**ID HTML:** `group-friends`  
**Variable:** `settings.groupFriends` (boolean)  
**Logique:** Affiche les nœuds du groupe "FRIENDS".

---

## Réglages visuels

### 1. Noms affichés (show-names)
**ID HTML:** `show-names`  
**Variable:** `settings.showNames` (boolean)  
**Effet:** Active les labels (prénom) au survol des nœuds.

### 2. Connexions affichées (show-connections)
**ID HTML:** `show-connections`  
**Variable:** `settings.showConnections` (boolean)  
**Effet:** Dessine les liens entre les individus et permet leur interaction.

### 3. Liaisons au centre (show-center-links)
**ID HTML:** `show-center-links`  
**Variable:** `settings.showCenterLinks` (boolean)  
**Effet:** Dessine les traits reliant chaque nœud au centre (ELOI).

### 4. Labels de connexion (show-connection-labels)
**ID HTML:** `show-connection-labels`  
**Variable:** `settings.showConnectionLabels` (boolean)  
**Effet:** Active l'affichage des détails (noms + date) au survol des connexions.

### 5. Taille des points (node-size-range)
**ID:** `node-size-range` | **Variable:** `nodeSizeMultiplier` | **Effet:** Ajuste le rayon des nœuds.

### 6. Épaisseur liens (link-width-range)
**ID:** `link-width-range` | **Variable:** `linkThicknessMultiplier` | **Effet:** Ajuste l'épaisseur des traits.

---

## Réglages de structure

### 1. Profondeur des rangs (rank-range)
**ID:** `rank-range` | **Variable:** `maxRank` (1-5)  
**Logique:**  
Le nombre de cercles concentriques. Changer cette valeur déclenche `initTrueCircle` pour régénérer la structure et recalculer les connexions.

---

### 2. Densité connexions (density-range)
**ID:** `density-range` | **Variable:** `connectionDensity` (0-100%)  
**Logique:**  
Modifie les probabilités d'interconnexion. La probabilité de base (ex: 100% pour rang 1) est multipliée par ce facteur.

---

## Interactions utilisateur

### Mode "Carte Ouverte" (Card Open Mode)

**Définition:**
Une carte (Profil ou Connexion) est considérée comme ouverte si `profileCardEl` ou `connectionCardEl` a la classe `visible`.

**Comportement Global:**
1.  **Rotation Continue:**
    -   La sphère tourne automatiquement et doucement (`currentRotation.y += 0.002`).
    -   L'horizon se stabilise (`currentRotation.x` tendant vers 0).
    -   Ce comportement surcharge l'arrêt de rotation habituel (`isFrozen`).
    
2.  **Verrouillage des Interactions (Interaction Lock):**
    -   Le survol des nœuds et des connexions en arrière-plan est **désactivé**.
    -   Les nœuds ne grossissent pas, le curseur reste par défaut (sauf sur la carte).
    -   Cela permet de garder le focus visuel sur la carte ouverte.

3.  **Fermeture par Clic:**
    -   Un clic n'importe où sur l'arrière-plan (canvas, overlay) ferme immédiatement la carte.
    -   Ce clic **n'active pas** d'autres nœuds (protection contre la sélection accidentelle).

**Code Critique (`performHitTesting`):**
```javascript
let isCardOpen = profileCardEl.classList.contains('visible') || connectionCardEl.classList.contains('visible');
if (isCardOpen) {
    if (!profileCardEl.contains(e.target) && !connectionCardEl.contains(e.target)) {
        closeProfileCard();
        closeConnectionCard();
        return; // Arrêt immédiat, pas de sélection de nœud
    }
}
```

### Sélection persistante (Hors Mode Carte)

**Description:**
Quand aucune carte n'est ouverte, un clic sur un nœud ou une connexion "fige" l'élément sélectionné et ouvre sa carte, passant en Mode Carte.

**Séquence:**
1.  **Clic Nœud:** `clickedNodeIndex` défini → Ouvre `profileCard` → Active *Mode Carte*.
2.  **Clic Connexion:** `clickedConnectionKey` défini → Ouvre `connectionCard` → Active *Mode Carte*.

### Rotation (Drag)
-   Possible via "cliquer-glisser" sur le fond.
-   Si une carte est ouverte, le drag est possible mais la rotation automatique reprend dès le relâchement.

---

### Mini Cartes (Prévisualisation)

**Description:**
De petites vignettes circulaires (avatars) apparaissent en haut à gauche pour rappeler les éléments actifs lorsque leurs cartes principales sont fermées.

**Comportement:**
- **Apparition:** Dès qu'une Carte Profil ou Connexion est ouverte.
- **Persistance:** Si on ferme la carte (clic background), la mini-carte reste visible (sauf si on désélectionne tout explicitement).
- **Interaction:** Un clic sur la mini-carte rouvre immédiatement la Carte Principale correspondante et refocalise la caméra.

---

## Fonctionnalités Avancées (Antigravity Engine)

### 1. Timelapse Chronologique
**Bouton:** Stopwatch Icon (`timelapse-fab`)  
**Variable:** `isTimelapseActive` (boolean)

**Logique de progression :**
- **Expansion Automatique :** Le timelapse force `settings.maxRank = 5` pour révéler l'intégralité du réseau. Cet état est **persistant** même après l'arrêt du timelapse.
- **Courbe de Vitesse Exponentielle :** L'animation commence très lentement pour permettre l'observation des premières connexions ("Naissance du réseau"), puis accélère de manière exponentielle vers la fin.
- **Synchronisation Date :** Un affichage (`#timelapse-date-display`) synchronise le mois/année affiché avec les dates de connexion réelles des nœuds apparaissant à l'écran.
- **Logique "Parents" :** Deux nœuds du Rang 1 sont désignés comme "Parents" et se connectent au centre 20 ans avant la date actuelle, créant un point d'ancrage historique au début de l'animation.

**Code de calcul de vitesse :**
```javascript
let progress = currentIndex / timelineNodes.length;
let speed = 200 * Math.pow(0.05, progress); // Ralenti au début, ultra-rapide à la fin
```

### 2. Système Visuel "Liquid Glass"
Le rendu des avatars utilise le moteur de design **Liquid Glass**, simulant des matériaux physiques via l'API Canvas 2D.

**Composants du Rendu :**
- **Fake Drop Shadow :** Optimisé via un gradient radial (remplace `shadowBlur` pour les performances mobiles).
- **Volume Interne :** Superposition de dégradés (Top-Left Light / Bottom-Right Dark) pour simuler la réfraction.
- **Surface Glare :** Reflet spéculaire elliptique et "Rim Light" (bordure lumineuse) pour l'effet de profondeur.
- **Visibilité Optimisée :** Les masques de flou centraux sont minimisés pour garantir que les visages restent parfaitement reconnaissables sous la "vitre".

---

## Rendu et Performance

### Photo Zoom Threshold
**Variable:** `PHOTO_ZOOM_THRESHOLD = 2.5`
- Les photos "Liquid Glass" ne sont rendues que lorsque le niveau de zoom est suffisant.
- En deçà, les nœuds sont représentés par des points colorés simples pour maximiser les performances de rotation lors des vues larges.

### Mise en Cache des Images
- Les images sont chargées via `getLabelImage` et stockées dans `node.img`.
- Le rendu attend `img.complete` pour éviter les clignotements.

---

## Fonctions principales

### `performHitTesting(e)`
Gère toute la logique de clic.  
**Ordre de priorité:**
1.  Clic sur Interface (Bulle info) → Ignorer.
2.  Clic DANS une carte ouverte → Ignorer (laisser passer aux boutons).
3.  **Nouveau:** Si une carte est ouverte et clic DEHORS → `closeCards()` et Stop.
4.  Clic Mini-Carte → Ouvrir la carte correspondante.
5.  Calcul des projections (Hit Test 3D).
6.  Détection Clic Centre (ELOI).
7.  Détection Clic Nœud (trié par Z).
8.  Détection Clic Connexion.
9.  Si rien touché → Désélectionner tout.

### `drawTrueCircle()`
Boucle de rendu (Main Loop).
1.  Efface le canvas.
2.  Gère le zoom (lerp).
3.  **Rotation:** Applique la rotation automatique (si carte ouverte ou auto-rotation active) ou le damping du drag manuel.
4.  Projette le centre et les nœuds.
5.  **Hit Detection:** Calcule le nœud/connexion survolé (si interactions non verrouillées).
6.  Dessine les connexions filaires (Centre et Inter-nœuds).
7.  Dessine le Centre et les Nœuds (cercles).
8.  Dessine les Labels (Engineering Labels) si applicable.

---

## Notes importantes

1.  **Exclusivité des filtres d'âge:** `filterOldest` et `filterMostRecent` sont mutuellement exclusifs.
2.  **Recalcul des orphelins:** Nécessaire après changement de densité ou de rang.
3.  **Mode Carte Prioritaire:** L'état "Carte Ouverte" modifie drastiquement le comportement du rendu (rotation force, interaction disable) pour une meilleure UX.
4.  **Performance:** Les calculs de géométrie sont faits à chaque frame, optimisés par le tri Z uniquement pour les éléments visibles.
