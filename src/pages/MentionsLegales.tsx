import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Globe, Shield, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MentionsLegales = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* En-tête avec bouton retour */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4 border-border/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Mentions Légales
          </h1>
          <p className="text-muted-foreground">
            Informations légales concernant le site Kouss Kouss 2025
          </p>
        </div>

        <div className="space-y-8">
          {/* Éditeur du site */}
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Éditeur du site
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Responsable de la publication</h3>
                <p className="text-muted-foreground">
                  <strong>Société :</strong> JG Conseil<br />
                  <strong>Forme juridique :</strong> SASU<br />
                  <strong>SIRET :</strong> 98456422900016<br />
                  <strong>Représentant légal :</strong> Joël Gombin<br />
                  <strong>Adresse :</strong> 60 rue François 1er, 75008 Paris<br />
                  <strong>Email :</strong> joel.gombin+kousskouss@gmail.com
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Hébergement */}
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Hébergement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                <strong>Hébergeur :</strong> Hetzner Online GmbH<br />
                <strong>Adresse :</strong> Industriestr. 25, 91710 Gunzenhausen, Allemagne<br />
                <strong>Site web :</strong> <a href="https://www.hetzner.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.hetzner.com</a>
              </p>
            </CardContent>
          </Card>

          {/* Données personnelles et cookies */}
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Protection des données personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Données collectées</h3>
                <p className="text-muted-foreground mb-3">
                  Ce site ne collecte aucune donnée personnelle. Aucun système de tracking ou d'analytics n'est utilisé.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Finalité du traitement</h3>
                <p className="text-muted-foreground">
                  Aucune donnée n'est collectée, traitée ou stockée.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Cookies et stockage local</h3>
                <p className="text-muted-foreground">
                  Le site n'utilise aucun cookie ni stockage local du navigateur.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Service tiers</h3>
                <p className="text-muted-foreground">
                  Aucun service tiers de tracking ou d'analytics n'est utilisé.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Propriété intellectuelle */}
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Propriété intellectuelle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Contenu du site</h3>
                <p className="text-muted-foreground">
                  Le contenu de ce site reprend pour l'essentiel les informations publiées dans le programme officiel du festival. Si vous voulez les réutiliser, le fichier json est disponible sur le repo github du site : <a href="https://github.com/joelgombin/kouss-kouss-explore/blob/main/public/restaurants.json" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://github.com/joelgombin/kouss-kouss-explore/blob/main/public/restaurants.json</a>. 
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Statut du site et relation au festival</h3>
                <p className="text-muted-foreground mb-3">
                  <strong>Site non officiel :</strong> Ce site est une initiative personnelle de JG Conseil 
                  pour rendre accessible et découvrable le programme du festival Kouss•Kouss. 
                  Il ne s'agit pas du site officiel du festival. J'ai fait de mon mieux pour récupérer les informations publiées dans le programme officiel, et parfois les améliorer légèrement, mais il se peut que des informations soient manquantes ou erronées. N'hésitez pas à me contacter si vous remarquez des erreurs.
                </p>
                <p className="text-muted-foreground mb-3">
                  <strong>Site officiel du festival :</strong>{" "}
                  <a href="https://kousskouss.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    kousskouss.com
                  </a>
                </p>
                <p className="text-muted-foreground">
                  <strong>Objectif :</strong> Faciliter la découverte des restaurants participants 
                  et de leurs créations culinaires, à partir d'informations publiquement disponibles.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Informations sur les restaurants</h3>
                <p className="text-muted-foreground">
                  Les informations concernant les restaurants participants (noms, adresses, plats, prix) 
                  sont collectées à partir du programme officiel du festival et d'informations publiquement disponibles. 
                  En cas d'erreur ou de demande de modification, contactez-moi.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Photos de plats uploadées par les utilisateurs</h3>
                <p className="text-muted-foreground">
                  En uploadant une photo de plat sur ce site, l'utilisateur reconnaît qu'il dispose des droits 
                  sur l'image utilisée et qu'il accepte son utilisation par le site Kouss Kouss 2025. 
                  L'utilisateur s'engage à ne pas publier d'images dont il ne détient pas les droits ou 
                  qui pourraient porter atteinte aux droits de tiers.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Responsabilité */}
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Limitation de responsabilité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Ce site est fourni à titre informatif concernant le festival Kouss•Kouss 2025. 
                Il s'agit d'une initiative non officielle visant à faciliter l'accès aux informations 
                du festival. L'éditeur s'efforce de maintenir les informations à jour mais ne peut 
                garantir l'exactitude, la complétude ou l'actualité des informations diffusées.
              </p>
              
              <p className="text-muted-foreground">
                L'éditeur ne saurait être tenu responsable :
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Des erreurs ou omissions dans les informations</li>
                <li>Des modifications de prix, horaires ou menus des restaurants</li>
                <li>De l'interruption temporaire du service</li>
                <li>Des dommages directs ou indirects résultant de l'utilisation du site</li>
              </ul>
            </CardContent>
          </Card>

          {/* Droit applicable */}
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader>
              <CardTitle>Droit applicable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Les présentes mentions légales sont soumises au droit français. 
                En cas de litige, les tribunaux français seront seuls compétents.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Pour toute question concernant ces mentions légales ou le traitement 
                de vos données personnelles, vous pouvez me contacter :
              </p>
              <div className="mt-4 p-4 bg-muted rounded-md">
                <p className="text-muted-foreground">
                  <strong>Email :</strong> joel.gombin+kousskouss@gmail.com
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Date de mise à jour */}
          <div className="text-center text-sm text-muted-foreground border-t border-border/50 pt-6">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegales;
