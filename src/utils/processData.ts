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
  if (sev === 'critical' || sev === 'high' || sev === 'medium' || sev === 'low') {
    return sev as keyof SeverityCount;
  }
  return 'low'; // Default to low for unknown severity levels
};

const getOrganizationFromRepo = (repoFullName: string): string => {
  const parts = repoFullName.split('/');
  return parts[0] || 'Unknown Organization';
};

const updateRepoBreakdown = (
  breakdown: Map<string, RepositoryBreakdown>,
  repoName: string,
  severity: keyof SeverityCount,
  count: number = 1
) => {
  const repo = breakdown.get(repoName) || {
    name: repoName,
    alerts: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  };
  
  repo.alerts += count;
  repo[severity] += count;
  breakdown.set(repoName, repo);
};

export const processCSVData = (file: File): Promise<ReportData> => {
  return new Promise((resolve, reject) => {
    parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
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
          
          const codeScanningRepos = new Map<string, RepositoryBreakdown>();
          const dependabotRepos = new Map<string, RepositoryBreakdown>();
          const secretScanningRepos = new Map<string, RepositoryBreakdown>();
          
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
              default:
                // Any tool that's not secret-scanning or dependabot is treated as a code scanning tool
                if (alert.Tool.toLowerCase() !== 'secret-scanning' && alert.Tool.toLowerCase() !== 'dependabot') {
                  totalCodeScanning++;
                  codeScanningAlerts[mappedSeverity]++;
                  updateRepoBreakdown(codeScanningRepos, alert.Repository, mappedSeverity);
                } else if (alert.Tool.toLowerCase() === 'secret-scanning') {
                  totalSecretScanning++;
                  if (alert['Secret Type']) {
                    secretScanningByType[alert['Secret Type']] = 
                      (secretScanningByType[alert['Secret Type']] || 0) + 1;
                  }
                  updateRepoBreakdown(secretScanningRepos, alert.Repository, 'critical');
                } else if (alert.Tool.toLowerCase() === 'dependabot') {
                  totalDependabot++;
                  dependabotAlerts[mappedSeverity]++;
                  updateRepoBreakdown(dependabotRepos, alert.Repository, mappedSeverity);
                }
                break;
            }
          });

          const mapToBreakdown = (map: Map<string, RepositoryBreakdown>): RepositoryBreakdown[] => {
            return Array.from(map.values())
              .sort((a, b) => b.alerts - a.alerts);
          };

          const reportData: ReportData = {
            organization,
            timestamp: new Date().toISOString(),
            alertSummary: [
              { 
                alertType: 'Code Scanning', 
                total: totalCodeScanning, 
                open: totalCodeScanning,
                critical: codeScanningAlerts.critical,
                high: codeScanningAlerts.high,
                medium: codeScanningAlerts.medium,
                low: codeScanningAlerts.low
              },
              { 
                alertType: 'Secret Scanning', 
                total: totalSecretScanning, 
                open: totalSecretScanning,
                critical: totalSecretScanning,
                high: 0,
                medium: 0,
                low: 0
              },
              { 
                alertType: 'Dependabot', 
                total: totalDependabot, 
                open: totalDependabot,
                critical: dependabotAlerts.critical,
                high: dependabotAlerts.high,
                medium: dependabotAlerts.medium,
                low: dependabotAlerts.low
              },
            ],
            codeScanningAlerts,
            dependabotAlerts,
            secretScanningByType,
            codeScanningByRepo: mapToBreakdown(codeScanningRepos),
            dependabotByRepo: mapToBreakdown(dependabotRepos),
            secretScanningByRepo: mapToBreakdown(secretScanningRepos),
          };

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