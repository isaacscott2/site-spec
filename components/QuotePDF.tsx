// components/QuotePDF.tsx
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 35,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#334155',
  },
  // Top Header Banner
  headerBanner: {
    backgroundColor: '#0F172A',
    padding: 20,
    borderRadius: 6,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  badgeText: {
    color: '#38BDF8',
    fontSize: 8,
    fontWeight: 'bold',
  },
  // Grid Callout Boxes
  gridContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 12,
  },
  cardLabel: {
    fontSize: 8,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  cardUnit: {
    fontSize: 9,
    color: '#2563EB',
    fontWeight: 'normal',
  },
  // Structured Sections
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingBottom: 5,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Data Table Rows
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowLabel: {
    color: '#475569',
  },
  rowValue: {
    fontWeight: 'bold',
    color: '#0F172A',
  },
  // Notes / Scope Block
  scopeBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
  },
  scopeText: {
    fontSize: 8,
    color: '#475569',
    lineHeight: 1.4,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 35,
    right: 35,
    textAlign: 'center',
    fontSize: 8,
    color: '#94A3B8',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
});

export function QuotePDF({ cameraCount, storageTB, bandwidth, poeWatts, conduitCables }: any) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Banner */}
        <View style={styles.headerBanner}>
          <View>
            <Text style={styles.brandTitle}>SITESPEC</Text>
            <Text style={styles.brandSubtitle}>Technical Scope & Infrastructure Sizing Estimate</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>OFFICIAL QUOTE</Text>
          </View>
        </View>

        {/* Executive Summary Cards */}
        <View style={styles.gridContainer}>
          <View style={styles.metricCard}>
            <Text style={styles.cardLabel}>System Scale</Text>
            <Text style={styles.cardValue}>
              {cameraCount} <Text style={styles.cardUnit}>Cams</Text>
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.cardLabel}>Storage Target</Text>
            <Text style={styles.cardValue}>
              {storageTB} <Text style={styles.cardUnit}>TB</Text>
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.cardLabel}>PoE Switch Min</Text>
            <Text style={styles.cardValue}>
              {poeWatts} <Text style={styles.cardUnit}>Watts</Text>
            </Text>
          </View>
        </View>

        {/* Section 1: CCTV & Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Surveillance & Storage Sizing</Text>
          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Total IP Cameras Planned</Text>
            <Text style={styles.rowValue}>{cameraCount} Units</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Calculated NVR Storage Needed</Text>
            <Text style={styles.rowValue}>{storageTB} TB</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Estimated Throughput Bandwidth</Text>
            <Text style={styles.rowValue}>{bandwidth} Mbps</Text>
          </View>
        </View>

        {/* Section 2: Power & Infrastructure */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Power & Pathways Infrastructure</Text>
          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Recommended PoE Switch Power Budget</Text>
            <Text style={styles.rowValue}>{poeWatts} W</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>3/4" EMT Conduit Max Fill Capacity (Cat6)</Text>
            <Text style={styles.rowValue}>{conduitCables} Cables Max (NEC 40% Standard)</Text>
          </View>
        </View>

        {/* Section 3: Engineering Scope Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Engineering Scope Narrative</Text>
          <View style={styles.scopeBox}>
            <Text style={styles.scopeText}>
              System sizing calculated in accordance with NEC pathways capacity rules and standard IP stream bitrates. Switch selection must deliver a minimum continuous budget of {poeWatts}W across all designated PoE ports.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Generated via SiteSpec Estimator on {currentDate} | Confidential Commercial Quote
          </Text>
        </View>
      </Page>
    </Document>
  );
}