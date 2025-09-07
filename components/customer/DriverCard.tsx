import React from 'react';
import { TouchableOpacity, View, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../common/ThemedText';
import { useAuthStore } from '../../store/authStore';
import { Chauffeur } from '../../types/navigation';

interface DriverCardProps {
  driver: Chauffeur;
  isSelected?: boolean;
  onSelect?: (driver: Chauffeur) => void;
  onCall?: (phoneNumber: string) => void;
  onMessage?: (driverId: string) => void;
  showActions?: boolean;
}

export const DriverCard: React.FC<DriverCardProps> = ({
  driver,
  isSelected = false,
  onSelect,
  onCall,
  onMessage,
  showActions = true,
}) => {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);

  const handleCall = () => {
    if (onCall) {
      onCall(driver.phone);
    } else {
      Linking.openURL(`tel:${driver.phone}`);
    }
  };

  const handleMessage = () => {
    if (onMessage) {
      onMessage(driver.id);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < Math.floor(rating) ? 'star' : index < rating ? 'star-half' : 'star-outline'}
        size={14}
        color="#BD8C5E"
      />
    ));
  };

  return (
    <TouchableOpacity
      onPress={() => onSelect?.(driver)}
      className={`p-4 rounded-2xl border-2 ${
        isSelected
          ? 'border-secondary bg-secondary/10'
          : `border-border ${isDarkMode ? 'border-darkBorder bg-darkSurface' : 'border-border bg-white'}`
      }`}
      disabled={!onSelect}
    >
      {/* Driver Header */}
      <View className="flex-row items-center mb-4">
        <View className="relative">
          <Image
            source={{ uri: driver.photo }}
            className="w-16 h-16 rounded-full"
            style={{ backgroundColor: '#f0f0f0' }}
          />
          <View className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white items-center justify-center ${
            driver.isAvailable ? 'bg-success' : 'bg-textSecondary'
          }`}>
            <Ionicons 
              name={driver.isAvailable ? 'checkmark' : 'time'} 
              size={12} 
              color="white" 
            />
          </View>
        </View>
        
        <View className="flex-1 ml-4">
          <ThemedText variant="h3" className="font-bold">
            {driver.name}
          </ThemedText>
          
          <View className="flex-row items-center mt-1 mb-2">
            <View className="flex-row mr-3">
              {renderStars(driver.rating)}
            </View>
            <ThemedText variant="small" className="text-textSecondary">
              {driver.rating} • {driver.experience}y exp
            </ThemedText>
          </View>
          
          <View className="flex-row items-center">
            <Ionicons name="time" size={14} color="#BD8C5E" />
            <ThemedText variant="small" className="ml-1 font-semibold text-secondary">
              Arriving in {driver.eta}
            </ThemedText>
          </View>
        </View>

        {onSelect && (
          <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
            isSelected
              ? 'border-secondary bg-secondary'
              : 'border-textSecondary'
          }`}>
            {isSelected && (
              <Ionicons name="checkmark" size={14} color="white" />
            )}
          </View>
        )}
      </View>

      {/* Certifications */}
      <View className="flex-row flex-wrap mb-4">
        {driver.certifications.map((cert, index) => (
          <View
            key={index}
            className="bg-primary/20 px-3 py-1 rounded-full mr-2 mb-2"
          >
            <ThemedText variant="tiny" className="text-burgundy font-medium">
              {cert}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* ETA Display */}
      <View className="bg-secondary/10 rounded-xl p-3 mb-4 border border-secondary/20">
        <ThemedText variant="body" className="text-center font-semibold text-secondary">
          Arriving in {driver.eta}
        </ThemedText>
      </View>

      {/* Action Buttons */}
      {showActions && (
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={handleCall}
            className="flex-1 bg-success rounded-xl py-3 flex-row items-center justify-center"
          >
            <Ionicons name="call" size={18} color="white" />
            <ThemedText className="text-white font-semibold ml-2">
              Call
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleMessage}
            className="flex-1 border-2 border-burgundy rounded-xl py-3 flex-row items-center justify-center"
          >
            <Ionicons name="chatbubble" size={18} color="#720C17" />
            <ThemedText className="text-burgundy font-semibold ml-2">
              Message
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};