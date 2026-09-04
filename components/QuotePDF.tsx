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
  retentionDays: number;
  storageTB: string;
  poeWattage: number;
  conduitFill: number;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  
  // Header Component
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: "#0f172a",
    marginBottom: 16,
  },
  companyName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
    letterSpacing: 0.5,
  },
  projectTitle: {
    fontSize: 10,
    color: "#475569",
    marginTop: 3,
    fontWeight: "bold",
  },
  metaBlock: {
    alignItems: "flex-end",
  },
  badge: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#1e3a8a",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 8,
    color: "#64748b",
  },

  // Executive Summary Bar
  heroBar: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
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
    fontSize: 7,
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 2,
  },
  heroValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e3a8a",
  },

  // Section Layouts
  section: {
    marginBottom: 14,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Metric Cards Grid
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
    borderRadius: 4,
    padding: 7,
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 7,
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  cardValue: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 2,
  },
  cardSub: {
    fontSize: 7,
    color: "#94a3b8",
    marginTop: 1,
  },

  // Narrative
  narrativeText: {
    fontSize: 8,
    color: "#334155",
    lineHeight: 1.45,
    backgroundColor: "#fafafa",
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },

  // Sign-off Block
  signatureContainer: {
    marginTop: 16,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sigBox: {
    width: "46%",
  },
  sigLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#94a3b8",
    marginBottom: 4,
  },
  sigLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#475569",
    textTransform: "uppercase",
  },
  sigSub: {
    fontSize: 6.5,
    color: "#94a3b8",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    color: "#94a3b8",
  },
});

const MyDocument = ({ data }: { data: PDFData }) => {
  const estimatedMbps = data.cameraCount * 4;
  const fieldLaborHours = (data.cameraCount * 1.5).toFixed(1);
  const configLaborHours = "8.0";
  const totalLaborHours = (parseFloat(fieldLaborHours) + 8).toFixed(1);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        
        {/* Document Header */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.companyName}>{data.companyName.toUpperCase()}</Text>
            <Text style={styles.projectTitle}>
              PROJECT: {data.projectName.toUpperCase()}
            </Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.badge}>BICSI / IEEE COMPLIANT</Text>
            <Text style={styles.metaText}>
              DATE: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </Text>
            <Text style={styles.metaText}>ENGINEERING SCOPE ESTIMATE</Text>
          </View>
        </View>

        {/* Executive Summary Bar */}
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
            <Text style={styles.heroLabel}>PoE Power Budget</Text>
            <Text style={styles.heroValue}>{data.poeWattage} W</Text>
          </View>
          <View style={styles.heroItem}>
            <Text style={styles.heroLabel}>Est. Field Labor</Text>
            <Text style={styles.heroValue}>{totalLaborHours} Hours</Text>
          </View>
        </View>

        {/* Section 1: Video & NVR Architecture */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>1. Surveillance & Storage Architecture</Text>
          </View>
          <View style={styles.grid}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>System Scale</Text>
              <Text style={styles.cardValue}>{data.cameraCount} IP Devices</Text>
              <Text style={styles.cardSub}>4MP / 15 FPS Baseline</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Network Throughput</Text>
              <Text style={styles.cardValue}>~{estimatedMbps} Mbps</Text>
              <Text style={styles.cardSub}>H.265 Main Profile Codec</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Storage Array Capacity</Text>
              <Text style={styles.cardValue}>{data.storageTB} TB Net Target</Text>
              <Text style={styles.cardSub}>{data.retentionDays}-Day Continuous Retention</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Recommended Head-End</Text>
              <Text style={styles.cardValue}>{data.cameraCount > 16 ? "32-Channel" : "16-Channel"} NVR</Text>
              <Text style={styles.cardSub}>RAID-5 Storage Configuration</Text>
            </View>
          </View>
        </View>

        {/* Section 2: Power & Pathways */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>2. Power & Pathways Infrastructure</Text>
          </View>
          <View style={styles.grid}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Min. PoE Power Budget</Text>
              <Text style={styles.cardValue}>{data.poeWattage} Watts Continuous</Text>
              <Text style={styles.cardSub}>IEEE 802.3at / PoE+ Standard</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>PoE Switch Spec</Text>
              <Text style={styles.cardValue}>{data.cameraCount > 16 ? "24-Port" : "16-Port"} Managed Switch</Text>
              <Text style={styles.cardSub}>370W PSU Minimum Output</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Branch Pathway Capacity</Text>
              <Text style={styles.cardValue}>3/4" EMT Conduit</Text>
              <Text style={styles.cardSub}>{data.conduitFill} Cat6 Max (NEC 40% Rule)</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Main Pathway Trunk</Text>
              <Text style={styles.cardValue}>12" Wire Basket Tray</Text>
              <Text style={styles.cardSub}>Home-Run Path to MDF Room</Text>
            </View>
          </View>
        </View>

        {/* Section 3: Estimated Labor Hours */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>3. Estimated Labor Allocation</Text>
          </View>
          <View style={styles.grid}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Field Mounting & Drops</Text>
              <Text style={styles.cardValue}>{fieldLaborHours} Hours</Text>
              <Text style={styles.cardSub}>1.5 hrs / camera location</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>MDF Rack & NVR Setup</Text>
              <Text style={styles.cardValue}>{configLaborHours} Hours</Text>
              <Text style={styles.cardSub}>Configuration & Testing</Text>
            </View>
          </View>
        </View>

        {/* Section 4: Engineering Standards Narrative */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>4. Engineering Standards & Compliance</Text>
          </View>
          <Text style={styles.narrativeText}>
            System sizing calculated in accordance with ANSI/BICSI 005 pathways capacity rules and standard IP stream bitrates. Network switch selection must deliver a continuous PoE budget of at least {data.poeWattage}W across active ports. All Category 6 horizontal cabling runs must not exceed 328 feet (100 meters) without fiber media extension.
          </Text>
        </View>

        {/* Executive Sign-off Block */}
        <View style={styles.signatureContainer}>
          <View style={styles.sigBox}>
            <View style={styles.sigLine} />
            <Text style={styles.sigLabel}>Prepared By (Estimator Signature)</Text>
            <Text style={styles.sigSub}>SiteSpec Certified Estimator</Text>
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
      className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition text-sm inline-block cursor-pointer shadow-lg hover:shadow-blue-500/20"
    >
      {/* @ts-ignore */}
      {({ loading }) =>
        loading ? "Generating Executive Scope PDF..." : "Export Executive Scope PDF"
      }
    </PDFDownloadLink>
  );
}