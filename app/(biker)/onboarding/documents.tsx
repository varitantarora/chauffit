import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedText } from '../../../components/common/ThemedText';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';
import BikerApiService, { BikerDocumentRequest } from '../../../services/api/BikerApiService';
import * as ImagePicker from 'expo-image-picker';

type DocumentType = 'license' | 'identity' | 'address' | 'insurance' | 'selfie';

interface DocumentStatus {
  uploaded: boolean;
  uri?: string;
  status: 'pending' | 'uploading' | 'verified' | 'rejected';
}

export default function BikerDocumentsScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  
  const [documents, setDocuments] = useState<Record<DocumentType, DocumentStatus>>({
    license: { uploaded: false, status: 'pending' },
    identity: { uploaded: false, status: 'pending' },
    address: { uploaded: false, status: 'pending' },
    insurance: { uploaded: false, status: 'pending' },
    selfie: { uploaded: false, status: 'pending' },
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const documentTypes = [
    {
      key: 'license' as const,
      title: 'Driving License',
      description: 'Valid motorcycle/scooter license',
      icon: 'card',
      required: true
    },
    {
      key: 'identity' as const,
      title: 'Government ID',
      description: 'Passport, Aadhar, or National ID',
      icon: 'id-card',
      required: true
    },
    {
      key: 'address' as const,
      title: 'Address Proof',
      description: 'Utility bill or bank statement',
      icon: 'home',
      required: true
    },
    {
      key: 'insurance' as const,
      title: 'Vehicle Insurance',
      description: 'Valid insurance certificate',
      icon: 'shield-checkmark',
      required: false
    },
    {
      key: 'selfie' as const,
      title: 'Live Selfie',
      description: 'Take a selfie for verification',
      icon: 'camera',
      required: true
    },
  ];

  // Map document types to API document types
  const mapDocumentType = (type: DocumentType): 'police_verification' | 'address_proof' | 'passport' | 'other' => {
    switch (type) {
      case 'license': return 'other'; // License is handled separately in profile
      case 'identity': return 'passport';
      case 'address': return 'address_proof';
      case 'insurance': return 'other';
      case 'selfie': return 'police_verification';
      default: return 'other';
    }
  };

  const uploadDocument = async (type: DocumentType) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to photos to upload documents');
        return;
      }

      // For selfie, use camera
      const useCamera = type === 'selfie';
      
      const result = useCamera 
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]) {
        setDocuments(prev => ({
          ...prev,
          [type]: { 
            uploaded: true, 
            uri: result.assets[0].uri, 
            status: 'uploading' 
          }
        }));

        // Upload to API
        try {
          const documentRequest: BikerDocumentRequest = {
            document_type: mapDocumentType(type),
            document_file: {
              uri: result.assets[0].uri,
              name: `${type}_${Date.now()}.jpg`,
              type: 'image/jpeg',
            } as any,
          };

          const response = await BikerApiService.uploadDocument(documentRequest);
          
          if (response.success) {
            setDocuments(prev => ({
              ...prev,
              [type]: { 
                ...prev[type], 
                status: 'verified' 
              }
            }));
            Alert.alert('Success', 'Document uploaded successfully');
          } else {
            setDocuments(prev => ({
              ...prev,
              [type]: { 
                ...prev[type], 
                status: 'pending' 
              }
            }));
            Alert.alert('Error', response.error || 'Failed to upload document');
          }
        } catch (error) {
          setDocuments(prev => ({
            ...prev,
            [type]: { 
              ...prev[type], 
              status: 'pending' 
            }
          }));
          Alert.alert('Error', 'Failed to upload document. Please try again.');
          console.error('Error uploading document:', error);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select document. Please try again.');
    }
  };

  const getStatusColor = (status: DocumentStatus['status']) => {
    switch (status) {
      case 'pending': return '#6b7280';
      case 'uploading': return '#f59e0b';
      case 'verified': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: DocumentStatus['status']) => {
    switch (status) {
      case 'pending': return 'cloud-upload';
      case 'uploading': return 'hourglass';
      case 'verified': return 'checkmark-circle';
      case 'rejected': return 'close-circle';
      default: return 'cloud-upload';
    }
  };

  const handleTestBypass = () => {
    Alert.alert(
      'Test Bypass Mode',
      'Skip document upload for testing? This will mark all documents as verified.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip for Testing',
          style: 'destructive',
          onPress: () => {
            // Mark all documents as verified for testing
            const verifiedDocs = {
              license: { uploaded: true, uri: 'test://placeholder', status: 'verified' as const },
              identity: { uploaded: true, uri: 'test://placeholder', status: 'verified' as const },
              address: { uploaded: true, uri: 'test://placeholder', status: 'verified' as const },
              insurance: { uploaded: true, uri: 'test://placeholder', status: 'verified' as const },
              selfie: { uploaded: true, uri: 'test://placeholder', status: 'verified' as const },
            };
            setDocuments(verifiedDocs);
            
            // Navigate to background check immediately
            setTimeout(() => {
              router.push('/(biker)/onboarding/background-check');
            }, 500);
          }
        }
      ]
    );
  };

  const handleSubmit = async () => {
    // Check if at least one document is uploaded
    if (!atLeastOneUploaded) {
      Alert.alert(
        'No Documents Uploaded',
        'Please upload at least one document to continue.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Get all uploaded documents
      const uploadedDocs = Object.values(documents).filter(doc => doc.status === 'verified' || doc.uploaded);
      
      if (uploadedDocs.length === 0) {
        Alert.alert(
          'No Documents Uploaded',
          'Please upload at least one document to continue.'
        );
        return;
      }
      
      Alert.alert(
        'Documents Submitted!',
        'Your documents have been submitted for verification. You\'ll be notified once approved.',
        [
          {
            text: 'Continue to Background Check',
            onPress: () => router.push('/(biker)/onboarding/background-check')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit documents. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if at least one document is uploaded (changed from all required)
  const atLeastOneUploaded = Object.values(documents).some(doc => doc.uploaded);

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-darkBorder">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#d9d1c6' : '#314b4c'} />
          </TouchableOpacity>
          <View className="items-center">
            <ThemedText variant="title" className="font-bold">
              Document Upload
            </ThemedText>
            <ThemedText variant="caption" className="text-secondary">
              Step 2 of 3
            </ThemedText>
          </View>
          <View className="w-6" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="p-6">
            {/* Description */}
            <View className="mb-8">
              <ThemedText variant="title" className="text-2xl font-bold mb-2">
                Upload Documents
              </ThemedText>
              <ThemedText variant="secondary">
                Secure verification for biker safety
              </ThemedText>
            </View>

            {/* Progress Indicator */}
            <ThemedCard className="p-4 mb-6 bg-burgundy/5 border border-burgundy/20">
              <View className="flex-row items-center justify-between">
                <View>
                  <ThemedText className="font-bold text-burgundy">
                    Verification Progress
                  </ThemedText>
                  <ThemedText variant="caption" className="text-burgundy">
                    {Object.values(documents).filter(doc => doc.status === 'verified').length} of {documentTypes.length} completed
                  </ThemedText>
                </View>
                <View className="w-16 h-16 bg-burgundy rounded-full items-center justify-center">
                  <ThemedText className="text-white font-bold text-lg">
                    {Math.round((Object.values(documents).filter(doc => doc.status === 'verified').length / documentTypes.length) * 100)}%
                  </ThemedText>
                </View>
              </View>
            </ThemedCard>

            {/* Document Upload Cards */}
            <View className="space-y-4">
              {documentTypes.map((docType) => {
                const doc = documents[docType.key];
                const statusColor = getStatusColor(doc.status);
                const statusIcon = getStatusIcon(doc.status);

                return (
                  <ThemedCard key={docType.key} className="p-4">
                    <View className="flex-row items-center">
                      <View className="w-12 h-12 bg-secondary/20 rounded-full items-center justify-center mr-4">
                        <Ionicons name={docType.icon as any} size={24} color="#bd8c5e" />
                      </View>
                      
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <ThemedText className="font-bold text-lg">
                            {docType.title}
                          </ThemedText>
                          {docType.required && (
                            <ThemedText className="text-danger text-sm ml-1">*</ThemedText>
                          )}
                        </View>
                        <ThemedText variant="caption" className="text-secondary">
                          {docType.description}
                        </ThemedText>
                        
                        {doc.uploaded && doc.uri && (
                          <View className="mt-2">
                            <Image 
                              source={{ uri: doc.uri }} 
                              className="w-16 h-12 rounded border"
                              resizeMode="cover"
                            />
                          </View>
                        )}
                      </View>

                      <View className="items-center">
                        <View className="flex-row items-center mb-2">
                          <Ionicons name={statusIcon} size={20} color={statusColor} />
                          <ThemedText className="text-sm font-semibold ml-1" style={{ color: statusColor }}>
                            {doc.status === 'pending' && 'Upload'}
                            {doc.status === 'uploading' && 'Processing'}
                            {doc.status === 'verified' && 'Verified'}
                            {doc.status === 'rejected' && 'Rejected'}
                          </ThemedText>
                        </View>
                        
                        <TouchableOpacity
                          onPress={() => uploadDocument(docType.key)}
                          disabled={doc.status === 'uploading'}
                          className={`px-4 py-2 rounded-lg ${
                            doc.status === 'verified' ? 'bg-success/10' : 'bg-burgundy'
                          }`}
                          activeOpacity={0.7}
                        >
                          <ThemedText className={`font-semibold text-sm ${
                            doc.status === 'verified' ? 'text-success' : 'text-white'
                          }`}>
                            {doc.status === 'verified' ? 'Reupload' : 
                             docType.key === 'selfie' ? 'Take Photo' : 'Upload'}
                          </ThemedText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </ThemedCard>
                );
              })}
            </View>

            {/* Important Notes */}
            <ThemedCard className="p-4 mt-6 bg-warning/5 border border-warning/20">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#f59e0b" />
                <View className="flex-1 ml-3">
                  <ThemedText className="font-bold text-warning mb-2">
                    Important Notes:
                  </ThemedText>
                  <View className="space-y-1">
                    <ThemedText className="text-warning text-sm">
                      • All documents must be clear and readable
                    </ThemedText>
                    <ThemedText className="text-warning text-sm">
                      • Documents should be valid and not expired
                    </ThemedText>
                    <ThemedText className="text-warning text-sm">
                      • Verification typically takes 24-48 hours
                    </ThemedText>
                    <ThemedText className="text-warning text-sm">
                      • You'll be notified once documents are approved
                    </ThemedText>
                  </View>
                </View>
              </View>
            </ThemedCard>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View className="p-6 border-t border-border dark:border-darkBorder">
          {/* Test Bypass Button */}
          <TouchableOpacity
            onPress={handleTestBypass}
            className="w-full py-4 bg-warning rounded-lg items-center mb-4"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Ionicons name="flash" size={20} color="white" />
              <ThemedText className="text-white font-bold text-lg ml-2">
                Test Bypass - Skip Documents
              </ThemedText>
            </View>
          </TouchableOpacity>
          
          <PrimaryButton
            title={isSubmitting ? "Submitting Documents..." : "SUBMIT FOR VERIFICATION"}
            onPress={handleSubmit}
            disabled={isSubmitting || !atLeastOneUploaded}
            className={!atLeastOneUploaded ? 'opacity-50' : ''}
          />
          
          {!atLeastOneUploaded && (
            <ThemedText className="text-center text-secondary mt-2 text-sm">
              Please upload at least one document to continue
            </ThemedText>
          )}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}