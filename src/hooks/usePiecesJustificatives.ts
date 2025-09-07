import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PieceJustificative } from '@/types/regulatory';

export function usePiecesJustificatives(clientId?: string) {
  const [pieces, setPieces] = useState<PieceJustificative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPieces = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pieces_justificatives')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPieces(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Error fetching pieces:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadPiece = async (
    clientId: string,
    file: File,
    typePiece: PieceJustificative['type_piece']
  ): Promise<PieceJustificative> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${clientId}/${typePiece}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Save piece info to database
      const { data, error } = await supabase
        .from('pieces_justificatives')
        .insert({
          client_id: clientId,
          type_piece: typePiece,
          nom_fichier: file.name,
          url_fichier: publicUrl,
          taille_fichier: file.size,
          type_mime: file.type,
          uploaded_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      const newPiece = data as PieceJustificative;
      setPieces(prev => [newPiece, ...prev]);
      return newPiece;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updatePieceStatus = async (
    pieceId: string,
    statut: PieceJustificative['statut'],
    commentaire?: string
  ): Promise<PieceJustificative> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const updateData: any = {
        statut,
        commentaire,
      };

      if (statut === 'validee') {
        updateData.validated_by = user.id;
        updateData.validated_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('pieces_justificatives')
        .update(updateData)
        .eq('id', pieceId)
        .select()
        .single();

      if (error) throw error;
      
      const updatedPiece = data as PieceJustificative;
      setPieces(prev => 
        prev.map(piece => 
          piece.id === pieceId ? updatedPiece : piece
        )
      );
      return updatedPiece;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deletePiece = async (pieceId: string): Promise<void> => {
    try {
      const piece = pieces.find(p => p.id === pieceId);
      if (!piece) throw new Error('Pièce non trouvée');

      // Delete from storage
      const fileName = piece.url_fichier.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('documents')
          .remove([fileName]);
      }

      // Delete from database
      const { error } = await supabase
        .from('pieces_justificatives')
        .delete()
        .eq('id', pieceId);

      if (error) throw error;
      
      setPieces(prev => prev.filter(piece => piece.id !== pieceId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getPiecesByType = (type: PieceJustificative['type_piece']) => {
    return pieces.filter(piece => piece.type_piece === type);
  };

  const getRequiredPiecesStatus = () => {
    const requiredTypes: PieceJustificative['type_piece'][] = ['identite', 'domicile'];
    const status: Record<string, { received: boolean; validated: boolean }> = {};

    requiredTypes.forEach(type => {
      const typePieces = getPiecesByType(type);
      status[type] = {
        received: typePieces.length > 0,
        validated: typePieces.some(p => p.statut === 'validee'),
      };
    });

    return status;
  };

  useEffect(() => {
    if (clientId) {
      fetchPieces(clientId);
    }
  }, [clientId]);

  return {
    pieces,
    loading,
    error,
    fetchPieces,
    uploadPiece,
    updatePieceStatus,
    deletePiece,
    getPiecesByType,
    getRequiredPiecesStatus,
  };
}

export default usePiecesJustificatives;