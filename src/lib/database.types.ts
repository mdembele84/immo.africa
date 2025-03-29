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
      countries: {
        Row: {
          code: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          code: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          code?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          title: string
          description: string | null
          type: 'land' | 'house'
          price: number
          image_url: string | null
          location: string
          country_code: string
          coordinates: [number, number] | null
          status: 'available' | 'sold'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type: 'land' | 'house'
          price: number
          image_url?: string | null
          location: string
          country_code: string
          coordinates?: [number, number] | null
          status?: 'available' | 'sold'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: 'land' | 'house'
          price?: number
          image_url?: string | null
          location?: string
          country_code?: string
          coordinates?: [number, number] | null
          status?: 'available' | 'sold'
          created_at?: string
          updated_at?: string
        }
      }
      property_payment_schedules: {
        Row: {
          id: string
          property_id: string
          initial_payment: number
          monthly_payment: number
          duration: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          initial_payment: number
          monthly_payment: number
          duration: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          initial_payment?: number
          monthly_payment?: number
          duration?: number
          created_at?: string
          updated_at?: string
        }
      }
      property_details: {
        Row: {
          id: string
          property_id: string
          surface: number
          bedrooms: number | null
          bathrooms: number | null
          matterport_id: string | null
          floor_plan_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          surface: number
          bedrooms?: number | null
          bathrooms?: number | null
          matterport_id?: string | null
          floor_plan_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          surface?: number
          bedrooms?: number | null
          bathrooms?: number | null
          matterport_id?: string | null
          floor_plan_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      required_documents: {
        Row: {
          id: string
          property_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      property_purchases: {
        Row: {
          id: string
          user_id: string
          property_id: string
          status: 'pending_kyc' | 'pending_documents' | 'pending_payment' | 'processing' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id: string
          status: 'pending_kyc' | 'pending_documents' | 'pending_payment' | 'processing' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string
          status?: 'pending_kyc' | 'pending_documents' | 'pending_payment' | 'processing' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      purchase_messages: {
        Row: {
          id: string
          purchase_id: string
          user_id: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          purchase_id: string
          user_id: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          purchase_id?: string
          user_id?: string
          message?: string
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          last_name: string | null
          first_name: string | null
          country: string | null
          phone: string | null
          professional_activity: string | null
          revenue_range: string | null
          has_eu_residency: boolean | null
          kyc_verified: boolean
          kyc_verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          last_name?: string | null
          first_name?: string | null
          country?: string | null
          phone?: string | null
          professional_activity?: string | null
          revenue_range?: string | null
          has_eu_residency?: boolean | null
          kyc_verified?: boolean
          kyc_verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          last_name?: string | null
          first_name?: string | null
          country?: string | null
          phone?: string | null
          professional_activity?: string | null
          revenue_range?: string | null
          has_eu_residency?: boolean | null
          kyc_verified?: boolean
          kyc_verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}