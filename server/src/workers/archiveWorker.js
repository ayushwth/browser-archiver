import Queue from 'bull';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { generatePdf } from '../services/pdfGenerator.js';
import { extractText } from '../services/textExtractor.js';
import { indexDocument } from '../services/searchIndex.js';
import { extractDomain } from '../utils/dedup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const PDF_DIR = path.resolve(
  __dirname,
  '..',
  '..',
  process.env.PDF_STORAGE_PATH || './storage/pdfs'
);

let archiveQueue = null;

/**
 * Get or create the Bull queue
 */
function getQueue() {
  if (!archiveQueue) {
    archiveQueue = new Queue('archive', REDIS_URL, {
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
      },
    });
  }
  return archiveQueue;
}

/**
 * Add a URL to the archive queue
 */
export function enqueueArchive(url, urlHash, tags = []) {
  const queue = getQueue();
  return queue.add({ url, urlHash, tags });
}

/**
 * Start processing jobs from the queue
 */
export function startWorker() {
  const queue = getQueue();
  const concurrency = parseInt(process.env.PUPPETEER_CONCURRENT_LIMIT || '2', 10);

  queue.process(concurrency, async (job) => {
    const { url, urlHash, tags } = job.data;
    console.log(`📥 Processing archive job for: ${url}`);

    // Update status to processing
    await prisma.archive.update({
      where: { urlHash },
      data: { status: 'processing' },
    });

    try {
      // Step 1: Generate PDF
      job.progress(20);
      const { pdfBuffer, title } = await generatePdf(url);

      // Step 2: Save PDF to disk
      job.progress(50);
      const fileName = `${uuidv4()}.pdf`;
      const filePath = path.join(PDF_DIR, fileName);
      await fs.mkdir(PDF_DIR, { recursive: true });
      await fs.writeFile(filePath, pdfBuffer);

      // Step 3: Extract text
      job.progress(70);
      const { text, ocrUsed } = await extractText(pdfBuffer);

      // Step 4: Update database record
      job.progress(85);
      const archive = await prisma.archive.update({
        where: { urlHash },
        data: {
          title: title || extractDomain(url),
          pdfPath: fileName,
          textContent: text ? text.replace(/\0/g, '') : '',
          pageSize: pdfBuffer.length,
          ocrUsed,
          status: 'done',
        },
        include: { tags: true },
      });

      // Step 5: Index in Meilisearch
      job.progress(95);
      try {
        await indexDocument(archive);
      } catch (err) {
        console.warn('⚠️  Failed to index in Meilisearch:', err.message);
      }

      job.progress(100);
      console.log(`✅ Archived: ${title || url}`);
      return { id: archive.id, title, fileName };
    } catch (err) {
      console.error(`❌ Failed to archive ${url}:`, err.message);

      // Update status to error
      await prisma.archive.update({
        where: { urlHash },
        data: { status: 'error', errorMsg: err.message },
      });

      throw err;
    }
  });

  queue.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} failed:`, err.message);
  });

  queue.on('completed', (job, result) => {
    console.log(`✅ Job ${job.id} completed:`, result?.title);
  });
}
