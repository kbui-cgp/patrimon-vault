export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          adresse: string | null
          created_at: string | null
          created_by: string | null
          date_naissance: string | null
          email: string | null
          id: string
          nom: string
          prenom: string
          situation_patrimoniale: Json | null
          tags: string[] | null
          telephone: string | null
          updated_at: string | null
        }
        Insert: {
          adresse?: string | null
          created_at?: string | null
          created_by?: string | null
          date_naissance?: string | null
          email?: string | null
          id?: string
          nom: string
          prenom: string
          situation_patrimoniale?: Json | null
          tags?: string[] | null
          telephone?: string | null
          updated_at?: string | null
        }
        Update: {
          adresse?: string | null
          created_at?: string | null
          created_by?: string | null
          date_naissance?: string | null
          email?: string | null
          id?: string
          nom?: string
          prenom?: string
          situation_patrimoniale?: Json | null
          tags?: string[] | null
          telephone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
        ]
      }
      conformite: {
        Row: {
          checklist: Json | null
          client_id: string | null
          created_at: string | null
          document_id: string | null
          id: string
          responsable_id: string | null
          statut_global: Database["public"]["Enums"]["conformity_status"] | null
          updated_at: string | null
        }
        Insert: {
          checklist?: Json | null
          client_id?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          responsable_id?: string | null
          statut_global?:
            | Database["public"]["Enums"]["conformity_status"]
            | null
          updated_at?: string | null
        }
        Update: {
          checklist?: Json | null
          client_id?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          responsable_id?: string | null
          statut_global?:
            | Database["public"]["Enums"]["conformity_status"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conformite_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conformite_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conformite_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          client_id: string | null
          created_at: string | null
          created_by: string | null
          fichier_url: string | null
          id: string
          modele_id: string | null
          statut_conformite:
            | Database["public"]["Enums"]["document_status"]
            | null
          type_document: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          fichier_url?: string | null
          id?: string
          modele_id?: string | null
          statut_conformite?:
            | Database["public"]["Enums"]["document_status"]
            | null
          type_document: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          fichier_url?: string | null
          id?: string
          modele_id?: string | null
          statut_conformite?:
            | Database["public"]["Enums"]["document_status"]
            | null
          type_document?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_modele_id_fkey"
            columns: ["modele_id"]
            isOneToOne: false
            referencedRelation: "modeles_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      modeles_documents: {
        Row: {
          contenu_modele: string
          created_at: string | null
          created_by: string | null
          id: string
          nom_modele: string
          tags_detectes: string[] | null
          type_document: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          contenu_modele: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          nom_modele: string
          tags_detectes?: string[] | null
          type_document: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          contenu_modele?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          nom_modele?: string
          tags_detectes?: string[] | null
          type_document?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "modeles_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "utilisateurs"
            referencedColumns: ["id"]
          },
        ]
      }
      tags_mapping: {
        Row: {
          client_field: string
          created_at: string | null
          id: string
          modele_id: string | null
          tag_name: string
        }
        Insert: {
          client_field: string
          created_at?: string | null
          id?: string
          modele_id?: string | null
          tag_name: string
        }
        Update: {
          client_field?: string
          created_at?: string | null
          id?: string
          modele_id?: string | null
          tag_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_mapping_modele_id_fkey"
            columns: ["modele_id"]
            isOneToOne: false
            referencedRelation: "modeles_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      utilisateurs: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nom: string
          password_hash: string | null
          prenom: string
          role: Database["public"]["Enums"]["user_role"]
          two_fa_secret: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          nom: string
          password_hash?: string | null
          prenom: string
          role?: Database["public"]["Enums"]["user_role"]
          two_fa_secret?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nom?: string
          password_hash?: string | null
          prenom?: string
          role?: Database["public"]["Enums"]["user_role"]
          two_fa_secret?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      conformity_status: "En attente" | "Conforme" | "Non conforme" | "En cours"
      document_status: "En attente" | "Validé" | "Rejeté" | "En révision"
      user_role: "admin" | "conseiller" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      conformity_status: ["En attente", "Conforme", "Non conforme", "En cours"],
      document_status: ["En attente", "Validé", "Rejeté", "En révision"],
      user_role: ["admin", "conseiller", "client"],
    },
  },
} as const
