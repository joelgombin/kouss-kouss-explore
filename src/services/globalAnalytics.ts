// Service pour collecter les statistiques globales de manière anonyme
// Utilise CounterAPI.dev - service gratuit pour compteurs simples

interface GlobalStats {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  lastUpdated: string;
}

// Configuration CounterAPI.dev
const COUNTER_API_BASE = 'https://api.counterapi.dev/v1';
const SITE_KEY = 'kouss-kouss-2025';

class GlobalAnalyticsService {
  private isEnabled = true;
  private lastSync = 0;
  private syncInterval = 5 * 60 * 1000; // 5 minutes entre les syncs

  constructor() {
    // Désactiver en développement pour éviter de polluer les stats
    this.isEnabled = !window.location.hostname.includes('localhost') && 
                     !window.location.hostname.includes('127.0.0.1');
  }

  // Méthode avec CounterAPI.dev (service officiel et gratuit)
  async trackVisit(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const now = Date.now();
      // Éviter de spammer l'API
      if (now - this.lastSync < this.syncInterval) return;
      
      // Incrémenter le compteur global avec CounterAPI.dev
      await fetch(`${COUNTER_API_BASE}/${SITE_KEY}/visits/up`, {
        method: 'GET',
        mode: 'cors'
      });

      this.lastSync = now;
    } catch (error) {
      console.warn('Impossible de synchroniser les stats globales:', error);
    }
  }

  async trackUniqueVisitor(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // Vérifier si c'est un nouveau visiteur (localStorage)
      const visitorKey = 'kouss_global_tracked';
      const hasBeenTracked = localStorage.getItem(visitorKey);
      
      if (!hasBeenTracked) {
        await fetch(`${COUNTER_API_BASE}/${SITE_KEY}/unique-visitors/up`, {
          method: 'GET',
          mode: 'cors'
        });
        
        localStorage.setItem(visitorKey, 'true');
      }
    } catch (error) {
      console.warn('Impossible de tracker le visiteur unique:', error);
    }
  }

  async getGlobalStats(): Promise<GlobalStats | null> {
    if (!this.isEnabled) {
      // Retourner des stats fictives en développement
      return {
        totalVisits: 1247,
        uniqueVisitors: 892,
        todayVisits: 23,
        lastUpdated: new Date().toISOString()
      };
    }

    try {
      // Récupérer les stats depuis CounterAPI.dev
      const [visitsRes, uniqueRes] = await Promise.all([
        fetch(`${COUNTER_API_BASE}/${SITE_KEY}/visits`, { mode: 'cors' }),
        fetch(`${COUNTER_API_BASE}/${SITE_KEY}/unique-visitors`, { mode: 'cors' })
      ]);

      const visitsData = await visitsRes.json();
      const uniqueData = await uniqueRes.json();

      return {
        totalVisits: visitsData.count || 0,
        uniqueVisitors: uniqueData.count || 0,
        todayVisits: this.getTodayVisitsEstimate(visitsData.count || 0),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.warn('Impossible de récupérer les stats globales:', error);
      return null;
    }
  }

  // Estimation des visites du jour (basée sur les patterns typiques)
  private getTodayVisitsEstimate(totalVisits: number): number {
    // Estimation basée sur le trafic total et l'heure
    const dailyAverage = Math.max(1, Math.floor(totalVisits / 30));
    const hourOfDay = new Date().getHours();
    
    // Facteur basé sur l'heure (plus de trafic en journée)
    const hourFactor = hourOfDay >= 9 && hourOfDay <= 18 ? 1.3 : 0.7;
    
    // Estimation avec un peu de variabilité
    return Math.floor(dailyAverage * hourFactor * (0.8 + Math.random() * 0.4));
  }

  // Alternative avec un service personnalisé simple (si vous voulez votre propre backend)
  async trackWithCustomEndpoint(endpoint: string): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          page: window.location.pathname,
          referrer: document.referrer || 'direct',
          userAgent: navigator.userAgent.substring(0, 100) // Tronqué pour la vie privée
        })
      });
    } catch (error) {
      console.warn('Impossible de tracker vers l\'endpoint personnalisé:', error);
    }
  }
}

export const globalAnalytics = new GlobalAnalyticsService();
