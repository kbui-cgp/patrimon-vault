import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProfilInvestisseur, CreateProfilData, QuestionnaireInvestisseur } from '@/types/regulatory';

export function useProfilInvestisseur(clientId?: string) {
  const [profil, setProfil] = useState<ProfilInvestisseur | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const questionnaire: QuestionnaireInvestisseur = {
    horizon: {
      question: "Quel est votre horizon d'investissement principal ?",
      options: [
        { value: 6, label: "Moins de 6 mois", points: 1 },
        { value: 12, label: "6 mois à 1 an", points: 2 },
        { value: 36, label: "1 à 3 ans", points: 4 },
        { value: 60, label: "3 à 5 ans", points: 6 },
        { value: 120, label: "5 à 10 ans", points: 8 },
        { value: 240, label: "Plus de 10 ans", points: 10 },
      ],
    },
    tolerance: {
      question: "Comment réagiriez-vous si votre investissement perdait 20% de sa valeur ?",
      options: [
        { value: 1, label: "Je vendrais immédiatement", points: 1 },
        { value: 2, label: "Je serais très inquiet mais j'attendrais", points: 3 },
        { value: 3, label: "Je serais préoccupé mais confiant", points: 5 },
        { value: 4, label: "Je considérerais cela comme une opportunité", points: 7 },
        { value: 5, label: "J'investirais davantage", points: 10 },
      ],
    },
    connaissances: {
      question: "Comment évaluez-vous vos connaissances financières ?",
      options: [
        { value: 1, label: "Débutant", points: 1 },
        { value: 2, label: "Notions de base", points: 3 },
        { value: 3, label: "Intermédiaire", points: 5 },
        { value: 4, label: "Avancé", points: 7 },
        { value: 5, label: "Expert", points: 10 },
      ],
    },
    experience: {
      question: "Quelle est votre expérience en investissement ?",
      options: [
        { value: "aucune", label: "Aucune expérience", points: 1 },
        { value: "limitee", label: "Expérience limitée (livrets, assurance-vie)", points: 3 },
        { value: "moderee", label: "Expérience modérée (actions, obligations)", points: 5 },
        { value: "importante", label: "Expérience importante (produits dérivés)", points: 7 },
        { value: "professionnelle", label: "Expérience professionnelle", points: 10 },
      ],
    },
    objectifs: {
      question: "Quels sont vos objectifs d'investissement ? (plusieurs choix possibles)",
      multiple: true,
      options: [
        { value: "preservation", label: "Préservation du capital", points: 2 },
        { value: "revenus", label: "Génération de revenus", points: 4 },
        { value: "croissance", label: "Croissance du capital", points: 6 },
        { value: "speculation", label: "Spéculation", points: 10 },
        { value: "retraite", label: "Préparation retraite", points: 5 },
        { value: "transmission", label: "Transmission patrimoine", points: 3 },
      ],
    },
    capacite_perte: {
      question: "Quel pourcentage de votre patrimoine pouvez-vous vous permettre de perdre ?",
      type: 'percentage',
    },
  };

  const fetchProfil = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profils_investisseur')
        .select('*')
        .eq('client_id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfil(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Error fetching profil:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateProfil = (reponses: Record<string, any>): {
    profil: ProfilInvestisseur['profil_calcule'];
    score: number;
  } => {
    let totalPoints = 0;
    let maxPoints = 0;

    // Calculer les points pour chaque réponse
    Object.entries(reponses).forEach(([key, value]) => {
      const questionConfig = questionnaire[key as keyof QuestionnaireInvestisseur];
      
      if (questionConfig && 'options' in questionConfig) {
        if (Array.isArray(value)) {
          // Questions à choix multiples
          value.forEach(v => {
            const option = questionConfig.options.find(opt => opt.value === v);
            if (option) totalPoints += option.points;
          });
          maxPoints += Math.max(...questionConfig.options.map(opt => opt.points));
        } else {
          // Questions à choix unique
          const option = questionConfig.options.find(opt => opt.value === value);
          if (option) totalPoints += option.points;
          maxPoints += Math.max(...questionConfig.options.map(opt => opt.points));
        }
      }
    });

    // Ajuster pour la capacité de perte
    if (reponses.capacite_perte) {
      const capacite = parseFloat(reponses.capacite_perte);
      if (capacite <= 5) totalPoints += 1;
      else if (capacite <= 10) totalPoints += 3;
      else if (capacite <= 20) totalPoints += 5;
      else if (capacite <= 30) totalPoints += 7;
      else totalPoints += 10;
      maxPoints += 10;
    }

    const score = Math.round((totalPoints / maxPoints) * 100);
    
    let profil: ProfilInvestisseur['profil_calcule'];
    if (score <= 25) profil = 'prudent';
    else if (score <= 50) profil = 'equilibre';
    else if (score <= 75) profil = 'dynamique';
    else profil = 'offensif';

    return { profil, score };
  };

  const createProfil = async (profilData: CreateProfilData): Promise<ProfilInvestisseur> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { profil: profilCalcule, score } = calculateProfil(profilData.questionnaire_reponses);

      const { data, error } = await supabase
        .from('profils_investisseur')
        .insert({
          ...profilData,
          profil_calcule: profilCalcule,
          score_risque: score,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      const newProfil = data as ProfilInvestisseur;
      setProfil(newProfil);
      return newProfil;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateProfil = async (
    profilId: string, 
    updateData: Partial<CreateProfilData>
  ): Promise<ProfilInvestisseur> => {
    try {
      let finalUpdateData = { ...updateData };

      // Recalculer le profil si les réponses ont changé
      if (updateData.questionnaire_reponses) {
        const { profil: profilCalcule, score } = calculateProfil(updateData.questionnaire_reponses);
        finalUpdateData.profil_calcule = profilCalcule;
        finalUpdateData.score_risque = score;
      }

      const { data, error } = await supabase
        .from('profils_investisseur')
        .update(finalUpdateData)
        .eq('id', profilId)
        .select()
        .single();

      if (error) throw error;
      
      const updatedProfil = data as ProfilInvestisseur;
      setProfil(updatedProfil);
      return updatedProfil;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const generateProfilPDF = async (profilId: string): Promise<string> => {
    try {
      // TODO: Implémenter la génération PDF
      // Pour l'instant, on simule avec une URL
      const pdfUrl = `/api/profil/${profilId}/pdf`;
      
      await updateProfil(profilId, { pdf_url: pdfUrl });
      return pdfUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération PDF';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchProfil(clientId);
    }
  }, [clientId]);

  return {
    profil,
    loading,
    error,
    questionnaire,
    fetchProfil,
    createProfil,
    updateProfil,
    calculateProfil,
    generateProfilPDF,
  };
}

export default useProfilInvestisseur;