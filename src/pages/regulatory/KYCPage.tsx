import { useParams } from "react-router-dom";
import { KYCForm } from "@/components/regulatory/KYCForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClients } from "@/hooks/useClients";

export default function KYCPage() {
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
            Questionnaire KYC
          </h1>
          {client && (
            <p className="text-muted-foreground">
              {client.nom} {client.prenom}
            </p>
          )}
        </div>
      </div>

      {/* Informations importantes */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="text-lg">Recueil d'informations client (KYC)</CardTitle>
          <CardDescription>
            Ce questionnaire permet de collecter les informations nécessaires pour respecter 
            les obligations réglementaires de connaissance client selon la directive MiFID II.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Objectif :</strong>
              <p className="text-muted-foreground">
                Évaluer la situation financière et les objectifs d'investissement
              </p>
            </div>
            <div>
              <strong>Durée :</strong>
              <p className="text-muted-foreground">
                Environ 15-20 minutes
              </p>
            </div>
            <div>
              <strong>Sauvegarde :</strong>
              <p className="text-muted-foreground">
                Progression sauvegardée automatiquement
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire KYC */}
      <KYCForm 
        clientId={clientId}
        onComplete={(kyc) => {
          navigate(`/clients/${clientId}`, { 
            state: { message: 'KYC terminé avec succès' }
          });
        }}
      />
    </div>
  );
}