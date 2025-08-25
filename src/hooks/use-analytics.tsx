import { useState, useEffect } from 'react';
import { globalAnalytics } from '@/services/globalAnalytics';

interface AnalyticsData {
  totalVisits: number;
  uniqueVisits: number;
  todayVisits: number;
  lastVisit: string;
  dailyStats: Record<string, number>;
  popularPages: Record<string, number>;
}

interface GlobalAnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  lastUpdated: string;
}

interface VisitorInfo {
  visitId: string;
  firstVisit: string;
  lastVisit: string;
  visitCount: number;
}

const ANALYTICS_KEY = 'kouss_kouss_analytics';
const VISITOR_KEY = 'kouss_kouss_visitor';

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalVisits: 0,
    uniqueVisits: 0,
    todayVisits: 0,
    lastVisit: '',
    dailyStats: {},
    popularPages: {}
  });

  const [globalStats, setGlobalStats] = useState<GlobalAnalyticsData | null>(null);
  const [loadingGlobal, setLoadingGlobal] = useState(false);

  // Générer un ID unique pour le visiteur
  const generateVisitorId = (): string => {
    return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // Obtenir la date du jour au format YYYY-MM-DD
  const getTodayKey = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  // Charger les données d'analytics
  const loadAnalytics = (): AnalyticsData => {
    try {
      const stored = localStorage.getItem(ANALYTICS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Erreur lors du chargement des analytics:', error);
    }
    
    return {
      totalVisits: 0,
      uniqueVisits: 0,
      todayVisits: 0,
      lastVisit: '',
      dailyStats: {},
      popularPages: {}
    };
  };

  // Sauvegarder les données d'analytics
  const saveAnalytics = (data: AnalyticsData) => {
    try {
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
      setAnalytics(data);
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde des analytics:', error);
    }
  };

  // Gérer les informations du visiteur
  const handleVisitor = (): { isNewVisitor: boolean; isNewSession: boolean } => {
    try {
      const stored = localStorage.getItem(VISITOR_KEY);
      const now = new Date().toISOString();
      
      if (stored) {
        const visitor: VisitorInfo = JSON.parse(stored);
        const lastVisit = new Date(visitor.lastVisit);
        const timeDiff = Date.now() - lastVisit.getTime();
        
        // Considérer comme une nouvelle session si plus de 30 minutes
        const isNewSession = timeDiff > 30 * 60 * 1000;
        
        // Mettre à jour les infos du visiteur
        const updatedVisitor: VisitorInfo = {
          ...visitor,
          lastVisit: now,
          visitCount: isNewSession ? visitor.visitCount + 1 : visitor.visitCount
        };
        
        localStorage.setItem(VISITOR_KEY, JSON.stringify(updatedVisitor));
        
        return { isNewVisitor: false, isNewSession };
      } else {
        // Nouveau visiteur
        const newVisitor: VisitorInfo = {
          visitId: generateVisitorId(),
          firstVisit: now,
          lastVisit: now,
          visitCount: 1
        };
        
        localStorage.setItem(VISITOR_KEY, JSON.stringify(newVisitor));
        
        return { isNewVisitor: true, isNewSession: true };
      }
    } catch (error) {
      console.warn('Erreur lors de la gestion du visiteur:', error);
      return { isNewVisitor: false, isNewSession: false };
    }
  };

  // Enregistrer une visite de page
  const trackPageView = async (pagePath: string = window.location.pathname) => {
    const currentAnalytics = loadAnalytics();
    const { isNewVisitor, isNewSession } = handleVisitor();
    const today = getTodayKey();
    const now = new Date().toISOString();

    const updatedAnalytics: AnalyticsData = {
      ...currentAnalytics,
      lastVisit: now,
      totalVisits: isNewSession ? currentAnalytics.totalVisits + 1 : currentAnalytics.totalVisits,
      uniqueVisits: isNewVisitor ? currentAnalytics.uniqueVisits + 1 : currentAnalytics.uniqueVisits,
      dailyStats: {
        ...currentAnalytics.dailyStats,
        [today]: (currentAnalytics.dailyStats[today] || 0) + (isNewSession ? 1 : 0)
      },
      popularPages: {
        ...currentAnalytics.popularPages,
        [pagePath]: (currentAnalytics.popularPages[pagePath] || 0) + 1
      }
    };

    // Calculer les visites d'aujourd'hui
    updatedAnalytics.todayVisits = updatedAnalytics.dailyStats[today] || 0;

    saveAnalytics(updatedAnalytics);

    // Tracker globalement (async, sans bloquer l'UI)
    if (isNewSession) {
      globalAnalytics.trackVisit().catch(() => {
        // Ignorer les erreurs silencieusement
      });
    }

    if (isNewVisitor) {
      globalAnalytics.trackUniqueVisitor().catch(() => {
        // Ignorer les erreurs silencieusement
      });
    }
  };

  // Obtenir les statistiques des derniers jours
  const getRecentDays = (days: number = 7) => {
    const result: Array<{ date: string; visits: number }> = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      result.push({
        date: dateKey,
        visits: analytics.dailyStats[dateKey] || 0
      });
    }
    
    return result;
  };

  // Nettoyer les anciennes données (garder seulement 30 jours)
  const cleanOldData = () => {
    const currentAnalytics = loadAnalytics();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const cleanedDailyStats: Record<string, number> = {};
    
    Object.entries(currentAnalytics.dailyStats).forEach(([date, visits]) => {
      if (new Date(date) >= thirtyDaysAgo) {
        cleanedDailyStats[date] = visits;
      }
    });

    const updatedAnalytics = {
      ...currentAnalytics,
      dailyStats: cleanedDailyStats
    };

    saveAnalytics(updatedAnalytics);
  };

  // Réinitialiser toutes les données
  const resetAnalytics = () => {
    try {
      localStorage.removeItem(ANALYTICS_KEY);
      localStorage.removeItem(VISITOR_KEY);
      setAnalytics({
        totalVisits: 0,
        uniqueVisits: 0,
        todayVisits: 0,
        lastVisit: '',
        dailyStats: {},
        popularPages: {}
      });
    } catch (error) {
      console.warn('Erreur lors de la réinitialisation:', error);
    }
  };

  // Récupérer les statistiques globales
  const fetchGlobalStats = async () => {
    if (loadingGlobal) return;
    
    setLoadingGlobal(true);
    try {
      const stats = await globalAnalytics.getGlobalStats();
      setGlobalStats(stats);
    } catch (error) {
      console.warn('Erreur lors du chargement des stats globales:', error);
    } finally {
      setLoadingGlobal(false);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    const data = loadAnalytics();
    setAnalytics(data);
    
    // Nettoyer les anciennes données
    cleanOldData();
    
    // Tracker la visite de la page actuelle
    trackPageView();

    // Charger les stats globales
    fetchGlobalStats();
  }, []);

  return {
    analytics,
    globalStats,
    loadingGlobal,
    trackPageView,
    getRecentDays,
    resetAnalytics,
    cleanOldData,
    fetchGlobalStats
  };
};
