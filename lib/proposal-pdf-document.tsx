import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ProposalData } from '@/types';

// Define colors
const PRIMARY_COLOR = '#2C5282';
const ACCENT_COLOR = '#4A90E2';
const LIGHT_GRAY = '#F7FAFC';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333333',
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: `2px solid ${PRIMARY_COLOR}`,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: `1px solid ${ACCENT_COLOR}`,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: '30%',
    fontWeight: 'bold',
    color: '#555555',
  },
  value: {
    width: '70%',
    color: '#333333',
  },
  coverageCard: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: LIGHT_GRAY,
    borderRadius: 4,
    borderLeft: `4px solid ${ACCENT_COLOR}`,
  },
  coverageTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 10,
  },
  coverageRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  coverageLabel: {
    width: '50%',
    fontSize: 9,
    color: '#666666',
  },
  coverageValue: {
    width: '50%',
    fontSize: 9,
    fontWeight: 'bold',
    color: '#333333',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingLeft: 10,
  },
  bullet: {
    width: 15,
    color: ACCENT_COLOR,
  },
  listText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: `1px solid ${PRIMARY_COLOR}`,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#666666',
    textAlign: 'center',
  },
});

interface ProposalPDFDocumentProps {
  data: ProposalData;
}

export const ProposalPDFDocument: React.FC<ProposalPDFDocumentProps> = ({ data }) => {
  const { clientInfo, agentInfo, proposalDate, coverages, notes } = data;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Metro Point Insurance</Text>
          <Text style={styles.subtitle}>Workers' Compensation Wrap Proposal</Text>
        </View>

        {/* Client Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Client Name:</Text>
            <Text style={styles.value}>{`${clientInfo.firstName} ${clientInfo.lastName}`}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{`${clientInfo.address}, ${clientInfo.city}, ${clientInfo.state} ${clientInfo.zip}`}</Text>
          </View>
          {clientInfo.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{clientInfo.email}</Text>
            </View>
          )}
          {clientInfo.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{clientInfo.phone}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Proposal Date:</Text>
            <Text style={styles.value}>{proposalDate}</Text>
          </View>
        </View>

        {/* Agent Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agent Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Agent Name:</Text>
            <Text style={styles.value}>{agentInfo.name}</Text>
          </View>
          {agentInfo.title && (
            <View style={styles.row}>
              <Text style={styles.label}>Title:</Text>
              <Text style={styles.value}>{agentInfo.title}</Text>
            </View>
          )}
          {agentInfo.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{agentInfo.email}</Text>
            </View>
          )}
          {agentInfo.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{agentInfo.phone}</Text>
            </View>
          )}
        </View>

        {/* Coverage Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coverage Details</Text>

          {Object.entries(coverages).map(([key, coverage]) => (
            <View key={key} style={styles.coverageCard}>
              <Text style={styles.coverageTitle}>{key.toUpperCase()}</Text>

              {coverage.current_carrier && (
                <View style={styles.coverageRow}>
                  <Text style={styles.coverageLabel}>Current Carrier:</Text>
                  <Text style={styles.coverageValue}>{coverage.current_carrier}</Text>
                </View>
              )}

              {coverage.current_premium && (
                <View style={styles.coverageRow}>
                  <Text style={styles.coverageLabel}>Current Premium:</Text>
                  <Text style={styles.coverageValue}>{coverage.current_premium}</Text>
                </View>
              )}

              {coverage.proposed_carrier && (
                <View style={styles.coverageRow}>
                  <Text style={styles.coverageLabel}>Proposed Carrier:</Text>
                  <Text style={styles.coverageValue}>{coverage.proposed_carrier}</Text>
                </View>
              )}

              {coverage.proposed_premium && (
                <View style={styles.coverageRow}>
                  <Text style={styles.coverageLabel}>Proposed Premium:</Text>
                  <Text style={styles.coverageValue}>{coverage.proposed_premium}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Additional Notes */}
        {notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <Text style={{ fontSize: 9, lineHeight: 1.5 }}>{notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This proposal is valid for 30 days from the proposal date. Terms and conditions apply.
          </Text>
          <Text style={styles.footerText}>
            Metro Point Insurance | {agentInfo.phone || ''} | {agentInfo.email || ''}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
