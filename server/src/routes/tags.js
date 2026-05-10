import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/tags
 * List all tags with archive counts
 */
router.get('/', async (req, res, next) => {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: { select: { archives: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      tags: tags.map((t) => ({
        id: t.id,
        name: t.name,
        color: t.color,
        archiveCount: t._count.archives,
      })),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/tags
 * Create a new tag
 * Body: { name: string, color?: string }
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, color } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: { message: 'Tag name is required' } });
    }

    const tag = await prisma.tag.create({
      data: { name: name.trim(), color },
    });

    res.status(201).json({ tag });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: { message: 'Tag already exists' } });
    }
    next(err);
  }
});

/**
 * DELETE /api/tags/:id
 * Delete a tag
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.tag.delete({ where: { id: req.params.id } });
    res.json({ message: 'Tag deleted' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Tag not found' } });
    }
    next(err);
  }
});

/**
 * PATCH /api/tags/:id
 * Update a tag
 * Body: { name?: string, color?: string }
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (color !== undefined) data.color = color;

    const tag = await prisma.tag.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ tag });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Tag not found' } });
    }
    next(err);
  }
});

export default router;
