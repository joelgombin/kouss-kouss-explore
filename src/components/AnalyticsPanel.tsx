import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Users, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  RefreshCw,
  AlertTriangle,
  Globe,
  Monitor,
  Loader2
} from 'lucide-react';
import { useAnalytics } from '@/hooks/use-analytics';

interface AnalyticsPanelProps {
  className?: string;
}

export const AnalyticsPanel = ({ className = '' }: AnalyticsPanelProps) => {
  const { analytics, globalStats, loadingGlobal, getRecentDays, resetAnalytics, fetchGlobalStats } = useAnalytics();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [viewMode, setViewMode] = useState<'local' | 'global'>('global');

  const recentDays = getRecentDays(7);
  
  // Calculer les tendances
  const yesterdayVisits = analytics.dailyStats[getYesterdayKey()] || 0;
  const trendVsYesterday = analytics.todayVisits - yesterdayVisits;
  
  // Obtenir les pages les plus populaires (top 5)
  const topPages = Object.entries(analytics.popularPages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Choisir les stats à afficher selon le mode
  const currentStats = viewMode === 'global' && globalStats ? {
    totalVisits: globalStats.totalVisits,
    uniqueVisits: globalStats.uniqueVisitors,
    todayVisits: globalStats.todayVisits,
    lastUpdated: globalStats.lastUpdated
  } : {
    totalVisits: analytics.totalVisits,
    uniqueVisits: analytics.uniqueVisits,
    todayVisits: analytics.todayVisits,
    lastUpdated: analytics.lastVisit
  };

  function getYesterdayKey(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    });
  }

  function formatLastVisit(lastVisit: string): string {
    if (!lastVisit) return 'Jamais';
    
    const date = new Date(lastVisit);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('fr-FR');
  }

  const handleReset = () => {
    if (showResetConfirm) {
      resetAnalytics();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* En-tête */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Analytics Kouss Kouss
            </h2>
            <p className="text-muted-foreground">
              Statistiques de visite du site
            </p>
          </div>
          
          <Button
            variant={showResetConfirm ? "destructive" : "outline"}
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            {showResetConfirm ? (
              <>
                <AlertTriangle className="h-4 w-4" />
                Confirmer Reset Local
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Reset Local
              </>
            )}
          </Button>
        </div>

        {/* Sélecteur de mode */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
            <Button
              variant={viewMode === 'global' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('global')}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              Global
            </Button>
            <Button
              variant={viewMode === 'local' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('local')}
              className="flex items-center gap-2"
            >
              <Monitor className="h-4 w-4" />
              Local
            </Button>
          </div>
          
          {viewMode === 'global' && (
            <Button
              variant="outline"
              size="sm"
              onClick={fetchGlobalStats}
              disabled={loadingGlobal}
              className="flex items-center gap-2"
            >
              {loadingGlobal ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Actualiser Global
            </Button>
          )}
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Visites
                  {viewMode === 'global' && <Badge variant="outline" className="ml-2 text-xs">Global</Badge>}
                </p>
                <p className="text-2xl font-bold text-foreground">{currentStats.totalVisits}</p>
              </div>
              <Eye className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Visiteurs Uniques
                  {viewMode === 'global' && <Badge variant="outline" className="ml-2 text-xs">Global</Badge>}
                </p>
                <p className="text-2xl font-bold text-foreground">{currentStats.uniqueVisits}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Aujourd'hui
                  {viewMode === 'global' && <Badge variant="outline" className="ml-2 text-xs">Estimation</Badge>}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-foreground">{currentStats.todayVisits}</p>
                  {viewMode === 'local' && trendVsYesterday !== 0 && (
                    <Badge variant={trendVsYesterday > 0 ? "default" : "secondary"} className="text-xs">
                      {trendVsYesterday > 0 ? '+' : ''}{trendVsYesterday}
                    </Badge>
                  )}
                </div>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {viewMode === 'global' ? 'Dernière MAJ' : 'Dernière Visite'}
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {formatLastVisit(currentStats.lastUpdated)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détails */}
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily">Statistiques Quotidiennes</TabsTrigger>
          <TabsTrigger value="pages">Pages Populaires</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Visites des 7 derniers jours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentDays.map((day, index) => {
                  const isToday = index === recentDays.length - 1;
                  const maxVisits = Math.max(...recentDays.map(d => d.visits));
                  const percentage = maxVisits > 0 ? (day.visits / maxVisits) * 100 : 0;
                  
                  return (
                    <div key={day.date} className="flex items-center gap-4">
                      <div className="w-16 text-sm text-muted-foreground">
                        {formatDate(day.date)}
                      </div>
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            isToday ? 'bg-primary' : 'bg-primary/60'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-12 text-right text-sm font-medium">
                        {day.visits}
                        {isToday && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Aujourd'hui
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Pages les plus visitées</CardTitle>
            </CardHeader>
            <CardContent>
              {topPages.length > 0 ? (
                <div className="space-y-3">
                  {topPages.map(([path, visits], index) => (
                    <div key={path} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className="font-medium text-foreground">
                          {path === '/' ? 'Page d\'accueil' : path}
                        </span>
                      </div>
                      <Badge variant="secondary">
                        {visits} visite{visits > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Aucune donnée de page disponible
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Note explicative */}
      <Card className="bg-muted/30 border-border/50">
        <CardContent className="p-4">
          {viewMode === 'global' ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Mode Global :</strong> Statistiques agrégées de tous les visiteurs du site. 
                Les données sont collectées de manière anonyme via{' '}
                <a href="https://docs.counterapi.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  CounterAPI.dev
                </a>{' '}
                pour donner une vue d'ensemble du trafic réel.
              </p>
              {!globalStats && !loadingGlobal && (
                <p className="text-xs text-orange-600">
                  ⚠️ Impossible de charger les statistiques globales (mode hors ligne ou service indisponible).
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              <strong>Mode Local :</strong> Statistiques détaillées stockées localement dans votre navigateur. 
              Ces données représentent uniquement votre activité sur cet appareil et sont conservées 30 jours maximum.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
