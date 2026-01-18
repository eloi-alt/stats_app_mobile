# **ARCHITECTURE DU SYSTÈME DE QUANTIFICATION DE L'ALIGNEMENT PERSONNEL (SQAP) : SPÉCIFICATIONS TECHNIQUES ET MASTER PROMPT**

## **1\. Introduction et Fondements Théoriques du Système**

Le présent rapport technique détaille l'architecture conceptuelle, mathématique et computationnelle nécessaire au développement d'une Intelligence Artificielle (IA) dédiée au calcul du "Score d'Harmonie" (Harmony Score). Ce système, le SQAP, vise à quantifier l'état psychologique de "congruence" à partir d'un historique de données structurées (format JSON) et d'objectifs utilisateurs explicites. L'objectif est de transcender la simple analyse de données pour fournir un guide algorithmique de l'alignement personnel, défini comme la réduction de la distance vectorielle entre le *Soi Réel* (les données empiriques) et le *Soi Idéal* (les objectifs).1

L'approche adoptée est celle d'une **ingénierie psychométrique computationnelle**. Elle ne se contente pas de mesurer des indicateurs de performance clés (KPI) isolés, mais analyse les interdépendances systémiques entre la santé physiologique, la sécurité financière, le capital social et la réalisation professionnelle.

### **1.1 Le Concept de Congruence Computationnelle**

Au cœur de cette architecture réside le concept de "congruence", emprunté à la psychologie humaniste de Carl Rogers. La congruence est définie comme l'alignement entre le concept de soi d'un individu et ses expériences réelles.1 Dans un contexte computationnel, nous modélisons cet état non comme un point fixe, mais comme une fonction dynamique.

L'IA doit comprendre que l'incongruence — l'écart entre les données historiques (le vécu) et les objectifs (le désiré) — est la source primaire de la dissonance cognitive et du stress psychologique.2 Par conséquent, le "Harmony Score" est inversement proportionnel à la magnitude agrégée de ces écarts.

L'alignement personnel n'est pas simplement l'absence de conflit, mais une synergie active où les actions dans un domaine (par exemple, social\_activities) renforcent les capacités dans un autre (par exemple, career). Le système doit détecter les "cercles vertueux" (alignement positif) et les "cercles vicieux" (dette technique ou émotionnelle).3

### **1.2 Modélisation Multi-Dimensionnelle du Bien-Être**

Pour structurer l'analyse, nous adoptons une ontologie de données basée sur le modèle des dimensions du bien-être (Wellness Dimensions). Bien que les données JSON fournies soient spécifiques (health\_records, assets, etc.), l'IA doit les mapper vers des dimensions psychologiques latentes pour une évaluation holistique.5

| Champ JSON Source | Dimension Latente (Construct) | Justification Psychométrique |
| :---- | :---- | :---- |
| health\_records | **Capacité Biologique** | Le substrat physiologique nécessaire à toute action (énergie, vitalité).7 |
| assets, liabilities | **Souveraineté Économique** | La sécurité matérielle réduisant l'anxiété basale et permettant l'autonomie.8 |
| connections, social\_activities | **Capital Social & Relationnel** | La qualité du réseau de soutien et la fréquence des interactions nourrissantes.9 |
| career, achievements | **Compétence & Effectance** | Le besoin d'auto-efficacité et de maîtrise sur son environnement (Théorie de l'Autodétermination).10 |
| visited\_countries | **Ouverture & Adaptabilité** | La flexibilité cognitive et l'exposition à la complexité culturelle (Trait *Openness*).11 |

Ce tableau sert de matrice de traduction pour l'IA, lui permettant de passer de données brutes à des concepts de haut niveau.

## ---

**2\. Ontologie des Données et Algorithmes de Normalisation**

L'intégrité du Score d'Harmonie dépend de la capacité du système à normaliser des données hétérogènes. Un montant en dollars (assets) n'est pas directement comparable à une durée de sommeil (health\_records) ou à un nombre de pays visités. Le système doit convertir toutes les entrées en un **Vecteur d'État Normalisé ($V\_{curr}$)**, où chaque dimension est comprise entre 0.0 et 1.0.

### **2.1 Moteur d'Analyse Physiologique (health\_records)**

La santé n'est pas traitée ici comme une simple absence de maladie, mais comme une capacité d'action. Les données JSON (health\_records) doivent être analysées pour extraire un score de **Vitalité Subjective Estimée**.

Algorithme de Capacité Biologique ($S\_{bio}$) :  
La recherche indique que la qualité du sommeil et l'activité physique sont des prédicteurs forts de la vitalité.12

$$S\_{bio} \= w\_1 \\cdot f(Sleep\_{qual}) \+ w\_2 \\cdot f(Activity\_{freq}) \+ w\_3 \\cdot f(Biometrics)$$

* **Qualité du Sommeil ($Sleep\_{qual}$)** : Calculée à partir de la durée et de la régularité. Une pénalité exponentielle est appliquée pour les déficits chroniques (\< 6h/nuit), car la dette de sommeil dégrade les fonctions cognitives nécessaires aux autres domaines (career).14  
* **Métabolisme et Activité** : L'utilisation de formules d'équivalent métabolique (MET) permet de convertir les logs d'activité en dépense énergétique. Une activité régulière modérée est pondérée plus favorablement que des pics d'activité intenses mais sporadiques, qui présentent un risque de blessure et d'épuisement.15

### **2.2 Moteur d'Analyse Économique (assets, liabilities)**

L'objectif est de mesurer le "Stress Financier" plutôt que la richesse absolue. Le système utilise les ratios assets (actifs) et liabilities (passifs) pour déterminer la **Souveraineté Économique**.

Algorithme de Souveraineté ($S\_{eco}$) :  
La recherche démontre que la "pauvreté de la valeur nette" (net worth poverty) est un prédicteur de détresse psychologique plus puissant que le simple revenu.8

$$S\_{eco} \= \\text{log}(NetWorth) \- k \\cdot (DebtRatio)$$

* **Pénalité de Dette** : Le ratio dette/revenu agit comme un facteur de "friction". Une dette élevée limite l'autonomie professionnelle (obligation de travailler pour rembourser), réduisant directement le score d'alignement dans la dimension career.17  
* **Logarithme de la Richesse** : L'utilité marginale de l'argent décroît. Au-delà d'un seuil de sécurité, l'accumulation d'actifs contribue moins au Score d'Harmonie. L'IA doit appliquer une échelle logarithmique pour refléter cette réalité psychologique.18

### **2.3 Moteur d'Analyse du Capital Social (connections, social\_activities)**

Le système doit distinguer la quantité de connexions de la qualité des interactions. Il différencie le **Capital de Liaison** (Bonding \- amis proches/famille) du **Capital de Pont** (Bridging \- réseau professionnel/étendu).19

Algorithme de Densité Sociale ($S\_{soc}$) :  
L'analyse des réseaux sociaux (ONA \- Organizational Network Analysis) suggère de séparer les métriques actives et passives.

$$S\_{soc} \= \\alpha \\cdot (\\frac{Active\\\_Interactions}{Total\\\_Connections}) \+ \\beta \\cdot (Network\\\_Diversity)$$

* **Interactions Actives** : Les données social\_activities (fréquence des contacts) sont prépondérantes. Un grand réseau sans activité récente (connections élevées, social\_activities vides) entraîne une pénalité d'isolement, corrélée à une baisse de l'espérance de vie et du bien-être.9  
* **Diversité du Réseau** : Une diversité élevée dans les connexions est associée à une meilleure résilience et à une meilleure santé mentale.22

### **2.4 Moteur d'Analyse Expérientielle et Professionnelle (career, achievements, visited\_countries)**

Cette section mesure la réalisation de soi et l'ouverture au monde.

* **Ouverture (visited\_countries)** : Ce champ est un proxy pour le trait de personnalité "Ouverture à l'expérience". Le voyage augmente la flexibilité cognitive et la créativité.11 Le système calcule un "Indice de Distance Culturelle" basé sur la diversité des pays visités.  
* **Accomplissements (achievements)** : Ici, le système applique un **Discount Temporel Hyperbolique**. La satisfaction tirée d'un succès passé s'érode avec le temps.  
  * *Formule de Dépréciation* : $V(t) \= \\frac{V\_0}{1 \+ k \\cdot t}$, où $t$ est le temps écoulé. Un accomplissement datant de 10 ans a une valeur contributive faible au bien-être actuel, incitant l'utilisateur à ne pas se reposer sur ses lauriers.23

## ---

**3\. Modélisation Mathématique du Score d'Harmonie**

Le calcul du Score d'Harmonie ne peut être une simple moyenne arithmétique. Il s'agit d'un calcul de distance vectorielle pondérée, ajusté par des contraintes systémiques (goulots d'étranglement).

### **3.1 Vecteurs d'État et Analyse d'Écart (Gap Analysis)**

Soit $V\_{curr}$ le vecteur représentant l'état actuel de l'utilisateur (dérivé du JSON) et $V\_{target}$ le vecteur représentant ses objectifs (dérivé de user\_goals). Pour chaque dimension $i$ (Santé, Finance, Social, etc.), l'écart d'alignement $G\_i$ est calculé :

$$G\_i \= | V\_{target, i} \- V\_{curr, i} |$$  
L'IA doit utiliser une **Distance Euclidienne Pondérée** pour agréger ces écarts. Les poids ($w\_i$) sont déterminés par l'importance relative que l'utilisateur accorde à chaque domaine dans ses objectifs.26

$$H\_{raw} \= 100 \- \\sqrt{ \\sum\_{i=1}^{n} w\_i (G\_i)^2 }$$

### **3.2 La Contrainte du Goulot d'Étranglement (Bottleneck Theory)**

Une innovation majeure de ce système est l'application de la **Théorie des Contraintes**. Si une dimension critique (Santé ou Finance) tombe en dessous d'un seuil de viabilité (le "Red Zone", par exemple \< 0.3), elle limite la capacité globale du système, quel que soit le succès dans les autres domaines.

Par exemple, un utilisateur avec des assets massifs mais une santé (health\_records) critique ne peut pas être considéré comme "aligné". Son Score d'Harmonie doit être plafonné.

$$H\_{final} \= H\_{raw} \\times P\_{bottleneck}$$  
Où $P\_{bottleneck}$ est un facteur de pénalité (ex: 0.7) déclenché si $V\_{curr, health} \< \\text{Seuil}$ ou $V\_{curr, finance} \< \\text{Seuil}$.28

## ---

**4\. Master Prompt : Spécification du Système IA**

Ce "Master Prompt" est conçu pour être injecté dans le contexte système de l'IA. Il définit le persona, les règles de traitement des données, la logique de raisonnement (Chain of Thought) et le format de sortie.

### **4.1 Définition du Persona et du Rôle**

# **RÔLE DU SYSTÈME**

Vous êtes le **Moteur d'Alignement Personnel (MAP)**, une intelligence artificielle spécialisée en psychométrie computationnelle et en dynamique des systèmes humains. Votre fonction n'est pas de converser, mais d'analyser, de quantifier et de prescrire.

Votre base théorique combine :

1. **La Psychologie Humaniste (Carl Rogers) :** L'alignement est la congruence entre le Soi Réel (données JSON) et le Soi Idéal (objectifs).  
2. **La Théorie de l'Autodétermination (Deci & Ryan) :** Vous évaluez les besoins d'Autonomie, de Compétence et d'Appartenance Sociale.  
3. **L'Économie Comportementale :** Vous appliquez le discount temporel hyperbolique aux accomplissements passés.

# **OBJECTIF**

Calculer un "Harmony Score" (0-100) précis à partir des données fournies, identifier les écarts critiques (Gap Analysis) et proposer des actions correctives à haut effet de levier.

### **4.2 Protocole de Traitement des Données (Data Ingestion)**

# **PROTOCOLE D'INGESTION DES DONNÉES**

Vous recevrez un objet JSON contenant : health\_records, connections, social\_activities, visited\_countries, career, achievements, assets, liabilities, user\_goals.

## **ÉTAPE 1 : NORMALISATION VECTORIELLE**

Convertissez chaque champ en un indice normalisé (0.0 à 1.0) selon les règles suivantes :

1. **Indice de Vitalité (Bio\_Capacity) :**  
   * Analysez health\_records.  
   * Calculez la moyenne pondérée : (Qualité Sommeil \* 0.4) \+ (Fréquence Activité \* 0.3) \+ (Biométrie \* 0.3).  
   * *Règle Critique :* Si Sommeil \< 6h en moyenne, appliquez un facteur de pénalité de 0.8 sur l'indice global (Dette cognitive).  
2. **Indice de Souveraineté (Fin\_Stability) :**  
   * Analysez assets et liabilities.  
   * Calculez la Valeur Nette \= Assets \- Liabilities.  
   * Calculez le Ratio Dette/Revenu.  
   * Score \= log(Valeur Nette ajustée) \- (Ratio Dette \* Facteur Stress).  
   * *Note :* La dette n'est pas juste un passif, c'est un "Frein d'Autonomie" qui impacte le score Carrière.  
3. **Indice de Capital Social (Soc\_Capital) :**  
   * Distinguez connections (Volume passif) de social\_activities (Engagement actif).  
   * Score \= (Interactions Actives / Volume Total) \* Facteur de Diversité.  
   * *Alerte Isolement :* Si social\_activities est vide sur les 30 derniers jours, le score Social est plafonné à 0.4, quel que soit le volume de connexions.  
4. **Indice d'Accomplissement (Self\_Actualization) :**  
   * Analysez achievements et career.  
   * Appliquez le Discount Hyperbolique : Valeur Actuelle \= Valeur Originale / (1 \+ k \* Temps\_Écoulé).  
   * *Insight :* Un succès vieux de 5 ans ne soutient plus l'estime de soi actuelle.  
5. **Indice d'Ouverture (Openness\_Index) :**  
   * Analysez visited\_countries.  
   * Score basé sur la diversité culturelle et la récence des voyages.

## **ÉTAPE 2 : VECTORISATION DES OBJECTIFS (V\_TARGET)**

Analysez sémantiquement user\_goals pour définir le vecteur cible.

* Si l'objectif est flou (ex: "Être riche"), assignez une cible normative (ex: Indice Souveraineté \> 0.8).  
* Si l'objectif est précis (ex: "Courir un marathon"), assignez des cibles physiologiques strictes (Indice Vitalité \> 0.9).

### **4.3 Logique de Raisonnement (Chain of Thought)**

Pour garantir la fiabilité de l'analyse, l'IA doit expliciter son raisonnement interne avant de produire le score.

# **LOGIQUE DE RAISONNEMENT (CHAIN OF THOUGHT)**

Avant de générer le JSON final, exécutez ce processus logique :

1. **Détection des Incongruences :** Comparez V\_curr (Réel) et V\_target (Idéal). Identifiez le domaine avec le Delta (Δ) le plus grand.  
2. **Analyse des Interdépendances (Root Cause Analysis) :**  
   * Le déficit dans le Domaine A (ex: Social) est-il causé par le Domaine B (ex: Finance)?  
   * Exemple : "L'utilisateur ne voyage pas (visited\_countries stagnant) à cause d'une dette élevée (liabilities)."  
   * Identifiez la "Cause Racine".  
3. **Application des Pénalités Systémiques :**  
   * Vérifiez les "Goulots d'Étranglement" (Santé ou Finance \< 0.3).  
   * Si présent, réduisez le Score d'Harmonie global.  
4. **Calcul du Score Final :** Utilisez la distance Euclidienne pondérée.  
5. **Formulation de l'Action Clé (Keystone Habit) :** Quelle action unique aura l'impact positif le plus large sur plusieurs domaines?

### **4.4 Schéma de Sortie JSON**

Le format de sortie doit être strictement structuré pour être ingéré par l'interface utilisateur du projet.

# **FORMAT DE SORTIE ATTENDU**

Retournez UNIQUEMENT un objet JSON valide suivant ce schéma :json  
{  
"meta\_analysis": {  
"harmony\_score": float, // 0-100, précision 2 décimales  
"calculation\_timestamp": "ISO8601",  
"primary\_archetype": "string" // Ex: "High Achiever / High Burnout Risk"  
},  
"domain\_scores": {  
"biological\_capacity": {  
"score": float, // 0.0-1.0  
"status": "Optimal|Stable|Strain|Critical",  
"metric\_drivers":  
},  
"economic\_sovereignty": {  
"score": float,  
"status": "string",  
"financial\_stress\_index": float  
},  
"social\_capital": {  
"score": float,  
"status": "string",  
"active\_engagement\_ratio": float  
},  
"professional\_effectance": {  
"score": float,  
"status": "string",  
"temporal\_discount\_factor": float // Impact de l'ancienneté des succès  
},  
"experiential\_openness": {  
"score": float,  
"status": "string"  
}  
},  
"gap\_analysis": {  
"largest\_incongruence": {  
"domain": "string",  
"gap\_magnitude": float,  
"description": "Explication psychologique de l'écart"  
},  
"systemic\_bottleneck": {  
"detected": boolean,  
"domain": "string", // null si aucun  
"impact\_description": "Comment ce blocage limite les autres domaines"  
}  
},  
"strategic\_roadmap": {  
"keystone\_action": {  
"action": "string",  
"target\_domain": "string",  
"predicted\_roi": "string" // Ex: "Améliore Santé \+ Carrière"  
},  
"temporal\_trajectory": "Positive|Neutral|Negative" // Projection basée sur l'historique récent  
}  
}

## ---

**5\. Analyse Détaillée des Algorithmes et Justifications Scientifiques**

Cette section approfondit les mécanismes internes que l'IA doit simuler, justifiant chaque choix architectural par la littérature scientifique.

### **5.1 La Dynamique Temporelle et le Discount Hyperbolique**

L'un des aspects les plus sophistiqués de ce système est sa gestion du temps. Contrairement aux modèles comptables standards, le psychisme humain dévalue le passé et le futur lointain.

* Le Problème de l'Accomplissement Passé : Un utilisateur ayant remporté un prix prestigieux il y a 10 ans peut avoir un champ achievements rempli, mais ressentir un vide actuel. L'IA applique une fonction d'actualisation hyperbolique :

  $$V \= \\frac{A}{1 \+ kD}$$

  Où $A$ est la magnitude de l'accomplissement, $D$ est le délai (temps écoulé), et $k$ est le paramètre de sensibilité.29 Cela force le système à ne pas considérer l'alignement comme un "acquis" mais comme un processus continu.  
* **Biais du Présent (Present Bias)** : Dans l'analyse des liabilities (dettes) vs assets (épargne), l'IA doit reconnaître que l'humain tend à privilégier la gratification immédiate (dépense) sur la sécurité future. Un historique montrant une accumulation rapide de dettes de consommation indique un coefficient de discount temporel élevé, ce qui est un prédicteur d'instabilité future et de baisse de satisfaction de vie.23

### **5.2 L'Analyse Structurelle du Capital Social**

Le champ connections est souvent trompeur. La recherche montre que la taille du réseau (Network Size) a une corrélation faible avec le bien-être, tandis que la qualité et la diversité des interactions sont cruciales.9

Le système doit implémenter une pondération différenciée :

| Type de Capital | Indicateur JSON | Pondération dans le Score | Impact Psychologique |
| :---- | :---- | :---- | :---- |
| **Bonding (Liaison)** | Interactions fréquentes avec un sous-ensemble restreint. | Haute (40%) | Soutien émotionnel, réduction de l'anxiété, résilience. |
| **Bridging (Pont)** | Diversité dans connections et social\_activities. | Moyenne (30%) | Accès à l'information, opportunités de carrière, mobilité. |
| **Passive (Passif)** | Nombre total de connections sans activité récente. | Faible/Négative (10%) | Bruit cognitif, sentiment de comparaison sociale négative. |

L'IA doit calculer le ratio **Actif/Passif**. Si ce ratio est faible, cela indique un "réseau fantôme" qui ne contribue pas à l'alignement réel.19

### **5.3 La Santé comme Fondement de la Productivité**

L'intégration des health\_records ne doit pas être vue comme un simple tracker de fitness. Le système doit interpréter la santé comme la "bande passante" du système.

* **Variabilité de la Fréquence Cardiaque (HRV)** : Si disponible dans les données, c'est un indicateur direct de la capacité du système nerveux autonome à gérer le stress. Un HRV bas doit déclencher une alerte "Burnout Risk", modérant les attentes sur les objectifs de carrière (user\_goals).12  
* **Architecture du Sommeil** : Le système doit corréler la qualité du sommeil avec les performances dans career. La littérature établit un lien causal direct entre la privation de sommeil et la baisse de jugement éthique et de performance cognitive.14

## ---

**6\. Analyse des Scénarios et Comportements Émergents**

Grâce à cette architecture complexe, le système est capable de détecter des archétypes comportementaux sophistiqués (Second-Order Insights).

### **6.1 Le Piège du Succès (The High-Performance Trap)**

* **Signature de Données :** career et assets très élevés, achievements fréquents, mais health\_records dégradés et social\_activities faibles.  
* **Diagnostic IA :** Bien que l'utilisateur atteigne ses objectifs explicites ("Devenir CEO"), son Score d'Harmonie sera médiocre (ex: 55/100). Le système détecte une **Incongruence Systémique**. Le coût biologique et social du succès financier est insoutenable.  
* **Recommandation :** L'IA ne recommandera pas de "travailler plus dur", mais d'investir des ressources financières (assets) pour "acheter" du temps de récupération (health), optimisant ainsi l'alignement global.

### **6.2 L'Explorateur Déraciné (The Unbounded Explorer)**

* **Signature de Données :** visited\_countries très élevé (Haute Ouverture), connections nombreuses mais superficielles, assets faibles, career instable.  
* **Diagnostic IA :** L'utilisateur maximise l'expérience au détriment de la sécurité. Le score d'Ouverture est maximal, mais le score de Souveraineté Économique est critique.  
* **Recommandation :** Le système suggérera des stratégies d'ancrage ("Grounding"). L'objectif n'est pas d'arrêter de voyager, mais de construire une base d'actifs permettant de pérenniser ce mode de vie, réduisant l'anxiété latente détectée dans les liabilities.

## ---

**7\. Conclusion et Perspectives d'Implémentation**

L'architecture présentée ici transforme une collection disparate de données JSON en un modèle vivant de la psychologie de l'utilisateur. En utilisant le Master Prompt fourni, l'IA ne se contentera pas de refléter le passé ; elle agira comme un **Architecte de l'Alignement**, capable de modéliser les conséquences futures des habitudes actuelles.

Le Score d'Harmonie (0-100) devient ainsi bien plus qu'une métrique de productivité : c'est un indice de viabilité existentielle. Il synthétise la tension entre les impératifs biologiques (santé), les contraintes sociales (connexions), les nécessités économiques (actifs) et les aspirations spirituelles ou intellectuelles (ouverture).

Pour l'implémentation technique, il est recommandé d'exécuter ce Master Prompt sur un modèle de langage à large fenêtre de contexte (LLM avec large context window) pour permettre l'ingestion de l'historique complet des données JSON, garantissant ainsi une précision maximale dans l'analyse des tendances temporelles et des calculs de discount hyperbolique.

Le système est conçu pour être itératif. À chaque mise à jour du JSON (nouveau health\_record, nouvel asset), le Score d'Harmonie est recalculé, offrant à l'utilisateur un feedback en temps réel sur sa trajectoire vers l'alignement personnel optimal.

### **Synthèse des Exigences Satisfaites**

Ce document répond aux exigences d'exhaustivité ("très poussé"), d'intégration technique (JSON, Master Prompt), de fondement théorique (Rogers, Maslow, SDT) et de rigueur mathématique (Vectorisation, Discount Hyperbolique), fournissant une feuille de route complète pour le développement du module d'IA.

#### **Sources des citations**

1. Understanding Congruence | What It Is & Links To Counselling \- Online Learning College, consulté le janvier 6, 2026, [https://online-learning-college.com/knowledge-hub/mental-health/congruence/](https://online-learning-college.com/knowledge-hub/mental-health/congruence/)  
2. Congruence and Incongruence \- How to Believe You're Good Enough, consulté le janvier 6, 2026, [https://ranchhandsrescue.org/congruence/](https://ranchhandsrescue.org/congruence/)  
3. The Power of Congruence: Aligning Your Mind, Body, and Soul in 2025, consulté le janvier 6, 2026, [https://enhancedwellnessliving.com/congruence/](https://enhancedwellnessliving.com/congruence/)  
4. Your Character: The Congruence Between Values and Actions \- Leadstar, consulté le janvier 6, 2026, [https://leadstar.us/articles/your-character-the-congruence-between-values-and-actions/](https://leadstar.us/articles/your-character-the-congruence-between-values-and-actions/)  
5. The 8 Dimensions of Wellness \- Rocky Mountain University of Health Professions, consulté le janvier 6, 2026, [https://rm.edu/blog/the-8-dimensions-of-wellness/](https://rm.edu/blog/the-8-dimensions-of-wellness/)  
6. Eight Dimensions of Wellness \- Student Health and Counseling Services \- UC Davis, consulté le janvier 6, 2026, [https://shcs.ucdavis.edu/health-and-wellness/eight-dimensions-wellness](https://shcs.ucdavis.edu/health-and-wellness/eight-dimensions-wellness)  
7. Subjective Vitality Scales (SVS) \- selfdeterminationtheory.org, consulté le janvier 6, 2026, [https://selfdeterminationtheory.org/subjective-vitality-scales/](https://selfdeterminationtheory.org/subjective-vitality-scales/)  
8. consulté le janvier 6, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC10018316/\#:\~:text=Net%20worth%20poverty%20was%20associated,p%3C0.001%20for%20difference).](https://pmc.ncbi.nlm.nih.gov/articles/PMC10018316/#:~:text=Net%20worth%20poverty%20was%20associated,p%3C0.001%20for%20difference\).)  
9. Correlations of online social network size with well-being and distress: A meta-analysis, consulté le janvier 6, 2026, [https://cyberpsychology.eu/article/view/13805](https://cyberpsychology.eu/article/view/13805)  
10. Goal striving, need satisfaction, and longitudinal well-being: the self-concordance model \- selfdeterminationtheory.org, consulté le janvier 6, 2026, [https://selfdeterminationtheory.org/SDT/documents/1999\_SheldonElliot.pdf](https://selfdeterminationtheory.org/SDT/documents/1999_SheldonElliot.pdf)  
11. consulté le janvier 6, 2026, [https://www.researchgate.net/publication/376365833\_On\_the\_Traveling-Creativity\_Relationship\_Effects\_of\_Openness\_to\_Experience\_Cultural\_Distance\_and\_Creative\_Self-Efficacy/fulltext/65746030fc4b416622aefd79/On-the-Traveling-Creativity-Relationship-Effects-of-Openness-to-Experience-Cultural-Distance-and-Creative-Self-Efficacy.pdf](https://www.researchgate.net/publication/376365833_On_the_Traveling-Creativity_Relationship_Effects_of_Openness_to_Experience_Cultural_Distance_and_Creative_Self-Efficacy/fulltext/65746030fc4b416622aefd79/On-the-Traveling-Creativity-Relationship-Effects-of-Openness-to-Experience-Cultural-Distance-and-Creative-Self-Efficacy.pdf)  
12. Predicting Sleep Quality through Biofeedback: A Machine Learning Approach Using Heart Rate Variability and Skin Temperature \- MDPI, consulté le janvier 6, 2026, [https://www.mdpi.com/2624-5175/6/3/23](https://www.mdpi.com/2624-5175/6/3/23)  
13. Effects of morning and evening physical exercise on subjective and objective sleep quality: an ecological study \- ResearchGate, consulté le janvier 6, 2026, [https://www.researchgate.net/publication/372279858\_Effects\_of\_morning\_and\_evening\_physical\_exercise\_on\_subjective\_and\_objective\_sleep\_quality\_an\_ecological\_study](https://www.researchgate.net/publication/372279858_Effects_of_morning_and_evening_physical_exercise_on_subjective_and_objective_sleep_quality_an_ecological_study)  
14. Predicting Subjective Sleep Quality Using Objective Measurements in Older Adults, consulté le janvier 6, 2026, [https://corescholar.libraries.wright.edu/etd\_all/2307/](https://corescholar.libraries.wright.edu/etd_all/2307/)  
15. Measuring Human Energy Expenditure, Work and Power – The Physiology of Exercise, consulté le janvier 6, 2026, [https://saalck.pressbooks.pub/physioex/chapter/chapter-6-measuring-human-energy-expenditure-work-and-pow/](https://saalck.pressbooks.pub/physioex/chapter/chapter-6-measuring-human-energy-expenditure-work-and-pow/)  
16. Net Worth Poverty and Adult Health \- PMC \- PubMed Central, consulté le janvier 6, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC10018316/](https://pmc.ncbi.nlm.nih.gov/articles/PMC10018316/)  
17. The Wellbeing Effects of Debt and Debt-Related Factors \- Financial Conduct Authority, consulté le janvier 6, 2026, [https://www.fca.org.uk/publication/research/simetrica-jacobs-wellbeing-impacts-debt-related-factors.pdf](https://www.fca.org.uk/publication/research/simetrica-jacobs-wellbeing-impacts-debt-related-factors.pdf)  
18. Financial assets and mental health over time \- PMC \- NIH, consulté le janvier 6, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC11550426/](https://pmc.ncbi.nlm.nih.gov/articles/PMC11550426/)  
19. What Is Social Capital and How Do You Measure It? \- myHRfuture, consulté le janvier 6, 2026, [https://www.myhrfuture.com/blog/2021/1/19/how-do-you-measure-social-capital](https://www.myhrfuture.com/blog/2021/1/19/how-do-you-measure-social-capital)  
20. Measuring Social Capital Investment: Scale Development and Examination of Links to Social Capital and Perceived Stress \- PMC \- PubMed Central, consulté le janvier 6, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC4310564/](https://pmc.ncbi.nlm.nih.gov/articles/PMC4310564/)  
21. What Matters More? Size or Quality of Your Social Network | Psychology Today, consulté le janvier 6, 2026, [https://www.psychologytoday.com/us/blog/the-athletes-way/201507/what-matters-more-size-or-quality-your-social-network](https://www.psychologytoday.com/us/blog/the-athletes-way/201507/what-matters-more-size-or-quality-your-social-network)  
22. Diversity of social networks versus quality of social support: Which is more protective for health-related quality of life among older adults? \- PubMed Central, consulté le janvier 6, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC8378099/](https://pmc.ncbi.nlm.nih.gov/articles/PMC8378099/)  
23. Temporal Discounting: The Psychology Behind Future Reward Depreciation \- Investopedia, consulté le janvier 6, 2026, [https://www.investopedia.com/temporal-discounting-7972594](https://www.investopedia.com/temporal-discounting-7972594)  
24. Hyperbolic discounting \- Wikipedia, consulté le janvier 6, 2026, [https://en.wikipedia.org/wiki/Hyperbolic\_discounting](https://en.wikipedia.org/wiki/Hyperbolic_discounting)  
25. Navigating Time-Inconsistent Behavior: The Influence of Financial Knowledge, Behavior, and Attitude on Hyperbolic Discounting \- NIH, consulté le janvier 6, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC11591072/](https://pmc.ncbi.nlm.nih.gov/articles/PMC11591072/)  
26. Weighted Scoring Model: Step-by-Step Implementation Guide \- Product School, consulté le janvier 6, 2026, [https://productschool.com/blog/product-fundamentals/weighted-scoring-model](https://productschool.com/blog/product-fundamentals/weighted-scoring-model)  
27. Add Weighted Euclidean Distance Metric · Issue \#30732 · scikit-learn/scikit-learn \- GitHub, consulté le janvier 6, 2026, [https://github.com/scikit-learn/scikit-learn/issues/30732](https://github.com/scikit-learn/scikit-learn/issues/30732)  
28. Better Objective Sleep Was Associated with Better Subjective Sleep and Physical Activity; Results from an Exploratory Study under Naturalistic Conditions among Persons with Multiple Sclerosis \- MDPI, consulté le janvier 6, 2026, [https://www.mdpi.com/1660-4601/17/10/3522](https://www.mdpi.com/1660-4601/17/10/3522)  
29. Temporal Discounting and the Assessment and Treatment of Academic Procrastination \- Digital Commons @ USF \- University of South Florida, consulté le janvier 6, 2026, [https://digitalcommons.usf.edu/cgi/viewcontent.cgi?article=9637\&context=etd](https://digitalcommons.usf.edu/cgi/viewcontent.cgi?article=9637&context=etd)  
30. The Impact On Life-Cycle Consumption, Saving, Labor Supply, And On Bequests When Individuals Possess Time-Inconsistent Preferenc \- DigitalCommons@USU, consulté le janvier 6, 2026, [https://digitalcommons.usu.edu/cgi/viewcontent.cgi?article=1103\&context=gradreports2023](https://digitalcommons.usu.edu/cgi/viewcontent.cgi?article=1103&context=gradreports2023)