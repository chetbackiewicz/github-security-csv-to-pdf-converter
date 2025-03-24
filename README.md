# GitHub Advanced Security CSV to PDF Converter

A web application that converts GitHub Advanced Security CSV exports into professional PDF reports. Easily transform your organization's security data into shareable, presentation-ready documents.

## Features

- Import GitHub Advanced Security CSV reports from organization level exports
- Generate professional PDF reports including:
  - Organization summary
  - Executive overview of security alerts
  - Breakdown by alert type (Code Scanning, Dependabot, Secret Scanning)
  - Severity distribution visualizations
  - Repository-specific alert statistics
- Choose which sections to include
- Modern, clean user interface
- Local processing (no data is sent to external servers)
- Docker support for easy deployment

## Getting Started

### Prerequisites

To run the application locally, you'll need:

- Node.js (version 16 or later)
- npm or yarn package manager

For Docker deployment:
- Docker
- Docker Compose (optional, but recommended)

### Local Installation and Setup

1. Clone the repository
   ```bash
   git clone https://github.com/chetbackiewicz/github-security-csv-to-pdf-converter.git
   cd github-security-csv-to-pdf-converter
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (or the URL shown in your terminal)

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory and can be served with any static file server.

## Docker Deployment

### Using Docker Compose (Recommended)

1. Clone the repository
   ```bash
   git clone https://github.com/chetbackiewicz/github-security-csv-to-pdf-converter.git
   cd github-security-csv-to-pdf-converter
   ```

2. Build and start the container
   ```bash
   docker-compose up -d
   ```

3. Access the application at `http://localhost:8080`

4. To stop the application
   ```bash
   docker-compose down
   ```

### Using Docker Directly

1. Build the Docker image
   ```bash
   docker build -t ghas-report .
   ```

2. Run the container
   ```bash
   docker run -d -p 8080:80 --name ghas-report-container ghas-report
   ```

3. Access the application at `http://localhost:8080`

4. To stop and remove the container
   ```bash
   docker stop ghas-report-container
   docker rm ghas-report-container
   ```

## How to Use

### Exporting CSV from GitHub Advanced Security

1. Navigate to your GitHub organization page
2. Select the "Security" tab
3. In the Security Overview section, click on the "Export CSV" button
4. Save the CSV file to your computer

### Converting CSV to PDF

1. Open the application in your browser
2. Click the "Upload CSV File" button
3. Select the CSV file you downloaded from GitHub
4. **Customize your report** by selecting which sections to include:
   - **Code Scanning options**:
     - Include all code scanning alerts
     - Include alerts by repository
     - Include only top 10 repositories by frequency
   - **Dependabot options**:
     - Include all Dependabot alerts
     - Include alerts by repository
     - Include only top 10 repositories by frequency
   - **Secret Scanning options**:
     - Include all Secret Scanning alerts
     - Include top 10 secrets by frequency
     - Include top 10 repositories by secret scanning alert frequency
5. Click the "Download PDF Report" button
6. Save the generated PDF to your preferred location

### PDF Report Contents

The generated PDF includes:
- Organization identification and report generation timestamp
- Executive summary of all security alerts
- Code scanning alerts breakdown by severity (if selected)
- Dependabot alerts breakdown by severity (if selected)
- Secret scanning alerts by type (if selected)
- Repository-specific alert distributions (if selected)

## Technology Stack

- React
- TypeScript
- Vite
- Material UI
- react-pdf for PDF generation
- Docker & Nginx for containerized deployment

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.