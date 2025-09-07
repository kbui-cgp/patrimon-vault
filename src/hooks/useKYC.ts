import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { KYCQuestionnaire, CreateKYCData, UpdateKYCData } from '@/types/regulatory';

export function useKYC(clientId?: string) {
  const [kyc, setKyc] = useState<KYCQuestionnaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKYC = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('kyc_questionnaires')
        .select('*')
        .eq('client_id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setKyc(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Error fetching KYC:', err);
    } finally {
      setLoading(false);
    }
  };

  const createKYC = async (kycData: CreateKYCData): Promise<KYCQuestionnaire> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { data, error } = await supabase
        .from('kyc_questionnaires')
        .insert({
          ...kycData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      const newKYC = data as KYCQuestionnaire;
      setKyc(newKYC);
      return newKYC;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateKYC = async (kycId: string, updateData: UpdateKYCData): Promise<KYCQuestionnaire> => {
    try {
      const { data, error } = await supabase
        .from('kyc_questionnaires')
        .update(updateData)
        .eq('id', kycId)
        .select()
        .single();

      if (error) throw error;
      
      const updatedKYC = data as KYCQuestionnaire;
      setKyc(updatedKYC);
      return updatedKYC;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const saveKYCStep = async (
    kycId: string, 
    etape: number, 
    stepData: Partial<KYCQuestionnaire>
  ): Promise<KYCQuestionnaire> => {
    try {
      const updateData: UpdateKYCData = {
        etape_courante: etape,
        ...stepData,
      };

      return await updateKYC(kycId, updateData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const completeKYC = async (kycId: string): Promise<KYCQuestionnaire> => {
    try {
      return await updateKYC(kycId, {
        statut: 'complete',
        etape_courante: 7, // Toutes les étapes terminées
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la finalisation';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchKYC(clientId);
    }
  }, [clientId]);

  return {
    kyc,
    loading,
    error,
    fetchKYC,
    createKYC,
    updateKYC,
    saveKYCStep,
    completeKYC,
  };
}

export default useKYC;