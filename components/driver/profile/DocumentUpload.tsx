import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedCard } from '../../common/ThemedCard';
import { ThemedText } from '../../common/ThemedText';
import { PrimaryButton } from '../../common/PrimaryButton';
import { DriverDocument } from '../../../types/navigation';
import { useAuthStore } from '../../../store/authStore';
import * as ImagePicker from 'expo-image-picker';
import DriverApiService, { DriverDocumentRequest } from '../../../services/api/DriverApiService';
import { appConfig } from '../../../config/env';

interface DocumentUploadProps {
  document?: DriverDocument;
  type: DriverDocument['type'];
  title: string;
  description: string;
  required?: boolean;
  onUpload: (document: Partial<DriverDocument>) => void;
  onDelete?: (documentId: string) => void;
}

export function DocumentUpload({
  document,
  type,
  title,
  description,
  required = false,
  onUpload,
  onDelete
}: DocumentUploadProps) {
  const isDarkMode = useAuthStore((state) => state.isDarkMode);
  const [isUploading, setIsUploading] = useState(false);

  const getDocumentIcon = (type: DriverDocument['type']) => {
    switch (type) {
      case 'license_front':
      case 'license_back':
        return 'card';
      case 'aadhaar_front':
      case 'aadhaar_back':
        return 'finger-print';
      default:
        return 'document';
    }
  };

  const getStatusColor = (document?: DriverDocument) => {
    if (!document) return '#6b7280';
    if (!document.isVerified) return '#f59e0b';
    return '#10b981';
  };

  const getStatusText = (document?: DriverDocument) => {
    if (!document) return 'Not uploaded';
    if (!document.isVerified) return 'Under review';
    return 'Verified';
  };

  const handleUpload = () => {
    Alert.alert(
      'Upload Document',
      'Choose an option to upload your document',
      [
        {
          text: 'Camera',
          onPress: () => uploadFromCamera()
        },
        {
          text: 'Gallery',
          onPress: () => uploadFromGallery()
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  // Map local document type to API document type
  const mapLocalTypeToApi = (localType: DriverDocument['type']): 'driving_license_front' | 'driving_license_back' | 'aadhaar_front' | 'aadhaar_back' | 'other' => {
    switch (localType) {
      case 'license_front':
        return 'driving_license_front';
      case 'license_back':
        return 'driving_license_back';
      case 'aadhaar_front':
        return 'aadhaar_front';
      case 'aadhaar_back':
        return 'aadhaar_back';
      default:
        return 'other';
    }
  };

  const uploadFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow camera access to upload documents');
        return;
      }

      setIsUploading(true);
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadDocumentToApi(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Upload Failed', 'Please try again later.');
      console.error('Error uploading from camera:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow photo access to upload documents');
        return;
      }

      setIsUploading(true);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadDocumentToApi(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Upload Failed', 'Please try again later.');
      console.error('Error uploading from gallery:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const uploadDocumentToApi = async (uri: string) => {
    try {
      const documentRequest: DriverDocumentRequest = {
        document_type: mapLocalTypeToApi(type),
        document_file: {
          uri,
          name: `${type}_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any,
      };

      const response = await DriverApiService.uploadDocument(documentRequest);
      
      if (response.success) {
        const uploadedDoc: Partial<DriverDocument> = {
          id: `doc_${Date.now()}`,
          type,
          imageUrl: uri,
          isVerified: false,
          uploadedAt: new Date()
        };
        
        onUpload(uploadedDoc);
        Alert.alert(
          'Upload Successful',
          'Your document has been uploaded and is under review. You will be notified once it\'s verified.'
        );
      } else {
        Alert.alert('Upload Failed', response.error || 'Please try again later.');
      }
    } catch (error) {
      Alert.alert('Upload Failed', 'Please try again later.');
      console.error('Error uploading document to API:', error);
    }
  };

  const handleDelete = () => {
    if (!document) return;
    
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(document.id)
        }
      ]
    );
  };

  const isExpired = document?.expiryDate && new Date(document.expiryDate) < new Date();
  const isExpiringSoon = document?.expiryDate && 
    new Date(document.expiryDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000; // 30 days

  return (
    <ThemedCard className="mb-4">
      <View className="flex-row items-start">
        <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
          document?.isVerified ? 'bg-success/20' : 'bg-warning/20'
        }`}>
          <Ionicons 
            name={getDocumentIcon(type) as any} 
            size={24} 
            color={getStatusColor(document)} 
          />
        </View>
        
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <ThemedText variant="title" className="font-semibold">
              {title}
            </ThemedText>
            {required && (
              <View className="bg-danger/10 px-2 py-1 rounded">
                <ThemedText variant="caption" className="text-danger text-xs">
                  Required
                </ThemedText>
              </View>
            )}
          </View>
          
          <ThemedText variant="caption" className="mb-2">
            {description}
          </ThemedText>
          
          {/* Status */}
          <View className="flex-row items-center mb-3">
            <View className={`w-2 h-2 rounded-full mr-2`} 
                  style={{ backgroundColor: getStatusColor(document) }} />
            <ThemedText 
              variant="caption" 
              className="font-semibold"
              style={{ color: getStatusColor(document) }}
            >
              {getStatusText(document)}
            </ThemedText>
          </View>
          
          {/* Document Info */}
          {document && (
            <View className="mb-3">
              {document.number && (
                <View className="flex-row justify-between items-center mb-1">
                  <ThemedText variant="caption">Document Number:</ThemedText>
                  <ThemedText variant="caption" className="font-mono">
                    {document.number}
                  </ThemedText>
                </View>
              )}
              
              <View className="flex-row justify-between items-center mb-1">
                <ThemedText variant="caption">Uploaded:</ThemedText>
                <ThemedText variant="caption">
                  {new Date(document.uploadedAt).toLocaleDateString('en-IN')}
                </ThemedText>
              </View>
              
              {document.expiryDate && (
                <View className="flex-row justify-between items-center">
                  <ThemedText variant="caption">Expires:</ThemedText>
                  <ThemedText 
                    variant="caption" 
                    className={isExpired ? 'text-danger' : isExpiringSoon ? 'text-warning' : ''}
                  >
                    {new Date(document.expiryDate).toLocaleDateString('en-IN')}
                  </ThemedText>
                </View>
              )}
              
              {document.verifiedAt && (
                <View className="flex-row justify-between items-center">
                  <ThemedText variant="caption">Verified:</ThemedText>
                  <ThemedText variant="caption" className="text-success">
                    {new Date(document.verifiedAt).toLocaleDateString('en-IN')}
                  </ThemedText>
                </View>
              )}
            </View>
          )}
          
          {/* Expiry Warning */}
          {isExpired && (
            <View className="bg-danger/10 border border-danger/20 rounded-lg p-2 mb-3">
              <View className="flex-row items-center">
                <Ionicons name="warning" size={14} color="#ef4444" />
                <ThemedText variant="caption" className="text-danger font-semibold ml-2">
                  Document has expired! Please upload a new one.
                </ThemedText>
              </View>
            </View>
          )}
          
          {isExpiringSoon && !isExpired && (
            <View className="bg-warning/10 border border-warning/20 rounded-lg p-2 mb-3">
              <View className="flex-row items-center">
                <Ionicons name="time" size={14} color="#f59e0b" />
                <ThemedText variant="caption" className="text-warning font-semibold ml-2">
                  Document expires soon! Consider renewing.
                </ThemedText>
              </View>
            </View>
          )}
          
          {/* Document Image Preview */}
          {document?.imageUrl && (
            <View className="mb-3">
              <ThemedText variant="caption" className="mb-1 text-secondary">
                Preview
              </ThemedText>
              <TouchableOpacity activeOpacity={0.8}>
                <Image 
                  source={{ uri: document.imageUrl }}
                  className="w-full h-16 rounded-lg"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Actions */}
          <View className="flex-row space-x-2">
            {!document ? (
              <TouchableOpacity
                onPress={handleUpload}
                disabled={isUploading}
                className={`flex-1 flex-row items-center justify-center py-3 rounded-lg border-2 border-dashed
                  ${isUploading ? 'border-border dark:border-darkBorder bg-gray-50' : 'border-secondary bg-secondary/5'}
                `}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={isUploading ? "cloud-upload" : "camera"} 
                  size={16} 
                  color={isUploading ? '#6b7280' : '#bd8c5e'} 
                />
                <ThemedText 
                  className={`ml-2 font-semibold ${isUploading ? 'text-textSecondary dark:text-darkTextSecondary' : 'text-secondary'}`}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </ThemedText>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  onPress={handleUpload}
                  disabled={isUploading}
                  className="flex-1 flex-row items-center justify-center py-2 rounded-lg border border-secondary"
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh" size={14} color="#bd8c5e" />
                  <ThemedText className="ml-1 text-secondary text-sm">
                    Replace
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleDelete}
                  className="flex-row items-center justify-center px-3 py-2 rounded-lg border border-danger/30"
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash" size={14} color="#ef4444" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </ThemedCard>
  );
}

// Document list component
interface DocumentsListProps {
  documents?: any[];
  onRefresh?: () => void;
}

export function DocumentsList({ documents: apiDocuments = [], onRefresh }: DocumentsListProps) {
  const [localDocuments, setLocalDocuments] = useState<DriverDocument[]>([]);

  const getDocumentImageUrl = (url?: string | null): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://')) {
      return url;
    }
    const baseUrl = appConfig.apiBaseUrl.replace('/api/v1', '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const mapApiDocumentTypeToLocal = (apiType: string): DriverDocument['type'] => {
    switch (apiType) {
      case 'driving_license_front':
        return 'license_front';
      case 'driving_license_back':
        return 'license_back';
      case 'aadhaar_front':
        return 'aadhaar_front';
      case 'aadhaar_back':
        return 'aadhaar_back';
      default:
        return 'other';
    }
  };
  
  // Map API documents to local format
  const mappedDocuments = React.useMemo(() => {
    if (apiDocuments && apiDocuments.length > 0) {
      return apiDocuments.map((doc: any) => ({
        id: doc.id,
        type: mapApiDocumentTypeToLocal(doc.document_type),
        number: doc.document_number || '',
        imageUrl: getDocumentImageUrl(doc.document_file),
        isVerified: doc.verification_status === 'approved',
        uploadedAt: new Date(doc.created_at),
        expiryDate: doc.expiry_date ? new Date(doc.expiry_date) : undefined,
        verifiedAt: doc.verified_at ? new Date(doc.verified_at) : undefined,
      }));
    }
    return [];
  }, [apiDocuments]);

  // Prefer freshly uploaded local document for preview until backend refresh catches up.
  const allDocuments = [...localDocuments, ...mappedDocuments];
  
  const requiredDocuments = [
    {
      type: 'license_front' as const,
      title: 'Driving License - Front',
      description: 'Upload the front side of your driving license',
      required: true
    },
    {
      type: 'license_back' as const,
      title: 'Driving License - Back',
      description: 'Upload the back side of your driving license',
      required: true
    },
    {
      type: 'aadhaar_front' as const,
      title: 'Aadhaar Card - Front',
      description: 'Upload the front side of your Aadhaar card',
      required: true
    },
    {
      type: 'aadhaar_back' as const,
      title: 'Aadhaar Card - Back',
      description: 'Upload the back side of your Aadhaar card',
      required: true
    }
  ];

  const handleUpload = (documentData: Partial<DriverDocument>) => {
    const newDocument: DriverDocument = {
      id: documentData.id || `doc_${Date.now()}`,
      type: documentData.type!,
      number: documentData.number || '',
      imageUrl: documentData.imageUrl || '',
      isVerified: false,
      uploadedAt: new Date(),
      ...documentData
    };

    setLocalDocuments(prev => [...prev.filter(doc => doc.type !== newDocument.type), newDocument]);
    onRefresh?.();
  };

  const handleDelete = (documentId: string) => {
    setLocalDocuments(prev => prev.filter(doc => doc.id !== documentId));
    onRefresh?.();
  };

  return (
    <View>
      <ThemedText variant="title" className="text-lg font-bold mb-4">
        Document Verification
      </ThemedText>
      
      {requiredDocuments.map((docType) => {
        const existingDocument = allDocuments.find(doc => doc.type === docType.type);
        
        return (
          <DocumentUpload
            key={docType.type}
            document={existingDocument}
            type={docType.type}
            title={docType.title}
            description={docType.description}
            required={docType.required}
            onUpload={handleUpload}
            onDelete={handleDelete}
          />
        );
      })}
    </View>
  );
}
