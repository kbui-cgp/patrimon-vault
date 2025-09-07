-- Add missing RLS policies for tags_mapping table
CREATE POLICY "Users can view all tag mappings" ON public.tags_mapping
  FOR SELECT USING (true);

CREATE POLICY "Users can create tag mappings" ON public.tags_mapping
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.modeles_documents m 
      WHERE m.id = modele_id AND (
        m.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.utilisateurs 
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Users can update tag mappings" ON public.tags_mapping
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.modeles_documents m 
      WHERE m.id = modele_id AND (
        m.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.utilisateurs 
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Users can delete tag mappings" ON public.tags_mapping
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.modeles_documents m 
      WHERE m.id = modele_id AND (
        m.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.utilisateurs 
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );