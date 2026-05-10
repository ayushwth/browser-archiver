import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import archiveRoutes from './routes/archive.js';
import searchRoutes from './routes/search.js';
import tagRoutes from './routes/tags.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initSearchIndex } from './services/searchIndex.js';
import { startWorker } from './workers/archiveWorker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve stored PDFs
app.use('/api/files', express.static(path.join(__dirname, '..', 'storage', 'pdfs')));

// Routes
app.use('/api/archive', archiveRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/tags', tagRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Start
async function start() {
  try {
    await initSearchIndex();
    console.log('✅ Meilisearch index initialized');
  } catch (err) {
    console.warn('⚠️  Meilisearch not available, full-text search disabled:', err.message);
  }

  try {
    startWorker();
    console.log('✅ Archive worker started');
  } catch (err) {
    console.warn('⚠️  Redis not available, queue processing disabled:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

start();
