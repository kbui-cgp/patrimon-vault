export interface Client {
  id: string;
  nom: string;
  prenom: string;
  date_naissance?: string | null;
  email?: string | null;
  telephone?: string | null;
  adresse?: string | null;
  situation_patrimoniale?: any;
  tags?: string[] | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  client_id: string;
  modele_id?: string;
  type_document: string;
  fichier_url?: string;
  version: number;
  statut_conformite: 'En attente' | 'Validé' | 'Rejeté' | 'En révision';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ModeleDocument {
  id: string;
  nom_modele: string;
  type_document: string;
  contenu_modele: string;
  tags_detectes?: string[];
  version: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TagMapping {
  id: string;
  modele_id: string;
  tag_name: string;
  client_field: string;
  created_at: string;
}

export interface Conformite {
  id: string;
  client_id: string;
  document_id: string;
  checklist?: Record<string, any>;
  statut_global: 'En attente' | 'Conforme' | 'Non conforme' | 'En cours';
  responsable_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'conseiller' | 'client';
  password_hash?: string;
  two_fa_secret?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientData {
  nom: string;
  prenom: string;
  date_naissance?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  situation_patrimoniale?: any;
  tags?: string[];
}

export interface UpdateClientData extends Partial<CreateClientData> {}