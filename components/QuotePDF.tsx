"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

export interface PDFData {
  projectName: string;
  companyName: string;
  cameraCount: number;
  breakdown: {
    dome: number;
    bullet: number;
    ptz: number;
    multisensor: number;
    varifocal?: number;
    unknown?: number;
  };
  retentionDays: number;
  resolution: string;
  storageTB: string;
  poeWattage: number;
  conduitFill: number;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 36,
    paddingHorizontal: 36,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#0f172a",
    marginBottom: 12,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
  },
  projectTitle: {
    fontSize: 9,
    color: "#475569",
    marginTop: 2,
    fontWeight: "bold",
  },
  metaBlock: {
    alignItems: "flex-end",
  },
  badge: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#991b1b",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
    marginBottom: 3,
  },
  metaText: {
    fontSize: 7.5,
    color: "#64748b",
  },
  heroBar: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    padding: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  heroItem: {
    flex: 1,
    alignItems: "center",
  },
  heroBorder: {
    borderRightWidth: 1,
    borderRightColor: "#cbd5e1",
  },
  heroLabel: {
    fontSize: 6.5,
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  heroValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#991b1b",
    marginTop: 1,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitleContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 3,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0f172a",
    textTransform: "uppercase",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 3,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  col1: { width: "35%", fontSize: 7.5, color: "#334155", fontWeight: "bold" },
  col2: { width: "15%", fontSize: 7.5, color: "#0f172a", textAlign: "center" },
  col3: { width: "25%", fontSize: 7.5, color: "#475569" },
  col4: { width: "25%", fontSize: 7.5, color: "#475569" },
  th: { fontSize: 7, fontWeight: "bold", color: "#475569", textTransform: "uppercase" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48.5%",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    borderRadius: 3,
    padding: 6,
    marginBottom: 5,
  },
  cardLabel: {
    fontSize: 6.5,
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  cardValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 1,
  },
  cardSub: {
    fontSize: 6.5,
    color: "#94a3b8",
  },
  narrativeText: {
    fontSize: 7.5,
    color: "#334155",
    lineHeight: 1.4,
    backgroundColor: "#fafafa",
    padding: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  signatureContainer: {
    marginTop: 12,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sigBox: {
    width: "46%",
  },
  sigLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#94a3b8",
    marginBottom: 3,
  },
  sigLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#475569",
    textTransform: "uppercase",
  },
  sigSub: {
    fontSize: 6,
    color: "#94a3b8",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 6.5,
    color: "#94a3b8",
  },
});

const MyDocument = ({ data }: { data: PDFData }) => {
  const domeCount = data.breakdown?.dome || 0;
  const bulletCount = data.breakdown?.bullet || 0;
  const ptzCount = data.breakdown?.ptz || 0;
  const multiCount = data.breakdown?.multisensor || 0;
  const variCount = data.breakdown?.varifocal || 0;
  const unknownCount = data.breakdown?.unknown || 0;

  const fieldLaborHours = (
    domeCount * 1.2 +
    bulletCount * 1.5 +
    ptzCount * 2.5 +
    multiCount * 2.0 +
    variCount * 1.6 +
    unknownCount * 1.5
  ).toFixed(1);

  const totalLaborHours = (parseFloat(fieldLaborHours) + 8).toFixed(1);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        
        {/* Header */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.companyName}>{data.companyName.toUpperCase()}</Text>
            <Text style={styles.projectTitle}>
              PROJECT: {data.projectName.toUpperCase()}
            </Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.badge}>AS/NZS & BICSI COMPLIANT</Text>
            <Text style={styles.metaText}>
              DATE: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </Text>
            <Text style={styles.metaText}>CATEGORIZED HARDWARE SCOPE</Text>
          </View>
        </View>

        {/* Hero Summary */}
        <View style={styles.heroBar}>
          <View style={[styles.heroItem, styles.heroBorder]}>
            <Text style={styles.heroLabel}>Total Cameras</Text>
            <Text style={styles.heroValue}>{data.cameraCount} Units</Text>
          </View>
          <View style={[styles.heroItem, styles.heroBorder]}>
            <Text style={styles.heroLabel}>Storage ({data.retentionDays}-Days)</Text>
            <Text style={styles.heroValue}>{data.storageTB} TB</Text>
          </View>
          <View style={[styles.heroItem, styles.heroBorder]}>
            <Text style={styles.heroLabel}>PoE Load Target</Text>
            <Text style={styles.heroValue}>{data.poeWattage} W</Text>
          </View>
          <View style={styles.heroItem}>
            <Text style={styles.heroLabel}>Est. Field Labor</Text>
            <Text style={styles.heroValue}>{totalLaborHours} Hours</Text>
          </View>
        </View>

        {/* Table Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>1. Categorized Camera Hardware Schedule</Text>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.col1, styles.th]}>Device Type</Text>
              <Text style={[styles.col2, styles.th]}>Qty</Text>
              <Text style={[styles.col3, styles.th]}>PoE Power Standard</Text>
              <Text style={[styles.col4, styles.th]}>Labor Sizing</Text>
            </View>

            {domeCount > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.col1}>Interior Dome Cameras</Text>
                <Text style={styles.col2}>{domeCount}</Text>
                <Text style={styles.col3}>IEEE 802.3af (15.4W)</Text>
                <Text style={styles.col4}>{(domeCount * 1.2).toFixed(1)} Hours</Text>
              </View>
            )}

            {bulletCount > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.col1}>Perimeter Bullet Cameras</Text>
                <Text style={styles.col2}>{bulletCount}</Text>
                <Text style={styles.col3}>IEEE 802.3af (18.0W)</Text>
                <Text style={styles.col4}>{(bulletCount * 1.5).toFixed(1)} Hours</Text>
              </View>
            )}

            {ptzCount > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.col1}>PTZ High-Power Cameras</Text>
                <Text style={styles.col2}>{ptzCount}</Text>
                <Text style={styles.col3}>IEEE 802.3bt High-PoE (60W)</Text>
                <Text style={styles.col4}>{(ptzCount * 2.5).toFixed(1)} Hours</Text>
              </View>
            )}

            {multiCount > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.col1}>180° / Multisensor Units</Text>
                <Text style={styles.col2}>{multiCount}</Text>
                <Text style={styles.col3}>IEEE 802.3at PoE+ (30W)</Text>
                <Text style={styles.col4}>{(multiCount * 2.0).toFixed(1)} Hours</Text>
              </View>
            )}

            {variCount > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.col1}>Varifocal Motorized Units</Text>
                <Text style={styles.col2}>{variCount}</Text>
                <Text style={styles.col3}>IEEE 802.3at PoE+ (20W)</Text>
                <Text style={styles.col4}>{(variCount * 1.6).toFixed(1)} Hours</Text>
              </View>
            )}

            {unknownCount > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.col1}>Unclassified / Other Drops</Text>
                <Text style={styles.col2}>{unknownCount}</Text>
                <Text style={styles.col3}>IEEE 802.3af Baseline</Text>
                <Text style={styles.col4}>{(unknownCount * 1.5).toFixed(1)} Hours</Text>
              </View>
            )}
          </View>
        </View>

        {/* Infrastructure Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>2. Infrastructure & Head-End Sizing</Text>
          </View>
          <View style={styles.grid}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Calculated NVR Storage</Text>
              <Text style={styles.cardValue}>{data.storageTB} TB Target</Text>
              <Text style={styles.cardSub}>{data.retentionDays}-Day Retention ({data.resolution})</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>PoE Switch Requirement</Text>
              <Text style={styles.cardValue}>{data.cameraCount > 16 ? "24-Port" : "16-Port"} Managed Switch</Text>
              <Text style={styles.cardSub}>Continuous Budget: {data.poeWattage}W Minimum</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Branch Pathway Capacity</Text>
              <Text style={styles.cardValue}>3/4" EMT Conduit</Text>
              <Text style={styles.cardSub}>{data.conduitFill} Cat6 Max Standard</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Main Pathway Trunk</Text>
              <Text style={styles.cardValue}>12" Wire Basket Tray</Text>
              <Text style={styles.cardSub}>Home-Run Path to MDF / Server Room</Text>
            </View>
          </View>
        </View>

        {/* Narrative */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>3. Engineering Standards Narrative</Text>
          </View>
          <Text style={styles.narrativeText}>
            Infrastructure sizing calculated in accordance with AS/NZS 3000 and ANSI/BICSI 005 pathways rules. Switch selection must deliver an aggregate PoE budget of at least {data.poeWattage}W to accommodate high-draw PTZ and multisensor drops. Category 6 horizontal runs must not exceed 328 ft (100 meters).
          </Text>
        </View>

        {/* Signatures */}
        <View style={styles.signatureContainer}>
          <View style={styles.sigBox}>
            <View style={styles.sigLine} />
            <Text style={styles.sigLabel}>Prepared By (Estimator Signature)</Text>
            <Text style={styles.sigSub}>SiteSpec Certified Security Estimator</Text>
          </View>
          <View style={styles.sigBox}>
            <View style={styles.sigLine} />
            <Text style={styles.sigLabel}>Client Acceptance Signature</Text>
            <Text style={styles.sigSub}>Authorized Representative & Date</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated via SiteSpec Engineering Engine</Text>
          <Text style={styles.footerText}>Confidential & Proprietary Commercial Scope</Text>
        </View>
      </Page>
    </Document>
  );
};

export function QuotePDFLink({ data }: { data: PDFData }) {
  return (
    <PDFDownloadLink
      document={<MyDocument data={data} />}
      fileName={`SiteSpec_Scope_${data.projectName.replace(/\s+/g, "_")}.pdf`}
      className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg transition text-sm inline-block cursor-pointer shadow-lg hover:shadow-red-600/30 font-mono tracking-wider"
    >
      {/* @ts-ignore */}
      {({ loading }) =>
        loading ? "Generating Scope PDF..." : "Export Categorized Scope PDF"
      }
    </PDFDownloadLink>
  );
}