export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          city: string | null
          lat: number | null
          lng: number | null
          bio: string | null
          is_premium: boolean
          is_business: boolean
          is_admin: boolean
          onboarding_completed: boolean
          daily_swipe_count: number
          last_swipe_reset: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          city?: string | null
          lat?: number | null
          lng?: number | null
          bio?: string | null
          is_premium?: boolean
          is_business?: boolean
          is_admin?: boolean
          onboarding_completed?: boolean
          daily_swipe_count?: number
          last_swipe_reset?: string
          created_at?: string
          updated_at?: string
        }
        Update: Record<string, unknown>
        Relationships: never[]
      }
      pets: {
        Row: {
          id: string
          owner_id: string
          name: string
          species: string
          breed: string | null
          age_years: number | null
          age_months: number | null
          gender: "male" | "female" | null
          size: "small" | "medium" | "large" | "xlarge" | null
          description: string | null
          is_vaccinated: boolean
          is_sterilized: boolean
          allergies: string | null
          interests: string[] | null
          available_for_breeding: boolean
          breeding_conditions: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          species: string
          breed?: string | null
          age_years?: number | null
          age_months?: number | null
          gender?: "male" | "female" | null
          size?: "small" | "medium" | "large" | "xlarge" | null
          description?: string | null
          is_vaccinated?: boolean
          is_sterilized?: boolean
          allergies?: string | null
          interests?: string[] | null
          available_for_breeding?: boolean
          breeding_conditions?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Record<string, unknown>
        Relationships: never[]
      }
      pet_photos: {
        Row: {
          id: string
          pet_id: string
          url: string
          is_primary: boolean
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          pet_id: string
          url: string
          is_primary?: boolean
          position?: number
          created_at?: string
        }
        Update: Record<string, unknown>
        Relationships: never[]
      }
      swipes: {
        Row: {
          id: string
          swiper_id: string
          swiped_pet_id: string
          direction: "left" | "right"
          purpose: "walk" | "breeding" | "socializing" | "any"
          created_at: string
        }
        Insert: {
          id?: string
          swiper_id: string
          swiped_pet_id: string
          direction: "left" | "right"
          purpose?: "walk" | "breeding" | "socializing" | "any"
          created_at?: string
        }
        Update: Record<string, unknown>
        Relationships: never[]
      }
      matches: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          pet1_id: string
          pet2_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          pet1_id: string
          pet2_id: string
          created_at?: string
        }
        Update: Record<string, unknown>
        Relationships: never[]
      }
      conversations: {
        Row: {
          id: string
          match_id: string
          last_message_at: string
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          last_message_at?: string
          created_at?: string
        }
        Update: Record<string, unknown>
        Relationships: never[]
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string | null
          image_url: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content?: string | null
          image_url?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: Record<string, unknown>
        Relationships: never[]
      }
      blocked_users: {
        Row: {
          blocker_id: string
          blocked_id: string
          created_at: string
        }
        Insert: {
          blocker_id: string
          blocked_id: string
          created_at?: string
        }
        Update: Record<string, unknown>
        Relationships: never[]
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_id: string
          reason: string
          details: string | null
          status: "pending" | "reviewed" | "resolved"
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_id: string
          reason: string
          details?: string | null
          status?: "pending" | "reviewed" | "resolved"
          created_at?: string
        }
        Update: Record<string, unknown>
        Relationships: never[]
      }
      dog_parks: {
        Row: {
          id: string
          name: string
          address: string
          city: string
          lat: number
          lng: number
          is_fenced: boolean
          has_water_fountain: boolean
          opening_hours: string | null
          description: string | null
          added_by: string | null
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          city: string
          lat: number
          lng: number
          is_fenced?: boolean
          has_water_fountain?: boolean
          opening_hours?: string | null
          description?: string | null
          added_by?: string | null
          is_approved?: boolean
          created_at?: string
        }
        Update: Record<string, unknown>
        Relationships: never[]
      }
      veterinarians: {
        Row: {
          id: string
          business_owner_id: string | null
          name: string
          address: string
          city: string
          lat: number
          lng: number
          phone: string | null
          email: string | null
          website: string | null
          opening_hours: Json | null
          specializations: string[] | null
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_owner_id?: string | null
          name: string
          address: string
          city: string
          lat: number
          lng: number
          phone?: string | null
          email?: string | null
          website?: string | null
          opening_hours?: Json | null
          specializations?: string[] | null
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Record<string, unknown>
        Relationships: never[]
      }
      pet_shops: {
        Row: {
          id: string
          business_owner_id: string | null
          name: string
          address: string
          city: string
          lat: number
          lng: number
          phone: string | null
          website: string | null
          opening_hours: Json | null
          product_types: string[] | null
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_owner_id?: string | null
          name: string
          address: string
          city: string
          lat: number
          lng: number
          phone?: string | null
          website?: string | null
          opening_hours?: Json | null
          product_types?: string[] | null
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Record<string, unknown>
        Relationships: never[]
      }
      reviews: {
        Row: {
          id: string
          reviewer_id: string
          entity_type: "dog_park" | "veterinarian" | "pet_shop"
          entity_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          reviewer_id: string
          entity_type: "dog_park" | "veterinarian" | "pet_shop"
          entity_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: Record<string, unknown>
        Relationships: never[]
      }
      transports: {
        Row: {
          id: string
          driver_id: string
          from_city: string
          to_city: string
          departure_date: string
          departure_time: string | null
          available_spots: number
          price_per_pet: number | null
          description: string | null
          status: "active" | "full" | "completed" | "cancelled"
          created_at: string
        }
        Insert: {
          id?: string
          driver_id: string
          from_city: string
          to_city: string
          departure_date: string
          departure_time?: string | null
          available_spots?: number
          price_per_pet?: number | null
          description?: string | null
          status?: "active" | "full" | "completed" | "cancelled"
          created_at?: string
        }
        Update: Record<string, unknown>
        Relationships: never[]
      }
      transport_bookings: {
        Row: {
          id: string
          transport_id: string
          passenger_id: string
          pet_id: string | null
          status: "pending" | "confirmed" | "completed" | "cancelled"
          created_at: string
        }
        Insert: {
          id?: string
          transport_id: string
          passenger_id: string
          pet_id?: string | null
          status?: "pending" | "confirmed" | "completed" | "cancelled"
          created_at?: string
        }
        Update: Record<string, unknown>
        Relationships: never[]
      }
      transport_reviews: {
        Row: {
          id: string
          booking_id: string
          reviewer_id: string
          reviewed_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          reviewer_id: string
          reviewed_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: Record<string, unknown>
        Relationships: never[]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Pet = Database["public"]["Tables"]["pets"]["Row"]
export type PetPhoto = Database["public"]["Tables"]["pet_photos"]["Row"]
export type Swipe = Database["public"]["Tables"]["swipes"]["Row"]
export type Match = Database["public"]["Tables"]["matches"]["Row"]
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"]
export type Message = Database["public"]["Tables"]["messages"]["Row"]
export type DogPark = Database["public"]["Tables"]["dog_parks"]["Row"]
export type Veterinarian = Database["public"]["Tables"]["veterinarians"]["Row"]
export type PetShop = Database["public"]["Tables"]["pet_shops"]["Row"]
export type Review = Database["public"]["Tables"]["reviews"]["Row"]
export type Transport = Database["public"]["Tables"]["transports"]["Row"]
export type TransportBooking = Database["public"]["Tables"]["transport_bookings"]["Row"]
export type TransportReview = Database["public"]["Tables"]["transport_reviews"]["Row"]
export type Report = Database["public"]["Tables"]["reports"]["Row"]

export type PetWithPhotos = Pet & { pet_photos: PetPhoto[]; profiles: Profile }
export type MatchWithDetails = Match & {
  pet1: PetWithPhotos
  pet2: PetWithPhotos
  profile1: Profile
  profile2: Profile
  conversation: Conversation | null
}
export type ConversationWithDetails = Conversation & {
  match: Match & {
    pet1: PetWithPhotos
    pet2: PetWithPhotos
    user1: Profile
    user2: Profile
  }
  last_message: Message | null
  unread_count: number
}
