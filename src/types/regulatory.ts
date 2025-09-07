export interface KYCQuestionnaire {
  id: string;
  client_id: string;
  etape_courante: number;
  identite: {
    nom?: string;
    prenom?: string;
    date_naissance?: string;
    lieu_naissance?: string;
    nationalite?: string;
    numero_identite?: string;
  };
  situation_familiale: {
    situation_matrimoniale?: string;
    nombre_enfants?: number;
    personnes_a_charge?: number;
  };
  situation_professionnelle: {
    statut?: string;
    profession?: string;
    employeur?: string;
    anciennete?: number;
    secteur_activite?: string;
  };
  revenus: {
    revenus_annuels?: number;
    autres_revenus?: number;
    source_autres_revenus?: string;
  };
  patrimoine: {
    patrimoine_immobilier?: number;
    patrimoine_financier?: number;
    dettes?: number;
    patrimoine_net?: number;
  };
  objectifs: {
    objectifs_investissement?: string[];
    horizon_investissement?: number;
    montant_investissement?: number;
  };
  statut: 'en_cours' | 'complete' | 'validee';
  completed_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PieceJustificative {
  id: string;
  client_id: string;
  type_piece: 'identite' | 'domicile' | 'revenus' | 'patrimoine' | 'autre';
  nom_fichier: string;
  url_fichier: string;
  taille_fichier?: number;
  type_mime?: string;
  statut: 'recue' | 'en_attente' | 'validee' | 'rejetee';
  commentaire?: string;
  uploaded_by?: string;
  validated_by?: string;
  validated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfilInvestisseur {
  id: string;
  client_id: string;
  horizon_investissement?: number;
  tolerance_risque?: number;
  connaissances_financieres?: number;
  experience_investissement?: string;
  objectifs_investissement?: string[];
  capacite_perte_max?: number;
  questionnaire_reponses: Record<string, any>;
  profil_calcule?: 'prudent' | 'equilibre' | 'dynamique' | 'offensif';
  score_risque?: number;
  pdf_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ProduitFinancier {
  id: string;
  nom_produit: string;
  type_produit: string;
  categorie: string;
  description?: string;
  niveau_risque?: number;
  horizon_recommande?: number;
  profils_cibles?: string[];
  montant_minimum?: number;
  frais: Record<string, any>;
  caracteristiques: Record<string, any>;
  actif: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AdequationCheck {
  id: string;
  client_id: string;
  produit_id: string;
  profil_id: string;
  compatible: boolean;
  score_adequation?: number;
  alertes?: string[];
  justification?: string;
  recommandations?: string;
  checked_by?: string;
  created_at: string;
}

export interface DERDocument {
  id: string;
  client_id: string;
  profil_id: string;
  produits_proposes?: string[];
  contenu_der: Record<string, any>;
  pdf_url?: string;
  statut: 'genere' | 'envoye' | 'signe' | 'archive';
  signature_electronique?: Record<string, any>;
  signed_at?: string;
  generated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceTracking {
  id: string;
  client_id: string;
  kyc_complete: boolean;
  pieces_justificatives_complete: boolean;
  profil_investisseur_complete: boolean;
  der_genere: boolean;
  pourcentage_completude: number;
  derniere_relance?: string;
  prochaine_relance?: string;
  alertes_actives?: string[];
  notes_conformite?: string;
  responsable_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateKYCData {
  client_id: string;
  etape_courante?: number;
  identite?: KYCQuestionnaire['identite'];
  situation_familiale?: KYCQuestionnaire['situation_familiale'];
  situation_professionnelle?: KYCQuestionnaire['situation_professionnelle'];
  revenus?: KYCQuestionnaire['revenus'];
  patrimoine?: KYCQuestionnaire['patrimoine'];
  objectifs?: KYCQuestionnaire['objectifs'];
}

export interface UpdateKYCData extends Partial<CreateKYCData> {
  statut?: KYCQuestionnaire['statut'];
}

export interface CreateProfilData {
  client_id: string;
  horizon_investissement?: number;
  tolerance_risque?: number;
  connaissances_financieres?: number;
  experience_investissement?: string;
  objectifs_investissement?: string[];
  capacite_perte_max?: number;
  questionnaire_reponses: Record<string, any>;
}

export interface QuestionnaireInvestisseur {
  horizon: {
    question: string;
    options: { value: number; label: string; points: number }[];
  };
  tolerance: {
    question: string;
    options: { value: number; label: string; points: number }[];
  };
  connaissances: {
    question: string;
    options: { value: number; label: string; points: number }[];
  };
  experience: {
    question: string;
    options: { value: string; label: string; points: number }[];
  };
  objectifs: {
    question: string;
    options: { value: string; label: string; points: number }[];
    multiple: boolean;
  };
  capacite_perte: {
    question: string;
    type: 'percentage';
  };
}