'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'fr' | 'es'

interface Translations {
  [key: string]: {
    en: string
    fr: string
    es: string
  }
}

const translations: Translations = {
  // Greetings
  'goodMorning': { en: 'Good morning', fr: 'Bonjour', es: 'Buenos días' },
  'goodAfternoon': { en: 'Good afternoon', fr: 'Bon après-midi', es: 'Buenas tardes' },
  'goodEvening': { en: 'Good evening', fr: 'Bonsoir', es: 'Buenas noches' },

  // Navigation
  'health': { en: 'Health', fr: 'Santé', es: 'Salud' },
  'trueCircle': { en: 'TrueCircle', fr: 'TrueCircle', es: 'TrueCircle' },
  'home': { en: 'Home', fr: 'Accueil', es: 'Inicio' },
  'world': { en: 'World', fr: 'Monde', es: 'Mundo' },
  'career': { en: 'Career', fr: 'Carrière', es: 'Carrera' },

  // Sections
  'yourDomains': { en: 'Your domains', fr: 'Vos domaines', es: 'Tus dominios' },
  'metrics': { en: 'Metrics', fr: 'Métriques', es: 'Métricas' },
  'innerCircle': { en: 'Inner Circle', fr: 'Mon cercle proche', es: 'Círculo íntimo' },
  'ranking': { en: 'Ranking', fr: 'Classement', es: 'Clasificación' },
  'connections': { en: 'Connections', fr: 'Connexions', es: 'Conexiones' },
  'balance': { en: 'Balance', fr: 'Équilibre', es: 'Equilibrio' },
  'growth': { en: 'Growth', fr: 'Croissance', es: 'Crecimiento' },
  'exploration': { en: 'Exploration', fr: 'Exploration', es: 'Exploración' },

  // Profile
  'memberSince': { en: 'Member since', fr: 'Membre depuis', es: 'Miembro desde' },
  'globalScore': { en: 'Global score', fr: 'Score global', es: 'Puntuación global' },
  'countries': { en: 'Countries', fr: 'Pays', es: 'Países' },
  'achievements': { en: 'Achievements', fr: 'Réalisations', es: 'Logros' },
  'settings': { en: 'Settings', fr: 'Paramètres', es: 'Configuración' },
  'signOut': { en: 'Sign out', fr: 'Se déconnecter', es: 'Cerrar sesión' },
  'shareProfile': { en: 'Share Profile', fr: 'Partager le profil', es: 'Compartir perfil' },
  'scanToView': { en: 'Scan to view profile', fr: 'Scanner pour voir le profil', es: 'Escanear para ver perfil' },
  'tapToAddBio': { en: 'Tap to add a bio', fr: 'Appuyez pour ajouter une bio', es: 'Toca para añadir bio' },

  // Settings
  'notifications': { en: 'Notifications', fr: 'Notifications', es: 'Notificaciones' },
  'privacy': { en: 'Privacy', fr: 'Confidentialité', es: 'Privacidad' },
  'language': { en: 'Language', fr: 'Langue', es: 'Idioma' },
  'appearance': { en: 'Appearance', fr: 'Apparence', es: 'Apariencia' },
  'theme': { en: 'Theme', fr: 'Thème', es: 'Tema' },
  'light': { en: 'Light', fr: 'Clair', es: 'Claro' },
  'dark': { en: 'Dark', fr: 'Sombre', es: 'Oscuro' },
  'verification': { en: 'Verification', fr: 'Vérification', es: 'Verificación' },

  // Privacy options
  'public': { en: 'Public', fr: 'Public', es: 'Público' },
  'friends': { en: 'Friends', fr: 'Amis', es: 'Amigos' },
  'private': { en: 'Private', fr: 'Privé', es: 'Privado' },
  'publicStats': { en: 'Public Stats', fr: 'Stats publiques', es: 'Estadísticas públicas' },
  'privateStats': { en: 'Private Stats', fr: 'Stats privées', es: 'Estadísticas privadas' },

  // UI Controls
  'save': { en: 'Save', fr: 'Enregistrer', es: 'Guardar' },
  'cancel': { en: 'Cancel', fr: 'Annuler', es: 'Cancelar' },
  'close': { en: 'Close', fr: 'Fermer', es: 'Cerrar' },
  'add': { en: 'Add', fr: 'Ajouter', es: 'Añadir' },
  'edit': { en: 'Edit', fr: 'Modifier', es: 'Editar' },
  'back': { en: 'Back', fr: 'Retour', es: 'Volver' },
  'plan': { en: 'Plan', fr: 'Planifier', es: 'Planificar' },

  // Health / Physio
  'sleep': { en: 'Sleep', fr: 'Sommeil', es: 'Sueño' },
  'weight': { en: 'Weight', fr: 'Poids', es: 'Peso' },
  'water': { en: 'Water', fr: 'Eau', es: 'Agua' },
  'workout': { en: 'Workout', fr: 'Entraînement', es: 'Entrenamiento' },
  'activity': { en: 'Activity', fr: 'Activité', es: 'Actividad' },
  'steps': { en: 'Steps', fr: 'Pas', es: 'Pasos' },
  'hrv': { en: 'HRV', fr: 'VFC', es: 'VFC' },
  'hydration': { en: 'Hydration', fr: 'Hydratation', es: 'Hidratación' },
  'lastActivity': { en: 'Last activity', fr: 'Dernière activité', es: 'Última actividad' },
  'bodyComposition': { en: 'Body composition', fr: 'Composition corporelle', es: 'Composición corporal' },
  'bodyFat': { en: 'Body fat', fr: 'Masse grasse', es: 'Grasa corporal' },
  'muscleMass': { en: 'Muscle mass', fr: 'Masse musculaire', es: 'Masa muscular' },
  'vo2Max': { en: 'VO2 Max', fr: 'VO2 Max', es: 'VO2 Máx' },
  'restingHR': { en: 'Resting HR', fr: 'FC au repos', es: 'Frecuencia cardíaca' },
  'readMore': { en: 'Tap to read more...', fr: 'Appuyez pour en savoir plus...', es: 'Toca para leer más...' },
  'saved': { en: 'Saved!', fr: 'Enregistré !', es: '¡Guardado!' },

  // World / Map
  'trips': { en: 'Trips', fr: 'Voyages', es: 'Viajes' },
  'cities': { en: 'Cities', fr: 'Villes', es: 'Ciudades' },
  'visitedCountries': { en: 'Visited Countries', fr: 'Pays visités', es: 'Países visitados' },
  'addNewTrip': { en: 'Add New Trip', fr: 'Ajouter un voyage', es: 'Añadir viaje' },
  'destination': { en: 'Destination', fr: 'Destination', es: 'Destino' },
  'start': { en: 'Start', fr: 'Début', es: 'Inicio' },
  'end': { en: 'End', fr: 'Fin', es: 'Fin' },
  'purpose': { en: 'Purpose', fr: 'Objectif', es: 'Propósito' },
  'leisure': { en: 'Leisure', fr: 'Loisirs', es: 'Ocio' },
  'work': { en: 'Work', fr: 'Travail', es: 'Trabajo' },
  'family': { en: 'Family', fr: 'Famille', es: 'Familia' },
  'adventure': { en: 'Adventure', fr: 'Aventure', es: 'Aventura' },
  'whereGoing': { en: 'Where are you going?', fr: 'Où allez-vous ?', es: '¿A dónde vas?' },
  'tripAdded': { en: 'Trip added!', fr: 'Voyage ajouté !', es: '¡Viaje añadido!' },

  // Career / Pro
  'currentPosition': { en: 'Current Position', fr: 'Poste actuel', es: 'Cargo actual' },
  'skills': { en: 'Skills', fr: 'Compétences', es: 'Habilidades' },
  'skillsIdentified': { en: 'skills identified', fr: 'compétences identifiées', es: 'habilidades identificadas' },
  'careerProjection': { en: 'Career Projection', fr: 'Projection de carrière', es: 'Proyección de carrera' },
  'goal': { en: 'Goal', fr: 'Objectif', es: 'Meta' },
  'missingSkill': { en: 'To develop', fr: 'À développer', es: 'Por desarrollar' },
  'proAchievements': { en: 'Pro achievements', fr: 'Réalisations pro', es: 'Logros pro' },
  'financialOverview': { en: 'Financial Overview', fr: 'Aperçu financier', es: 'Resumen financiero' },
  'netWorth': { en: 'Net Worth', fr: 'Patrimoine net', es: 'Patrimonio neto' },
  'incomeYear': { en: 'Income/year', fr: 'Revenus/an', es: 'Ingresos/año' },
  'addSkill': { en: 'Add a skill', fr: 'Ajouter une compétence', es: 'Añadir habilidad' },

  // Social
  'national': { en: 'National', fr: 'National', es: 'Nacional' },
  'interactions': { en: 'Interactions', fr: 'Interactions', es: 'Interacciones' },
  'lastContact': { en: 'Last contact', fr: 'Dernier contact', es: 'Último contacto' },
  'message': { en: 'Message', fr: 'Message', es: 'Mensaje' },
  'call': { en: 'Call', fr: 'Appel', es: 'Llamar' },
  'remind': { en: 'Remind', fr: 'Rappel', es: 'Recordar' },

  // Other
  'week': { en: 'Week', fr: 'Semaine', es: 'Semana' },
  'harmony': { en: 'HARMONY', fr: 'HARMONIE', es: 'ARMONÍA' },
  'best': { en: 'Best', fr: 'Meilleur', es: 'Mejor' },
  'tracked': { en: 'Tracked', fr: 'Suivis', es: 'Seguidos' },
  'toImprove': { en: 'To improve', fr: 'À améliorer', es: 'Por mejorar' },
  'you': { en: 'You', fr: 'Vous', es: 'Tú' },
  'ago': { en: 'ago', fr: 'il y a', es: 'hace' },
  'noActivity': { en: 'No activity', fr: 'Aucune activité', es: 'Sin actividad' },
  'perso': { en: 'Perso', fr: 'Perso', es: 'Perso' },
  'amis': { en: 'Friends', fr: 'Amis', es: 'Amigos' },
  'careerGoal': { en: 'Career Goal', fr: 'Objectif de carrière', es: 'Meta de carrera' },
  'probability': { en: 'Probability', fr: 'Probabilité', es: 'Probabilidad' },
  'toDevelop': { en: 'To develop', fr: 'À développer', es: 'Por desarrollar' },
  'skillAdded': { en: 'Skill assessment started', fr: 'Évaluation des compétences démarrée', es: 'Evaluación de habilidades iniciada' },
  'noActivityAmis': { en: 'No activity from friends', fr: 'Aucune activité des amis', es: 'Sin actividad de amigos' },
  'noActivityPerso': { en: 'No personal activity', fr: 'Aucune activité personnelle', es: 'Sin actividad personal' },
  'yourStats': { en: 'Your stats', fr: 'Vos stats', es: 'Tus estadísticas' },
  'overallHarmony': { en: 'Overall Harmony', fr: 'Harmonie globale', es: 'Armonía global' },
  'activityBubble': { en: 'Activity Bubble', fr: 'Bulle d\'activité', es: 'Burbuja de actividad' },
  'aiHealthAnalysis': { en: 'Based on your recent activity patterns, your body composition shows excellent balance. Your VO2 Max indicates strong cardiovascular health, and your resting heart rate is within optimal range. Continue maintaining your current activity level and sleep schedule for sustained performance.', fr: 'D\'après vos habitudes d\'activité récentes, votre composition corporelle présente un excellent équilibre. Votre VO2 Max indique une bonne santé cardiovasculaire et votre fréquence cardiaque au repos se situe dans une plage optimale. Continuez à maintenir votre niveau d\'activité actuel et votre horaire de sommeil pour une performance durable.', es: 'Basándose en sus patrones recientes de actividad, su composición corporal muestra un excelente equilibrio. Su VO2 Máx indica una fuerte salud cardiovascular, y su frecuencia cardíaca en reposo está dentro del rango óptimo. Continúe manteniendo su nivel de actividad actual y su horario de sueño para un rendimiento sostenido.' },
  'intensityIntense': { en: 'Intense', fr: 'Intense', es: 'Intenso' },
  'intensityModerate': { en: 'Moderate', fr: 'Modéré', es: 'Moderado' },
  'intensityLight': { en: 'Light', fr: 'Léger', es: 'Ligero' },
  'intensityExtreme': { en: 'Extreme', fr: 'Extrême', es: 'Extremo' },
  'tapToSetGoal': { en: 'Tap to set goal', fr: 'Appuyez pour définir un objectif', es: 'Toca para fijar meta' },
  'bedtime': { en: 'Bedtime', fr: 'Heure du coucher', es: 'Hora de dormir' },
  'wakeTime': { en: 'Wake time', fr: 'Heure de réveil', es: 'Hora de despertar' },
  'quality': { en: 'Quality', fr: 'Qualité', es: 'Calidad' },
  'excellent': { en: 'Excellent', fr: 'Excellent', es: 'Excelente' },
  'good': { en: 'Good', fr: 'Bon', es: 'Bueno' },
  'average': { en: 'Average', fr: 'Moyen', es: 'Promedio' },
  'poor': { en: 'Poor', fr: 'Mauvais', es: 'Pobre' },
  'running': { en: 'Running', fr: 'Course', es: 'Correr' },
  'gym': { en: 'Gym', fr: 'Musculation', es: 'Gimnasio' },
  'yoga': { en: 'Yoga', fr: 'Yoga', es: 'Yoga' },
  'cycling': { en: 'Cycling', fr: 'Cyclisme', es: 'Ciclismo' },
  'swimming': { en: 'Swimming', fr: 'Natation', es: 'Natación' },
  'hiit': { en: 'HIIT', fr: 'HIIT', es: 'HIIT' },
  'durationMin': { en: 'Duration (min)', fr: 'Durée (min)', es: 'Duración (min)' },
  'currentBodyFat': { en: 'Current body fat', fr: 'Masse grasse actuelle', es: 'Grasa corporal actual' },
  'composition': { en: 'Composition', fr: 'Composition', es: 'Composición' },
  'weightKg': { en: 'Weight (kg)', fr: 'Poids (kg)', es: 'Peso (kg)' },
  'amountL': { en: 'Amount (L)', fr: 'Quantité (L)', es: 'Cantidad (L)' },
  'setGoal': { en: 'Set Goal', fr: 'Définir un objectif', es: 'Fijar meta' },
  'ofGoal': { en: 'of goal', fr: 'de l\'objectif', es: 'de la meta' },
  'targetGoal': { en: 'Target Goal', fr: 'Objectif cible', es: 'Meta objetivo' },
  'current': { en: 'Current', fr: 'Actuel', es: 'Actual' },
  'keep': { en: 'Keep', fr: 'Garder', es: 'Mantener' },

  // Profile View
  'profile': { en: 'Profile', fr: 'Profil', es: 'Perfil' },
  'performanceByModule': { en: 'Performance by Module', fr: 'Performance par Module', es: 'Rendimiento por Módulo' },
  'saveMyData': { en: 'Save my data', fr: 'Sauvegarder mes données', es: 'Guardar mis datos' },
  'share': { en: 'Share', fr: 'Partager', es: 'Compartir' },
  'editProfile': { en: 'Edit Profile', fr: 'Modifier le profil', es: 'Editar perfil' },

  // Settings View
  'general': { en: 'General', fr: 'Général', es: 'General' },
  'account': { en: 'Account', fr: 'Compte', es: 'Cuenta' },
  'about': { en: 'About', fr: 'À propos', es: 'Acerca de' },
  'dataStorage': { en: 'Data & Storage', fr: 'Données & Stockage', es: 'Datos y Almacenamiento' },
  'manageData': { en: 'Manage your data', fr: 'Gérer vos données', es: 'Gestionar tus datos' },
  'version': { en: 'Version', fr: 'Version', es: 'Versión' },
  'madeWith': { en: 'Made with', fr: 'Fait avec', es: 'Hecho con' },
  'system': { en: 'Auto', fr: 'Auto', es: 'Auto' },

  // Harmony Module
  'alignmentScore': { en: 'Alignment Score', fr: 'Score d\'Alignement', es: 'Puntuación de Alineación' },
  'evolution': { en: 'Evolution', fr: 'Évolution', es: 'Evolución' },
  'objectives': { en: 'Objectives', fr: 'Objectifs', es: 'Objetivos' },
  'aiGuide': { en: 'AI Guide', fr: 'Guide IA', es: 'Guía IA' },
  'weekLabel': { en: 'Week', fr: 'Semaine', es: 'Semana' },
  'monthLabel': { en: 'Month', fr: 'Mois', es: 'Mes' },
  'yearLabel': { en: 'Year', fr: 'Année', es: 'Año' },
  'priority': { en: 'Priority', fr: 'Prioritaire', es: 'Prioritario' },
  'inProgress': { en: 'In Progress', fr: 'En cours', es: 'En curso' },
  'toPlan': { en: 'To Plan', fr: 'À planifier', es: 'Por planificar' },
  'analyzeTrends': { en: 'Analyze trends', fr: 'Analyser tendances', es: 'Analizar tendencias' },
  'adjustObjectives': { en: 'Adjust objectives', fr: 'Ajuster objectifs', es: 'Ajustar objetivos' },
  'whatIsHarmony': { en: 'What is Harmony?', fr: 'Qu\'est-ce que Harmony ?', es: '¿Qué es Harmony?' },
  'harmonyExplanation': { en: 'The Harmony score measures your life alignment: how much your daily actions bring you closer to your personal goals.', fr: 'Le score Harmony mesure ton alignement de vie : à quel point tes actions quotidiennes te rapprochent de tes objectifs personnels.', es: 'La puntuación Harmony mide tu alineación de vida: cuánto tus acciones diarias te acercan a tus metas personales.' },
  'harmonyExplanation2': { en: 'It analyzes 5 key dimensions of your life.', fr: 'Il analyse 5 dimensions clés de ta vie.', es: 'Analiza 5 dimensiones clave de tu vida.' },
  'trendAnalysis': { en: 'Trend Analysis', fr: 'Analyse des Tendances', es: 'Análisis de Tendencias' },
  'recommendations': { en: 'Recommendations', fr: 'Recommandations', es: 'Recomendaciones' },
  'fullReport': { en: 'Full Report', fr: 'Rapport Complet', es: 'Informe Completo' },
  'dimensionAnalysis': { en: 'Dimension Analysis', fr: 'Analyse par Dimension', es: 'Análisis por Dimensión' },
  'lifeBalance': { en: 'Life Balance', fr: 'Équilibre de Vie', es: 'Equilibrio de Vida' },
  'monthlyFocus': { en: 'Monthly Focus', fr: 'Focus du Mois', es: 'Enfoque del Mes' },
  'longTermVision': { en: 'Long-term Vision', fr: 'Vision Long Terme', es: 'Visión a Largo Plazo' },
  'strengths': { en: 'Strengths', fr: 'Points forts', es: 'Puntos fuertes' },
  'toImproveLabel': { en: 'To improve', fr: 'À améliorer', es: 'A mejorar' },
  'clickForFullReport': { en: 'Click for full report →', fr: 'Cliquer pour voir le rapport complet →', es: 'Clic para ver el informe completo →' },
  'min': { en: 'Min', fr: 'Min', es: 'Mín' },
  'avg': { en: 'Avg', fr: 'Moy', es: 'Med' },
  'max': { en: 'Max', fr: 'Max', es: 'Máx' },

  // Dimensions
  'healthDimension': { en: 'Health', fr: 'Santé', es: 'Salud' },
  'financeDimension': { en: 'Finance', fr: 'Finance', es: 'Finanzas' },
  'socialDimension': { en: 'Social', fr: 'Social', es: 'Social' },
  'careerDimension': { en: 'Career', fr: 'Carrière', es: 'Carrera' },
  'worldDimension': { en: 'World', fr: 'Monde', es: 'Mundo' },

  // Module Names (for HomeView cards)
  'moduleHealth': { en: 'Health', fr: 'Santé', es: 'Salud' },
  'moduleWorld': { en: 'World', fr: 'Monde', es: 'Mundo' },
  'moduleFinance': { en: 'Finance', fr: 'Finance', es: 'Finanzas' },
  'moduleAchievements': { en: 'Career', fr: 'Carrière', es: 'Carrera' },
  'moduleCircle': { en: 'Social', fr: 'Social', es: 'Social' },
  'moduleCareer': { en: 'Career', fr: 'Carrière', es: 'Carrera' },
  'noData': { en: 'No data', fr: 'Aucune donnée', es: 'Sin datos' },
  'completeProfile': { en: 'Complete profile', fr: 'Compléter le profil', es: 'Completar perfil' },
  'newMember': { en: 'New member', fr: 'Nouveau membre', es: 'Nuevo miembro' },
  'profileInProgress': { en: 'Profile in progress...', fr: 'Profil en cours de création...', es: 'Perfil en creación...' },
  // Comparison/Ranking Labels (SocialView)
  'sport': { en: 'Sport', fr: 'Sport', es: 'Deporte' },
  'connection': { en: 'Connection', fr: 'Connexion', es: 'Conexión' },
  'level': { en: 'Level', fr: 'Niveau', es: 'Nivel' },
  'compare': { en: 'Compare', fr: 'Comparer', es: 'Comparar' },

  // Finance Card
  'flux': { en: 'Flux', fr: 'Flux', es: 'Flujo' },
  'stock': { en: 'Stock', fr: 'Stock', es: 'Stock' },
  'patrimoine': { en: 'Assets & Income', fr: 'Patrimoine & Revenus', es: 'Patrimonio e Ingresos' },
  'perMonth': { en: '/month net', fr: '/mois net', es: '/mes neto' },
  'netPatrimony': { en: 'net worth', fr: 'patrimoine net', es: 'patrimonio neto' },
  'liquid': { en: 'liquid', fr: 'liquide', es: 'líquido' },
  'savingsLabel': { en: 'savings', fr: 'épargne', es: 'ahorro' },
  'assetBreakdown': { en: 'Asset breakdown', fr: 'Répartition des actifs', es: 'Distribución de activos' },
  'realEstate': { en: 'Real Estate', fr: 'Immobilier', es: 'Inmobiliario' },
  'financial': { en: 'Financial', fr: 'Financier', es: 'Financiero' },
  'vehicles': { en: 'Vehicles', fr: 'Véhicules', es: 'Vehículos' },
  'incomeSources': { en: 'Income sources', fr: 'Sources de revenus', es: 'Fuentes de ingresos' },
  'pinned': { en: 'Pinned', fr: 'Épinglé', es: 'Fijado' },
  'score': { en: 'Score', fr: 'Score', es: 'Puntuación' },
  'goalLabel': { en: 'Goal', fr: 'Objectif', es: 'Objetivo' },
  'perYear': { en: '/year', fr: '/an', es: '/año' },

  // Pull to refresh
  'pullToRefresh': { en: 'Pull to refresh', fr: 'Tirez pour actualiser', es: 'Desliza para actualizar' },
  'releaseToRefresh': { en: 'Release to refresh', fr: 'Relâchez pour actualiser', es: 'Suelta para actualizar' },

  // Loading
  'loading': { en: 'Loading...', fr: 'Chargement...', es: 'Cargando...' },

  // Private Stats Labels
  'monthly': { en: 'Monthly', fr: 'Mensuel', es: 'Mensual' },
  'savings': { en: 'Savings', fr: 'Épargne', es: 'Ahorros' },

  // Global label
  'global': { en: 'Global', fr: 'Global', es: 'Global' },

  // Open TrueCircle
  'openTrueCircle': { en: 'Open full TrueCircle', fr: 'Ouvrir TrueCircle complet', es: 'Abrir TrueCircle completo' },

  // Map
  'backToOrigin': { en: 'Back to origin', fr: 'Retour à la position d\'origine', es: 'Volver al origen' },

  // Countries
  'countriesLabel': { en: 'countries', fr: 'pays', es: 'países' },

  // Assets Modal
  'assetDistribution': { en: 'Asset Distribution', fr: 'Répartition des actifs', es: 'Distribución de activos' },
  'liabilities': { en: 'Liabilities', fr: 'Passifs', es: 'Pasivos' },
  'cash': { en: 'Cash', fr: 'Liquidités', es: 'Efectivo' },
  'financialAssets': { en: 'Financial Assets', fr: 'Actifs financiers', es: 'Activos financieros' },
  'perMonthLabel': { en: '/month', fr: '/mois', es: '/mes' },
  'salary': { en: 'Salary', fr: 'Salaire', es: 'Salario' },
  'freelance': { en: 'Freelance', fr: 'Freelance', es: 'Freelance' },
  'rental': { en: 'Rental', fr: 'Location', es: 'Alquiler' },
  'investments': { en: 'Investments', fr: 'Investissements', es: 'Inversiones' },
  'dividends': { en: 'Dividends', fr: 'Dividendes', es: 'Dividendos' },

  // Compare Modal
  'compareStats': { en: 'Compare Stats', fr: 'Comparer les stats', es: 'Comparar estadísticas' },

  // Harmony Modal
  'harmonyGuide': { en: 'Harmony Guide', fr: 'Guide Harmony', es: 'Guía Harmony' },
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('app_language') as Language
    if (saved && ['en', 'fr', 'es'].includes(saved)) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('app_language', lang)
  }

  const t = (key: string): string => {
    return translations[key]?.[language] || translations[key]?.en || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

