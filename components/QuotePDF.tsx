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
    padding: 36,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#0f172a",
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  companyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
  },
  projectSub: {
    fontSize: 9,
    color: "#475569",
    marginTop: 2,
  },
  docBadge: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#2563eb",
    textAlign: "right",
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 3,
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    marginBottom: 6,
  },
  label: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
  },
  value: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 1,
  },
  narrative: {
    fontSize: 8.5,
    color: "#334155",
    lineHeight: 1.4,
  },
  signatureBlock: {
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sigLine: {
    width: "45%",
  },
  sigLabel: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 20,
  },
  borderLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#94a3b8",
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7.5,
    color: "#94a3b8",
  },
});

const MyDocument = ({ data }: { data: PDFData }) => {
  // Calculated Engineering Metrics
  const estimatedMbps = data.cameraCount * 4; // ~4Mbps per camera stream
  const fieldLaborHours = (data.cameraCount * 1.5).toFixed(1); // 1.5 hrs per cam drop/mount
  const configLaborHours = "8.0";
  const totalLaborHours = (parseFloat(fieldLaborHours) + 8).toFixed(1);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header Block */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyTitle}>{data.companyName.toUpperCase()}</Text>
            <Text style={styles.projectSub}>
              Project: {data.projectName} | Scope & Infrastructure Sizing
            </Text>
          </View>
          <View>
            <Text style={styles.docBadge}>BICSI / IEEE COMPLIANT</Text>
            <Text style={styles.projectSub}>
              Date: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </Text>
          </View>
        </View>

        {/* Section 1: Video & NVR Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Surveillance & Storage Architecture</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Total IP Cameras Planned</Text>
              <Text style={styles.value}>{data.cameraCount} Units</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Target Stream Bandwidth</Text>
              <Text style={styles.value}>~{estimatedMbps} Mbps (H.265 Main Profile)</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>NVR Storage Target</Text>
              <Text style={styles.value}>{data.storageTB} TB ({data.retentionDays}-Day Retention)</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Recording Profile</Text>
              <Text style={styles.value}>15 FPS @ 4MP Resolution</Text>
            </View>
          </View>
        </View>

        {/* Section 2: Power & Pathways */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Power & Pathways Infrastructure</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>PoE Power Budget Target</Text>
              <Text style={styles.value}>{data.poeWattage} Watts Minimum</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Recommended Hardware</Text>
              <Text style={styles.value}>
                {data.cameraCount > 16 ? "24-Port" : "16-Port"} Managed PoE+ Switch
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Branch Conduit Capacity</Text>
              <Text style={styles.value}>3/4" EMT ({data.conduitFill} Cat6 Max per NEC 40%)</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Main Pathway Trunk</Text>
              <Text style={styles.value}>12" Wire Basket Tray to MDF/IDF</Text>
            </View>
          </View>
        </View>

        {/* Section 3: Labor Estimate */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Estimated Labor Hours Breakdown</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Field Rough-In & Mounting</Text>
              <Text style={styles.value}>{fieldLaborHours} Hours</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>MDF Head-End Config & Testing</Text>
              <Text style={styles.value}>{configLaborHours} Hours</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Total Estimated Field Labor</Text>
              <Text style={styles.value}>{totalLaborHours} Total Hours</Text>
            </View>
          </View>
        </View>

        {/* Section 4: Engineering Scope Narrative */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Engineering Standards Narrative</Text>
          <Text style={styles.narrative}>
            System sizing calculated in accordance with ANSI/BICSI 005 pathways capacity rules and standard IP stream bitrates. Network switch selection must deliver a continuous PoE budget of at least {data.poeWattage}W across active ports. All cabling runs must not exceed 328 feet (100 meters) without fiber ext.
          </Text>
        </View>

        {/* Executive Sign-off Block */}
        <View style={styles.signatureBlock}>
          <View style={styles.sigLine}>
            <Text style={styles.sigLabel}>Prepared By (Estimator Signature)</Text>
            <View style={styles.borderLine} />
          </View>
          <View style={styles.sigLine}>
            <Text style={styles.sigLabel}>Client Acceptance Signature</Text>
            <View style={styles.borderLine} />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated via SiteSpec Engineering Platform</Text>
          <Text style={styles.footerText}>Confidential & Proprietary Scope</Text>
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
      className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-lg transition text-sm inline-block cursor-pointer shadow-lg hover:shadow-blue-500/20"
    >
      {/* @ts-ignore */}
      {({ loading }) =>
        loading ? "Generating Executive Scope..." : "Export Executive Scope PDF"
      }
    </PDFDownloadLink>
  );
}