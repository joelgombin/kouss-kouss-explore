# Kouss Kouss 2025 - Guide des Restaurants

Site web non-officiel pour découvrir les restaurants participants au festival culinaire Kouss Kouss 2025 à Marseille.

🌐 **Site web** : [kousskouss.joelgombin.fr](https://kousskouss.joelgombin.fr)  
📖 **Code source** : [github.com/joelgombin/kouss-kouss-explore](https://github.com/joelgombin/kouss-kouss-explore)

## À propos du projet

Ce site facilite la découverte du programme du festival Kouss Kouss 2025. Il permet aux visiteurs de :

- Explorer les restaurants participants
- Localiser les établissements sur une carte interactive
- Filtrer par régimes alimentaires (végétarien, vegan)
- Consulter les dates et services disponibles

**Dates du festival** : 22 août - 7 septembre 2025  
**Lieu** : Marseille  
**Site officiel** : [kousskouss.com](https://kousskouss.com/)

## ✨ Fonctionnalités

- 🗺️ **Carte interactive** - Localisation des restaurants participants
- 🔍 **Recherche intelligente** - Filtrage par nom, quartier, type de cuisine
- 🥗 **Filtres alimentaires** - Végétarien, vegan
- 📱 **Design responsive** - Optimisé mobile et desktop
- 📊 **Analytics** - Statistiques sur les restaurants et plats 
- 🎨 **Interface moderne** - Design épuré avec shadcn/ui

## 🛠️ Technologies utilisées

Ce projet est développé avec :

- **Vite** - Build tool moderne et rapide
- **TypeScript** - Typage statique pour plus de robustesse
- **React 18** - Interface utilisateur avec les dernières fonctionnalités
- **shadcn/ui** - Composants UI accessibles et personnalisables
- **Tailwind CSS** - Framework CSS utilitaire
- **React Router** - Navigation côté client
- **Leaflet** - Cartes interactives OpenStreetMap
- **React Query** - Gestion d'état et cache des données

J'ai utilisé Cursor et Claude 4 Sonnet pour générer le code. 

## 🚀 Installation et développement

**Prérequis** : Node.js 18+ et npm installés ([installer avec nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

```bash
# Cloner le repository
git clone https://github.com/joelgombin/kouss-kouss-explore.git

# Naviguer vers le projet
cd kouss-kouss-explore

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

## 📋 Scripts disponibles

```bash
# Développement avec rechargement automatique
npm run dev

# Build de production
npm run build

# Prévisualisation du build
npm run preview

# Linting
npm run lint
```

## 📁 Structure du projet

```
kouss-kouss-explore/
├── public/             # Fichiers statiques
│   ├── favicon.ico     # Icône du site
│   ├── robots.txt      # Instructions pour les robots
│   ├── restaurants.json # Données des restaurants
│   └── ...
├── src/
│   ├── components/     # Composants React réutilisables
│   │   ├── ui/         # Composants UI de base (shadcn/ui)
│   │   ├── Map.tsx     # Carte interactive
│   │   ├── RestaurantCard.tsx
│   │   ├── PlatCard.tsx
│   │   └── ...
│   ├── pages/          # Pages principales
│   │   ├── Index.tsx   # Page d'accueil
│   │   ├── Analytics.tsx # Statistiques
│   │   └── ...
│   ├── data/           # Données des restaurants (TypeScript)
│   ├── hooks/          # Hooks React personnalisés
│   ├── lib/            # Utilitaires
│   └── services/       # Services (analytics, etc.)
├── package.json        # Dépendances et scripts
├── vite.config.ts      # Configuration Vite
├── tailwind.config.ts  # Configuration Tailwind
└── tsconfig.json       # Configuration TypeScript
```

## 🚀 Déploiement

Le projet peut être déployé sur n'importe quelle plateforme supportant les sites statiques :

- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting

Personnellement, j'ai déployé en utilisant CapRover.

```bash
# Build de production
npm run build

# Le dossier dist/ contient les fichiers à déployer
```

## Contribution

Si vous trouvez un bug, merci d'ouvrir une [issue](https://github.com/joelgombin/kouss-kouss-explore/issues) avec :
- Une description claire du problème
- Les étapes pour reproduire le bug
- Votre environnement (OS, navigateur, version Node.js)

## 📄 Licence

CC BY-NC-SA 4.0

---

**Disclaimer** : Ce site est un projet indépendant et n'est pas affilié officiellement au festival Kouss Kouss. Pour les informations officielles, consultez [kousskouss.com](https://kousskouss.com/).