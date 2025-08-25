export interface Plat {
  nom: string;
  prix: string;
  description: string;
  vegetarien: boolean;
  vegan: boolean;
  dates: { jour: number; mois: number }[];
  services: string[];
}

export interface Restaurant {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
  chef: string | null;
  plats: Plat[];
}

export const restaurants: Restaurant[] = [
  {
    id: "ecomotive",
    nom: "L'ECOMOTIVE",
    adresse: "2 Pl. des Marseillaises - 13001",
    telephone: "07 83 09 70 36",
    chef: null,
    plats: [
      {
        nom: "KOUSS-LECO",
        prix: "15 €",
        description: "Couscous boulettes meati aux deux pois (pois chiches et cassés) parfumés avec des champignons, des noix, servi avec un bouillon épicé de tomates rôties et herbes fraîches.",
        vegetarien: false,
        vegan: false,
        dates: [
          { jour: 23, mois: 8 },
          { jour: 24, mois: 8 }
        ],
        services: ["midi"]
      },
      {
        nom: "Aubergines confites",
        prix: "15 €",
        description: "Aubergines confites fondantes et harissa aux abricots.",
        vegetarien: true,
        vegan: true,
        dates: [
          { jour: 23, mois: 8 },
          { jour: 24, mois: 8 }
        ],
        services: ["midi"]
      },
      {
        nom: "Pavlova",
        prix: "15 €",
        description: "Pavlova à la meringue d'aquafaba et son fruit de saison.",
        vegetarien: true,
        vegan: true,
        dates: [
          { jour: 23, mois: 8 },
          { jour: 24, mois: 8 }
        ],
        services: ["midi"]
      }
    ]
  },
  {
    id: "capucin",
    nom: "BRASSERIE LE CAPUCIN",
    adresse: "48 La Canebière - 13001",
    telephone: "04 65 58 56 93",
    chef: "NOËL BAUDRAND",
    plats: [
      {
        nom: "KOUSS-CAPUCIN",
        prix: "20 - 30 €",
        description: "Couscous, légumes de fin d'été, pois chiche, merguez, semoule parfumée, herbe fraîche.",
        vegetarien: false,
        vegan: false,
        dates: [
          { jour: 22, mois: 8 }, { jour: 23, mois: 8 }, { jour: 24, mois: 8 }, { jour: 25, mois: 8 },
          { jour: 26, mois: 8 }, { jour: 27, mois: 8 }, { jour: 28, mois: 8 }, { jour: 29, mois: 8 },
          { jour: 30, mois: 8 }, { jour: 31, mois: 8 }, { jour: 1, mois: 9 }, { jour: 2, mois: 9 },
          { jour: 3, mois: 9 }, { jour: 4, mois: 9 }, { jour: 5, mois: 9 }, { jour: 6, mois: 9 },
          { jour: 7, mois: 9 }
        ],
        services: ["midi"]
      }
    ]
  },
  {
    id: "petit-tunis",
    nom: "LE PETIT TUNIS",
    adresse: "72 La Canebière - 13001",
    telephone: "04 91 42 82 60",
    chef: null,
    plats: [
      {
        nom: "KOUSS-CHICHE TUNIS",
        prix: "7-16 €",
        description: "Spécialités tunisiennes: les soupes de pois chiches Lebleli au thon ou hergma et un large choix de couscous à prix très abordables.",
        vegetarien: false,
        vegan: false,
        dates: [
          { jour: 22, mois: 8 }, { jour: 23, mois: 8 }, { jour: 24, mois: 8 }, { jour: 25, mois: 8 },
          { jour: 26, mois: 8 }, { jour: 27, mois: 8 }, { jour: 28, mois: 8 }, { jour: 29, mois: 8 },
          { jour: 30, mois: 8 }, { jour: 31, mois: 8 }, { jour: 1, mois: 9 }, { jour: 2, mois: 9 },
          { jour: 3, mois: 9 }, { jour: 4, mois: 9 }, { jour: 5, mois: 9 }, { jour: 6, mois: 9 },
          { jour: 7, mois: 9 }
        ],
        services: []
      }
    ]
  }
];