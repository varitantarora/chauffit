import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedCard } from '../../common/ThemedCard';
import { ThemedText } from '../../common/ThemedText';
import { PrimaryButton } from '../../common/PrimaryButton';
import { DriverDocument } from '../../../types/navigation';
import { useAuthStore } from '../../../store/authStore';

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
      case 'license':
        return 'card';
      case 'insurance':
        return 'shield-checkmark';
      case 'registration':
        return 'document-text';
      case 'permit':
        return 'ribbon';
      case 'passport':
        return 'airplane';
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

  const uploadFromCamera = async () => {
    try {
      setIsUploading(true);
      
      // Mock camera upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockDocument: Partial<DriverDocument> = {
        id: `doc_${Date.now()}`,
        type,
        number: generateMockNumber(type),
        imageUrl: 'https://via.placeholder.com/400x300?text=Document',
        isVerified: false,
        uploadedAt: new Date()
      };
      
      onUpload(mockDocument);
      
      Alert.alert(
        'Upload Successful',
        'Your document has been uploaded and is under review. You will be notified once it\'s verified.'
      );
      
    } catch (error) {
      Alert.alert('Upload Failed', 'Please try again later.');
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFromGallery = async () => {
    try {
      setIsUploading(true);
      
      // Mock gallery upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockDocument: Partial<DriverDocument> = {
        id: `doc_${Date.now()}`,
        type,
        number: generateMockNumber(type),
        imageUrl: 'https://via.placeholder.com/400x300?text=Document',
        isVerified: false,
        uploadedAt: new Date()
      };
      
      onUpload(mockDocument);
      
      Alert.alert(
        'Upload Successful',
        'Your document has been uploaded and is under review. You will be notified once it\'s verified.'
      );
      
    } catch (error) {
      Alert.alert('Upload Failed', 'Please try again later.');
    } finally {
      setIsUploading(false);
    }
  };

  const generateMockNumber = (type: DriverDocument['type']) => {
    switch (type) {
      case 'license':
        return `DL-${Math.random().toString().substr(2, 10)}`;
      case 'insurance':
        return `INS-${Math.random().toString().substr(2, 8)}`;
      case 'registration':
        return `REG-${Math.random().toString().substr(2, 8)}`;
      case 'permit':
        return `PER-${Math.random().toString().substr(2, 8)}`;
      default:
        return `DOC-${Math.random().toString().substr(2, 8)}`;
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
              <TouchableOpacity activeOpacity={0.8}>
                <Image 
                  source={{ uri: document.imageUrl }}
                  className="w-full h-24 rounded-lg"
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
                  ${isUploading ? 'border-gray-300 bg-gray-50' : 'border-secondary bg-secondary/5'}
                `}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={isUploading ? "cloud-upload" : "camera"} 
                  size={16} 
                  color={isUploading ? '#6b7280' : '#bd8c5e'} 
                />
                <ThemedText 
                  className={`ml-2 font-semibold ${isUploading ? 'text-gray-500' : 'text-secondary'}`}
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
export function DocumentsList() {
  const [documents, setDocuments] = useState<DriverDocument[]>([]);
  
  const requiredDocuments = [
    {
      type: 'license' as const,
      title: 'Driving License',
      description: 'Upload your valid Indian driving license',
      required: true
    },
    {
      type: 'insurance' as const,
      title: 'Insurance Certificate',
      description: 'Valid vehicle insurance certificate',
      required: true
    },
    {
      type: 'registration' as const,
      title: 'Vehicle Registration',
      description: 'RC book of your registered vehicle',
      required: true
    },
    {
      type: 'permit' as const,
      title: 'Commercial Permit',
      description: 'Commercial driving permit (if applicable)',
      required: false
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

    setDocuments(prev => [...prev.filter(doc => doc.type !== newDocument.type), newDocument]);
  };

  const handleDelete = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  return (
    <View>
      <ThemedText variant="title" className="text-lg font-bold mb-4">
        Document Verification
      </ThemedText>
      
      {requiredDocuments.map((docType) => {
        const existingDocument = documents.find(doc => doc.type === docType.type);
        
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