import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database Tables Interface
export interface Tables {
  users: {
    Row: {
      id: string;
      email: string;
      user_type: 'customer' | 'driver' | 'biker';
      full_name: string;
      phone_number: string;
      avatar_url?: string;
      is_online: boolean;
      last_seen: string;
      location_lat?: number;
      location_lng?: number;
      fcm_token?: string;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      email: string;
      user_type: 'customer' | 'driver' | 'biker';
      full_name: string;
      phone_number: string;
      avatar_url?: string;
      is_online?: boolean;
      last_seen?: string;
      location_lat?: number;
      location_lng?: number;
      fcm_token?: string;
    };
    Update: {
      email?: string;
      user_type?: 'customer' | 'driver' | 'biker';
      full_name?: string;
      phone_number?: string;
      avatar_url?: string;
      is_online?: boolean;
      last_seen?: string;
      location_lat?: number;
      location_lng?: number;
      fcm_token?: string;
    };
  };
  
  bookings: {
    Row: {
      id: string;
      customer_id: string;
      driver_id?: string;
      biker_id?: string;
      pickup_location: string;
      pickup_lat: number;
      pickup_lng: number;
      dropoff_location: string;
      dropoff_lat: number;
      dropoff_lng: number;
      booking_type: 'ride' | 'delivery' | 'emergency';
      status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
      duration_hours?: number;
      estimated_fare: number;
      actual_fare?: number;
      payment_method: string;
      payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
      special_instructions?: string;
      created_at: string;
      updated_at: string;
      scheduled_for?: string;
    };
    Insert: {
      id?: string;
      customer_id: string;
      driver_id?: string;
      biker_id?: string;
      pickup_location: string;
      pickup_lat: number;
      pickup_lng: number;
      dropoff_location: string;
      dropoff_lat: number;
      dropoff_lng: number;
      booking_type: 'ride' | 'delivery' | 'emergency';
      status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
      duration_hours?: number;
      estimated_fare: number;
      actual_fare?: number;
      payment_method: string;
      payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
      special_instructions?: string;
      scheduled_for?: string;
    };
    Update: {
      driver_id?: string;
      biker_id?: string;
      status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
      actual_fare?: number;
      payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
    };
  };

  locations: {
    Row: {
      id: string;
      user_id: string;
      user_type: 'customer' | 'driver' | 'biker';
      latitude: number;
      longitude: number;
      accuracy?: number;
      heading?: number;
      speed?: number;
      timestamp: string;
      is_active: boolean;
    };
    Insert: {
      id?: string;
      user_id: string;
      user_type: 'customer' | 'driver' | 'biker';
      latitude: number;
      longitude: number;
      accuracy?: number;
      heading?: number;
      speed?: number;
      timestamp?: string;
      is_active?: boolean;
    };
    Update: {
      latitude?: number;
      longitude?: number;
      accuracy?: number;
      heading?: number;
      speed?: number;
      timestamp?: string;
      is_active?: boolean;
    };
  };

  messages: {
    Row: {
      id: string;
      booking_id: string;
      sender_id: string;
      sender_type: 'customer' | 'driver' | 'biker' | 'system';
      message: string;
      message_type: 'text' | 'location' | 'image' | 'system';
      is_read: boolean;
      created_at: string;
    };
    Insert: {
      id?: string;
      booking_id: string;
      sender_id: string;
      sender_type: 'customer' | 'driver' | 'biker' | 'system';
      message: string;
      message_type?: 'text' | 'location' | 'image' | 'system';
      is_read?: boolean;
    };
    Update: {
      is_read?: boolean;
    };
  };

  emergency_alerts: {
    Row: {
      id: string;
      user_id: string;
      user_type: 'customer' | 'driver' | 'biker';
      latitude: number;
      longitude: number;
      location_description: string;
      alert_type: 'general' | 'medical' | 'security' | 'vehicle';
      status: 'active' | 'responded' | 'resolved' | 'cancelled';
      message?: string;
      responder_id?: string;
      response_time?: string;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      user_id: string;
      user_type: 'customer' | 'driver' | 'biker';
      latitude: number;
      longitude: number;
      location_description: string;
      alert_type: 'general' | 'medical' | 'security' | 'vehicle';
      status?: 'active' | 'responded' | 'resolved' | 'cancelled';
      message?: string;
      responder_id?: string;
    };
    Update: {
      status?: 'active' | 'responded' | 'resolved' | 'cancelled';
      responder_id?: string;
      response_time?: string;
    };
  };
}

export type Database = {
  public: {
    Tables: Tables;
  };
};

// Real-time channel names
export const REALTIME_CHANNELS = {
  BOOKINGS: 'bookings',
  LOCATIONS: 'locations',
  MESSAGES: 'messages',
  EMERGENCY_ALERTS: 'emergency_alerts',
  USER_STATUS: 'user_status',
} as const;

// Helper function to get user-specific channel
export const getUserChannel = (userId: string, channelType: string) => {
  return `${channelType}:${userId}`;
};

// Helper function to get booking-specific channel
export const getBookingChannel = (bookingId: string) => {
  return `${REALTIME_CHANNELS.BOOKINGS}:${bookingId}`;
};