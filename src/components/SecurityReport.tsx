import { Document, Page, Text, View, StyleSheet, Image, Svg, Circle, Path } from '@react-pdf/renderer';
import { ReportData, SeverityCount, RepositoryBreakdown } from '../types';
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
  chartSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chartContainer: {
    width: '45%',
  },
  pieChart: {
    width: 120,
    height: 120,
  },
});

const PieChart = ({ data }: { data: SeverityCount }) => {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);
  if (total === 0) return null;

  let currentAngle = 0;
  const colors = {
    critical: '#dc3545',
    high: '#fd7e14',
    medium: '#ffc107',
    low: '#28a745',
  };

  const paths = Object.entries(data).map(([severity, count]) => {
    if (count === 0) return null;
    const percentage = count / total;
    const angle = percentage * 360;
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    // Calculate start and end points
    const startX = Math.cos((currentAngle * Math.PI) / 180) * 75 + 75;
    const startY = Math.sin((currentAngle * Math.PI) / 180) * 75 + 75;
    const endX = Math.cos(((currentAngle + angle) * Math.PI) / 180) * 75 + 75;
    const endY = Math.sin(((currentAngle + angle) * Math.PI) / 180) * 75 + 75;

    const path = `M 75 75 L ${startX} ${startY} A 75 75 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
    const element = (
      <Path
        key={severity}
        d={path}
        fill={colors[severity as keyof typeof colors]}
      />
    );

    currentAngle += angle;
    return element;
  });

  return (
    <Svg viewBox="0 0 150 150" style={styles.pieChart}>
      {paths}
    </Svg>
  );
};

const SeverityTable = ({ data }: { data: SeverityCount }) => {
  const severityOrder = ['critical', 'high', 'low'];
  return (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <View style={styles.tableCell}><Text>Severity</Text></View>
        <View style={styles.tableCell}><Text>Count</Text></View>
      </View>
      {severityOrder.map((severity) => (
        <View key={severity} style={styles.tableRow}>
          <View style={styles.tableCell}><Text>{severity}</Text></View>
          <View style={styles.tableCell}><Text>{data[severity as keyof SeverityCount]}</Text></View>
        </View>
      ))}
    </View>
  );
};

const RepoBreakdownTable = ({ repos }: { repos: RepositoryBreakdown[] }) => (
  <View style={styles.table}>
    <View style={[styles.tableRow, styles.tableHeader]}>
      <View style={styles.tableCell}><Text>Repository</Text></View>
      <View style={styles.tableCell}><Text>Alert Count</Text></View>
    </View>
    {repos.map((repo) => (
      <View key={repo.name} style={styles.tableRow}>
        <View style={styles.tableCell}><Text>{repo.name}</Text></View>
        <View style={styles.tableCell}><Text>{repo.alerts}</Text></View>
      </View>
    ))}
  </View>
);

const SecurityReport = ({ data }: { data: ReportData }) => (
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Code Scanning Alerts</Text>
        <View style={styles.chartSection}>
          <View style={styles.chartContainer}>
            <PieChart data={data.codeScanningAlerts} />
          </View>
          <View style={styles.chartContainer}>
            <SeverityTable data={data.codeScanningAlerts} />
          </View>
        </View>
        <Text style={styles.sectionTitle}>Alerts by Repository</Text>
        <RepoBreakdownTable repos={data.codeScanningByRepo} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dependabot Alerts</Text>
        <View style={styles.chartSection}>
          <View style={styles.chartContainer}>
            <PieChart data={data.dependabotAlerts} />
          </View>
          <View style={styles.chartContainer}>
            <SeverityTable data={data.dependabotAlerts} />
          </View>
        </View>
        <Text style={styles.sectionTitle}>Alerts by Repository</Text>
        <RepoBreakdownTable repos={data.dependabotByRepo} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Secret Scanning</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableCell}><Text>Secret Type</Text></View>
            <View style={styles.tableCell}><Text>Count</Text></View>
          </View>
          {Object.entries(data.secretScanningByType).map(([type, count]) => (
            <View key={type} style={styles.tableRow}>
              <View style={styles.tableCell}><Text>{type}</Text></View>
              <View style={styles.tableCell}><Text>{count}</Text></View>
            </View>
          ))}
        </View>
        <Text style={styles.sectionTitle}>Alerts by Repository</Text>
        <RepoBreakdownTable repos={data.secretScanningByRepo} />
      </View>
    </Page>
  </Document>
);

export default SecurityReport; 