import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';

interface DocumentStatus {
  id: string;
  name: string;
  icon: string;
  uploaded: boolean;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
}

export default function DocumentUploadScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  
  const [documents, setDocuments] = useState<DocumentStatus[]>([
    {
      id: 'license',
      name: 'Driving License',
      icon: 'card',
      uploaded: false,
      status: 'pending'
    },
    {
      id: 'id',
      name: 'Government ID (Aadhar/PAN)',
      icon: 'id-card',
      uploaded: false,
      status: 'pending'
    },
    {
      id: 'address',
      name: 'Address Proof',
      icon: 'location',
      uploaded: false,
      status: 'pending'
    },
    {
      id: 'bank',
      name: 'Bank Account Details',
      icon: 'card',
      uploaded: false,
      status: 'pending'
    }
  ]);

  const [liveSelfie, setLiveSelfie] = useState({
    taken: false,
    status: 'pending'
  });

  const handleUploadDocument = (docId: string) => {
    setDocuments(docs => docs.map(doc => 
      doc.id === docId ? { ...doc, uploaded: true, status: 'uploaded' } : doc
    ));
    Alert.alert('Document Uploaded', 'Document uploaded successfully!');
  };

  const handleTakeSelfie = () => {
    setLiveSelfie({ taken: true, status: 'uploaded' });
    Alert.alert('Photo Captured', 'Live selfie captured successfully!');
  };

  const handleSubmit = () => {
    const allUploaded = documents.every(doc => doc.uploaded) && liveSelfie.taken;
    if (!allUploaded) {
      Alert.alert('Missing Documents', 'Please upload all required documents and take a live selfie.');
      return;
    }
    router.push('/(driver)/onboarding/background-check');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded': return 'text-warning';
      case 'verified': return 'text-success';
      case 'rejected': return 'text-danger';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded': return 'time';
      case 'verified': return 'checkmark-circle';
      case 'rejected': return 'close-circle';
      default: return 'time';
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
            </TouchableOpacity>
            <View className="items-center">
              <ThemedText variant="title" className="font-bold">
                Upload Documents
              </ThemedText>
              <ThemedText variant="caption" className="text-secondary">
                2/5
              </ThemedText>
            </View>
            <View className="w-6" />
          </View>

          <View className="px-6 pt-4">
            <ThemedText variant="secondary" className="text-center mb-6">
              Upload your documents for{'\n'}background verification
            </ThemedText>

            {/* Required Documents Header */}
            <View className="flex-row items-center mb-4">
              <Ionicons name="document" size={20} color="#BD8C5E" />
              <ThemedText className="font-bold ml-2">REQUIRED DOCUMENTS</ThemedText>
            </View>

            {/* Documents List */}
            <View className="space-y-4 mb-6">
              {documents.map((doc) => (
                <ThemedCard key={doc.id} className="p-4">
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1">
                      <Ionicons name={doc.icon as any} size={20} color="#BD8C5E" />
                      <ThemedText className="font-semibold ml-3">{doc.name}</ThemedText>
                    </View>
                    <Ionicons 
                      name={getStatusIcon(doc.status) as any} 
                      size={20} 
                      color={doc.status === 'uploaded' ? '#f59e0b' : doc.status === 'verified' ? '#10b981' : '#6b7280'} 
                    />
                  </View>
                  
                  {!doc.uploaded ? (
                    <TouchableOpacity
                      onPress={() => handleUploadDocument(doc.id)}
                      className="flex-row items-center justify-center py-3 border-2 border-dashed border-secondary rounded-lg bg-secondary/5"
                    >
                      <Ionicons name="camera" size={16} color="#BD8C5E" />
                      <ThemedText className="text-secondary font-semibold ml-2">
                        Upload Front & Back
                      </ThemedText>
                    </TouchableOpacity>
                  ) : (
                    <View className="flex-row items-center py-2">
                      <ThemedText className={`font-semibold ${getStatusColor(doc.status)}`}>
                        Status: {doc.status === 'uploaded' ? '⏳ Pending' : `✅ ${doc.status}`}
                      </ThemedText>
                    </View>
                  )}
                </ThemedCard>
              ))}
            </View>

            {/* Live Photo Capture */}
            <View className="flex-row items-center mb-4">
              <Ionicons name="camera" size={20} color="#BD8C5E" />
              <ThemedText className="font-bold ml-2">LIVE PHOTO CAPTURE</ThemedText>
            </View>

            <ThemedCard className="p-4 mb-6">
              {!liveSelfie.taken ? (
                <TouchableOpacity
                  onPress={handleTakeSelfie}
                  className="items-center py-6"
                >
                  <View className="w-16 h-16 bg-burgundy/10 rounded-full items-center justify-center mb-3">
                    <Ionicons name="camera" size={32} color="#720C17" />
                  </View>
                  <ThemedText className="font-bold text-burgundy">Take Live Selfie</ThemedText>
                  <ThemedText variant="caption" className="text-secondary text-center mt-1">
                    For identity verification
                  </ThemedText>
                </TouchableOpacity>
              ) : (
                <View className="items-center py-4">
                  <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                  <ThemedText className="font-semibold text-success mt-2">
                    Live selfie captured successfully
                  </ThemedText>
                </View>
              )}
            </ThemedCard>

            {/* Submit Button */}
            <PrimaryButton
              title="Submit Documents"
              onPress={handleSubmit}
              className="mb-6"
            />
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}