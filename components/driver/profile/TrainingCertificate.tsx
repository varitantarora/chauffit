import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../common/ThemedText';
import { useI18nStore } from '../../../store/i18nStore';
import { TrainingSession } from '../../../services/api/DriverApiService';

interface TrainingCertificateProps {
  driverName: string;
  phoneNumber: string;
  trainingSession: TrainingSession;
  isDarkMode?: boolean;
}

export function TrainingCertificate({
  driverName,
  phoneNumber,
  trainingSession,
  isDarkMode = false,
}: TrainingCertificateProps) {
  const t = useI18nStore((state) => state.t);
  const batch = trainingSession.batch;

  const formattedDate = batch?.date
    ? new Date(batch.date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'N/A';

  const issuedDate = trainingSession.updated_at
    ? new Date(trainingSession.updated_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

  const timeRange =
    batch?.start_time && batch?.end_time
      ? `${batch.start_time} – ${batch.end_time}`
      : null;

  // Gold & burgundy colour palette (works for both light/dark)
  const gold = '#C9952D';
  const goldLight = '#F5D78E';
  const burgundy = '#720C17';
  const bgColor = isDarkMode ? '#1C1208' : '#FFFBF0';
  const borderColor = isDarkMode ? '#6B4C10' : '#D4A853';
  const textPrimary = isDarkMode ? '#F5DFA0' : '#3D2700';
  const textSecondary = isDarkMode ? '#C9A84C' : '#7A5C1E';
  const divider = isDarkMode ? '#4A3008' : '#E8C87A';

  return (
    <View style={[styles.outerBorder, { borderColor }]}>
      <View style={[styles.certificate, { backgroundColor: bgColor, borderColor: divider }]}>
        {/* Corner Ornaments */}
        <View style={[styles.cornerTL, { borderColor: gold }]} />
        <View style={[styles.cornerTR, { borderColor: gold }]} />
        <View style={[styles.cornerBL, { borderColor: gold }]} />
        <View style={[styles.cornerBR, { borderColor: gold }]} />

        {/* Header */}
        <View style={styles.header}>
          {/* Crest / seal */}
          <View style={[styles.sealOuter, { borderColor: gold }]}>
            <View style={[styles.sealInner, { backgroundColor: burgundy }]}>
              <Ionicons name="car" size={22} color={goldLight} />
            </View>
          </View>

          <ThemedText style={[styles.brandName, { color: burgundy }]}>CHAUFFIT</ThemedText>
          <ThemedText style={[styles.subBrand, { color: textSecondary }]}>
            {t('professionalDriverServices')}
          </ThemedText>
        </View>

        {/* Gold divider */}
        <View style={[styles.goldLine, { backgroundColor: gold }]} />

        {/* Certificate title */}
        <View style={styles.titleSection}>
          <ThemedText style={[styles.certLabel, { color: textSecondary }]}>
            {t('certificateOfCompletion')}
          </ThemedText>
          <ThemedText style={[styles.certSubLabel, { color: textPrimary }]}>
            {t('thisCertifiesThat')}
          </ThemedText>
        </View>

        {/* Driver Name */}
        <View style={[styles.nameBox, { borderColor: divider }]}>
          <ThemedText style={[styles.driverName, { color: burgundy }]}>
            {driverName}
          </ThemedText>
          <ThemedText style={[styles.phoneText, { color: textSecondary }]}>
            {phoneNumber}
          </ThemedText>
        </View>

        {/* Completion text */}
        <ThemedText style={[styles.completionText, { color: textPrimary }]}>
          {t('hasSuccessfullyCompleted')}{'\n'}
          <ThemedText style={{ fontWeight: '700', color: burgundy }}>
            {t('chauffitProfessionalDriverTraining')}
          </ThemedText>
        </ThemedText>

        {/* Gold divider thin */}
        <View style={[styles.thinLine, { backgroundColor: divider }]} />

        {/* Training Details */}
        <View style={styles.detailsGrid}>
          {/* Date */}
          <View style={styles.detailItem}>
            <View style={[styles.detailIconWrap, { backgroundColor: `${gold}20` }]}>
              <Ionicons name="calendar" size={16} color={gold} />
            </View>
            <ThemedText style={[styles.detailLabel, { color: textSecondary }]}>
              {t('dateOfTraining')}
            </ThemedText>
            <ThemedText style={[styles.detailValue, { color: textPrimary }]}>
              {formattedDate}
            </ThemedText>
            {timeRange && (
              <ThemedText style={[styles.detailSub, { color: textSecondary }]}>
                {timeRange}
              </ThemedText>
            )}
          </View>

          {/* Vertical separator */}
          <View style={[styles.verticalDivider, { backgroundColor: divider }]} />

          {/* Location */}
          <View style={styles.detailItem}>
            <View style={[styles.detailIconWrap, { backgroundColor: `${gold}20` }]}>
              <Ionicons name="location" size={16} color={gold} />
            </View>
            <ThemedText style={[styles.detailLabel, { color: textSecondary }]}>
              {t('location')}
            </ThemedText>
            <ThemedText style={[styles.detailValue, { color: textPrimary }]} numberOfLines={2}>
              {batch?.location_name ?? 'N/A'}
            </ThemedText>
            {batch?.location_address ? (
              <ThemedText
                style={[styles.detailSub, { color: textSecondary }]}
                numberOfLines={2}
              >
                {batch.location_address}
              </ThemedText>
            ) : null}
          </View>
        </View>

        {/* Gold divider thin */}
        <View style={[styles.thinLine, { backgroundColor: divider }]} />

        {/* Footer */}
        <View style={styles.footer}>
          {/* Issue date */}
          <View style={styles.footerLeft}>
            <ThemedText style={[styles.footerLabel, { color: textSecondary }]}>
              {t('issuedOn')}
            </ThemedText>
            <ThemedText style={[styles.footerValue, { color: textPrimary }]}>
              {issuedDate}
            </ThemedText>
          </View>

          {/* Certified badge */}
          <View style={[styles.certifiedBadge, { backgroundColor: `${burgundy}15`, borderColor: burgundy }]}>
            <Ionicons name="shield-checkmark" size={14} color={burgundy} />
            <ThemedText style={[styles.certifiedText, { color: burgundy }]}>
              {t('certified')}
            </ThemedText>
          </View>

          {/* Certificate ID */}
          <View style={styles.footerRight}>
            <ThemedText style={[styles.footerLabel, { color: textSecondary }]}>
              {t('certId')}
            </ThemedText>
            <ThemedText style={[styles.footerValue, { color: textPrimary }]}>
              #{String(trainingSession.id).substring(0, 8).toUpperCase()}
            </ThemedText>
          </View>
        </View>

        {/* Bottom gold line */}
        <View style={[styles.goldLine, { backgroundColor: gold }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerBorder: {
    borderWidth: 3,
    borderRadius: 18,
    padding: 4,
  },
  certificate: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
  },

  // Corner ornaments
  cornerTL: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 22,
    height: 22,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 22,
    height: 22,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 22,
    height: 22,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomRightRadius: 4,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 12,
  },
  sealOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sealInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 6,
    marginBottom: 2,
  },
  subBrand: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '500',
  },

  // Dividers
  goldLine: {
    height: 2.5,
    borderRadius: 2,
    marginVertical: 12,
  },
  thinLine: {
    height: 1,
    borderRadius: 1,
    marginVertical: 12,
  },
  verticalDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginHorizontal: 8,
  },

  // Title
  titleSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  certLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 4,
  },
  certSubLabel: {
    fontSize: 13,
    fontStyle: 'italic',
  },

  // Name box
  nameBox: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  driverName: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
  },
  phoneText: {
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 1,
  },

  // Completion text
  completionText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },

  // Details grid
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  detailIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  detailSub: {
    fontSize: 10,
    textAlign: 'center',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  footerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  footerLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  footerValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  certifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  certifiedText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
