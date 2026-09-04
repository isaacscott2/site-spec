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
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#1e293b",
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 4,
  },
  section: {
    marginTop: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    color: "#475569",
  },
  value: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
  },
  narrative: {
    fontSize: 9,
    color: "#334155",
    lineHeight: 1.4,
    marginTop: 6,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: "#94a3b8",
  },
});

const MyDocument = ({ data }: { data: PDFData }) => (
  <Document>
    <Page size="LETTER" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{data.companyName.toUpperCase()}</Text>
        <Text style={styles.subtitle}>
          Project: {data.projectName} | Technical Scope & Sizing Estimate
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. SURVEILLANCE & STORAGE SIZING</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total IP Cameras Planned:</Text>
          <Text style={styles.value}>{data.cameraCount} Units</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>
            Calculated NVR Storage ({data.retentionDays}-Day Retention Target):
          </Text>
          <Text style={styles.value}>{data.storageTB} TB</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. POWER & PATHWAYS INFRASTRUCTURE</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Recommended PoE Switch Power Budget:</Text>
          <Text style={styles.value}>{data.poeWattage} W</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>
            3/4" EMT Conduit Max Fill Capacity (Cat6):
          </Text>
          <Text style={styles.value}>
            {data.conduitFill} Cables Max (NEC 40% Standard)
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. ENGINEERING SCOPE NARRATIVE</Text>
        <Text style={styles.narrative}>
          System sizing calculated in accordance with BICSI 005 pathways capacity
          rules and standard IP stream bitrates. Switch selection must deliver a
          minimum continuous budget of {data.poeWattage}W across all designated PoE ports.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Generated via SiteSpec Estimator</Text>
        <Text style={styles.footerText}>Confidential Commercial Quote</Text>
      </View>
    </Page>
  </Document>
);

export function QuotePDFLink({ data }: { data: PDFData }) {
  return (
    <PDFDownloadLink
      document={<MyDocument data={data} />}
      fileName={`SiteSpec_Scope_${data.projectName.replace(/\s+/g, "_")}.pdf`}
      className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-lg transition text-sm inline-block cursor-pointer"
    >
      {/* @ts-ignore */}
      {({ loading }) =>
        loading ? "Generating PDF Scope..." : "Export Scope PDF"
      }
    </PDFDownloadLink>
  );
}