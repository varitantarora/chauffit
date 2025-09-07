import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, REALTIME_CHANNELS, getUserChannel, getBookingChannel } from '../config/supabase';
import * as Location from 'expo-location';

export interface LocationUpdate {
  userId: string;
  userType: 'customer' | 'driver' | 'biker';
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface BookingUpdate {
  id: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  driverId?: string;
  bikerId?: string;
  driverLocation?: { lat: number; lng: number };
  estimatedArrival?: string;
  fare?: number;
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  userType: 'customer' | 'driver' | 'biker';
  latitude: number;
  longitude: number;
  locationDescription: string;
  alertType: 'general' | 'medical' | 'security' | 'vehicle';
  message?: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderType: 'customer' | 'driver' | 'biker' | 'system';
  message: string;
  messageType: 'text' | 'location' | 'image' | 'system';
  timestamp: number;
  isRead: boolean;
}

class SupabaseRealTimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private isConnected = false;
  private userId: string | null = null;
  private userType: 'customer' | 'driver' | 'biker' | null = null;

  // Initialize the service
  async initialize(userId: string, userType: 'customer' | 'driver' | 'biker') {
    this.userId = userId;
    this.userType = userType;
    
    try {
      // Set user online status
      await this.setUserOnlineStatus(true);
      this.isConnected = true;
      console.log('Supabase realtime service initialized');
    } catch (error) {
      console.error('Failed to initialize Supabase realtime service:', error);
    }
  }

  // Clean up when service is destroyed
  async cleanup() {
    try {
      // Set user offline
      if (this.userId) {
        await this.setUserOnlineStatus(false);
      }

      // Unsubscribe from all channels
      this.channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      this.channels.clear();
      
      this.isConnected = false;
      console.log('Supabase realtime service cleaned up');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Set user online/offline status
  private async setUserOnlineStatus(isOnline: boolean) {
    if (!this.userId) return;

    try {
      await supabase
        .from('users')
        .update({
          is_online: isOnline,
          last_seen: new Date().toISOString(),
        })
        .eq('id', this.userId);
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  }

  // Location tracking
  async startLocationTracking(onLocationUpdate?: (location: LocationUpdate) => void) {
    if (!this.userId || !this.userType) return;

    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission not granted');
        return;
      }

      // Subscribe to other users' location updates
      const locationChannel = supabase
        .channel(REALTIME_CHANNELS.LOCATIONS)
        .on('postgres_changes', 
          {
            event: 'INSERT',
            schema: 'public',
            table: 'locations',
          },
          (payload) => {
            if (payload.new && payload.new.user_id !== this.userId) {
              const locationUpdate: LocationUpdate = {
                userId: payload.new.user_id,
                userType: payload.new.user_type,
                latitude: payload.new.latitude,
                longitude: payload.new.longitude,
                accuracy: payload.new.accuracy,
                heading: payload.new.heading,
                speed: payload.new.speed,
                timestamp: new Date(payload.new.timestamp).getTime(),
              };
              onLocationUpdate?.(locationUpdate);
            }
          }
        )
        .subscribe();

      this.channels.set('locations', locationChannel);

      // Start sending own location updates
      const locationWatcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Or every 10 meters
        },
        async (location) => {
          await this.updateLocation(location);
        }
      );

      // Store the watcher for cleanup
      (locationChannel as any).locationWatcher = locationWatcher;

    } catch (error) {
      console.error('Failed to start location tracking:', error);
    }
  }

  // Update user location
  private async updateLocation(location: Location.LocationObject) {
    if (!this.userId || !this.userType) return;

    try {
      await supabase
        .from('locations')
        .insert({
          user_id: this.userId,
          user_type: this.userType,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy || undefined,
          heading: location.coords.heading || undefined,
          speed: location.coords.speed || undefined,
          timestamp: new Date(location.timestamp).toISOString(),
          is_active: true,
        });
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  }

  // Stop location tracking
  stopLocationTracking() {
    const locationChannel = this.channels.get('locations');
    if (locationChannel) {
      const watcher = (locationChannel as any).locationWatcher;
      if (watcher) {
        watcher.remove();
      }
      supabase.removeChannel(locationChannel);
      this.channels.delete('locations');
    }
  }

  // Subscribe to booking updates
  subscribeToBookingUpdates(
    bookingId: string,
    onUpdate: (update: BookingUpdate) => void
  ) {
    const channelName = getBookingChannel(bookingId);
    
    if (this.channels.has(channelName)) {
      return; // Already subscribed
    }

    const bookingChannel = supabase
      .channel(channelName)
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${bookingId}`,
        },
        (payload) => {
          if (payload.new) {
            const update: BookingUpdate = {
              id: payload.new.id,
              status: payload.new.status,
              driverId: payload.new.driver_id,
              bikerId: payload.new.biker_id,
              fare: payload.new.actual_fare,
            };
            onUpdate(update);
          }
        }
      )
      .subscribe();

    this.channels.set(channelName, bookingChannel);
  }

  // Unsubscribe from booking updates
  unsubscribeFromBookingUpdates(bookingId: string) {
    const channelName = getBookingChannel(bookingId);
    const channel = this.channels.get(channelName);
    
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  // Subscribe to emergency alerts
  subscribeToEmergencyAlerts(
    radius: number, // in kilometers
    userLocation: { lat: number; lng: number },
    onAlert: (alert: EmergencyAlert) => void
  ) {
    const emergencyChannel = supabase
      .channel(REALTIME_CHANNELS.EMERGENCY_ALERTS)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emergency_alerts',
        },
        (payload) => {
          if (payload.new && payload.new.user_id !== this.userId) {
            // Calculate distance to determine if alert is relevant
            const alertLat = payload.new.latitude;
            const alertLng = payload.new.longitude;
            const distance = this.calculateDistance(
              userLocation.lat,
              userLocation.lng,
              alertLat,
              alertLng
            );

            if (distance <= radius) {
              const alert: EmergencyAlert = {
                id: payload.new.id,
                userId: payload.new.user_id,
                userType: payload.new.user_type,
                latitude: alertLat,
                longitude: alertLng,
                locationDescription: payload.new.location_description,
                alertType: payload.new.alert_type,
                message: payload.new.message,
                timestamp: new Date(payload.new.created_at).getTime(),
              };
              onAlert(alert);
            }
          }
        }
      )
      .subscribe();

    this.channels.set('emergency_alerts', emergencyChannel);
  }

  // Send emergency alert
  async sendEmergencyAlert(
    location: { lat: number; lng: number },
    locationDescription: string,
    alertType: 'general' | 'medical' | 'security' | 'vehicle',
    message?: string
  ) {
    if (!this.userId || !this.userType) return null;

    try {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .insert({
          user_id: this.userId,
          user_type: this.userType,
          latitude: location.lat,
          longitude: location.lng,
          location_description: locationDescription,
          alert_type: alertType,
          message,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
      return null;
    }
  }

  // Subscribe to chat messages
  subscribeToChat(
    bookingId: string,
    onMessage: (message: ChatMessage) => void
  ) {
    const chatChannelName = `chat:${bookingId}`;
    
    if (this.channels.has(chatChannelName)) {
      return; // Already subscribed
    }

    const chatChannel = supabase
      .channel(chatChannelName)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          if (payload.new) {
            const message: ChatMessage = {
              id: payload.new.id,
              bookingId: payload.new.booking_id,
              senderId: payload.new.sender_id,
              senderType: payload.new.sender_type,
              message: payload.new.message,
              messageType: payload.new.message_type,
              timestamp: new Date(payload.new.created_at).getTime(),
              isRead: payload.new.is_read,
            };
            onMessage(message);
          }
        }
      )
      .subscribe();

    this.channels.set(chatChannelName, chatChannel);
  }

  // Send chat message
  async sendChatMessage(
    bookingId: string,
    message: string,
    messageType: 'text' | 'location' | 'image' = 'text'
  ) {
    if (!this.userId || !this.userType) return null;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          booking_id: bookingId,
          sender_id: this.userId,
          sender_type: this.userType,
          message,
          message_type: messageType,
          is_read: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to send chat message:', error);
      return null;
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Get channel status
  getChannelStatus(channelName: string): string | null {
    const channel = this.channels.get(channelName);
    return channel ? channel.state : null;
  }

  // Check if service is connected
  isServiceConnected(): boolean {
    return this.isConnected;
  }

  // Get active channels count
  getActiveChannelsCount(): number {
    return this.channels.size;
  }
}

export default new SupabaseRealTimeService();