# Browsing Archive

> **Self-hosted web archiving that actually works.** Capture any webpage as a PDF, search across thousands of archives in milliseconds, and never lose important content again.

A full-stack, production-ready application for archiving, preserving, and searching web content. One-click browser extension archiving, powerful full-text search, and a beautiful analytics dashboard—all self-hosted.

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Usage Guide](#usage-guide)
- [Development Guide](#development-guide)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

---

## Overview

Traditional bookmarks decay. Links break, pages change, content disappears. Browsing Archive solves this by capturing high-fidelity PDF snapshots of web pages and indexing every word for instant full-text search.

Archive a page in one click. Search across thousands of saved pages in milliseconds. Access everything offline, forever.

---

## Architecture

```
                        +---------------------------+
                        |    Browser Extension       |
                        |    (Manifest V3)           |
                        +------------+--------------+
                                     |
                                     v
                        +---------------------------+
                        |    REST API Server          |
                        |    Node.js / Express        |
                        |                             |
                        |  - URL validation           |
                        |  - PDF generation           |
                        |  - Search indexing           |
                        |  - Job orchestration         |
                        +--+--------+--------+-------+
                           |        |        |
                  +--------+  +-----+--+  +--+----------+
                  |           |        |  |              |
                  v           v        v  v              v
            +-----------+ +-------+ +--------------+ +--------+
            | PostgreSQL | | Redis | | Meilisearch  | | Storage|
            | (metadata) | |(queue)| | (full-text)  | | (PDFs) |
            +-----------+ +-------+ +--------------+ +--------+
                  |           |        |
                  +--------+--+--------+
                           |
                           v
                  +------------------+
                  |  React Dashboard  |
                  |  (Vite / SPA)     |
                  +------------------+
```

---

## Key Features

### Archiving
- **One-click capture** via browser extension (Chrome, Edge, Brave)
- **High-fidelity PDF snapshots** generated with Puppeteer headless browser
- **Asynchronous job queue** backed by Redis and Bull to prevent UI blocking
- **Duplicate detection** via URL hashing to avoid redundant archives
- **OCR fallback** using Tesseract.js for image-heavy or scanned pages

### Search and Retrieval
- **Full-text search** across all archived content via Meilisearch
- **Highlighted snippets** showing matching content in context
- **Domain and tag filtering** for targeted searches
- **PostgreSQL ILIKE fallback** when Meilisearch is unavailable

### Dashboard
- **Analytics dashboard** with animated stat counters, completion progress ring, archive growth chart, top domains bar chart, and status breakdown pie chart
- **Timeline view** grouping archives chronologically with date headers and jump-to-date navigation
- **Browse view** with list, grid, and compact layout modes
- **Advanced filter panel** with domain, status, tag, and date range filters
- **Sort controls** supporting newest, oldest, alphabetical, and domain ordering
- **Breadcrumb navigation** with animated route transitions
- **Skeleton loading states** and staggered result card animations
- **Preview popups** on hover showing page metadata and content excerpt
- **Confirmation dialogs** with backdrop blur replacing native browser alerts
- **Inline PDF viewer** for viewing archived snapshots directly in the browser
- **Responsive layout** adapting to desktop and mobile viewports

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19, Vite 8, React Router 7 | Single-page application |
| Charts | Recharts | Dashboard analytics visualizations |
| PDF Rendering | React-PDF | Inline PDF viewing |
| Backend | Node.js, Express 4, Prisma ORM | REST API and business logic |
| PDF Generation | Puppeteer 22 (Chromium) | Headless page capture |
| OCR | Tesseract.js 5 | Fallback text extraction |
| Primary Database | PostgreSQL 16 | Archive metadata and relationships |
| Job Queue | Redis 7, Bull 4 | Async archive processing |
| Search Engine | Meilisearch 1.7 | Full-text indexing and search |
| Browser Extension | Manifest V3 | One-click archive trigger |
| Containerization | Docker Compose | Service orchestration |

---

## Prerequisites

- **Docker Desktop** -- required to run PostgreSQL, Redis, and Meilisearch
- **Node.js 22+** -- for local development without Docker
- **Chromium-based browser** -- Chrome, Edge, or Brave for the extension
- **4 GB RAM minimum** (6 GB+ recommended for Puppeteer)

---

## Quick Start

### 1. Clone and start services

```bash
git clone <repository-url>
cd browsing-archive
docker-compose up -d
```

Allow 2-3 minutes for all containers to initialize.

### 2. Install the browser extension

1. Open your browser's extension management page:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
2. Enable **Developer Mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `extension/` directory from this project

### 3. Open the dashboard

```
http://localhost:5173
```

---

## Usage Guide

### Archiving a Page

1. Navigate to any webpage in your browser
2. Click the Browsing Archive extension icon in the toolbar
3. Click **Archive This Page**
4. The page is queued for processing; a PDF snapshot and full-text index are generated asynchronously
5. Alternatively, paste any URL directly into the archive input on the Browse page

### Searching Your Archive

1. Open the dashboard and navigate to the **Search** page
2. Enter keywords, URLs, or content fragments into the search bar
3. Results appear with highlighted matching snippets
4. Use the **Filters** panel to narrow by domain, status, tags, or date range

### Viewing Archived Content

- Click any search result or browse card to open the inline PDF viewer
- The original URL, domain, tags, and archive timestamp are displayed alongside the PDF
- PDFs are served directly from local storage and do not require internet access

### Dashboard Analytics

- The **Dashboard** page provides an overview of your archive:
  - Total archives, completion rate, pending jobs, and storage usage
  - Archive growth over time (area chart)
  - Most archived domains (horizontal bar chart)
  - Status distribution (pie chart)

### Timeline

- The **Timeline** page displays archives in chronological order, grouped by date
- Use the date picker and **Jump** button to scroll to a specific day

---

## Development

### Backend

```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev
```

The API server starts on `http://localhost:3001`.

### Frontend

```bash
cd client
npm install
npm run dev
```

The development server starts on `http://localhost:5173`.

### Database Administration

```bash
# PostgreSQL shell
docker exec -it archive-postgres psql -U archive_user -d browsing_archive

# Redis CLI
docker exec -it archive-redis redis-cli

# Meilisearch health check
curl http://localhost:7700/health

# Prisma Studio (visual database browser)
cd server && npx prisma studio
```

---

## Project Structure

```
browsing-archive/
|
|-- client/                          # React frontend (Vite)
|   |-- src/
|   |   |-- components/
|   |   |   |-- Breadcrumbs.jsx      # Route breadcrumb navigation
|   |   |   |-- ConfirmDialog.jsx    # Confirmation modal with variants
|   |   |   |-- FilterPanel.jsx      # Slide-out advanced filter sidebar
|   |   |   |-- Modal.jsx            # Reusable modal with backdrop blur
|   |   |   |-- PDFViewer.jsx        # Inline PDF rendering
|   |   |   |-- ResultCard.jsx       # Archive card with hover preview
|   |   |   |-- SearchBar.jsx        # Search input component
|   |   |   |-- Sidebar.jsx          # Navigation sidebar with stats
|   |   |   |-- TagChip.jsx          # Tag pill component
|   |   |   |-- TagCloud.jsx         # Frequency-based tag visualization
|   |   |   +-- ViewToggle.jsx       # List/grid/compact view switcher
|   |   |-- pages/
|   |   |   |-- BrowsePage.jsx       # Archive listing with filters and views
|   |   |   |-- DashboardPage.jsx    # Analytics dashboard with charts
|   |   |   |-- SearchPage.jsx       # Full-text search interface
|   |   |   |-- TimelinePage.jsx     # Chronological archive timeline
|   |   |   +-- ViewerPage.jsx       # PDF viewer page
|   |   |-- hooks/
|   |   |   |-- api.js               # API client (fetch wrapper)
|   |   |   |-- useAnimatedCounter.js # Animated number counting hook
|   |   |   |-- useArchives.js       # Archive data management hook
|   |   |   +-- useSearch.js         # Debounced search hook
|   |   |-- App.jsx                  # Root layout and routing
|   |   +-- index.css                # Design system and all styles
|   +-- package.json
|
|-- server/                          # Node.js backend (Express)
|   |-- src/
|   |   |-- routes/
|   |   |   |-- archive.js           # Archive CRUD and stats endpoints
|   |   |   |-- search.js            # Full-text search endpoint
|   |   |   +-- tags.js              # Tag management endpoints
|   |   |-- services/
|   |   |   +-- searchIndex.js       # Meilisearch integration
|   |   |-- workers/
|   |   |   +-- archiveWorker.js     # Bull queue job processor
|   |   |-- utils/
|   |   |   |-- dedup.js             # URL normalization and hashing
|   |   |   +-- snippets.js          # Search snippet extraction
|   |   +-- index.js                 # Server entry point
|   |-- prisma/
|   |   +-- schema.prisma            # Database schema (Archive, Tag)
|   +-- package.json
|
|-- extension/                       # Browser extension (Manifest V3)
|   |-- manifest.json
|   |-- popup.html
|   |-- popup.js
|   +-- background.js
|
+-- docker-compose.yml               # Container orchestration
```

---

## API Reference

### Archives

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/archive` | Submit a URL for archiving |
| `GET` | `/api/archive` | List archives (paginated, filterable) |
| `GET` | `/api/archive/stats` | Aggregate statistics |
| `GET` | `/api/archive/:id` | Get a single archive |
| `GET` | `/api/archive/:id/pdf` | Serve the archived PDF |
| `DELETE` | `/api/archive/:id` | Delete an archive |
| `PATCH` | `/api/archive/:id/tags` | Update tags on an archive |

### Search

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/search?q=` | Full-text search with pagination |

### Tags

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tags` | List all tags with counts |
| `POST` | `/api/tags` | Create a new tag |
| `PATCH` | `/api/tags/:id` | Update a tag |
| `DELETE` | `/api/tags/:id` | Delete a tag |

---

## Troubleshooting

### Extension not appearing

1. Verify all Docker containers are running: `docker ps`
2. Confirm the API is reachable: `curl http://localhost:3001/api/archive/stats`
3. Reload the extension from the browser's extension management page

### Archives stuck in "pending" status

1. Check server logs: `docker logs archive-server`
2. Verify Redis is running: `docker exec -it archive-redis redis-cli ping`
3. Ensure Chromium has sufficient memory allocated
4. Restart the server container: `docker restart archive-server`

### Search returning no results

1. Confirm Meilisearch is healthy: `curl http://localhost:7700/health`
2. The application falls back to PostgreSQL ILIKE search automatically if Meilisearch is unavailable
3. Restart all services: `docker-compose restart`

---

## Stopping Services

```bash
docker-compose down
```

All data is persisted in Docker volumes and will be available on the next startup.

---

## License

This project is provided as-is for personal use.
