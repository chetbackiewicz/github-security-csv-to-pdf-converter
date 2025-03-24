import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { ReportData, SeverityCount, RepositoryBreakdown, ReportOptions } from '../types';
import githubLogo from '../assets/github-mark.svg';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    borderBottomStyle: 'solid',
    paddingBottom: 20,
    marginBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 35,
    height: 35,
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    color: '#24292f',
    fontWeight: 'normal',
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 20,
    fontSize: 12,
    color: '#57606a',
  },
  infoLabel: {
    width: 120,
    fontWeight: 'bold',
  },
  infoValue: {
    flex: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  table: {
    display: 'flex' as const,
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    padding: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    flex: 1,
    fontSize: 10,
  },
});

const SeverityTable = ({ data }: { data: SeverityCount }) => {
  // Include all severity levels in the correct order
  const severityOrder = ['critical', 'high', 'medium', 'low'];
  
  // Check if there's any data to display
  const hasData = Object.values(data).some(count => count > 0);
  
  if (!hasData) {
    return (
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={styles.tableCell}><Text>Severity</Text></View>
          <View style={styles.tableCell}><Text>Count</Text></View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}><Text>No data available</Text></View>
          <View style={styles.tableCell}><Text>0</Text></View>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <View style={styles.tableCell}><Text>Severity</Text></View>
        <View style={styles.tableCell}><Text>Count</Text></View>
      </View>
      {severityOrder.map((severity) => (
        <View key={severity} style={styles.tableRow}>
          <View style={styles.tableCell}><Text>{severity}</Text></View>
          <View style={styles.tableCell}><Text>{data[severity as keyof SeverityCount] || 0}</Text></View>
        </View>
      ))}
    </View>
  );
};

const RepoBreakdownTable = ({ repos, limit, showSeverities = true }: { 
  repos: RepositoryBreakdown[], 
  limit?: number,
  showSeverities?: boolean 
}) => {
  // If limit is provided, only show that many repos
  const reposToShow = limit ? repos.slice(0, limit) : repos;
  
  return (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <View style={styles.tableCell}><Text>Repository</Text></View>
        <View style={styles.tableCell}><Text>Total</Text></View>
        {showSeverities && (
          <>
            <View style={styles.tableCell}><Text>Critical</Text></View>
            <View style={styles.tableCell}><Text>High</Text></View>
            <View style={styles.tableCell}><Text>Medium</Text></View>
            <View style={styles.tableCell}><Text>Low</Text></View>
          </>
        )}
      </View>
      {reposToShow.map((repo) => (
        <View key={repo.name} style={styles.tableRow}>
          <View style={styles.tableCell}><Text>{repo.name}</Text></View>
          <View style={styles.tableCell}><Text>{repo.alerts}</Text></View>
          {showSeverities && (
            <>
              <View style={styles.tableCell}><Text>{repo.critical}</Text></View>
              <View style={styles.tableCell}><Text>{repo.high}</Text></View>
              <View style={styles.tableCell}><Text>{repo.medium}</Text></View>
              <View style={styles.tableCell}><Text>{repo.low}</Text></View>
            </>
          )}
        </View>
      ))}
    </View>
  );
};

const SecurityReport = ({ 
  data, 
  options 
}: { 
  data: ReportData, 
  options: ReportOptions 
}) => {
  try {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Image style={styles.logo} src={githubLogo} />
              <Text style={styles.title}>GitHub Advanced Security{'\n'}Summary Report</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>GitHub Repository:</Text>
              <Text style={styles.infoValue}>{data.organization}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Generated:</Text>
              <Text style={styles.infoValue}>{new Date(data.timestamp).toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <View style={styles.tableCell}><Text>Alert Type</Text></View>
                <View style={styles.tableCell}><Text>Total</Text></View>
                <View style={styles.tableCell}><Text>Critical</Text></View>
                <View style={styles.tableCell}><Text>High</Text></View>
                <View style={styles.tableCell}><Text>Medium</Text></View>
                <View style={styles.tableCell}><Text>Low</Text></View>
              </View>
              {data.alertSummary.map((summary) => (
                <View key={summary.alertType} style={styles.tableRow}>
                  <View style={styles.tableCell}><Text>{summary.alertType}</Text></View>
                  <View style={styles.tableCell}><Text>{summary.total}</Text></View>
                  <View style={styles.tableCell}><Text>{summary.critical}</Text></View>
                  <View style={styles.tableCell}><Text>{summary.high}</Text></View>
                  <View style={styles.tableCell}><Text>{summary.medium}</Text></View>
                  <View style={styles.tableCell}><Text>{summary.low}</Text></View>
                </View>
              ))}
            </View>
          </View>

          {/* Code Scanning Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Code Scanning Alerts</Text>
            {options.includeCodeScanning && (
              <>
                <Text style={[styles.sectionTitle, { fontSize: 10 }]}>All Alerts by Severity</Text>
                <SeverityTable data={data.codeScanningAlerts} />
              </>
            )}
            {options.includeCodeScanningByRepo && (
              <>
                <Text style={[styles.sectionTitle, { fontSize: 10 }]}>
                  {options.includeTopCodeScanningRepos ? 'Top 10 Repositories Only' : 'All Alerts by Repository'}
                </Text>
                <RepoBreakdownTable 
                  repos={data.codeScanningByRepo} 
                  limit={options.includeTopCodeScanningRepos ? 10 : undefined} 
                />
              </>
            )}
          </View>

          {/* Dependabot Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dependabot Alerts</Text>
            {options.includeDependabot && (
              <>
                <Text style={[styles.sectionTitle, { fontSize: 10 }]}>All Alerts by Severity</Text>
                <SeverityTable data={data.dependabotAlerts} />
              </>
            )}
            {options.includeDependabotByRepo && (
              <>
                <Text style={[styles.sectionTitle, { fontSize: 10 }]}>
                  {options.includeTopDependabotRepos ? 'Top 10 Repositories Only' : 'All Alerts by Repository'}
                </Text>
                <RepoBreakdownTable 
                  repos={data.dependabotByRepo} 
                  limit={options.includeTopDependabotRepos ? 10 : undefined} 
                />
              </>
            )}
          </View>

          {/* Secret Scanning Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Secret Scanning Alerts</Text>
            {options.includeSecretScanning && (
              <>
                <Text style={[styles.sectionTitle, { fontSize: 10 }]}>All Alerts</Text>
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <View style={styles.tableCell}><Text>Total Alerts</Text></View>
                  </View>
                  <View style={styles.tableRow}>
                    <View style={styles.tableCell}><Text>{data.alertSummary.find(s => s.alertType === 'Secret Scanning')?.total || 0}</Text></View>
                  </View>
                </View>
              </>
            )}
            {options.includeSecretScanningByRepo && (
              <>
                <Text style={[styles.sectionTitle, { fontSize: 10 }]}>Secret Types</Text>
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <View style={styles.tableCell}><Text>Secret Type</Text></View>
                    <View style={styles.tableCell}><Text>Count</Text></View>
                  </View>
                  {Object.entries(data.secretScanningByType)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([type, count]) => (
                      <View key={type} style={styles.tableRow}>
                        <View style={styles.tableCell}><Text>{type}</Text></View>
                        <View style={styles.tableCell}><Text>{count}</Text></View>
                      </View>
                    ))}
                </View>
                <Text style={[styles.sectionTitle, { fontSize: 10 }]}>
                  {options.includeTopSecretScanningRepos ? 'Top 10 Repositories Only' : 'All Alerts by Repository'}
                </Text>
                <RepoBreakdownTable 
                  repos={data.secretScanningByRepo} 
                  limit={options.includeTopSecretScanningRepos ? 10 : undefined}
                  showSeverities={false}
                />
              </>
            )}
          </View>
        </Page>
      </Document>
    );
  } catch (error) {
    console.error('Error rendering PDF:', error);
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Error Generating Report</Text>
          </View>
          <View style={styles.section}>
            <Text>There was an error generating the PDF report. Please try again with different options.</Text>
          </View>
        </Page>
      </Document>
    );
  }
};

export default SecurityReport;