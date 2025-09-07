import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { usePiecesJustificatives } from "@/hooks/usePiecesJustificatives";
import { PieceJustificative } from "@/types/regulatory";
import { 
  Upload, 
  FileText, 
  Eye, 
  Download, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle
} from "lucide-react";

interface PiecesJustificativesSectionProps {
  clientId: string;
}

const TYPES_PIECES = [
  { value: 'identite', label: 'Pièce d\'identité', required: true },
  { value: 'domicile', label: 'Justificatif de domicile', required: true },
  { value: 'revenus', label: 'Justificatif de revenus', required: false },
  { value: 'patrimoine', label: 'Justificatif de patrimoine', required: false },
  { value: 'autre', label: 'Autre document', required: false },
];

const STATUT_COLORS = {
  recue: 'secondary',
  en_attente: 'outline',
  validee: 'default',
  rejetee: 'destructive',
} as const;

const STATUT_ICONS = {
  recue: Clock,
  en_attente: AlertTriangle,
  validee: CheckCircle,
  rejetee: XCircle,
};

export function PiecesJustificativesSection({ clientId }: PiecesJustificativesSectionProps) {
  const { 
    pieces, 
    loading, 
    uploadPiece, 
    updatePieceStatus, 
    deletePiece, 
    getPiecesByType,
    getRequiredPiecesStatus 
  } = usePiecesJustificatives(clientId);
  const { toast } = useToast();

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<PieceJustificative['type_piece']>('identite');
  const [uploading, setUploading] = useState(false);

  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<PieceJustificative | null>(null);
  const [validationStatus, setValidationStatus] = useState<PieceJustificative['statut']>('validee');
  const [validationComment, setValidationComment] = useState('');

  const requiredStatus = getRequiredPiecesStatus();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille maximale autorisée est de 10MB.",
          variant: "destructive",
        });
        return;
      }

      // Vérifier le type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Type de fichier non autorisé",
          description: "Seuls les fichiers PDF, JPEG et PNG sont acceptés.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      await uploadPiece(clientId, selectedFile, selectedType);
      toast({
        title: "Document uploadé",
        description: "Le document a été ajouté avec succès.",
      });
      setUploadDialogOpen(false);
      setSelectedFile(null);
    } catch (error) {
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'uploader le document.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleValidation = async () => {
    if (!selectedPiece) return;

    try {
      await updatePieceStatus(selectedPiece.id, validationStatus, validationComment);
      toast({
        title: "Statut mis à jour",
        description: "Le statut du document a été modifié.",
      });
      setValidationDialogOpen(false);
      setSelectedPiece(null);
      setValidationComment('');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (piece: PieceJustificative) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      try {
        await deletePiece(piece.id);
        toast({
          title: "Document supprimé",
          description: "Le document a été supprimé avec succès.",
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le document.",
          variant: "destructive",
        });
      }
    }
  };

  const openValidationDialog = (piece: PieceJustificative) => {
    setSelectedPiece(piece);
    setValidationStatus(piece.statut);
    setValidationComment(piece.commentaire || '');
    setValidationDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statut global */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Pièces justificatives</h3>
          <p className="text-muted-foreground">
            Documents requis pour la conformité LAB/FT
          </p>
        </div>

        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Ajouter un document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type de document</Label>
                <Select value={selectedType} onValueChange={(value: PieceJustificative['type_piece']) => setSelectedType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES_PIECES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label} {type.required && '*'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Fichier</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                />
                <p className="text-xs text-muted-foreground">
                  Formats acceptés : PDF, JPEG, PNG (max 10MB)
                </p>
              </div>

              {selectedFile && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Fichier sélectionné : {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                  {uploading ? 'Upload...' : 'Ajouter'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statut des pièces requises */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TYPES_PIECES.filter(type => type.required).map((type) => {
          const status = requiredStatus[type.value];
          const typePieces = getPiecesByType(type.value);
          
          return (
            <Card key={type.value} className={`border-l-4 ${
              status?.validated ? 'border-l-success' : 
              status?.received ? 'border-l-warning' : 'border-l-destructive'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{type.label}</CardTitle>
                  <Badge variant={
                    status?.validated ? 'default' : 
                    status?.received ? 'secondary' : 'destructive'
                  }>
                    {status?.validated ? 'Validé' : 
                     status?.received ? 'Reçu' : 'Manquant'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {typePieces.length} document(s) uploadé(s)
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Liste des documents */}
      <div className="space-y-4">
        <h4 className="font-medium">Documents uploadés ({pieces.length})</h4>
        
        {pieces.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun document uploadé</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pieces.map((piece) => {
              const typeInfo = TYPES_PIECES.find(t => t.value === piece.type_piece);
              const StatusIcon = STATUT_ICONS[piece.statut];
              
              return (
                <Card key={piece.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{piece.nom_fichier}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{typeInfo?.label}</span>
                            <span>•</span>
                            <span>{piece.taille_fichier ? `${(piece.taille_fichier / 1024 / 1024).toFixed(2)} MB` : 'Taille inconnue'}</span>
                            <span>•</span>
                            <span>{new Date(piece.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={STATUT_COLORS[piece.statut]}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {piece.statut === 'recue' ? 'Reçue' :
                           piece.statut === 'en_attente' ? 'En attente' :
                           piece.statut === 'validee' ? 'Validée' : 'Rejetée'}
                        </Badge>

                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(piece.url_fichier, '_blank')}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openValidationDialog(piece)}
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(piece)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {piece.commentaire && (
                      <div className="mt-3 p-2 bg-muted rounded text-sm">
                        <strong>Commentaire :</strong> {piece.commentaire}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialog de validation */}
      <Dialog open={validationDialogOpen} onOpenChange={setValidationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valider le document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={validationStatus} onValueChange={(value: PieceJustificative['statut']) => setValidationStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recue">Reçue</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="validee">Validée</SelectItem>
                  <SelectItem value="rejetee">Rejetée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Commentaire</Label>
              <Textarea
                id="comment"
                value={validationComment}
                onChange={(e) => setValidationComment(e.target.value)}
                placeholder="Commentaire optionnel..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setValidationDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleValidation}>
                Valider
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}