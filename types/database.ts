// types/database.ts - Restaurant type definitions
// This file defines the Restaurant interface based on the Supabase database schema

export interface Restaurant {
  photo_storage_path: any;
  id: string;
  google_place_id: string;
  name: string;
  display_name?: string;
  formatted_address?: string;
  short_formatted_address?: string;
  location_lat?: number;
  location_lng?: number;
  location_city?: string;
  plus_code?: string;
  business_status?: string;
  primary_type?: string;
  types?: string[];
  website_uri?: string;
  phone_number?: string;
  international_phone_number?: string;
  rating?: number;
  user_rating_count?: number;
  price_level?: number;
  price_range?: {
    startPrice?: { currencyCode: string; units: string };
    endPrice?: { currencyCode: string; units: string };
  };
  regular_opening_hours?: any;
  current_opening_hours?: {
    open_now?: boolean;
    periods?: Array<{
      open?: { time: string };
      close?: { time: string };
    }>;
  };
  
  // Service offerings
  serves_breakfast?: boolean;
  serves_brunch?: boolean;
  serves_lunch?: boolean;
  serves_dinner?: boolean;
  serves_beer?: boolean;
  serves_wine?: boolean;
  serves_cocktails?: boolean;
  serves_coffee?: boolean;
  serves_dessert?: boolean;
  serves_vegetarian_food?: boolean;
  
  // Service types
  dine_in?: boolean;
  takeout?: boolean;
  delivery?: boolean;
  curbside_pickup?: boolean;
  
  // Amenities
  reservable?: boolean;
  outdoor_seating?: boolean;
  good_for_children?: boolean;
  good_for_groups?: boolean;
  good_for_watching_sports?: boolean;
  live_music?: boolean;
  allows_dogs?: boolean;
  restroom?: boolean;
  menu_for_children?: boolean;
  
  // Complex fields
  accessibility_options?: any;
  parking_options?: any;
  payment_options?: any;
  photos?: string[];
  primary_photo_url?: string; // New field for cached photo URL
  photo_processed_at?: string; // New field for tracking photo processing
  
  // Content
  editorial_summary?: string;
  reviews_summary?: string;
  generative_summary?: string;
  
  // Metadata
  last_synced?: string;
  sync_version?: number;
  is_active?: boolean;
  
  // Computed fields (not in database)
  distance?: number;
  neighborhood?: string;
  cuisine_types?: string[];
}

// Wizard state interface for discovery flow
export interface WizardState {
  location: string;
  mealTypes: string[];
  budget: number[];
  cuisineTypes: string[];
  dietary: string[];
  features: string[];
}

// Filter interface for restaurant queries
export interface RestaurantFilters {
  location?: string;
  mealTypes?: string[];
  budget?: number[];
  cuisineTypes?: string[];
  dietary?: string[];
  features?: string[];
  isOpen?: boolean;
  hasPhotos?: boolean;
  minRating?: number;
}

// Sort options for restaurant results
export type SortOption = 'distance' | 'rating' | 'price' | 'openNow';

// Restaurant search options
export interface RestaurantSearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: SortOption;
  sortOrder?: 'asc' | 'desc';
}