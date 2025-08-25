# Kouss Kouss 2025 - Guide des Restaurants

Site web non-officiel pour découvrir les restaurants participants au festival culinaire Kouss Kouss 2025 à Marseille.

## À propos du projet

Ce site facilite la découverte du programme du festival Kouss Kouss 2025. Il permet aux visiteurs de :

- Explorer les restaurants participants
- Découvrir les plats authentiques du Maghreb
- Localiser les établissements sur une carte interactive
- Filtrer par régimes alimentaires (végétarien, vegan)
- Consulter les dates et services disponibles

**Dates du festival** : 22 août - 7 septembre 2025  
**Lieu** : Marseille  
**Site officiel** : [kousskouss.com](https://kousskouss.com/)

## Technologies utilisées

Ce projet est développé avec :

- **Vite** - Build tool moderne
- **TypeScript** - Typage statique
- **React** - Interface utilisateur
- **shadcn/ui** - Composants UI
- **Tailwind CSS** - Styles
- **React Router** - Navigation
- **Leaflet** - Cartes interactives

## Installation et développement

Prérequis : Node.js et npm installés ([installer avec nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

```bash
# Cloner le repository
git clone <YOUR_GIT_URL>

# Naviguer vers le projet
cd kouss-kouss-explore

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

## Scripts disponibles

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

## Structure du projet

```
src/
├── components/          # Composants React réutilisables
│   ├── ui/             # Composants UI de base (shadcn/ui)
│   ├── Map.tsx         # Carte interactive
│   ├── RestaurantCard.tsx
│   ├── PlatCard.tsx
│   └── ...
├── pages/              # Pages principales
│   ├── Index.tsx       # Page d'accueil
│   ├── Analytics.tsx   # Statistiques
│   └── ...
├── data/               # Données des restaurants
├── hooks/              # Hooks React personnalisés
├── lib/                # Utilitaires
└── services/           # Services (analytics, etc.)
```

## Déploiement

Le projet peut être déployé sur n'importe quelle plateforme supportant les sites statiques :

- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting

```bash
# Build de production
npm run build

# Le dossier dist/ contient les fichiers à déployer
```

## Contribution

Ce projet est maintenu de manière indépendante. Pour toute suggestion ou amélioration, n'hésitez pas à ouvrir une issue ou proposer une pull request.

## Licence

© 2025 JG Conseil - Tous droits réservés