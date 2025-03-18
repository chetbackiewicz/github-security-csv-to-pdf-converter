import { useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Button, Container, Typography, Box, CircularProgress } from '@mui/material'
import SecurityReport from './components/SecurityReport'
import { processCSVData } from './utils/processData'
import { ReportData } from './types'
import githubLogo from './assets/github-mark.svg'
import './App.css'

function App() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <img src={githubLogo} alt="GitHub Logo" style={{ width: 40, height: 40, marginRight: 16 }} />
          <Typography variant="h5" component="h1">
            GitHub Advanced Security Report Generator
          </Typography>
        </Box>

        <Box sx={{ my: 3 }}>
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
          <Typography color="error" sx={{ my: 2 }}>
            {error}
          </Typography>
        )}

        {reportData && (
          <Box sx={{ my: 3 }}>
            <PDFDownloadLink
              document={<SecurityReport data={reportData} />}
              fileName={`${reportData.repository}-security-report.pdf`}
            >
              {({ loading: pdfLoading }) => (
                <Button
                  variant="contained"
                  color="primary"
                  disabled={pdfLoading}
                >
                  {pdfLoading ? 'Generating PDF...' : 'Download PDF Report'}
                </Button>
              )}
            </PDFDownloadLink>
          </Box>
        )}
      </Box>
    </Container>
  )
}

export default App
