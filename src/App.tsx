import { useState, useCallback } from 'react'
import { pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { 
  Button, 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Divider,
  Grid,
  Radio,
  RadioGroup
} from '@mui/material'
import SecurityReport from './components/SecurityReport'
import { processCSVData } from './utils/processData'
import { ReportData, ReportOptions } from './types'
import githubLogo from './assets/github-mark.svg'
import './App.css'

const defaultOptions: ReportOptions = {
  includeCodeScanning: false,
  includeCodeScanningByRepo: true,
  includeTopCodeScanningRepos: true,
  includeDependabot: false,
  includeDependabotByRepo: true,
  includeTopDependabotRepos: true,
  includeSecretScanning: false,
  includeSecretScanningByRepo: true,
  includeTopSecretScanningRepos: true
}

function App() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reportOptions, setReportOptions] = useState<ReportOptions>(defaultOptions)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('File selected:', file.name)
    setLoading(true)
    setError(null)

    try {
      console.log('Processing CSV file...')
      const data = await processCSVData(file)
      console.log('CSV data processed:', data)
      setReportData(data)
    } catch (err) {
      console.error('Error details:', err)
      setError('Error processing CSV file. Please ensure it\'s in the correct format.')
    } finally {
      setLoading(false)
    }
  }

  const handleOptionChange = (option: keyof ReportOptions) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setReportOptions({ ...reportOptions, [option]: event.target.checked })
  }

  const handleRepoOptionChange = (type: 'codeScanning' | 'dependabot' | 'secretScanning') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const isTop10 = event.target.value === 'top10';
    setReportOptions({
      ...reportOptions,
      [`include${type.charAt(0).toUpperCase() + type.slice(1)}ByRepo`]: true,
      [`includeTop${type.charAt(0).toUpperCase() + type.slice(1)}Repos`]: isTop10
    });
  };

  const handleRepoCheckboxChange = (type: 'codeScanning' | 'dependabot' | 'secretScanning') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setReportOptions({
      ...reportOptions,
      [`include${type.charAt(0).toUpperCase() + type.slice(1)}ByRepo`]: isChecked,
      [`includeTop${type.charAt(0).toUpperCase() + type.slice(1)}Repos`]: isChecked ? false : false // Reset to false when unchecked
    });
  };

  const generatePdf = useCallback(async () => {
    setPdfLoading(true)
    setPdfError(null);
    try {
      const doc = <SecurityReport data={reportData!} options={reportOptions} />
      const blob = await pdf(doc).toBlob()
      saveAs(blob, `${reportData!.organization}-security-report.pdf`)
    } catch (err) {
      console.error('Error generating PDF:', err)
      setPdfError('Error generating PDF. Please try again.')
    } finally {
      setPdfLoading(false)
    }
  }, [reportData, reportOptions])

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <img src={githubLogo} alt="GitHub Logo" style={{ width: 40, height: 40, marginRight: 16 }} />
          <Typography variant="h5" component="h1">
            GitHub Advanced Security Report Generator
          </Typography>
        </Box>

        <Box sx={{ my: 3, display: 'flex', justifyContent: 'center' }}>
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="csv-file-upload"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="csv-file-upload">
            <Button variant="contained" component="span">
              Upload CSV File
            </Button>
          </label>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ my: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        )}

        {reportData && (
          <>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                Customize Your Report
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select which sections to include in your report
              </Typography>
              
              <Grid container spacing={3}>
                {/* Code Scanning Options */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Code Scanning
                  </Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={reportOptions.includeCodeScanning}
                          onChange={handleOptionChange('includeCodeScanning')}
                        />
                      }
                      label="Include All Code Scanning Alerts"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={reportOptions.includeCodeScanningByRepo}
                          onChange={handleRepoCheckboxChange('codeScanning')}
                        />
                      }
                      label="Alerts by Repository"
                    />
                    {reportOptions.includeCodeScanningByRepo && (
                      <RadioGroup
                        value={reportOptions.includeTopCodeScanningRepos ? 'top10' : 'all'}
                        onChange={handleRepoOptionChange('codeScanning')}
                        sx={{ ml: 2 }}
                      >
                        <FormControlLabel
                          value="all"
                          control={<Radio />}
                          label="All Alerts by Repository"
                        />
                        <FormControlLabel
                          value="top10"
                          control={<Radio />}
                          label="Top 10 Repositories Only"
                        />
                      </RadioGroup>
                    )}
                  </FormGroup>
                </Grid>

                {/* Dependabot Options */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Dependabot
                  </Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={reportOptions.includeDependabot}
                          onChange={handleOptionChange('includeDependabot')}
                        />
                      }
                      label="Include All Dependabot Alerts"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={reportOptions.includeDependabotByRepo}
                          onChange={handleRepoCheckboxChange('dependabot')}
                        />
                      }
                      label="Alerts by Repository"
                    />
                    {reportOptions.includeDependabotByRepo && (
                      <RadioGroup
                        value={reportOptions.includeTopDependabotRepos ? 'top10' : 'all'}
                        onChange={handleRepoOptionChange('dependabot')}
                        sx={{ ml: 2 }}
                      >
                        <FormControlLabel
                          value="all"
                          control={<Radio />}
                          label="All Alerts by Repository"
                        />
                        <FormControlLabel
                          value="top10"
                          control={<Radio />}
                          label="Top 10 Repositories Only"
                        />
                      </RadioGroup>
                    )}
                  </FormGroup>
                </Grid>

                {/* Secret Scanning Options */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Secret Scanning
                  </Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={reportOptions.includeSecretScanning}
                          onChange={handleOptionChange('includeSecretScanning')}
                        />
                      }
                      label="Include All Secret Scanning Alerts"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={reportOptions.includeSecretScanningByRepo}
                          onChange={handleRepoCheckboxChange('secretScanning')}
                        />
                      }
                      label="Alerts by Repository"
                    />
                    {reportOptions.includeSecretScanningByRepo && (
                      <RadioGroup
                        value={reportOptions.includeTopSecretScanningRepos ? 'top10' : 'all'}
                        onChange={handleRepoOptionChange('secretScanning')}
                        sx={{ ml: 2 }}
                      >
                        <FormControlLabel
                          value="all"
                          control={<Radio />}
                          label="All Alerts by Repository"
                        />
                        <FormControlLabel
                          value="top10"
                          control={<Radio />}
                          label="Top 10 Repositories Only"
                        />
                      </RadioGroup>
                    )}
                  </FormGroup>
                </Grid>
              </Grid>
            </Paper>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 3 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={generatePdf}
                disabled={loading || pdfError !== null || pdfLoading}
              >
                {pdfLoading ? <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} /> : null}
                Generate PDF Report
              </Button>
              {pdfError && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {pdfError}
                </Typography>
              )}
            </Box>
            
          </>
        )}
      </Box>
    </Container>
  )
}

export default App
