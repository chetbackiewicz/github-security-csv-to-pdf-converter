import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { ReportData, SeverityCount, RepositoryBreakdown, ReportOptions } from '../types';
import githubLogo from '../assets/github-mark.svg';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  logo: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subHeader: {
    marginBottom: 20,
    fontSize: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
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

const RepoBreakdownTable = ({ repos, limit }: { repos: RepositoryBreakdown[], limit?: number }) => {
  // If limit is provided, only show that many repos
  const reposToShow = limit ? repos.slice(0, limit) : repos;
  
  return (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <View style={styles.tableCell}><Text>Repository</Text></View>
        <View style={styles.tableCell}><Text>Alert Count</Text></View>
      </View>
      {reposToShow.map((repo) => (
        <View key={repo.name} style={styles.tableRow}>
          <View style={styles.tableCell}><Text>{repo.name}</Text></View>
          <View style={styles.tableCell}><Text>{repo.alerts}</Text></View>
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
            <Image style={styles.logo} src={githubLogo} />
            <Text style={styles.title}>GitHub Advanced Security Summary Report</Text>
          </View>

          <View style={styles.subHeader}>
            <Text>Organization: {data.organization}</Text>
            <Text>Generated: {new Date(data.timestamp).toLocaleString()}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <View style={styles.tableCell}><Text>Alert Type</Text></View>
                <View style={styles.tableCell}><Text>Total</Text></View>
                <View style={styles.tableCell}><Text>Open</Text></View>
              </View>
              {data.alertSummary.map((summary) => (
                <View key={summary.alertType} style={styles.tableRow}>
                  <View style={styles.tableCell}><Text>{summary.alertType}</Text></View>
                  <View style={styles.tableCell}><Text>{summary.total}</Text></View>
                  <View style={styles.tableCell}><Text>{summary.open}</Text></View>
                </View>
              ))}
            </View>
          </View>

          {options.includeCodeScanning && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>All Code Scanning Alerts</Text>
              <SeverityTable data={data.codeScanningAlerts} />
            </View>
          )}

          {options.includeCodeScanningByRepo && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {options.includeTopCodeScanningRepos ? 'Top 10 Repositories Only' : 'All Alerts by Repository'}
              </Text>
              <RepoBreakdownTable 
                repos={data.codeScanningByRepo} 
                limit={options.includeTopCodeScanningRepos ? 10 : undefined} 
              />
            </View>
          )}

          {options.includeDependabot && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>All Dependabot Alerts</Text>
              <SeverityTable data={data.dependabotAlerts} />
            </View>
          )}

          {options.includeDependabotByRepo && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {options.includeTopDependabotRepos ? 'Top 10 Repositories Only' : 'All Alerts by Repository'}
              </Text>
              <RepoBreakdownTable 
                repos={data.dependabotByRepo} 
                limit={options.includeTopDependabotRepos ? 10 : undefined} 
              />
            </View>
          )}

          {options.includeSecretScanning && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>All Secret Scanning Alerts</Text>
            </View>
          )}

          {options.includeSecretScanningByRepo && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {options.includeTopSecretScanningRepos ? 'Top 10 Repositories Only' : 'All Alerts by Repository'}
              </Text>
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
              <RepoBreakdownTable 
                repos={data.secretScanningByRepo} 
                limit={options.includeTopSecretScanningRepos ? 10 : undefined} 
              />
            </View>
          )}

          {options.includeTopSecretScanningRepos && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {options.includeTopSecretScanningRepos ? 'Top 10 Repositories Only' : 'All Alerts by Repository'}
              </Text>
              <RepoBreakdownTable 
                repos={data.secretScanningByRepo} 
                limit={10} 
              />
            </View>
          )}
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