# Docker Setup for GHAS Report Application

This document provides instructions for building and running the GHAS CSV Converter application using Docker.

## Prerequisites

- Docker installed on your machine
- Docker Compose installed on your machine (optional, but recommended)

## Building and Running with Docker Compose (Recommended)

The simplest way to get started is to use Docker Compose:

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at http://localhost:8080

## Building and Running with Docker

If you prefer to use Docker commands directly:

```bash
# Build the Docker image
docker build -t ghas-report .

# Run the container
docker run -d -p 8080:80 --name ghas-report-container ghas-report

# Stop the container
docker stop ghas-report-container

# Remove the container
docker rm ghas-report-container
```

The application will be available at http://localhost:8080

## Configuration

- The application is served on port 80 inside the container
- The docker-compose.yml file maps port 80 to port 8080 on your host machine
- If you need to change this port mapping, edit the `ports` section in docker-compose.yml


## Using the Application
- Go to your organization in Github
- In the Security Tab, in the Overview section, you should see an "Export CSV" button
- Click the button to download your CSV Report
- Within this application, click the "Upload CSV File"
- Once converted, click the "Download PDF Report"