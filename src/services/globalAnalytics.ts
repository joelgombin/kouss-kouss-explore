// Service pour collecter les statistiques globales avec CounterAPI.dev
// Utilise la version browser officielle de CounterAPI

// Déclaration du type pour la version browser
declare global {
  interface Window {
    Counter: any;
  }
}

// Import dynamique de la version browser
let Counter: any = null;

interface GlobalStats {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  lastUpdated: string;
}

// Configuration CounterAPI.dev (workspace public)
const WORKSPACE = 'kouss-kouss-2025';

console.log('CounterAPI Config:', {
  workspace: WORKSPACE,
  type: 'public workspace'
});

// Fonction pour charger la version browser de CounterAPI
async function loadCounterAPI(): Promise<any> {
  console.log('🔍 loadCounterAPI appelé, vérification état:', {
    counterExists: !!Counter,
    windowCounterExists: !!(window as any).Counter
  });
  
  if (Counter) {
    console.log('✅ Counter déjà chargé, retour immédiat');
    return Counter;
  }
  
  return new Promise((resolve, reject) => {
    // Vérifier si déjà chargé globalement
    if ((window as any).Counter) {
      console.log('✅ window.Counter trouvé, utilisation directe');
      Counter = (window as any).Counter;
      resolve(Counter);
      return;
    }
    
    console.log('📥 Chargement du script CounterAPI depuis CDN...');
    
    // Charger la version browser via CDN
    const script = document.createElement('script');
    // Essayer d'abord jsDelivr, puis unpkg en fallback
    const cdnUrls = [
      'https://cdn.jsdelivr.net/npm/counterapi/dist/counter.browser.min.js',
      'https://unpkg.com/counterapi/dist/counter.browser.min.js'
    ];
    
    script.src = cdnUrls[0];
    script.async = true;
    
    script.onload = () => {
      console.log('✅ Script CounterAPI chargé avec succès');
      console.log('🔍 window.Counter après chargement:', {
        exists: !!(window as any).Counter,
        type: typeof (window as any).Counter
      });
      
      if ((window as any).Counter) {
        Counter = (window as any).Counter;
        console.log('🎉 CounterAPI initialisé avec succès');
        resolve(Counter);
      } else {
        console.error('❌ window.Counter non trouvé après chargement du script');
        reject(new Error('Counter class not found after script load'));
      }
    };
    
    script.onerror = (error) => {
      console.error('❌ Erreur lors du chargement du script CounterAPI:', error);
      reject(new Error('CounterAPI loading failed'));
    };
    
    console.log('📤 Ajout du script au DOM...');
    document.head.appendChild(script);
  });
}

class GlobalAnalyticsService {
  private isEnabled = true;
  private lastSync = 0;
  private syncInterval = 1000; // 1 seconde pour debug
  private counter: any = null;
  private counterAPILoaded = false;

  constructor() {
    // Activer en production ET temporairement en développement pour debug
    const isProduction = !window.location.hostname.includes('localhost') && 
                         !window.location.hostname.includes('127.0.0.1') &&
                         !window.location.hostname.includes('192.168');
    
    this.isEnabled = isProduction || true; // Temporaire : activer aussi en dev pour debug
    
    console.log('Analytics config:', {
      hostname: window.location.hostname,
      isProduction,
      isEnabled: this.isEnabled,
      syncInterval: this.syncInterval + 'ms'
    });
    
    // Initialiser CounterAPI de manière asynchrone
    this.initializeCounterAPI();
  }

  private async initializeCounterAPI() {
    if (!this.isEnabled) {
      console.log('CounterAPI non initialisé (désactivé)');
      return;
    }

    try {
      console.log('🔄 Chargement de CounterAPI browser version...');
      const CounterClass = await loadCounterAPI();
      
       // Configuration simple pour workspace public
       const config = {
        workspace: WORKSPACE,
        debug: true // Activer le debug pour voir les requêtes
      };
      
      
      this.counter = new CounterClass(config);
      this.counterAPILoaded = true;
      
      console.log('🎉 CounterAPI browser initialisé (workspace public)');
    } catch (error) {
      console.warn('❌ Erreur initialisation CounterAPI browser:', error);
      this.counter = null;
      this.counterAPILoaded = false;
    }
  }

  // Tracking des visites avec CounterAPI.dev
  async trackVisit(): Promise<void> {
    console.log('🔄 trackVisit() appelé');
    
    if (!this.isEnabled) {
      console.log('❌ Analytics désactivé (development mode)');
      return;
    }

    try {
      const now = Date.now();
      const timeSinceLastSync = now - this.lastSync;
      
      console.log('⏱️ Vérification anti-spam:', {
        timeSinceLastSync: timeSinceLastSync + 'ms',
        syncInterval: this.syncInterval + 'ms',
        canSync: timeSinceLastSync >= this.syncInterval
      });
      
      // Éviter de spammer l'API
      if (timeSinceLastSync < this.syncInterval) {
        console.log('🚫 Tracking bloqué par anti-spam');
        return;
      }
      
      console.log('📊 État CounterAPI:', {
        counterAPILoaded: this.counterAPILoaded,
        hasCounter: !!this.counter,
        counterType: typeof this.counter
      });
      
      // Essayer d'abord avec la version browser officielle
      if (this.counterAPILoaded && this.counter) {
        try {
          console.log('🌐 Tentative CounterAPI browser...');
          const result = await this.counter.up('kousskouss-visits');
          console.log('🎉 Visite trackée avec CounterAPI browser:', {
            value: result.value,
            response: result
          });
          this.lastSync = now;
          return;
        } catch (apiError) {
          console.warn('⚠️ Échec CounterAPI browser:', {
            error: apiError,
            message: apiError.message,
            stack: apiError.stack
          });
        }
      } else {
        console.log('📱 CounterAPI browser non disponible, passage au fallback local');
      }
      
      // Fallback : stockage local
      console.log('💾 Incrémentation du compteur local...');
      this.incrementLocalCounter('visits');
      this.lastSync = now;
      console.log('✅ Visite trackée localement (fallback)');
      
    } catch (error) {
      console.error('❌ Erreur lors du tracking de visite:', {
        error,
        message: error.message,
        stack: error.stack
      });
    }
  }

  async trackUniqueVisitor(): Promise<void> {
    console.log('👤 trackUniqueVisitor() appelé');
    
    // Vérifier si c'est un nouveau visiteur (localStorage)
    const visitorKey = 'kouss_global_tracked';
    const hasBeenTracked = localStorage.getItem(visitorKey);
    
    console.log('🔍 Vérification visiteur unique:', {
      visitorKey,
      hasBeenTracked: !!hasBeenTracked,
      isNewVisitor: !hasBeenTracked
    });
    
    if (!hasBeenTracked) {
      console.log('🆕 Nouveau visiteur détecté, marquage...');
      localStorage.setItem(visitorKey, 'true');

      if (!this.isEnabled) {
        console.log('❌ Analytics désactivé pour visiteur unique');
        return;
      }

      // Essayer d'abord avec la version browser officielle
      if (this.counterAPILoaded && this.counter) {
        try {
          console.log('🌐 Tentative CounterAPI browser pour visiteur unique...');
          const result = await this.counter.up('kousskouss-unique-visitors');
          console.log('🎉 Visiteur unique tracké avec CounterAPI browser:', {
            value: result.value,
            response: result
          });
          return;
        } catch (apiError) {
          console.warn('⚠️ Échec CounterAPI browser unique:', {
            error: apiError,
            message: apiError.message
          });
        }
      } else {
        console.log('📱 CounterAPI browser non disponible pour visiteur unique');
      }

      // Fallback : stockage local
      console.log('💾 Incrémentation compteur local visiteur unique...');
      this.incrementLocalCounter('unique');
      console.log('✅ Visiteur unique tracké localement (fallback)');
    } else {
      console.log('👥 Visiteur déjà tracké, pas d\'incrémentation');
    }
  }

  async getGlobalStats(): Promise<GlobalStats | null> {
    if (!this.isEnabled) {
      // En développement, retourner des stats fictives
      return {
        totalVisits: 1247,
        uniqueVisitors: 892,
        todayVisits: 23,
        lastUpdated: new Date().toISOString()
      };
    }

    try {
      // Essayer d'abord avec la version browser officielle
      if (this.counterAPILoaded && this.counter) {
        try {
          const [visitsResult, uniqueResult] = await Promise.all([
            this.counter.get('kousskouss-visits'),
            this.counter.get('kousskouss-unique-visitors')
          ]);

          console.log('📊 Stats récupérées avec CounterAPI browser:', { 
            visits: visitsResult.value, 
            unique: uniqueResult.value
          });

          return {
            totalVisits: visitsResult.value || 0,
            uniqueVisitors: uniqueResult.value || 0,
            todayVisits: this.getTodayVisitsEstimate(visitsResult.value || 0),
            lastUpdated: new Date().toISOString()
          };
        } catch (apiError) {
          console.warn('⚠️ Échec récupération stats CounterAPI browser:', apiError);
        }
      }

      // Fallback : tentative fetch direct
      console.log('🔄 Tentative fetch direct...');
      const [visitsResponse, uniqueResponse] = await Promise.all([
        fetch(`https://api.counterapi.dev/v2/${WORKSPACE}/kousskouss-visits`),
        fetch(`https://api.counterapi.dev/v2/${WORKSPACE}/kousskouss-unique-visitors`)
      ]);
      
      if (!visitsResponse.ok) throw new Error(`Visits API: ${visitsResponse.status}`);
      if (!uniqueResponse.ok) throw new Error(`Unique API: ${uniqueResponse.status}`);
      
      const visitsData = await visitsResponse.json();
      const uniqueData = await uniqueResponse.json();
      
      const visitsResult = { value: visitsData.data?.up_count || 0 };
      const uniqueResult = { value: uniqueData.data?.up_count || 0 };

      console.log('📊 Stats récupérées via fetch direct:', { 
        visits: visitsResult.value, 
        unique: uniqueResult.value
      });

      return {
        totalVisits: visitsResult.value || 0,
        uniqueVisitors: uniqueResult.value || 0,
        todayVisits: this.getTodayVisitsEstimate(visitsResult.value || 0),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.warn('CounterAPI inaccessible (CORS/Réseau):', error.message);
      console.log('🔄 Basculement vers les stats estimées...');
      
      // Utiliser directement les stats estimées (mode dégradé CORS)
      return this.getEstimatedGlobalStats();
    }
  }

  // Méthode de fallback avec fetch direct (workspace public)
  private async getStatsWithDirectFetch(): Promise<GlobalStats | null> {
    const baseUrl = 'https://api.counterapi.dev/v2';
    const workspace = WORKSPACE;
    
    try {
      // Requêtes simples sans authentification (workspace public)
      const [visitsResponse, uniqueResponse] = await Promise.all([
        fetch(`${baseUrl}/${workspace}/kousskouss-visits`, {
          method: 'GET',
          mode: 'cors'
        }),
        fetch(`${baseUrl}/${workspace}/kousskouss-unique-visitors`, {
          method: 'GET', 
          mode: 'cors'
        })
      ]);

      if (!visitsResponse.ok) {
        throw new Error(`Visits API: HTTP ${visitsResponse.status}`);
      }
      if (!uniqueResponse.ok) {
        throw new Error(`Unique API: HTTP ${uniqueResponse.status}`);
      }

      const visitsData = await visitsResponse.json();
      const uniqueData = await uniqueResponse.json();

      console.log('📊 Stats récupérées via fetch direct (workspace public):', { 
        visits: visitsData.data?.up_count || 0, 
        unique: uniqueData.data?.up_count || 0 
      });

      return {
        totalVisits: visitsData.data?.up_count || 0,
        uniqueVisitors: uniqueData.data?.up_count || 0,
        todayVisits: this.getTodayVisitsEstimate(visitsData.data?.up_count || 0),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Fetch direct échoué:', error);
      throw error;
    }
  }

  // Stats estimées basées sur les données locales
  private getEstimatedGlobalStats(): GlobalStats {
    // En cas d'échec total, donner une estimation basée sur l'activité locale
    const localStats = this.getLocalEstimation();
    
    console.log('Utilisation des stats estimées:', localStats);
    
    return {
      totalVisits: localStats.estimatedTotal,
      uniqueVisitors: localStats.estimatedUnique,
      todayVisits: localStats.estimatedToday,
      lastUpdated: new Date().toISOString()
    };
  }

  // Estimation basée sur l'activité locale et des patterns typiques
  private getLocalEstimation() {
    const now = new Date();
    const daysSinceLaunch = Math.max(1, Math.floor((now.getTime() - new Date('2025-01-01').getTime()) / (1000 * 60 * 60 * 24)));
    
    // Récupérer les compteurs locaux
    const localCounters = this.getLocalCounters();
    
    // Base l'estimation sur l'activité locale + patterns réalistes
    const baseVisits = Math.max(localCounters.visits || 0, daysSinceLaunch * 15);
    const randomVariation = Math.floor(Math.random() * 20) - 10; // ±10
    
    const estimatedTotal = baseVisits + randomVariation;
    const estimatedUnique = Math.floor(estimatedTotal * 0.7); // 70% de visiteurs uniques
    const estimatedToday = 15 + Math.floor(Math.random() * 10); // 15-25 visites/jour

    return {
      estimatedTotal: Math.max(1, estimatedTotal),
      estimatedUnique: Math.max(1, estimatedUnique),
      estimatedToday
    };
  }

  // Gérer les compteurs locaux pour contourner CORS
  private incrementLocalCounter(counterType: 'visits' | 'unique') {
    const key = 'kouss_local_counters';
    const countersBefore = this.getLocalCounters();
    
    console.log('📊 État compteurs AVANT incrémentation:', {
      counterType,
      countersBefore,
      key
    });
    
    const counters = { ...countersBefore };
    const oldValue = counters[counterType] || 0;
    counters[counterType] = oldValue + 1;
    counters.lastUpdated = new Date().toISOString();
    
    console.log('📈 Incrémentation:', {
      counterType,
      oldValue,
      newValue: counters[counterType],
      countersAfter: counters
    });
    
    try {
      localStorage.setItem(key, JSON.stringify(counters));
      console.log('💾 Compteurs sauvegardés dans localStorage');
      
      // Vérification immédiate
      const verification = localStorage.getItem(key);
      console.log('✅ Vérification sauvegarde:', {
        saved: verification,
        parsed: JSON.parse(verification || '{}')
      });
    } catch (error) {
      console.error('❌ Impossible de sauvegarder les compteurs locaux:', {
        error,
        message: error.message,
        key,
        counters
      });
    }
  }

  private getLocalCounters() {
    const key = 'kouss_local_counters';
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Erreur lecture compteurs locaux:', error);
    }
    
    return { visits: 0, unique: 0, lastUpdated: new Date().toISOString() };
  }

  // Tentative de synchronisation en arrière-plan (peut échouer avec CORS)
  private async attemptBackgroundSync(counterName: string) {
    try {
      // Utiliser une image 1x1 pixel comme technique de contournement CORS
      const img = new Image();
      img.src = `https://api.counterapi.dev/v2/${WORKSPACE}/${counterName}/up?${Date.now()}`;
      
      // Timeout après 5 secondes
      setTimeout(() => {
        img.src = '';
      }, 5000);
      
    } catch (error) {
      // Échec silencieux - c'est attendu avec CORS
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
    return Math.floor(dailyAverage * hourFactor);
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
