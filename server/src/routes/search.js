import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { searchDocuments } from '../services/searchIndex.js';
import { extractSnippets } from '../utils/snippets.js';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/search
 * Full-text search across archived pages
 * Query: q (required), page, limit, domain, tags (comma-separated), sort
 */
router.get('/', async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20, domain, tags, sort } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ error: { message: 'Search query "q" is required' } });
    }

    const filters = {};
    if (domain) filters.domain = domain;
    if (tags) filters.tags = tags.split(',').map((t) => t.trim());

    let results;
    try {
      // Try Meilisearch first
      results = await searchDocuments(q, {
        page: parseInt(page),
        limit: parseInt(limit),
        filters,
        sort,
      });
    } catch (err) {
      console.warn('⚠️  Meilisearch unavailable, falling back to DB search');
      // Fallback: basic ILIKE search on PostgreSQL
      results = await fallbackSearch(q, {
        page: parseInt(page),
        limit: parseInt(limit),
        domain,
      });
    }

    // Enrich results with full archive data from DB
    const archiveIds = results.hits.map((h) => h.id);
    const archives = await prisma.archive.findMany({
      where: { id: { in: archiveIds } },
      include: { tags: true },
    });

    const archiveMap = new Map(archives.map((a) => [a.id, a]));

    const enrichedResults = results.hits.map((hit) => {
      const archive = archiveMap.get(hit.id);
      return {
        id: hit.id,
        title: hit._formatted?.title || archive?.title || '',
        url: archive?.url || hit.url,
        domain: archive?.domain || hit.domain,
        pdfPath: archive?.pdfPath,
        createdAt: archive?.createdAt,
        tags: archive?.tags || [],
        status: archive?.status,
        // Highlighted snippets from Meilisearch
        snippets: hit._formatted?.textContent
          ? [hit._formatted.textContent]
          : extractSnippets(archive?.textContent || '', q),
        matchesPosition: hit._matchesPosition,
      };
    });

    res.json({
      query: q,
      results: enrichedResults,
      total: results.total,
      page: parseInt(page),
      limit: parseInt(limit),
      processingTimeMs: results.processingTimeMs,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Fallback search using PostgreSQL ILIKE when Meilisearch is unavailable
 */
async function fallbackSearch(query, { page = 1, limit = 20, domain } = {}) {
  const where = {
    status: 'done',
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { textContent: { contains: query, mode: 'insensitive' } },
      { url: { contains: query, mode: 'insensitive' } },
    ],
  };
  if (domain) where.domain = domain;

  const [archives, total] = await Promise.all([
    prisma.archive.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.archive.count({ where }),
  ]);

  return {
    hits: archives.map((a) => ({ id: a.id, ...a })),
    total,
    processingTimeMs: 0,
  };
}

export default router;
