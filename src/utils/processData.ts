import { parse } from 'papaparse';
import { SecurityAlert, ReportData, SeverityCount, SecretTypeCount, RepositoryBreakdown } from '../types';

const initializeSeverityCount = (): SeverityCount => ({
  critical: 0,
  high: 0,
  medium: 0,
  low: 0,
});

const mapSeverity = (severity: string): keyof SeverityCount => {
  const sev = severity.toLowerCase();
  if (sev === 'medium') return 'high';
  if (sev === 'critical' || sev === 'high' || sev === 'low') return sev as keyof SeverityCount;
  return 'low';
};

const getOrganizationFromRepo = (repoFullName: string): string => {
  const parts = repoFullName.split('/');
  return parts[0] || 'Unknown Organization';
};

const updateRepoBreakdown = (
  breakdown: Map<string, number>,
  repoName: string,
  count: number = 1
) => {
  breakdown.set(repoName, (breakdown.get(repoName) || 0) + count);
};

export const processCSVData = (file: File): Promise<ReportData> => {
  return new Promise((resolve, reject) => {
    parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log('CSV parsing complete:', results);
        if (results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors);
          reject(new Error('Failed to parse CSV file'));
          return;
        }

        try {
          const alerts = results.data as SecurityAlert[];
          if (!alerts || alerts.length === 0) {
            reject(new Error('No data found in CSV file'));
            return;
          }

          const organization = getOrganizationFromRepo(alerts[0]?.Repository || '');
          
          const codeScanningAlerts = initializeSeverityCount();
          const dependabotAlerts = initializeSeverityCount();
          const secretScanningByType: SecretTypeCount = {};
          
          const codeScanningRepos = new Map<string, number>();
          const dependabotRepos = new Map<string, number>();
          const secretScanningRepos = new Map<string, number>();
          
          let totalCodeScanning = 0;
          let totalSecretScanning = 0;
          let totalDependabot = 0;

          alerts.forEach((alert) => {
            if (!alert.Tool) {
              console.warn('Alert missing Tool field:', alert);
              return;
            }

            const mappedSeverity = mapSeverity(alert.Severity);

            switch (alert.Tool.toLowerCase()) {
              case 'codeql':
                totalCodeScanning++;
                codeScanningAlerts[mappedSeverity]++;
                updateRepoBreakdown(codeScanningRepos, alert.Repository);
                break;
              case 'secret-scanning':
                totalSecretScanning++;
                if (alert['Secret Type']) {
                  secretScanningByType[alert['Secret Type']] = 
                    (secretScanningByType[alert['Secret Type']] || 0) + 1;
                }
                updateRepoBreakdown(secretScanningRepos, alert.Repository);
                break;
              case 'dependabot':
                totalDependabot++;
                dependabotAlerts[mappedSeverity]++;
                updateRepoBreakdown(dependabotRepos, alert.Repository);
                break;
              default:
                console.warn('Unknown tool type:', alert.Tool);
            }
          });

          const mapToBreakdown = (map: Map<string, number>): RepositoryBreakdown[] => {
            return Array.from(map.entries())
              .map(([name, alerts]) => ({ name, alerts }))
              .sort((a, b) => b.alerts - a.alerts);
          };

          const reportData: ReportData = {
            organization,
            timestamp: new Date().toISOString(),
            alertSummary: [
              { alertType: 'Code Scanning', total: totalCodeScanning, open: totalCodeScanning },
              { alertType: 'Secret Scanning', total: totalSecretScanning, open: totalSecretScanning },
              { alertType: 'Dependabot', total: totalDependabot, open: totalDependabot },
            ],
            codeScanningAlerts,
            dependabotAlerts,
            secretScanningByType,
            codeScanningByRepo: mapToBreakdown(codeScanningRepos),
            dependabotByRepo: mapToBreakdown(dependabotRepos),
            secretScanningByRepo: mapToBreakdown(secretScanningRepos),
          };

          console.log('Generated report data:', reportData);
          resolve(reportData);
        } catch (error) {
          console.error('Error processing CSV data:', error);
          reject(error);
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        reject(error);
      },
    });
  });
}; 