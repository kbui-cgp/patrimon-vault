/*
  # Création des tables pour le parcours réglementaire CIF

  1. Nouvelles tables
    - `kyc_questionnaires` - Questionnaires KYC clients
    - `pieces_justificatives` - Pièces justificatives LAB/FT
    - `profils_investisseur` - Profils investisseur calculés
    - `produits_financiers` - Catalogue produits avec gouvernance
    - `adequation_checks` - Vérifications d'adéquation
    - `der_documents` - Documents DER générés
    - `compliance_tracking` - Suivi conformité

  2. Sécurité
    - Enable RLS sur toutes les nouvelles tables
    - Politiques d'accès basées sur les rôles utilisateur

  3. Relations
    - Toutes les tables liées aux clients existants
    - Traçabilité complète des actions
*/

-- Table pour les questionnaires KYC
CREATE TABLE IF NOT EXISTS kyc_questionnaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  etape_courante integer DEFAULT 1,
  identite jsonb DEFAULT '{}',
  situation_familiale jsonb DEFAULT '{}',
  situation_professionnelle jsonb DEFAULT '{}',
  revenus jsonb DEFAULT '{}',
  patrimoine jsonb DEFAULT '{}',
  objectifs jsonb DEFAULT '{}',
  statut text DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'complete', 'validee')),
  completed_at timestamptz,
  created_by uuid REFERENCES utilisateurs(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table pour les pièces justificatives
CREATE TABLE IF NOT EXISTS pieces_justificatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  type_piece text NOT NULL CHECK (type_piece IN ('identite', 'domicile', 'revenus', 'patrimoine', 'autre')),
  nom_fichier text NOT NULL,
  url_fichier text NOT NULL,
  taille_fichier bigint,
  type_mime text,
  statut text DEFAULT 'recue' CHECK (statut IN ('recue', 'en_attente', 'validee', 'rejetee')),
  commentaire text,
  uploaded_by uuid REFERENCES utilisateurs(id),
  validated_by uuid REFERENCES utilisateurs(id),
  validated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table pour les profils investisseur
CREATE TABLE IF NOT EXISTS profils_investisseur (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  horizon_investissement integer, -- en mois
  tolerance_risque integer CHECK (tolerance_risque BETWEEN 1 AND 10),
  connaissances_financieres integer CHECK (connaissances_financieres BETWEEN 1 AND 5),
  experience_investissement text,
  objectifs_investissement text[],
  capacite_perte_max numeric(15,2),
  questionnaire_reponses jsonb DEFAULT '{}',
  profil_calcule text CHECK (profil_calcule IN ('prudent', 'equilibre', 'dynamique', 'offensif')),
  score_risque integer CHECK (score_risque BETWEEN 1 AND 100),
  pdf_url text,
  created_by uuid REFERENCES utilisateurs(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table pour les produits financiers
CREATE TABLE IF NOT EXISTS produits_financiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_produit text NOT NULL,
  type_produit text NOT NULL,
  categorie text NOT NULL,
  description text,
  niveau_risque integer CHECK (niveau_risque BETWEEN 1 AND 7),
  horizon_recommande integer, -- en mois
  profils_cibles text[] DEFAULT '{}',
  montant_minimum numeric(15,2),
  frais jsonb DEFAULT '{}',
  caracteristiques jsonb DEFAULT '{}',
  actif boolean DEFAULT true,
  created_by uuid REFERENCES utilisateurs(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table pour les vérifications d'adéquation
CREATE TABLE IF NOT EXISTS adequation_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  produit_id uuid REFERENCES produits_financiers(id),
  profil_id uuid REFERENCES profils_investisseur(id),
  compatible boolean NOT NULL,
  score_adequation integer CHECK (score_adequation BETWEEN 0 AND 100),
  alertes text[],
  justification text,
  recommandations text,
  checked_by uuid REFERENCES utilisateurs(id),
  created_at timestamptz DEFAULT now()
);

-- Table pour les documents DER
CREATE TABLE IF NOT EXISTS der_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  profil_id uuid REFERENCES profils_investisseur(id),
  produits_proposes uuid[],
  contenu_der jsonb DEFAULT '{}',
  pdf_url text,
  statut text DEFAULT 'genere' CHECK (statut IN ('genere', 'envoye', 'signe', 'archive')),
  signature_electronique jsonb,
  signed_at timestamptz,
  generated_by uuid REFERENCES utilisateurs(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table pour le suivi conformité
CREATE TABLE IF NOT EXISTS compliance_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  kyc_complete boolean DEFAULT false,
  pieces_justificatives_complete boolean DEFAULT false,
  profil_investisseur_complete boolean DEFAULT false,
  der_genere boolean DEFAULT false,
  pourcentage_completude integer DEFAULT 0,
  derniere_relance timestamptz,
  prochaine_relance timestamptz,
  alertes_actives text[],
  notes_conformite text,
  responsable_id uuid REFERENCES utilisateurs(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes pour les performances
CREATE INDEX IF NOT EXISTS idx_kyc_client_id ON kyc_questionnaires(client_id);
CREATE INDEX IF NOT EXISTS idx_pieces_client_id ON pieces_justificatives(client_id);
CREATE INDEX IF NOT EXISTS idx_pieces_statut ON pieces_justificatives(statut);
CREATE INDEX IF NOT EXISTS idx_profils_client_id ON profils_investisseur(client_id);
CREATE INDEX IF NOT EXISTS idx_adequation_client_id ON adequation_checks(client_id);
CREATE INDEX IF NOT EXISTS idx_der_client_id ON der_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_compliance_client_id ON compliance_tracking(client_id);
CREATE INDEX IF NOT EXISTS idx_compliance_completude ON compliance_tracking(pourcentage_completude);

-- Enable RLS sur toutes les nouvelles tables
ALTER TABLE kyc_questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE pieces_justificatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE profils_investisseur ENABLE ROW LEVEL SECURITY;
ALTER TABLE produits_financiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE adequation_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE der_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_tracking ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour kyc_questionnaires
CREATE POLICY "Users can view KYC of their clients" ON kyc_questionnaires
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = client_id AND c.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM utilisateurs 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create KYC" ON kyc_questionnaires
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update KYC of their clients" ON kyc_questionnaires
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = client_id AND c.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM utilisateurs 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques RLS pour pieces_justificatives
CREATE POLICY "Users can view pieces of their clients" ON pieces_justificatives
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = client_id AND c.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM utilisateurs 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can upload pieces" ON pieces_justificatives
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can update pieces of their clients" ON pieces_justificatives
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = client_id AND c.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM utilisateurs 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques RLS pour profils_investisseur
CREATE POLICY "Users can view profiles of their clients" ON profils_investisseur
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = client_id AND c.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM utilisateurs 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create profiles" ON profils_investisseur
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update profiles of their clients" ON profils_investisseur
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = client_id AND c.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM utilisateurs 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques RLS pour produits_financiers
CREATE POLICY "Users can view all products" ON produits_financiers
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage products" ON produits_financiers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM utilisateurs 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques RLS pour adequation_checks
CREATE POLICY "Users can view adequation of their clients" ON adequation_checks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = client_id AND c.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM utilisateurs 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create adequation checks" ON adequation_checks
  FOR INSERT WITH CHECK (checked_by = auth.uid());

-- Politiques RLS pour der_documents
CREATE POLICY "Users can view DER of their clients" ON der_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = client_id AND c.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM utilisateurs 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create DER" ON der_documents
  FOR INSERT WITH CHECK (generated_by = auth.uid());

CREATE POLICY "Users can update DER of their clients" ON der_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = client_id AND c.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM utilisateurs 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques RLS pour compliance_tracking
CREATE POLICY "Users can view compliance of their clients" ON compliance_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = client_id AND c.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM utilisateurs 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can manage compliance" ON compliance_tracking
  FOR ALL USING (
    responsable_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM utilisateurs 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Triggers pour mise à jour automatique des timestamps
CREATE TRIGGER update_kyc_updated_at
  BEFORE UPDATE ON kyc_questionnaires
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pieces_updated_at
  BEFORE UPDATE ON pieces_justificatives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profils_updated_at
  BEFORE UPDATE ON profils_investisseur
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_produits_updated_at
  BEFORE UPDATE ON produits_financiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_der_updated_at
  BEFORE UPDATE ON der_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_updated_at
  BEFORE UPDATE ON compliance_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer le pourcentage de complétude
CREATE OR REPLACE FUNCTION calculate_compliance_completude(client_uuid uuid)
RETURNS integer AS $$
DECLARE
  total_steps integer := 4;
  completed_steps integer := 0;
BEGIN
  -- Vérifier KYC
  IF EXISTS (
    SELECT 1 FROM kyc_questionnaires 
    WHERE client_id = client_uuid AND statut = 'complete'
  ) THEN
    completed_steps := completed_steps + 1;
  END IF;
  
  -- Vérifier pièces justificatives (au moins identité et domicile)
  IF (
    SELECT COUNT(*) FROM pieces_justificatives 
    WHERE client_id = client_uuid 
    AND type_piece IN ('identite', 'domicile') 
    AND statut = 'validee'
  ) >= 2 THEN
    completed_steps := completed_steps + 1;
  END IF;
  
  -- Vérifier profil investisseur
  IF EXISTS (
    SELECT 1 FROM profils_investisseur 
    WHERE client_id = client_uuid
  ) THEN
    completed_steps := completed_steps + 1;
  END IF;
  
  -- Vérifier DER
  IF EXISTS (
    SELECT 1 FROM der_documents 
    WHERE client_id = client_uuid
  ) THEN
    completed_steps := completed_steps + 1;
  END IF;
  
  RETURN (completed_steps * 100 / total_steps);
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement le suivi conformité
CREATE OR REPLACE FUNCTION update_compliance_tracking()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO compliance_tracking (client_id, responsable_id, pourcentage_completude)
  VALUES (
    NEW.client_id, 
    COALESCE(NEW.created_by, NEW.uploaded_by, NEW.generated_by),
    calculate_compliance_completude(NEW.client_id)
  )
  ON CONFLICT (client_id) DO UPDATE SET
    pourcentage_completude = calculate_compliance_completude(NEW.client_id),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur les tables pertinentes
CREATE TRIGGER trigger_update_compliance_kyc
  AFTER INSERT OR UPDATE ON kyc_questionnaires
  FOR EACH ROW EXECUTE FUNCTION update_compliance_tracking();

CREATE TRIGGER trigger_update_compliance_pieces
  AFTER INSERT OR UPDATE ON pieces_justificatives
  FOR EACH ROW EXECUTE FUNCTION update_compliance_tracking();

CREATE TRIGGER trigger_update_compliance_profils
  AFTER INSERT OR UPDATE ON profils_investisseur
  FOR EACH ROW EXECUTE FUNCTION update_compliance_tracking();

CREATE TRIGGER trigger_update_compliance_der
  AFTER INSERT OR UPDATE ON der_documents
  FOR EACH ROW EXECUTE FUNCTION update_compliance_tracking();