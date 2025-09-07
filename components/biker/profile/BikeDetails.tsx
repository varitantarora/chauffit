import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedCard } from '../../common/ThemedCard';
import { ThemedText } from '../../common/ThemedText';
import { ThemedView } from '../../common/ThemedView';
import { PrimaryButton } from '../../common/PrimaryButton';
import { BikeDetails as BikeDetailsType, BikeDocument } from '../../../types/navigation';
import { useAuthStore } from '../../../store/authStore';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

interface BikeDetailsProps {
  bikeDetails: BikeDetailsType;
  onUpdate?: (updatedDetails: BikeDetailsType) => void;
  editable?: boolean;
}

export function BikeDetails({ bikeDetails, onUpdate, editable = false }: BikeDetailsProps) {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState<BikeDetailsType>(bikeDetails);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const handleSave = () => {
    onUpdate?.(editedDetails);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedDetails(bikeDetails);
    setIsEditing(false);
  };

  const getDocumentStatus = (document: BikeDocument) => {
    if (!document.isVerified) return { status: 'pending', color: 'orange' };
    
    if (document.expiryDate) {
      const now = new Date();
      const expiry = new Date(document.expiryDate);
      const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 0) return { status: 'expired', color: 'red' };
      if (daysUntilExpiry <= 30) return { status: 'expiring', color: 'orange' };
    }
    
    return { status: 'verified', color: 'green' };
  };

  const addDocument = async (type: BikeDocument['type']) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newDocument: BikeDocument = {
          id: Date.now().toString(),
          type,
          number: '',
          imageUrl: result.assets[0].uri,
          isVerified: false,
          uploadedAt: new Date(),
        };

        setEditedDetails({
          ...editedDetails,
          documents: [...editedDetails.documents, newDocument],
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload document');
    }
  };

  const removeDocument = (documentId: string) => {
    Alert.alert(
      'Remove Document',
      'Are you sure you want to remove this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setEditedDetails({
              ...editedDetails,
              documents: editedDetails.documents.filter(doc => doc.id !== documentId),
            });
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Bike Information */}
      <ThemedCard className="p-4 mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="bg-primary/10 p-3 rounded-full mr-3">
              <Ionicons name="bicycle" size={24} color="#bd8c5e" />
            </View>
            <View>
              <ThemedText className="font-bold text-lg">Bike Details</ThemedText>
              <ThemedText variant="caption" className="text-gray-500">
                {editedDetails.isActive ? 'Active' : 'Inactive'}
              </ThemedText>
            </View>
          </View>
          
          {editable && (
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              className="bg-primary/10 p-2 rounded-full"
            >
              <Ionicons name={isEditing ? "close" : "pencil"} size={18} color="#bd8c5e" />
            </TouchableOpacity>
          )}
        </View>

        {isEditing ? (
          <View className="space-y-4">
            <View>
              <ThemedText className="font-semibold mb-2">Make</ThemedText>
              <TextInput
                value={editedDetails.make}
                onChangeText={(text) => setEditedDetails({ ...editedDetails, make: text })}
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800"
                placeholder="Enter bike make"
                placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
              />
            </View>
            
            <View>
              <ThemedText className="font-semibold mb-2">Model</ThemedText>
              <TextInput
                value={editedDetails.model}
                onChangeText={(text) => setEditedDetails({ ...editedDetails, model: text })}
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800"
                placeholder="Enter bike model"
                placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
              />
            </View>
            
            <View>
              <ThemedText className="font-semibold mb-2">Registration Number</ThemedText>
              <TextInput
                value={editedDetails.registrationNumber}
                onChangeText={(text) => setEditedDetails({ ...editedDetails, registrationNumber: text.toUpperCase() })}
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800"
                placeholder="Enter registration number"
                placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                autoCapitalize="characters"
              />
            </View>
            
            <View>
              <ThemedText className="font-semibold mb-2">Engine Capacity</ThemedText>
              <TextInput
                value={editedDetails.engineCapacity}
                onChangeText={(text) => setEditedDetails({ ...editedDetails, engineCapacity: text })}
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800"
                placeholder="e.g., 150cc"
                placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
              />
            </View>
            
            <View className="flex-row space-x-3">
              <PrimaryButton
                title="Save Changes"
                onPress={handleSave}
                className="flex-1"
              />
              <TouchableOpacity
                onPress={handleCancel}
                className="flex-1 bg-gray-100 dark:bg-gray-800 py-3 rounded-lg"
              >
                <ThemedText className="text-center font-semibold">Cancel</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="space-y-3">
            <BikeDetailRow label="Make" value={editedDetails.make} />
            <BikeDetailRow label="Model" value={editedDetails.model} />
            <BikeDetailRow label="Year" value={editedDetails.year.toString()} />
            <BikeDetailRow label="Color" value={editedDetails.color} />
            <BikeDetailRow label="Registration" value={editedDetails.registrationNumber} />
            <BikeDetailRow label="Engine Capacity" value={editedDetails.engineCapacity} />
            <BikeDetailRow 
              label="Fuel Type" 
              value={editedDetails.fuelType === 'petrol' ? 'Petrol' : 'Electric'} 
            />
          </View>
        )}
      </ThemedCard>

      {/* Documents Section */}
      <ThemedCard className="p-4 mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="bg-blue-500/10 p-3 rounded-full mr-3">
              <Ionicons name="document-text" size={24} color="#3b82f6" />
            </View>
            <View>
              <ThemedText className="font-bold text-lg">Documents</ThemedText>
              <ThemedText variant="caption" className="text-gray-500">
                {editedDetails.documents.length} documents uploaded
              </ThemedText>
            </View>
          </View>
          
          {editable && (
            <TouchableOpacity
              onPress={() => setShowDocumentModal(true)}
              className="bg-blue-500/10 p-2 rounded-full"
            >
              <Ionicons name="add" size={18} color="#3b82f6" />
            </TouchableOpacity>
          )}
        </View>

        {editedDetails.documents.length > 0 ? (
          <View className="space-y-3">
            {editedDetails.documents.map((document) => (
              <DocumentItem
                key={document.id}
                document={document}
                onRemove={editable ? removeDocument : undefined}
              />
            ))}
          </View>
        ) : (
          <View className="items-center py-8">
            <View className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3">
              <Ionicons name="document-outline" size={32} color="#6b7280" />
            </View>
            <ThemedText className="font-semibold text-center">No Documents</ThemedText>
            <ThemedText variant="caption" className="text-center mt-1">
              Upload your bike documents to get verified
            </ThemedText>
          </View>
        )}
      </ThemedCard>

      {/* Document Upload Modal */}
      <Modal
        visible={showDocumentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDocumentModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <ThemedView className="rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <ThemedText className="font-bold text-lg">Add Document</ThemedText>
              <TouchableOpacity onPress={() => setShowDocumentModal(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? '#d9d1c6' : '#374151'} />
              </TouchableOpacity>
            </View>
            
            <View className="space-y-3">
              {(['registration', 'insurance', 'puc', 'license', 'permit'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    addDocument(type);
                    setShowDocumentModal(false);
                  }}
                  className="flex-row items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <Ionicons name={getDocumentIcon(type)} size={20} color="#bd8c5e" />
                  <ThemedText className="ml-3 font-semibold capitalize">
                    {type === 'puc' ? 'PUC Certificate' : type.replace('_', ' ')}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ScrollView>
  );
}

function BikeDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
      <ThemedText variant="caption" className="text-gray-500">{label}</ThemedText>
      <ThemedText className="font-semibold">{value}</ThemedText>
    </View>
  );
}

function DocumentItem({ 
  document, 
  onRemove 
}: { 
  document: BikeDocument; 
  onRemove?: (id: string) => void; 
}) {
  const status = getDocumentStatus(document);
  
  return (
    <View className="flex-row items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <View className="flex-row items-center flex-1">
        <View className={`bg-${status.color}-500/10 p-2 rounded-full mr-3`}>
          <Ionicons 
            name={getDocumentIcon(document.type)} 
            size={20} 
            color={status.color === 'green' ? '#10b981' : status.color === 'orange' ? '#f97316' : '#ef4444'} 
          />
        </View>
        
        <View className="flex-1">
          <ThemedText className="font-semibold capitalize">
            {document.type === 'puc' ? 'PUC Certificate' : document.type.replace('_', ' ')}
          </ThemedText>
          {document.number && (
            <ThemedText variant="caption">{document.number}</ThemedText>
          )}
          {document.expiryDate && (
            <ThemedText variant="caption" className="text-gray-500">
              Expires: {new Date(document.expiryDate).toLocaleDateString('en-IN')}
            </ThemedText>
          )}
        </View>
      </View>
      
      <View className="flex-row items-center">
        <View className={`bg-${status.color}-500/10 px-2 py-1 rounded-full mr-2`}>
          <ThemedText className={`text-${status.color}-600 text-xs font-semibold`}>
            {status.status.toUpperCase()}
          </ThemedText>
        </View>
        
        {onRemove && (
          <TouchableOpacity onPress={() => onRemove(document.id)}>
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function getDocumentIcon(type: BikeDocument['type']): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'registration':
      return 'document-text';
    case 'insurance':
      return 'shield-checkmark';
    case 'puc':
      return 'leaf';
    case 'license':
      return 'card';
    case 'permit':
      return 'checkmark-done-circle';
    default:
      return 'document';
  }
}

function getDocumentStatus(document: BikeDocument) {
  if (!document.isVerified) return { status: 'pending', color: 'orange' };
  
  if (document.expiryDate) {
    const now = new Date();
    const expiry = new Date(document.expiryDate);
    const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 0) return { status: 'expired', color: 'red' };
    if (daysUntilExpiry <= 30) return { status: 'expiring', color: 'orange' };
  }
  
  return { status: 'verified', color: 'green' };
}

// Compact version for profile overview
export function BikeDetailsCompact({ bikeDetails }: { bikeDetails: BikeDetailsType }) {
  const verifiedDocs = bikeDetails.documents.filter(doc => doc.isVerified).length;
  const totalDocs = bikeDetails.documents.length;
  
  return (
    <ThemedCard className="p-4">
      <View className="flex-row items-center">
        <View className="bg-primary/10 p-3 rounded-full mr-3">
          <Ionicons name="bicycle" size={24} color="#bd8c5e" />
        </View>
        
        <View className="flex-1">
          <ThemedText className="font-semibold">
            {bikeDetails.make} {bikeDetails.model}
          </ThemedText>
          <ThemedText variant="caption" className="text-gray-500">
            {bikeDetails.registrationNumber} • {bikeDetails.engineCapacity}
          </ThemedText>
          <View className="flex-row items-center mt-1">
            <View className={`w-2 h-2 rounded-full mr-2 ${
              bikeDetails.isActive ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <ThemedText variant="caption" className={
              bikeDetails.isActive ? 'text-green-600' : 'text-red-600'
            }>
              {bikeDetails.isActive ? 'Active' : 'Inactive'}
            </ThemedText>
            <ThemedText variant="caption" className="text-gray-500 ml-3">
              {verifiedDocs}/{totalDocs} docs verified
            </ThemedText>
          </View>
        </View>
      </View>
    </ThemedCard>
  );
}