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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          arquivo_nome: string | null
          arquivo_url: string | null
          created_at: string | null
          data: string
          descricao: string | null
          fase_alvo: string | null
          gestor_id: string | null
          gestor_nome: string | null
          id: string
          presenca: Json | null
          tipo: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          arquivo_nome?: string | null
          arquivo_url?: string | null
          created_at?: string | null
          data: string
          descricao?: string | null
          fase_alvo?: string | null
          gestor_id?: string | null
          gestor_nome?: string | null
          id?: string
          presenca?: Json | null
          tipo?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          arquivo_nome?: string | null
          arquivo_url?: string | null
          created_at?: string | null
          data?: string
          descricao?: string | null
          fase_alvo?: string | null
          gestor_id?: string | null
          gestor_nome?: string | null
          id?: string
          presenca?: Json | null
          tipo?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      configuracoes: {
        Row: {
          id: string
          valor: Json | null
        }
        Insert: {
          id: string
          valor?: Json | null
        }
        Update: {
          id?: string
          valor?: Json | null
        }
        Relationships: []
      }
      conteudos: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          imgs: string[] | null
          titulo: string
          trilha: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          imgs?: string[] | null
          titulo: string
          trilha: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          imgs?: string[] | null
          titulo?: string
          trilha?: string
        }
        Relationships: []
      }
      descricao_projeto: {
        Row: {
          conteudo: string | null
          created_at: string | null
          id: string
          ordem: number | null
          titulo: string
        }
        Insert: {
          conteudo?: string | null
          created_at?: string | null
          id?: string
          ordem?: number | null
          titulo: string
        }
        Update: {
          conteudo?: string | null
          created_at?: string | null
          id?: string
          ordem?: number | null
          titulo?: string
        }
        Relationships: []
      }
      encontros: {
        Row: {
          created_at: string | null
          data: string
          descricao: string | null
          id: string
          titulo: string
        }
        Insert: {
          created_at?: string | null
          data: string
          descricao?: string | null
          id?: string
          titulo: string
        }
        Update: {
          created_at?: string | null
          data?: string
          descricao?: string | null
          id?: string
          titulo?: string
        }
        Relationships: []
      }
      estagiarios: {
        Row: {
          arquivado_em: string | null
          arquivado_por: string | null
          atencao: boolean | null
          created_at: string | null
          excluir_em: string | null
          gestor_funcional: string | null
          id: string
          meses: string[] | null
          motivo_arquivamento: string | null
          nome: string
          obs: string | null
          perfil: Json | null
          regional_id: string | null
          senha_hash: string | null
          trilha_checks: Json | null
        }
        Insert: {
          arquivado_em?: string | null
          arquivado_por?: string | null
          atencao?: boolean | null
          created_at?: string | null
          excluir_em?: string | null
          gestor_funcional?: string | null
          id?: string
          meses?: string[] | null
          motivo_arquivamento?: string | null
          nome: string
          obs?: string | null
          perfil?: Json | null
          regional_id?: string | null
          senha_hash?: string | null
          trilha_checks?: Json | null
        }
        Update: {
          arquivado_em?: string | null
          arquivado_por?: string | null
          atencao?: boolean | null
          created_at?: string | null
          excluir_em?: string | null
          gestor_funcional?: string | null
          id?: string
          meses?: string[] | null
          motivo_arquivamento?: string | null
          nome?: string
          obs?: string | null
          perfil?: Json | null
          regional_id?: string | null
          senha_hash?: string | null
          trilha_checks?: Json | null
        }
        Relationships: []
      }
      feedbacks: {
        Row: {
          autor_nome: string
          autor_tipo: string
          conteudo: string
          created_at: string | null
          data: string
          estagiario_id: string | null
          evolucao: string | null
          frequencia: string | null
          id: string
        }
        Insert: {
          autor_nome: string
          autor_tipo: string
          conteudo: string
          created_at?: string | null
          data: string
          estagiario_id?: string | null
          evolucao?: string | null
          frequencia?: string | null
          id?: string
        }
        Update: {
          autor_nome?: string
          autor_tipo?: string
          conteudo?: string
          created_at?: string | null
          data?: string
          estagiario_id?: string | null
          evolucao?: string | null
          frequencia?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_estagiario_id_fkey"
            columns: ["estagiario_id"]
            isOneToOne: false
            referencedRelation: "estagiarios"
            referencedColumns: ["id"]
          },
        ]
      }
      gestores: {
        Row: {
          agencia: string
          created_at: string | null
          funcional: string
          id: string
          nome: string
          permissoes: Json | null
          regional_id: string | null
          senha_hash: string | null
          tipo_gestor: string | null
        }
        Insert: {
          agencia?: string
          created_at?: string | null
          funcional: string
          id?: string
          nome: string
          permissoes?: Json | null
          regional_id?: string | null
          senha_hash?: string | null
          tipo_gestor?: string | null
        }
        Update: {
          agencia?: string
          created_at?: string | null
          funcional?: string
          id?: string
          nome?: string
          permissoes?: Json | null
          regional_id?: string | null
          senha_hash?: string | null
          tipo_gestor?: string | null
        }
        Relationships: []
      }
      regionais: {
        Row: {
          ativa: boolean | null
          created_at: string | null
          id: string
          nome: string
          slug: string
        }
        Insert: {
          ativa?: boolean | null
          created_at?: string | null
          id?: string
          nome: string
          slug: string
        }
        Update: {
          ativa?: boolean | null
          created_at?: string | null
          id?: string
          nome?: string
          slug?: string
        }
        Relationships: []
      }
      producao_trimestral: {
        Row: {
          created_at: string | null
          estagiario_id: string | null
          id: string
          meta: number | null
          producao: number | null
          tri_ref: string
        }
        Insert: {
          created_at?: string | null
          estagiario_id?: string | null
          id?: string
          meta?: number | null
          producao?: number | null
          tri_ref: string
        }
        Update: {
          created_at?: string | null
          estagiario_id?: string | null
          id?: string
          meta?: number | null
          producao?: number | null
          tri_ref?: string
        }
        Relationships: [
          {
            foreignKeyName: "producao_trimestral_estagiario_id_fkey"
            columns: ["estagiario_id"]
            isOneToOne: false
            referencedRelation: "estagiarios"
            referencedColumns: ["id"]
          },
        ]
      }
      "Projetos Estagiários Itaú": {
        Row: {
          categoria: string | null
          id: string
          nome: string | null
          obs: string | null
          status: string | null
          valor: number | null
        }
        Insert: {
          categoria?: string | null
          id?: string
          nome?: string | null
          obs?: string | null
          status?: string | null
          valor?: number | null
        }
        Update: {
          categoria?: string | null
          id?: string
          nome?: string | null
          obs?: string | null
          status?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      renan_piscinas_app_state: {
        Row: {
          data: Json
          id: string
          updated_at: string
        }
        Insert: {
          data?: Json
          id: string
          updated_at?: string
        }
        Update: {
          data?: Json
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      snapshots: {
        Row: {
          created_at: string | null
          estagiario_id: string | null
          id: string
          meta: number | null
          score: number | null
          score_producao: number | null
          score_trilha: number | null
          total_producao: number | null
          tri_ref: string
        }
        Insert: {
          created_at?: string | null
          estagiario_id?: string | null
          id?: string
          meta?: number | null
          score?: number | null
          score_producao?: number | null
          score_trilha?: number | null
          total_producao?: number | null
          tri_ref: string
        }
        Update: {
          created_at?: string | null
          estagiario_id?: string | null
          id?: string
          meta?: number | null
          score?: number | null
          score_producao?: number | null
          score_trilha?: number | null
          total_producao?: number | null
          tri_ref?: string
        }
        Relationships: [
          {
            foreignKeyName: "snapshots_estagiario_id_fkey"
            columns: ["estagiario_id"]
            isOneToOne: false
            referencedRelation: "estagiarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

