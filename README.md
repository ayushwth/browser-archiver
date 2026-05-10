# Personal Browsing Archive

A full-stack application that acts as your own private "Wayback Machine." It allows you to seamlessly capture, save, and search through web pages you have visited. 

Instead of just saving bookmarks that might lead to dead links in the future, this project spins up an invisible browser to take a permanent PDF snapshot of the page and extracts its text for lightning-fast, full-text searching later.

## 🚀 Features

- **One-Click Archiving:** A custom browser extension lets you archive any webpage instantly.
- **Permanent Snapshots:** Uses Puppeteer to generate high-quality PDF snapshots of web pages.
- **Full-Text Search:** Automatically extracts text from pages and indexes it using Meilisearch, allowing you to instantly search through the contents of your entire archive.
- **Background Processing:** Built with Redis and Bull queues so the archiving process happens asynchronously without slowing down your experience.
- **Modern Dashboard:** A sleek React/Vite frontend to browse, search, and read your archived PDFs natively in the browser.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, React Router, React-PDF
- **Backend:** Node.js, Express, Prisma (ORM), Puppeteer, PDF-Parse
- **Databases/Infrastructure:** PostgreSQL (with pgvector), Redis, Meilisearch (via Docker)
- **Extension:** Vanilla JS Chrome/Chromium Browser Extension

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (must be running)
- Git

## ⚙️ Local Setup Instructions

### 1. Start the Infrastructure (Databases)
First, spin up PostgreSQL, Redis, and Meilisearch using Docker. Run this in the root directory:
```bash
docker-compose up -d
```

### 2. Configure & Start the Backend Server
Open a terminal and navigate to the `server` folder:
```bash
cd server
npm install
```

Copy the example environment variables:
```bash
cp ../.env.example .env
```

Setup the database tables and start the server:
```bash
npx prisma db push
npx prisma generate
npm run dev
```
*The backend API will now be running on `http://localhost:3001`.*

### 3. Start the Frontend Dashboard
Open a **new** terminal window, navigate to the `client` folder:
```bash
cd client
npm install
npm run dev
```
*The frontend dashboard will now be running on `http://localhost:5173`. Open this link in your browser to view your archive.*

### 4. Install the Browser Extension
To easily save pages as you browse:
1. Open your Chromium-based browser (Chrome, Edge, Brave).
2. Go to your extensions page (e.g., `chrome://extensions/` or `edge://extensions/`).
3. Turn on **Developer mode** (usually in the top right or bottom left corner).
4. Click **Load unpacked**.
5. Select the `extension` folder located inside this project directory.

You can now click the puzzle piece icon in your browser to archive the page you are currently viewing!

## 📄 License

This project is open-sourced and available under the MIT License.
