import { useParams } from "react-router-dom";
import { PiecesJustificativesSection } from "@/components/regulatory/PiecesJustificativesSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClients } from "@/hooks/useClients";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PiecesJustificativesPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { getClientById } = useClients();

  if (!clientId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Client non trouvé</p>
      </div>
    );
  }

  const client = getClientById(clientId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/clients/${clientId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au dossier
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold">
            Pièces justificatives
          </h1>
          {client && (
            <p className="text-muted-foreground">
              {client.nom} {client.prenom}
            </p>
          )}
        </div>
      </div>

      {/* Informations réglementaires */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Obligations LAB/FT :</strong> La collecte de pièces justificatives est obligatoire 
          pour respecter les exigences de lutte anti-blanchiment et financement du terrorisme.
        </AlertDescription>
      </Alert>

      {/* Informations sur les documents requis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Documents obligatoires
          </CardTitle>
          <CardDescription>
            Ces documents sont requis pour la conformité réglementaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Pièce d'identité</h4>
              <p className="text-sm text-muted-foreground">
                Carte nationale d'identité, passeport ou titre de séjour en cours de validité
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Justificatif de domicile</h4>
              <p className="text-sm text-muted-foreground">
                Facture (électricité, gaz, téléphone) ou avis d'imposition de moins de 3 mois
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Documents optionnels (selon le profil)</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Justificatifs de revenus (bulletins de salaire, avis d'imposition)</li>
              <li>• Justificatifs de patrimoine (relevés bancaires, estimations immobilières)</li>
              <li>• Autres documents spécifiques selon la situation</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Section principale */}
      <PiecesJustificativesSection clientId={clientId} />
    </div>
  );
}