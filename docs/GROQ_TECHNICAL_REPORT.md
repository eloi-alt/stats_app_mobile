# Rapport Technique Approfondi : Architecture & Optimisation Groq (Llama 3.3 70B)

__Date__ : 20 janvier 2026
__Contexte__ : Analyse de l'intégration AI pour le score "Harmony" dans l'application Stats App.
__Objectif__ : Fournir une vue technique exhaustive pour audit expert et optimisation.

---

## 1. Analyse Technique de l'Existant

### 1.1 Stack Technologique
*   **Modèle** : `llama-3.3-70b-versatile` (Groq Cloud).
*   **Client** : `groq-sdk` (Node.js/Edge compatible).
*   **Point d'Entrée** : `utils/harmonyAI.ts` -> `calculateHarmonyWithAI()`.
*   **Configuration** :
    *   `temperature`: 0.3 (Minimise les hallucinations, favorise le déterminisme).
    *   `max_tokens`: 1024 (Limite la verbosité de sortie).
    *   `response_format`: `{ type: 'json_object' }` (Mode JSON contraint).

### 1.2 Structure du Prompt & Tokenomics
La requête est construite de manière séquentielle. Voici la décomposition précise des coûts en tokens (estimations basées sur Llama 3 tokenizer) :

#### A. System Prompt (~950 Tokens)
Le "System Prompt" (`HARMONY_MASTER_PROMPT`) est statique et lourd. Il contient :
1.  **Persona** : "Conseiller d'Alignement de Vie".
2.  **Règles** : "Honnêteté absolue", "Analyse basée sur données".
3.  **Définitions des Piliers** : Détail des métriques pour Vitalité, Souveraineté, Connexion, Expansion.
4.  **Logique de Score** : Règles de calcul (ex: "Syndrome d'Icare").
5.  **Schéma JSON Complet** : ~400 tokens décrivant la structure exacte de sortie attendue.

#### B. User Data Payload (~600 - 1500 Tokens)
Les données utilisateur injectées dynamiquement (`JSON.stringify(requestData)`) comprennent :
*   **Santé** : 7 derniers jours de sommeil, 10 activités sportives, mesures biométriques.
*   **Finance** : Bilan patrimonial complet (Actifs, Passifs, Dettes).
*   **Social** : Liste des cercles, 10 dernières interactions avec métadonnées de qualité.
*   **Achievements** : 10 derniers succès, pays visités.
*   **Objectifs** : Tous les user goals définis.

**Total Input par Requête** : **~1,600 à 2,500 Tokens**.

#### C. Output Response (~600 Tokens)
La réponse JSON contient une analyse détaillée, des scores par pilier, des tendances, et des conseils textuels.

### 1.3 Coût & Latence Unitaire
*   **Prix Input** : $0.59 / 1M tokens.
*   **Prix Output** : $0.79 / 1M tokens.
*   **Coût Actuel** : ~($0.0014 Input + $0.0005 Output) = **$0.0019 par appel**.
*   **Latence** : Llama 3.3 70B sur Groq est extrêmement rapide (~300 tokens/sec), l'analyse prend généralement **< 2-3 secondes**.

---

## 2. Contraintes & Goulots d'Étranglement (Bottlenecks)

C'est ici que l'audit expert est crucial. Le modèle actuel n'est **pas scalable** en l'état sur le tier gratuit/standard.

### 2.1 Le Mur du TPM (Tokens Per Minute)
*   **Limite Groq (Llama 70B)** : 12,000 TPM (Tokens Per Minute) max (Tier Standard).
*   **Consommation Réelle** : Une seule requête consomme ~2,200 tokens (Input + Output).
*   **Capacité Max** : 12,000 / 2,200 ≈ **5.4 requêtes par minute**.

> [!CRITICAL]
> **Risque Critique** : Si 6 utilisateurs lancent l'application simultanément (ex: notification push à 18h), le 6ème recevra une erreur 429 (Too Many Requests). L'application passera en mode "Fallback" algorithmique.

---

## 3. Stratégies d'Optimisation & Recommandations

Pour passer à l'échelle (100+ utilisateurs simultanés), voici les architectures à valider par votre expert.

### 3.1 Optimisation du Prompt (Low-Hanging Fruit)
Réduire la taille du prompt permet d'augmenter le nombre de requêtes possibles par minute.
*   **Action** : Supprimer la définition JSON verbeuse du System Prompt.
*   **Technique** : Utiliser TypeScript interfaces (via Zod) pour valider la sortie à postériori, et ne donner au LLM qu'un exemple JSON minimal (one-shot prompting) plutôt que la définition complète.
*   **Gain estimé** : -400 tokens par requête (+20% de capacité).

### 3.2 Architecture de Caching "Layered" (Recommandé)
L'analyse "Harmony" ne nécessite pas de temps réel strict.
*   **Niveau 1 (Client)** : `localStorage`/`AsyncStorage` pour ne pas rappeler l'API au refresh de page (Déjà partiellement fait par React Query / State).
*   **Niveau 2 (Serveur - Critique)** : Les données d'un utilisateur changent rarement drastiquement en < 24h.
    *   *Règle* : Si une analyse date de moins de 24h, servir le cache DB.
    *   *Trigger* : Ne re-calculer QUE si de nouvelles données significatives (ex: nouvelle activité, nouveau sommeil) sont ajoutées.
*   **Gain** : Réduction de 90% des appels API inutiles.

### 3.3 Queue & Throttling (Gestion de Charge)
Ne jamais appeler Groq directement depuis le front-end ou une Server Action synchrone.
*   **Pattern** : UI -> Server Action -> **Job Queue (Redis/Bull)** -> Groq.
*   **Avantage** : Si 50 utilisateurs arrivent, la queue traite les requêtes 5 par 5 (pour respecter les 12k TPM) sans planter. L'utilisateur voit un état "Analyse en cours..." puis le résultat apparaît.

### 3.4 Downgrade Stratégique de Modèle
*   **Alternative** : `llama-3.1-8b-instant`.
*   **Prix** : ~$0.05 (10x moins cher).
*   **TPM** : Généralement beaucoup plus permissif (~100k TPM).
*   **Compromis** : Moins de finesse psychologique dans les "Conseils", mais capacité de calcul x10.
*   **Stratégie Hybride** : Utiliser 8B pour le calcul des scores/tendances (chiffres) et 70B uniquement pour la génération du texte "Conseil" (plus court, moins de tokens).

### 3.5 Passage au Tier Payant / Provisionné
Si le business model le permet, passer sur un plan Groq Business ou "Capacity Reservation" pour garantir un TPM > 100k.

## 4. Données & Confidentialité (Audit)

### Données Transmises
Le système transmet :
*   Données biométriques (Poids, Sommeil, Cœur).
*   Données financières (Patrimoine global).
*   Vie sociale (Nombre d'amis, interactions).

### Conformité
*   **Anonymisation** : Aucune PII (Nom, Email, IP) n'est envoyée dans le prompt. C'est conforme aux bonnes pratiques "Privacy by Design".
*   **Rétention** : Vérifier que l'option "Zero Retention" est active sur le compte Groq pour ces données sensibles.

---

## Conclusion pour l'Expert

L'implémentation est fonctionnelle et propre (`utils/harmonyAI.ts` est bien structuré), mais **fragile face à la charge** à cause de la limite stricte de 12k TPM du modèle 70B.

**Actions prioritaires** :
1.  Valider la stratégie de **Queueing** pour lisser les pics de charge.
2.  Auditer la qualité des réponses du modèle **8B** pour voir si une migration est acceptable.
3.  Optimiser le **System Prompt** pour gagner des tokens précieux.
