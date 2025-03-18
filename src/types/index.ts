export interface SecurityAlert {
  Repository: string;
  Tool: string;
  'Alert Number': string;
  Severity: string;
  'Created At': string;
  'Secret Type'?: string;
  'GHSA ID'?: string;
  Ecosystem?: string;
  Package?: string;
}

export interface AlertSummary {
  alertType: string;
  total: number;
  open: number;
}

export interface SeverityCount {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface SecretTypeCount {
  [key: string]: number;
}

export interface RepositoryBreakdown {
  name: string;
  alerts: number;
}

export interface ReportData {
  organization: string;
  timestamp: string;
  alertSummary: AlertSummary[];
  codeScanningAlerts: SeverityCount;
  dependabotAlerts: SeverityCount;
  secretScanningByType: SecretTypeCount;
  codeScanningByRepo: RepositoryBreakdown[];
  dependabotByRepo: RepositoryBreakdown[];
  secretScanningByRepo: RepositoryBreakdown[];
} 