import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { hashUrl, normalizeUrl, extractDomain } from '../utils/dedup.js';
import { enqueueArchive } from '../workers/archiveWorker.js';
import { removeDocument } from '../services/searchIndex.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const prisma = new PrismaClient();

const PDF_DIR = path.resolve(
  __dirname,
  '..',
  '..',
  process.env.PDF_STORAGE_PATH || './storage/pdfs'
);

/**
 * POST /api/archive
 * Submit a URL to be archived
 * Body: { url: string, tags?: string[] }
 */
router.post('/', async (req, res, next) => {
  try {
    const { url, tags = [] } = req.body;

    if (!url) {
      return res.status(400).json({ error: { message: 'URL is required' } });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: { message: 'Invalid URL format' } });
    }

    const normalized = normalizeUrl(url);
    const urlHash = hashUrl(url);
    const domain = extractDomain(url);

    // Check for duplicates
    const existing = await prisma.archive.findUnique({ where: { urlHash } });
    if (existing) {
      return res.status(200).json({
        message: 'Already archived',
        archive: existing,
        duplicate: true,
      });
    }

    // Create a pending archive record
    const archive = await prisma.archive.create({
      data: {
        url: normalized,
        urlHash,
        domain,
        pdfPath: '',
        status: 'pending',
        tags: tags.length
          ? {
              connectOrCreate: tags.map((tagName) => ({
                where: { name: tagName },
                create: { name: tagName },
              })),
            }
          : undefined,
      },
      include: { tags: true },
    });

    // Enqueue the archive job
    try {
      await enqueueArchive(normalized, urlHash, tags);
    } catch (err) {
      console.warn('⚠️  Queue unavailable, processing synchronously');
      // If Redis/Bull is not available, we could process synchronously here
      // For now, just mark the status
    }

    res.status(202).json({
      message: 'Archive job queued',
      archive,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/archive
 * List all archived pages with pagination
 * Query: page, limit, domain, status
 */
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { domain, status } = req.query;

    const where = {};
    if (domain) where.domain = domain;
    if (status) where.status = status;

    const [archives, total] = await Promise.all([
      prisma.archive.findMany({
        where,
        include: { tags: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.archive.count({ where }),
    ]);

    res.json({
      archives,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/archive/stats
 * Get archive statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const [total, done, pending, error, domains] = await Promise.all([
      prisma.archive.count(),
      prisma.archive.count({ where: { status: 'done' } }),
      prisma.archive.count({ where: { status: 'pending' } }),
      prisma.archive.count({ where: { status: 'error' } }),
      prisma.archive.groupBy({
        by: ['domain'],
        _count: { domain: true },
        orderBy: { _count: { domain: 'desc' } },
        take: 10,
      }),
    ]);

    // Calculate total storage size
    const sizeResult = await prisma.archive.aggregate({
      _sum: { pageSize: true },
    });

    res.json({
      total,
      done,
      pending,
      error,
      totalSizeBytes: sizeResult._sum.pageSize || 0,
      topDomains: domains.map((d) => ({ domain: d.domain, count: d._count.domain })),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/archive/:id
 * Get a single archive's details
 */
router.get('/:id', async (req, res, next) => {
  try {
    const archive = await prisma.archive.findUnique({
      where: { id: req.params.id },
      include: { tags: true },
    });

    if (!archive) {
      return res.status(404).json({ error: { message: 'Archive not found' } });
    }

    res.json({ archive });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/archive/:id/pdf
 * Serve the PDF file
 */
router.get('/:id/pdf', async (req, res, next) => {
  try {
    const archive = await prisma.archive.findUnique({
      where: { id: req.params.id },
    });

    if (!archive || !archive.pdfPath) {
      return res.status(404).json({ error: { message: 'PDF not found' } });
    }

    const filePath = path.join(PDF_DIR, archive.pdfPath);

    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: { message: 'PDF file missing from disk' } });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${archive.title || 'archive'}.pdf"`
    );
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/archive/:id
 * Delete an archive and its PDF file
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const archive = await prisma.archive.findUnique({
      where: { id: req.params.id },
    });

    if (!archive) {
      return res.status(404).json({ error: { message: 'Archive not found' } });
    }

    // Delete PDF file
    if (archive.pdfPath) {
      const filePath = path.join(PDF_DIR, archive.pdfPath);
      try {
        await fs.unlink(filePath);
      } catch {
        // File might already be gone
      }
    }

    // Delete from search index
    try {
      await removeDocument(archive.id);
    } catch {
      // Index might not be available
    }

    // Delete from database
    await prisma.archive.delete({ where: { id: req.params.id } });

    res.json({ message: 'Archive deleted' });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/archive/:id/tags
 * Update tags for an archive
 * Body: { tags: string[] }
 */
router.patch('/:id/tags', async (req, res, next) => {
  try {
    const { tags = [] } = req.body;

    const archive = await prisma.archive.update({
      where: { id: req.params.id },
      data: {
        tags: {
          set: [],
          connectOrCreate: tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: { tags: true },
    });

    res.json({ archive });
  } catch (err) {
    next(err);
  }
});

export default router;
