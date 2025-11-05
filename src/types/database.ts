export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          excerpt: string
          author_id: string
          category: string
          published: boolean
          featured_image?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          excerpt: string
          author_id: string
          category: string
          published?: boolean
          featured_image?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string
          author_id?: string
          category?: string
          published?: boolean
          featured_image?: string
          created_at?: string
          updated_at?: string
        }
      }
      orientation_resources: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          category: 'fields' | 'schools' | 'study-abroad' | 'procedures' | 'comparisons'
          featured: boolean
          premium: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          category: 'fields' | 'schools' | 'study-abroad' | 'procedures' | 'comparisons'
          featured?: boolean
          premium?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          category?: 'fields' | 'schools' | 'study-abroad' | 'procedures' | 'comparisons'
          featured?: boolean
          premium?: boolean
          created_at?: string
          updated_at?: string
        }
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
  }
}

