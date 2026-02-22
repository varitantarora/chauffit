import React from 'react';
import { View, Text } from 'react-native';

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: '#10B98120', text: '#10B981', label: 'Active' },
  online: { bg: '#10B98120', text: '#10B981', label: 'Online' },
  verified: { bg: '#10B98120', text: '#10B981', label: 'Verified' },
  completed: { bg: '#10B98120', text: '#10B981', label: 'Completed' },
  resolved: { bg: '#10B98120', text: '#10B981', label: 'Resolved' },
  approved: { bg: '#10B98120', text: '#10B981', label: 'Approved' },
  pending: { bg: '#F59E0B20', text: '#F59E0B', label: 'Pending' },
  requested: { bg: '#F59E0B20', text: '#F59E0B', label: 'Requested' },
  processing: { bg: '#F59E0B20', text: '#F59E0B', label: 'Processing' },
  in_progress: { bg: '#3B82F620', text: '#3B82F6', label: 'In Progress' },
  driver_assigned: { bg: '#3B82F620', text: '#3B82F6', label: 'Driver Assigned' },
  driver_en_route: { bg: '#3B82F620', text: '#3B82F6', label: 'En Route' },
  trip_started: { bg: '#8B5CF620', text: '#8B5CF6', label: 'Trip Started' },
  suspended: { bg: '#EF444420', text: '#EF4444', label: 'Suspended' },
  banned: { bg: '#EF444420', text: '#EF4444', label: 'Banned' },
  cancelled: { bg: '#EF444420', text: '#EF4444', label: 'Cancelled' },
  cancelled_by_customer: { bg: '#EF444420', text: '#EF4444', label: 'Cancelled' },
  cancelled_by_driver: { bg: '#EF444420', text: '#EF4444', label: 'Cancelled' },
  cancelled_by_system: { bg: '#EF444420', text: '#EF4444', label: 'Cancelled' },
  rejected: { bg: '#EF444420', text: '#EF4444', label: 'Rejected' },
  failed: { bg: '#EF444420', text: '#EF4444', label: 'Failed' },
  offline: { bg: '#6B728020', text: '#6B7280', label: 'Offline' },
  inactive: { bg: '#6B728020', text: '#6B7280', label: 'Inactive' },
  // User types
  customer: { bg: '#3B82F620', text: '#3B82F6', label: 'Customer' },
  driver: { bg: '#8B5CF620', text: '#8B5CF6', label: 'Driver' },
  biker: { bg: '#F59E0B20', text: '#F59E0B', label: 'Biker' },
  admin: { bg: '#720C1720', text: '#720C17', label: 'Admin' },
  super_admin: { bg: '#720C1720', text: '#720C17', label: 'Super Admin' },
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
