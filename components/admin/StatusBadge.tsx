import React from 'react';
import { View, Text } from 'react-native';
import { BrandColors } from '../../constants/Colors';

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: '#10B98120', text: BrandColors.success, label: 'Active' },
  online: { bg: '#10B98120', text: BrandColors.success, label: 'Online' },
  verified: { bg: '#10B98120', text: BrandColors.success, label: 'Verified' },
  completed: { bg: '#10B98120', text: BrandColors.success, label: 'Completed' },
  resolved: { bg: '#10B98120', text: BrandColors.success, label: 'Resolved' },
  approved: { bg: '#10B98120', text: BrandColors.success, label: 'Approved' },
  pending: { bg: '#F59E0B20', text: BrandColors.warning, label: 'Pending' },
  requested: { bg: '#F59E0B20', text: BrandColors.warning, label: 'Requested' },
  processing: { bg: '#F59E0B20', text: BrandColors.warning, label: 'Processing' },
  in_progress: { bg: '#3B82F620', text: BrandColors.info, label: 'In Progress' },
  driver_assigned: { bg: '#3B82F620', text: BrandColors.info, label: 'Driver Assigned' },
  driver_en_route: { bg: '#3B82F620', text: BrandColors.info, label: 'En Route' },
  trip_started: { bg: '#8B5CF620', text: '#8B5CF6', label: 'Trip Started' },
  suspended: { bg: '#EF444420', text: BrandColors.danger, label: 'Suspended' },
  banned: { bg: '#EF444420', text: BrandColors.danger, label: 'Banned' },
  cancelled: { bg: '#EF444420', text: BrandColors.danger, label: 'Cancelled' },
  cancelled_by_customer: { bg: '#EF444420', text: BrandColors.danger, label: 'Cancelled' },
  cancelled_by_driver: { bg: '#EF444420', text: BrandColors.danger, label: 'Cancelled' },
  cancelled_by_system: { bg: '#EF444420', text: BrandColors.danger, label: 'Cancelled' },
  rejected: { bg: '#EF444420', text: BrandColors.danger, label: 'Rejected' },
  failed: { bg: '#EF444420', text: BrandColors.danger, label: 'Failed' },
  offline: { bg: '#6B728020', text: '#6B7280', label: 'Offline' },
  inactive: { bg: '#6B728020', text: '#6B7280', label: 'Inactive' },
  // User types
  customer: { bg: '#3B82F620', text: BrandColors.info, label: 'Customer' },
  driver: { bg: '#8B5CF620', text: '#8B5CF6', label: 'Driver' },
  biker: { bg: '#F59E0B20', text: BrandColors.warning, label: 'Biker' },
  admin: { bg: '#720C1720', text: BrandColors.burgundy, label: 'Admin' },
  super_admin: { bg: '#720C1720', text: BrandColors.burgundy, label: 'Super Admin' },
};

interface StatusBadgeProps {
  status: string;
  customLabel?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, customLabel }) => {
  const style = statusStyles[status] || { bg: '#6B728020', text: '#6B7280', label: status };
  const label = customLabel || style.label;

  return (
    <View style={{ backgroundColor: style.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}>
      <Text style={{ color: style.text, fontSize: 11, fontWeight: '600' }}>{label}</Text>
    </View>
  );
};
