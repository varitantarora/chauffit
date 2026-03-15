import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../../components/common/ThemedView';
import { ThemedCard } from '../../../components/common/ThemedCard';
import { ThemedText } from '../../../components/common/ThemedText';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';
import DriverApiService, { DriverDocumentRequest, DriverDocumentType } from '../../../services/api/DriverApiService';
import { AADHAAR_API_VERIFICATION_ENABLED } from '../../../constants/VerificationConfig';
import * as ImagePicker from 'expo-image-picker';
import { BrandColors } from '../../../constants/Colors';

interface DocumentStatus {
  id: string;
  name: string;
  icon: string;
  uploaded: boolean;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected' | 'approved';
  apiType: DriverDocumentType;
  serverId?: string;
}

export default function DocumentUploadScreen() {
  const router = useRouter();
  const isDarkMode = useAuthStore((state) => state.isDarkMode);

  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<DocumentStatus[]>([
    {
      id: 'license_front',
      name: 'Driving License (Front)',
      icon: 'card',
      uploaded: false,
      status: 'pending',
      apiType: 'driving_license_front',
    },
    {
      id: 'license_back',
      name: 'Driving License (Back)',
      icon: 'card',
      uploaded: false,
      status: 'pending',
      apiType: 'driving_license_back',
    },
    {
      id: 'aadhaar_front',
      name: 'Aadhaar Card (Front)',
      icon: 'id-card',
      uploaded: false,
      status: 'pending',
      apiType: 'aadhaar_front',
    },
    {
      id: 'aadhaar_back',
      name: 'Aadhaar Card (Back)',
      icon: 'id-card',
      uploaded: false,
      status: 'pending',
      apiType: 'aadhaar_back',
    },
  ]);

  const [liveSelfie, setLiveSelfie] = useState({
    taken: false,
    status: 'pending'
  });

  // DL number
  const [dlNumber, setDlNumber] = useState('');

  // Aadhaar OTP flow
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
  const [aadhaarOtp, setAadhaarOtp] = useState('');
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [aadhaarVerifyLoading, setAadhaarVerifyLoading] = useState(false);
  const [aadhaarOtpTimer, setAadhaarOtpTimer] = useState(300); // 5 minutes
  const [aadhaarCanResend, setAadhaarCanResend] = useState(false);
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});

  // Hydrate documents on mount
  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      const response = await DriverApiService.getDocuments();
      if (response.success && response.data) {
        const uploadedDocs = response.data;
        // Map server documents to local state
        setDocuments(prev =>
          prev.map(doc => {
            const found = uploadedDocs.find(u => u.document_type === doc.apiType);
            if (found) {
              // Capture rejection reason if present
              if (found.rejection_reason) {
                setRejectionReasons(prev => ({ ...prev, [doc.id]: found.rejection_reason! }));
              }
              return {
                ...doc,
                uploaded: true,
                status: found.verification_status === 'approved' ? 'verified' : found.verification_status,
                serverId: found.id,
              };
            }
            return doc;
          })
        );
        // Load live selfie if available
        const selfieDoc = uploadedDocs.find(u => u.document_type === 'live_selfie');
        if (selfieDoc) {
          setLiveSelfie({
            taken: true,
            status: selfieDoc.verification_status === 'approved' ? 'verified' : selfieDoc.verification_status,
          });
        }
        // If aadhaar docs are approved, mark as verified
        const aadhaarFront = uploadedDocs.find(u => u.document_type === 'aadhaar_front');
        if (aadhaarFront?.verification_status === 'approved') setAadhaarVerified(true);
      }
      setIsLoading(false);
    };
    loadDocuments();
  }, []);

  // Aadhaar OTP timer
  useEffect(() => {
    if (!aadhaarOtpSent || aadhaarVerified) return;
    const interval = setInterval(() => {
      setAadhaarOtpTimer(prev => {
        if (prev <= 1) { setAadhaarCanResend(true); clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [aadhaarOtpSent, aadhaarVerified]);

  const pickFromCamera = async (docId: string) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await uploadDocumentFile(docId, result.assets[0].uri);
    }
  };

  const pickFromGallery = async (docId: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to photos to upload documents.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await uploadDocumentFile(docId, result.assets[0].uri);
    }
  };

  const uploadDocumentFile = async (docId: string, uri: string) => {
    try {
      const doc = documents.find(d => d.id === docId);
      if (!doc) return;

      const documentRequest: DriverDocumentRequest = {
        document_type: doc.apiType,
        document_file: {
          uri,
          name: `${docId}_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any,
        ...(doc.apiType === 'driving_license_front' && dlNumber ? { document_number: dlNumber } : {}),
        ...(doc.apiType === 'aadhaar_front' && aadhaarNumber && !AADHAAR_API_VERIFICATION_ENABLED ? { document_number: aadhaarNumber } : {}),
      };

      const response = await DriverApiService.uploadDocument(documentRequest);

      if (response.success) {
        setDocuments(docs => docs.map(doc =>
          doc.id === docId ? { ...doc, uploaded: true, status: 'pending' } : doc
        ));
        Alert.alert('Document Uploaded', 'Document uploaded successfully! It will be reviewed shortly.');
      } else {
        Alert.alert('Upload Failed', response.error || 'Please try again later.');
      }
    } catch (error) {
      Alert.alert('Upload Failed', 'Please try again later.');
      console.error('Error uploading document:', error);
    }
  };

  const handleSendAadhaarOtp = async () => {
    if (aadhaarNumber.length !== 12) {
      Alert.alert('Invalid', 'Aadhaar number must be exactly 12 digits');
      return;
    }
    setAadhaarVerifyLoading(true);
    const res = await DriverApiService.sendAadhaarOtp({ aadhar_number: aadhaarNumber });
    setAadhaarVerifyLoading(false);
    if (res.success) {
      setAadhaarOtpSent(true);
      setAadhaarOtpTimer(300);
      setAadhaarCanResend(false);
    } else {
      Alert.alert('Error', res.error || 'Failed to send OTP');
    }
  };

  const handleVerifyAadhaarOtp = async () => {
    if (aadhaarOtp.length !== 6) {
      Alert.alert('Invalid', 'Enter 6-digit OTP');
      return;
    }
    setAadhaarVerifyLoading(true);
    const res = await DriverApiService.verifyAadhaarOtp({ aadhar_number: aadhaarNumber, otp: aadhaarOtp });
    setAadhaarVerifyLoading(false);
    if (res.success) {
      setAadhaarVerified(true);
      Alert.alert('Success', 'Aadhaar verified successfully!');
    } else {
      Alert.alert('Error', res.error || 'Invalid OTP. Try again.');
      setAadhaarOtp('');
    }
  };

  const handleUploadDocument = (docId: string) => {
    Alert.alert(
      'Upload Document',
      'Choose how to upload your document',
      [
        { text: 'Take Photo', onPress: () => pickFromCamera(docId) },
        { text: 'Choose from Gallery', onPress: () => pickFromGallery(docId) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleTakeSelfie = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow camera access to take a selfie');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // Upload selfie as a document
        const documentRequest: DriverDocumentRequest = {
          document_type: 'live_selfie',
          document_file: {
            uri: result.assets[0].uri,
            name: `selfie_${Date.now()}.jpg`,
            type: 'image/jpeg',
          } as any,
        };

        const response = await DriverApiService.uploadDocument(documentRequest);

        if (response.success) {
          setLiveSelfie({ taken: true, status: 'pending' });
          Alert.alert('Photo Captured', 'Live selfie captured successfully!');
        } else {
          Alert.alert('Upload Failed', response.error || 'Please try again later.');
        }
      }
    } catch (error) {
      Alert.alert('Upload Failed', 'Please try again later.');
      console.error('Error taking selfie:', error);
    }
  };

  const handleSubmit = () => {
    const uploadedCount = documents.filter(doc => doc.uploaded).length;
    const totalDocs = documents.length;

    // Block if no documents uploaded at all
    if (uploadedCount === 0 && !liveSelfie.taken) {
      Alert.alert('Missing Documents', 'Please upload at least one document or take a live selfie to continue.');
      return;
    }

    router.push('/(driver)/onboarding/background-check');
  };

  const getSubmitButtonTitle = () => {
    const uploadedCount = documents.filter(doc => doc.uploaded).length;
    const totalDocs = documents.length;

    if (uploadedCount === 0 && !liveSelfie.taken) {
      return 'Upload Documents to Continue';
    }
    if (uploadedCount === totalDocs && liveSelfie.taken) {
      return 'Submit for Review';
    }
    return 'Save & Continue';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-warning';
      case 'uploaded': return 'text-warning';
      case 'verified': return 'text-success';
      case 'approved': return 'text-success';
      case 'rejected': return 'text-danger';
      default: return 'text-textSecondary dark:text-darkTextSecondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time';
      case 'uploaded': return 'time';
      case 'verified': return 'checkmark-circle';
      case 'approved': return 'checkmark-circle';
      case 'rejected': return 'close-circle';
      default: return 'time';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'uploaded': return 'Pending Review';
      case 'verified': return 'Verified ✓';
      case 'approved': return 'Verified ✓';
      case 'rejected': return 'Rejected — Retake';
      default: return 'Pending';
    }
  };

  const formatOtpTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
              <Ionicons name="document" size={20} color={BrandColors.secondary} />
              <ThemedText className="font-bold ml-2">REQUIRED DOCUMENTS</ThemedText>
            </View>

            {/* Documents List */}
            <View className="space-y-4 mb-6">
              {documents.filter(doc => !['aadhaar_front', 'aadhaar_back'].includes(doc.id)).map((doc) => (
                <View key={doc.id}>
                  <ThemedCard className="p-4">
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center flex-1">
                        <Ionicons name={doc.icon as any} size={20} color={BrandColors.secondary} />
                        <ThemedText className="font-semibold ml-3">{doc.name}</ThemedText>
                      </View>
                      {isLoading ? (
                        <ActivityIndicator size="small" color={BrandColors.secondary} />
                      ) : (
                        <Ionicons
                          name={getStatusIcon(doc.status) as any}
                          size={20}
                          color={
                            doc.status === 'pending' || doc.status === 'uploaded' ? '#f59e0b' :
                            doc.status === 'verified' || doc.status === 'approved' ? '#10b981' :
                            '#ef4444'
                          }
                        />
                      )}
                    </View>

                    {isLoading ? (
                      <View className="items-center py-6">
                        <ActivityIndicator size="large" color={BrandColors.secondary} />
                      </View>
                    ) : !doc.uploaded || doc.status === 'rejected' ? (
                      <TouchableOpacity
                        onPress={() => handleUploadDocument(doc.id)}
                        className="flex-row items-center justify-center py-3 border-2 border-dashed border-secondary rounded-lg bg-secondary/5"
                      >
                        <Ionicons name="camera" size={16} color={BrandColors.secondary} />
                        <ThemedText className="text-secondary font-semibold ml-2">
                          {doc.status === 'rejected' ? 'Retake Photo' : 'Upload Photo'}
                        </ThemedText>
                      </TouchableOpacity>
                    ) : (
                      <View className="flex-row items-center py-2 px-3 bg-opacity-10 rounded-lg" style={{backgroundColor: doc.status === 'verified' || doc.status === 'approved' ? '#10b98120' : '#f59e0b20'}}>
                        <Ionicons
                          name={getStatusIcon(doc.status) as any}
                          size={16}
                          color={doc.status === 'verified' || doc.status === 'approved' ? '#10b981' : '#f59e0b'}
                        />
                        <ThemedText className={`font-semibold ml-2 ${getStatusColor(doc.status)}`}>
                          {getStatusLabel(doc.status)}
                        </ThemedText>
                      </View>
                    )}

                    {doc.status === 'rejected' && rejectionReasons[doc.id] && (
                      <ThemedText variant="caption" className="text-danger mt-3">
                        Reason: {rejectionReasons[doc.id]}
                      </ThemedText>
                    )}
                  </ThemedCard>

                  {doc.id === 'license_front' && !doc.uploaded && (
                    <TextInput
                      placeholder="License Number (e.g. MH01 2024 1234567)"
                      value={dlNumber}
                      onChangeText={text => setDlNumber(text.toUpperCase())}
                      maxLength={20}
                      autoCapitalize="characters"
                      className="mt-3 px-4 py-3 border border-border dark:border-darkBorder rounded-lg text-text dark:text-darkText bg-background dark:bg-darkBackground"
                      placeholderTextColor={BrandColors.secondary}
                    />
                  )}
                </View>
              ))}
            </View>

            {/* Aadhaar Section - Conditional based on config */}
            {AADHAAR_API_VERIFICATION_ENABLED ? (
              <>
                {/* OTP Mode */}
                <View className="flex-row items-center mb-4">
                  <Ionicons name="id-card" size={20} color={BrandColors.secondary} />
                  <ThemedText className="font-bold ml-2">AADHAAR VERIFICATION</ThemedText>
                </View>

                <ThemedCard className="p-4 mb-6">
                  {isLoading ? (
                    <View className="items-center py-6">
                      <ActivityIndicator size="large" color={BrandColors.secondary} />
                    </View>
                  ) : aadhaarVerified ? (
                    <View className="items-center py-4 px-3 bg-opacity-10 rounded-lg" style={{backgroundColor: '#10b98120'}}>
                      <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                      <ThemedText className="font-semibold mt-2 text-success">Aadhaar Verified ✓</ThemedText>
                    </View>
                  ) : (
                    <View className="space-y-4">
                      {/* Aadhaar Number Input */}
                      <TextInput
                        placeholder="Aadhaar Number (12 digits)"
                        value={aadhaarNumber}
                        onChangeText={text => setAadhaarNumber(text.replace(/\D/g, '').slice(0, 12))}
                        maxLength={12}
                        keyboardType="number-pad"
                        className="px-4 py-3 border border-border dark:border-darkBorder rounded-lg text-text dark:text-darkText bg-background dark:bg-darkBackground"
                        placeholderTextColor={BrandColors.secondary}
                        editable={!aadhaarOtpSent}
                      />

                      {/* Aadhaar Front & Back Upload */}
                      {[
                        { id: 'aadhaar_front', name: 'Aadhaar Card (Front)' },
                        { id: 'aadhaar_back', name: 'Aadhaar Card (Back)' },
                      ].map(({ id, name }) => {
                        const doc = documents.find(d => d.id === id);
                        if (!doc) return null;
                        return (
                          <View key={id}>
                            <ThemedText className="font-semibold text-sm mb-2">{name}</ThemedText>
                            {!doc.uploaded || doc.status === 'rejected' ? (
                              <TouchableOpacity
                                onPress={() => handleUploadDocument(doc.id)}
                                className="flex-row items-center justify-center py-3 border-2 border-dashed border-secondary rounded-lg bg-secondary/5"
                              >
                                <Ionicons name="camera" size={16} color={BrandColors.secondary} />
                                <ThemedText className="text-secondary font-semibold ml-2">
                                  {doc.status === 'rejected' ? 'Retake Photo' : 'Upload Photo'}
                                </ThemedText>
                              </TouchableOpacity>
                            ) : (
                              <View className="flex-row items-center py-2 px-3 bg-opacity-10 rounded-lg" style={{backgroundColor: doc.status === 'verified' || doc.status === 'approved' ? '#10b98120' : '#f59e0b20'}}>
                                <Ionicons
                                  name={getStatusIcon(doc.status) as any}
                                  size={16}
                                  color={doc.status === 'verified' || doc.status === 'approved' ? '#10b981' : '#f59e0b'}
                                />
                                <ThemedText className={`font-semibold ml-2 ${getStatusColor(doc.status)}`}>
                                  {getStatusLabel(doc.status)}
                                </ThemedText>
                              </View>
                            )}
                            {doc.status === 'rejected' && rejectionReasons[doc.id] && (
                              <ThemedText variant="caption" className="text-danger mt-2">
                                Reason: {rejectionReasons[doc.id]}
                              </ThemedText>
                            )}
                          </View>
                        );
                      })}

                      {/* Send OTP Button */}
                      {!aadhaarOtpSent && (
                        <PrimaryButton
                          title="Send Verification OTP"
                          onPress={handleSendAadhaarOtp}
                          disabled={
                            aadhaarNumber.length !== 12 ||
                            !documents.find(d => d.id === 'aadhaar_front')?.uploaded ||
                            !documents.find(d => d.id === 'aadhaar_back')?.uploaded ||
                            aadhaarVerifyLoading
                          }
                          className="mt-2"
                        />
                      )}

                      {/* OTP Input Section */}
                      {aadhaarOtpSent && !aadhaarVerified && (
                        <View className="space-y-3 pt-3 border-t border-border dark:border-darkBorder">
                          <View>
                            <ThemedText className="font-semibold text-sm mb-2">Enter OTP</ThemedText>
                            <View className="flex-row items-center">
                              <TextInput
                                placeholder="000000"
                                value={aadhaarOtp}
                                onChangeText={text => setAadhaarOtp(text.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                keyboardType="number-pad"
                                textContentType="oneTimeCode"
                                className="flex-1 px-4 py-3 border border-border dark:border-darkBorder rounded-lg text-text dark:text-darkText bg-background dark:bg-darkBackground"
                                placeholderTextColor={BrandColors.secondary}
                              />
                              <ThemedText className="ml-3 font-semibold text-secondary">
                                {formatOtpTimer(aadhaarOtpTimer)}
                              </ThemedText>
                            </View>
                          </View>

                          {aadhaarCanResend && (
                            <TouchableOpacity onPress={handleSendAadhaarOtp}>
                              <ThemedText className="text-secondary font-semibold text-sm">Resend OTP</ThemedText>
                            </TouchableOpacity>
                          )}

                          <PrimaryButton
                            title="Verify Aadhaar"
                            onPress={handleVerifyAadhaarOtp}
                            disabled={aadhaarOtp.length !== 6 || aadhaarVerifyLoading}
                          />
                        </View>
                      )}
                    </View>
                  )}
                </ThemedCard>
              </>
            ) : (
              <>
                {/* Manual Mode - Photo Upload Only */}
                <View className="flex-row items-center mb-4">
                  <Ionicons name="id-card" size={20} color={BrandColors.secondary} />
                  <ThemedText className="font-bold ml-2">AADHAAR CARD</ThemedText>
                </View>

                {/* Aadhaar Number Input */}
                <TextInput
                  placeholder="Aadhaar Number (12 digits)"
                  value={aadhaarNumber}
                  onChangeText={text => setAadhaarNumber(text.replace(/\D/g, '').slice(0, 12))}
                  maxLength={12}
                  keyboardType="number-pad"
                  className="mb-4 px-4 py-3 border border-border dark:border-darkBorder rounded-lg text-text dark:text-darkText bg-background dark:bg-darkBackground"
                  placeholderTextColor={BrandColors.secondary}
                />

                {/* Aadhaar Front & Back as simple upload cards */}
                <View className="space-y-4 mb-6">
                  {[
                    { id: 'aadhaar_front', name: 'Aadhaar Card (Front)' },
                    { id: 'aadhaar_back', name: 'Aadhaar Card (Back)' },
                  ].map(({ id, name }) => {
                    const doc = documents.find(d => d.id === id);
                    if (!doc) return null;
                    return (
                      <ThemedCard key={id} className="p-4">
                        <View className="flex-row items-center justify-between mb-3">
                          <View className="flex-row items-center flex-1">
                            <Ionicons name="id-card" size={20} color={BrandColors.secondary} />
                            <ThemedText className="font-semibold ml-3">{name}</ThemedText>
                          </View>
                          {isLoading ? (
                            <ActivityIndicator size="small" color={BrandColors.secondary} />
                          ) : (
                            <Ionicons
                              name={getStatusIcon(doc.status) as any}
                              size={20}
                              color={
                                doc.status === 'pending' || doc.status === 'uploaded' ? '#f59e0b' :
                                doc.status === 'verified' || doc.status === 'approved' ? '#10b981' :
                                '#ef4444'
                              }
                            />
                          )}
                        </View>
                        {!doc.uploaded || doc.status === 'rejected' ? (
                          <TouchableOpacity
                            onPress={() => handleUploadDocument(doc.id)}
                            className="flex-row items-center justify-center py-3 border-2 border-dashed border-secondary rounded-lg bg-secondary/5"
                          >
                            <Ionicons name="camera" size={16} color={BrandColors.secondary} />
                            <ThemedText className="text-secondary font-semibold ml-2">
                              {doc.status === 'rejected' ? 'Retake Photo' : 'Upload Photo'}
                            </ThemedText>
                          </TouchableOpacity>
                        ) : (
                          <View className="flex-row items-center py-2 px-3 rounded-lg" style={{backgroundColor: doc.status === 'verified' || doc.status === 'approved' ? '#10b98120' : '#f59e0b20'}}>
                            <Ionicons
                              name={getStatusIcon(doc.status) as any}
                              size={16}
                              color={doc.status === 'verified' || doc.status === 'approved' ? '#10b981' : '#f59e0b'}
                            />
                            <ThemedText className={`font-semibold ml-2 ${getStatusColor(doc.status)}`}>
                              {getStatusLabel(doc.status)}
                            </ThemedText>
                          </View>
                        )}
                        {doc.status === 'rejected' && rejectionReasons[doc.id] && (
                          <ThemedText variant="caption" className="text-danger mt-3">
                            Reason: {rejectionReasons[doc.id]}
                          </ThemedText>
                        )}
                      </ThemedCard>
                    );
                  })}
                </View>
              </>
            )}

            {/* Live Photo Capture */}
            <View className="flex-row items-center mb-4">
              <Ionicons name="camera" size={20} color={BrandColors.secondary} />
              <ThemedText className="font-bold ml-2">LIVE PHOTO CAPTURE</ThemedText>
            </View>

            <ThemedCard className="p-4 mb-6">
              {isLoading ? (
                <View className="items-center py-6">
                  <ActivityIndicator size="large" color={BrandColors.secondary} />
                </View>
              ) : !liveSelfie.taken || liveSelfie.status === 'rejected' ? (
                <TouchableOpacity
                  onPress={handleTakeSelfie}
                  className="items-center py-6"
                >
                  <View className="w-16 h-16 bg-burgundy/10 rounded-full items-center justify-center mb-3">
                    <Ionicons name="camera" size={32} color={BrandColors.burgundy} />
                  </View>
                  <ThemedText className="font-bold text-burgundy">
                    {liveSelfie.status === 'rejected' ? 'Retake Live Selfie' : 'Take Live Selfie'}
                  </ThemedText>
                  <ThemedText variant="caption" className="text-secondary text-center mt-1">
                    For identity verification
                  </ThemedText>
                </TouchableOpacity>
              ) : (
                <View className="items-center py-4 px-3 bg-opacity-10 rounded-lg" style={{backgroundColor: liveSelfie.status === 'verified' || liveSelfie.status === 'approved' ? '#10b98120' : '#f59e0b20'}}>
                  <Ionicons
                    name={getStatusIcon(liveSelfie.status) as any}
                    size={32}
                    color={liveSelfie.status === 'verified' || liveSelfie.status === 'approved' ? '#10b981' : '#f59e0b'}
                  />
                  <ThemedText className="font-semibold mt-2" style={{color: liveSelfie.status === 'verified' || liveSelfie.status === 'approved' ? '#10b981' : '#f59e0b'}}>
                    {getStatusLabel(liveSelfie.status)}
                  </ThemedText>
                </View>
              )}
            </ThemedCard>

            {/* Submit Button */}
            <PrimaryButton
              title={getSubmitButtonTitle()}
              onPress={handleSubmit}
              className="mb-6"
              disabled={isLoading}
            />
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}