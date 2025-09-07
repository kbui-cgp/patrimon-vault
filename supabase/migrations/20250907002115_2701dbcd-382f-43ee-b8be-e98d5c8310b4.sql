-- Create enum types
CREATE TYPE public.document_status AS ENUM ('En attente', 'Validé', 'Rejeté', 'En révision');
CREATE TYPE public.user_role AS ENUM ('admin', 'conseiller', 'client');
CREATE TYPE public.conformity_status AS ENUM ('En attente', 'Conforme', 'Non conforme', 'En cours');

-- Create tables
CREATE TABLE public.utilisateurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'conseiller',
  password_hash TEXT,
  two_fa_secret TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  date_naissance DATE,
  email TEXT,
  telephone TEXT,
  adresse TEXT,
  situation_patrimoniale JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES public.utilisateurs(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.modeles_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_modele TEXT NOT NULL,
  type_document TEXT NOT NULL,
  contenu_modele TEXT NOT NULL,
  tags_detectes TEXT[] DEFAULT '{}',
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES public.utilisateurs(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  modele_id UUID REFERENCES public.modeles_documents(id),
  type_document TEXT NOT NULL,
  fichier_url TEXT,
  version INTEGER DEFAULT 1,
  statut_conformite document_status DEFAULT 'En attente',
  created_by UUID REFERENCES public.utilisateurs(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.tags_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modele_id UUID REFERENCES public.modeles_documents(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  client_field TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.conformite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  checklist JSONB DEFAULT '{}',
  statut_global conformity_status DEFAULT 'En attente',
  responsable_id UUID REFERENCES public.utilisateurs(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_clients_created_by ON public.clients(created_by);
CREATE INDEX idx_documents_client_id ON public.documents(client_id);
CREATE INDEX idx_documents_created_by ON public.documents(created_by);
CREATE INDEX idx_conformite_client_id ON public.conformite(client_id);
CREATE INDEX idx_conformite_responsable_id ON public.conformite(responsable_id);

-- Enable Row Level Security
ALTER TABLE public.utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modeles_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conformite ENABLE ROW LEVEL SECURITY;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('modeles', 'modeles', false);

-- RLS Policies for utilisateurs
CREATE POLICY "Users can view their own profile" ON public.utilisateurs
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.utilisateurs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.utilisateurs 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for clients
CREATE POLICY "Conseillers can view their clients" ON public.clients
  FOR SELECT USING (
    created_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.utilisateurs 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Conseillers can create clients" ON public.clients
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Conseillers can update their clients" ON public.clients
  FOR UPDATE USING (
    created_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.utilisateurs 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for documents
CREATE POLICY "Users can view documents of their clients" ON public.documents
  FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.clients c 
      WHERE c.id = client_id AND c.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.utilisateurs 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create documents" ON public.documents
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update documents" ON public.documents
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.clients c 
      WHERE c.id = client_id AND c.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.utilisateurs 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for modeles_documents
CREATE POLICY "Users can view all templates" ON public.modeles_documents
  FOR SELECT USING (true);

CREATE POLICY "Users can create templates" ON public.modeles_documents
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their templates" ON public.modeles_documents
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.utilisateurs 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for conformite
CREATE POLICY "Users can view conformity of their clients" ON public.conformite
  FOR SELECT USING (
    responsable_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.clients c 
      WHERE c.id = client_id AND c.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.utilisateurs 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create conformity records" ON public.conformite
  FOR INSERT WITH CHECK (responsable_id = auth.uid());

CREATE POLICY "Users can update conformity records" ON public.conformite
  FOR UPDATE USING (
    responsable_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.utilisateurs 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Storage policies
CREATE POLICY "Users can view documents based on client access" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM public.documents d
      JOIN public.clients c ON d.client_id = c.id
      WHERE d.fichier_url = name AND (
        c.created_by = auth.uid() OR
        d.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.utilisateurs 
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can view templates" ON storage.objects
  FOR SELECT USING (bucket_id = 'modeles');

CREATE POLICY "Users can upload templates" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'modeles');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_utilisateurs_updated_at
  BEFORE UPDATE ON public.utilisateurs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_modeles_updated_at
  BEFORE UPDATE ON public.modeles_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conformite_updated_at
  BEFORE UPDATE ON public.conformite
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();