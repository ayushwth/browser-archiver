# Browsing Archive

A self-hosted, full-stack application that functions as your personal private archive for web content. Capture, preserve, and instantly search through any webpage you visit with permanent PDF snapshots and full-text search capabilities.

## Overview

Instead of relying on traditional bookmarks that often become outdated links, Browsing Archive automatically captures high-fidelity snapshots of web pages and indexes their content for instant retrieval. Archive any page with a single click, search across your entire collection in milliseconds, and access your archived content offline anytime.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Extension                        │
│           (One-Click Archive Trigger)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   REST API Server                           │
│            (Node.js + Express)                              │
│         • URL Processing                                    │
│         • PDF Generation                                    │
│         • Search Integration                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐   ┌─────────┐   ┌─────────────┐
   │PostgreSQL   │ Redis     │Meilisearch  │
   │(Data)       │(Queue)    │(Search)     │
   └─────────┘   └─────────┘   └─────────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │  React Dashboard             │
        │  (Browse & Search Archive)   │
        └──────────────────────────────┘
```

## Features

- **One-Click Archiving** — Browser extension captures any webpage with a single click
- **Permanent Snapshots** — High-quality PDF generation using Puppeteer headless browser automation
- **Full-Text Search** — Instant content search across entire archive via Meilisearch
- **Asynchronous Processing** — Redis-backed job queue prevents UI blocking during capture
- **Modern Interface** — React/Vite dashboard for browsing, searching, and viewing archived PDFs
- **Offline Access** — View archived content without internet connectivity

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router, React-PDF |
| Backend | Node.js 22, Express, Prisma ORM |
| PDF Generation | Puppeteer 22 with Chromium |
| Databases | PostgreSQL 16, Redis 7, Meilisearch 1.7 |
| Container Orchestration | Docker Compose |
| Extension | Manifest V3 (Chrome/Edge/Brave) |

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) — Required for all services
- A Chromium-based browser (Chrome, Edge, or Brave) — For extension support
- 4GB RAM minimum (6GB+ recommended)

## Quick Start

### 1. Start All Services

From the project root directory:

```bash
docker-compose up -d
```

Wait 2-3 minutes for all services to initialize.

### 2. Install the Browser Extension

1. Open your browser and go to the extensions page:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`

2. Enable **Developer Mode** (top right)
3. Click **Load unpacked**
4. Select the `extension` folder from this project
5. The extension is now ready to use

### 3. Access the Dashboard

Open your browser and navigate to:

```
http://localhost:5173
```

## Usage

### Archive a Page

1. While browsing any website, click the extension icon
2. Click **Archive This Page**
3. The page will be processed and added to your archive
4. Progress updates appear in real-time

### Search Your Archive

1. Open the dashboard at `http://localhost:5173`
2. Use the search bar to find pages by content
3. Click any result to view the archived PDF
4. Filter by domain or tags for refined results

### View Archived Content

- Browse PDF snapshots directly in the dashboard
- Search highlights appear within the PDF content
- Navigate between archived pages seamlessly

## Development

### Backend Development

```bash
cd server
npm install
npm run dev
```

Server runs on `http://localhost:3001`

### Frontend Development

```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### Database Management

```bash
# Access PostgreSQL
docker exec -it archive-postgres psql -U archive_user -d browsing_archive

# View Redis data
docker exec -it archive-redis redis-cli

# Check Meilisearch
curl http://localhost:7700/health
```

## Project Structure

```
browsing-archive/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page routes
│   │   └── hooks/       # Custom hooks
│   └── package.json
├── server/              # Node.js backend (Express)
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Core logic
│   │   ├── workers/     # Background jobs
│   │   └── middleware/  # Express middleware
│   ├── prisma/          # Database schema
│   └── package.json
├── extension/           # Browser extension
│   ├── manifest.json    # Extension configuration
│   ├── popup.html       # Extension UI
│   └── background.js    # Extension logic
└── docker-compose.yml   # Container orchestration
```

## Troubleshooting

### Extension Not Appearing
- Ensure Docker containers are running: `docker ps`
- Check server is accessible: `curl http://localhost:3001/api/stats`
- Reload extension in browser (click reload icon)

### Archives Stuck in Processing
- Check server logs: `docker logs archive-server`
- Verify Chromium has sufficient resources
- Restart server: `docker restart archive-server`

### Search Not Working
- Ensure Meilisearch is running: `curl http://localhost:7700/health`
- Check database connection in server logs
- Restart all services: `docker-compose restart`

## Stopping Services

```bash
docker-compose down
```

All data persists in Docker volumes and will be available when services restart.

## License

MIT License - See LICENSE file for details
