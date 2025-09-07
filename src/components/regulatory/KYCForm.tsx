import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useKYC } from "@/hooks/useKYC";
import { KYCQuestionnaire } from "@/types/regulatory";
import { ChevronLeft, ChevronRight, Save, CheckCircle } from "lucide-react";

interface KYCFormProps {
  clientId: string;
  onComplete?: (kyc: KYCQuestionnaire) => void;
}

const ETAPES = [
  { numero: 1, titre: "Identité", description: "Informations personnelles" },
  { numero: 2, titre: "Situation familiale", description: "État civil et famille" },
  { numero: 3, titre: "Situation professionnelle", description: "Emploi et activité" },
  { numero: 4, titre: "Revenus", description: "Revenus et sources" },
  { numero: 5, titre: "Patrimoine", description: "Biens et dettes" },
  { numero: 6, titre: "Objectifs", description: "Objectifs d'investissement" },
  { numero: 7, titre: "Récapitulatif", description: "Validation finale" },
];

export function KYCForm({ clientId, onComplete }: KYCFormProps) {
  const { kyc, loading, createKYC, saveKYCStep, completeKYC } = useKYC(clientId);
  const { toast } = useToast();
  const [etapeCourante, setEtapeCourante] = useState(1);
  const [formData, setFormData] = useState<Partial<KYCQuestionnaire>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (kyc) {
      setEtapeCourante(kyc.etape_courante);
      setFormData(kyc);
    } else if (!loading && clientId) {
      // Créer un nouveau KYC si aucun n'existe
      createKYC({ client_id: clientId });
    }
  }, [kyc, loading, clientId, createKYC]);

  const handleInputChange = (section: keyof KYCQuestionnaire, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSaveStep = async () => {
    if (!kyc) return;

    setSaving(true);
    try {
      await saveKYCStep(kyc.id, etapeCourante, formData);
      toast({
        title: "Étape sauvegardée",
        description: "Vos informations ont été enregistrées.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'étape.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNextStep = async () => {
    await handleSaveStep();
    if (etapeCourante < ETAPES.length) {
      setEtapeCourante(etapeCourante + 1);
    }
  };

  const handlePrevStep = () => {
    if (etapeCourante > 1) {
      setEtapeCourante(etapeCourante - 1);
    }
  };

  const handleComplete = async () => {
    if (!kyc) return;

    setSaving(true);
    try {
      const completedKYC = await completeKYC(kyc.id);
      toast({
        title: "KYC terminé",
        description: "Le questionnaire KYC a été finalisé avec succès.",
      });
      onComplete?.(completedKYC);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de finaliser le KYC.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderEtapeIdentite = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom *</Label>
          <Input
            id="nom"
            value={formData.identite?.nom || ''}
            onChange={(e) => handleInputChange('identite', 'nom', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prenom">Prénom *</Label>
          <Input
            id="prenom"
            value={formData.identite?.prenom || ''}
            onChange={(e) => handleInputChange('identite', 'prenom', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date_naissance">Date de naissance *</Label>
          <Input
            id="date_naissance"
            type="date"
            value={formData.identite?.date_naissance || ''}
            onChange={(e) => handleInputChange('identite', 'date_naissance', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lieu_naissance">Lieu de naissance</Label>
          <Input
            id="lieu_naissance"
            value={formData.identite?.lieu_naissance || ''}
            onChange={(e) => handleInputChange('identite', 'lieu_naissance', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nationalite">Nationalité</Label>
          <Select
            value={formData.identite?.nationalite || ''}
            onValueChange={(value) => handleInputChange('identite', 'nationalite', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="francaise">Française</SelectItem>
              <SelectItem value="autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="numero_identite">Numéro pièce d'identité</Label>
          <Input
            id="numero_identite"
            value={formData.identite?.numero_identite || ''}
            onChange={(e) => handleInputChange('identite', 'numero_identite', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderEtapeSituationFamiliale = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="situation_matrimoniale">Situation matrimoniale</Label>
        <Select
          value={formData.situation_familiale?.situation_matrimoniale || ''}
          onValueChange={(value) => handleInputChange('situation_familiale', 'situation_matrimoniale', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="celibataire">Célibataire</SelectItem>
            <SelectItem value="marie">Marié(e)</SelectItem>
            <SelectItem value="pacs">Pacsé(e)</SelectItem>
            <SelectItem value="divorce">Divorcé(e)</SelectItem>
            <SelectItem value="veuf">Veuf/Veuve</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre_enfants">Nombre d'enfants</Label>
          <Input
            id="nombre_enfants"
            type="number"
            min="0"
            value={formData.situation_familiale?.nombre_enfants || ''}
            onChange={(e) => handleInputChange('situation_familiale', 'nombre_enfants', parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="personnes_a_charge">Personnes à charge</Label>
          <Input
            id="personnes_a_charge"
            type="number"
            min="0"
            value={formData.situation_familiale?.personnes_a_charge || ''}
            onChange={(e) => handleInputChange('situation_familiale', 'personnes_a_charge', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>
    </div>
  );

  const renderEtapeSituationProfessionnelle = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="statut">Statut professionnel</Label>
        <Select
          value={formData.situation_professionnelle?.statut || ''}
          onValueChange={(value) => handleInputChange('situation_professionnelle', 'statut', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="salarie">Salarié</SelectItem>
            <SelectItem value="independant">Indépendant</SelectItem>
            <SelectItem value="fonctionnaire">Fonctionnaire</SelectItem>
            <SelectItem value="retraite">Retraité</SelectItem>
            <SelectItem value="etudiant">Étudiant</SelectItem>
            <SelectItem value="sans_emploi">Sans emploi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="profession">Profession</Label>
          <Input
            id="profession"
            value={formData.situation_professionnelle?.profession || ''}
            onChange={(e) => handleInputChange('situation_professionnelle', 'profession', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="employeur">Employeur</Label>
          <Input
            id="employeur"
            value={formData.situation_professionnelle?.employeur || ''}
            onChange={(e) => handleInputChange('situation_professionnelle', 'employeur', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="anciennete">Ancienneté (années)</Label>
          <Input
            id="anciennete"
            type="number"
            min="0"
            value={formData.situation_professionnelle?.anciennete || ''}
            onChange={(e) => handleInputChange('situation_professionnelle', 'anciennete', parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="secteur_activite">Secteur d'activité</Label>
          <Input
            id="secteur_activite"
            value={formData.situation_professionnelle?.secteur_activite || ''}
            onChange={(e) => handleInputChange('situation_professionnelle', 'secteur_activite', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderEtapeRevenus = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="revenus_annuels">Revenus annuels nets (€)</Label>
          <Input
            id="revenus_annuels"
            type="number"
            min="0"
            value={formData.revenus?.revenus_annuels || ''}
            onChange={(e) => handleInputChange('revenus', 'revenus_annuels', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="autres_revenus">Autres revenus annuels (€)</Label>
          <Input
            id="autres_revenus"
            type="number"
            min="0"
            value={formData.revenus?.autres_revenus || ''}
            onChange={(e) => handleInputChange('revenus', 'autres_revenus', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="source_autres_revenus">Source des autres revenus</Label>
        <Textarea
          id="source_autres_revenus"
          value={formData.revenus?.source_autres_revenus || ''}
          onChange={(e) => handleInputChange('revenus', 'source_autres_revenus', e.target.value)}
          placeholder="Précisez la source de vos autres revenus..."
        />
      </div>
    </div>
  );

  const renderEtapePatrimoine = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patrimoine_immobilier">Patrimoine immobilier (€)</Label>
          <Input
            id="patrimoine_immobilier"
            type="number"
            min="0"
            value={formData.patrimoine?.patrimoine_immobilier || ''}
            onChange={(e) => handleInputChange('patrimoine', 'patrimoine_immobilier', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="patrimoine_financier">Patrimoine financier (€)</Label>
          <Input
            id="patrimoine_financier"
            type="number"
            min="0"
            value={formData.patrimoine?.patrimoine_financier || ''}
            onChange={(e) => handleInputChange('patrimoine', 'patrimoine_financier', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dettes">Dettes totales (€)</Label>
          <Input
            id="dettes"
            type="number"
            min="0"
            value={formData.patrimoine?.dettes || ''}
            onChange={(e) => handleInputChange('patrimoine', 'dettes', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label>Patrimoine net (€)</Label>
          <div className="p-3 bg-muted rounded-md">
            {((formData.patrimoine?.patrimoine_immobilier || 0) + 
              (formData.patrimoine?.patrimoine_financier || 0) - 
              (formData.patrimoine?.dettes || 0)).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );

  const renderEtapeObjectifs = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="objectifs_investissement">Objectifs d'investissement</Label>
        <Textarea
          id="objectifs_investissement"
          value={formData.objectifs?.objectifs_investissement?.join(', ') || ''}
          onChange={(e) => handleInputChange('objectifs', 'objectifs_investissement', e.target.value.split(', '))}
          placeholder="Décrivez vos objectifs d'investissement..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="horizon_investissement">Horizon d'investissement (mois)</Label>
          <Input
            id="horizon_investissement"
            type="number"
            min="1"
            value={formData.objectifs?.horizon_investissement || ''}
            onChange={(e) => handleInputChange('objectifs', 'horizon_investissement', parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="montant_investissement">Montant à investir (€)</Label>
          <Input
            id="montant_investissement"
            type="number"
            min="0"
            value={formData.objectifs?.montant_investissement || ''}
            onChange={(e) => handleInputChange('objectifs', 'montant_investissement', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
    </div>
  );

  const renderRecapitulatif = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
        <h3 className="text-xl font-semibold">Questionnaire KYC terminé</h3>
        <p className="text-muted-foreground">
          Toutes les informations ont été collectées avec succès.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Identité</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>{formData.identite?.nom} {formData.identite?.prenom}</p>
            <p>{formData.identite?.date_naissance}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Situation professionnelle</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>{formData.situation_professionnelle?.statut}</p>
            <p>{formData.situation_professionnelle?.profession}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Revenus annuels</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>{(formData.revenus?.revenus_annuels || 0).toLocaleString()} €</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Patrimoine net</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>{((formData.patrimoine?.patrimoine_immobilier || 0) + 
                 (formData.patrimoine?.patrimoine_financier || 0) - 
                 (formData.patrimoine?.dettes || 0)).toLocaleString()} €</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderEtapeContent = () => {
    switch (etapeCourante) {
      case 1: return renderEtapeIdentite();
      case 2: return renderEtapeSituationFamiliale();
      case 3: return renderEtapeSituationProfessionnelle();
      case 4: return renderEtapeRevenus();
      case 5: return renderEtapePatrimoine();
      case 6: return renderEtapeObjectifs();
      case 7: return renderRecapitulatif();
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const progress = (etapeCourante / ETAPES.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header avec progression */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Questionnaire KYC</h2>
            <p className="text-muted-foreground">
              Étape {etapeCourante} sur {ETAPES.length} - {ETAPES[etapeCourante - 1]?.titre}
            </p>
          </div>
          {kyc?.statut && (
            <Badge variant={kyc.statut === 'complete' ? 'default' : 'secondary'}>
              {kyc.statut === 'complete' ? 'Terminé' : 'En cours'}
            </Badge>
          )}
        </div>

        <Progress value={progress} className="w-full" />

        {/* Navigation des étapes */}
        <div className="flex flex-wrap gap-2">
          {ETAPES.map((etape) => (
            <Button
              key={etape.numero}
              variant={etape.numero === etapeCourante ? "default" : "outline"}
              size="sm"
              onClick={() => setEtapeCourante(etape.numero)}
              className="text-xs"
            >
              {etape.numero}. {etape.titre}
            </Button>
          ))}
        </div>
      </div>

      {/* Contenu de l'étape */}
      <Card>
        <CardHeader>
          <CardTitle>{ETAPES[etapeCourante - 1]?.titre}</CardTitle>
          <CardDescription>{ETAPES[etapeCourante - 1]?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderEtapeContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={etapeCourante === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Précédent
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSaveStep}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>

          {etapeCourante < ETAPES.length ? (
            <Button onClick={handleNextStep} disabled={saving}>
              Suivant
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={saving}>
              <CheckCircle className="h-4 w-4 mr-2" />
              {saving ? 'Finalisation...' : 'Terminer'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}