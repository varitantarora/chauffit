import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { ThemedText } from '../common/ThemedText';
import { Ionicons } from '@expo/vector-icons';

const CANCEL_REASONS = [
  'Change of plans',
  'Driver is taking too long',
  'Booked by mistake',
  'Found another ride',
  'Other',
];

interface CancelReasonModalProps {
  visible: boolean;
  bookingId: string;
  onCancel: (reason: string) => void;
  onDismiss: () => void;
}

const CancelReasonModal = ({ visible, bookingId, onCancel, onDismiss }: CancelReasonModalProps) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherText, setOtherText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!selectedReason) return;
    const reason = selectedReason === 'Other' ? (otherText.trim() || 'Other') : selectedReason;
    setIsSubmitting(true);
    await onCancel(reason);
    setIsSubmitting(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{
          backgroundColor: 'white',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
        }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <ThemedText style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>
              Why are you cancelling?
            </ThemedText>
            <TouchableOpacity onPress={onDismiss} disabled={isSubmitting}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Reason Options */}
          {CANCEL_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason}
              onPress={() => setSelectedReason(reason)}
              disabled={isSubmitting}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                paddingHorizontal: 12,
                marginBottom: 8,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: selectedReason === reason ? '#DC2626' : '#E5E7EB',
                backgroundColor: selectedReason === reason ? '#FEF2F2' : 'white',
              }}
            >
              <View style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor: selectedReason === reason ? '#DC2626' : '#D1D5DB',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                {selectedReason === reason && (
                  <View style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: '#DC2626',
                  }} />
                )}
              </View>
              <ThemedText style={{ fontSize: 15, color: '#1F2937' }}>{reason}</ThemedText>
            </TouchableOpacity>
          ))}

          {/* Other text input */}
          {selectedReason === 'Other' && (
            <TextInput
              placeholder="Please specify your reason..."
              placeholderTextColor="#9CA3AF"
              value={otherText}
              onChangeText={setOtherText}
              multiline
              editable={!isSubmitting}
              style={{
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 12,
                padding: 12,
                marginBottom: 8,
                minHeight: 80,
                fontSize: 14,
                color: '#1F2937',
                textAlignVertical: 'top',
              }}
            />
          )}

          {/* Buttons */}
          <View style={{ marginTop: 16, gap: 10 }}>
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={!selectedReason || isSubmitting}
              style={{
                backgroundColor: !selectedReason || isSubmitting ? '#FCA5A5' : '#DC2626',
                paddingVertical: 16,
                borderRadius: 14,
                alignItems: 'center',
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <ThemedText style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                  Confirm Cancellation
                </ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onDismiss}
              disabled={isSubmitting}
              style={{
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            >
              <ThemedText style={{ color: '#6B7280', fontWeight: '600', fontSize: 15 }}>
                Go Back
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CancelReasonModal;
