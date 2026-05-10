import { MeiliSearch } from 'meilisearch';

const INDEX_NAME = 'archives';

let client = null;

function getClient() {
  if (!client) {
    client = new MeiliSearch({
      host: process.env.MEILI_HOST || 'http://localhost:7700',
      apiKey: process.env.MEILI_MASTER_KEY || 'masterKey123',
    });
  }
  return client;
}

/**
 * Initialize the Meilisearch index with proper settings
 */
export async function initSearchIndex() {
  const meilisearch = getClient();

  // Create or get the index
  try {
    await meilisearch.createIndex(INDEX_NAME, { primaryKey: 'id' });
  } catch {
    // Index might already exist
  }

  const index = meilisearch.index(INDEX_NAME);

  // Configure searchable attributes
  await index.updateSearchableAttributes([
    'textContent',
    'title',
    'url',
    'domain',
    'tagNames',
  ]);

  // Configure displayed attributes
  await index.updateDisplayedAttributes([
    'id',
    'title',
    'url',
    'domain',
    'createdAt',
    'tagNames',
    'textContent',
  ]);

  // Configure filterable attributes
  await index.updateFilterableAttributes([
    'domain',
    'tagNames',
    'createdAt',
  ]);

  // Configure sortable attributes
  await index.updateSortableAttributes(['createdAt']);

  // Enable highlighting
  console.log('✅ Meilisearch index configured');
}

/**
 * Add or update a document in the search index
 */
export async function indexDocument(archive) {
  const meilisearch = getClient();
  const index = meilisearch.index(INDEX_NAME);

  await index.addDocuments([
    {
      id: archive.id,
      title: archive.title || '',
      url: archive.url,
      domain: archive.domain,
      textContent: archive.textContent || '',
      tagNames: archive.tags?.map((t) => t.name) || [],
      createdAt: archive.createdAt
        ? new Date(archive.createdAt).getTime()
        : Date.now(),
    },
  ]);
}

/**
 * Search the index with highlighting
 */
export async function searchDocuments(query, options = {}) {
  const meilisearch = getClient();
  const index = meilisearch.index(INDEX_NAME);

  const { page = 1, limit = 20, filters, sort } = options;

  const searchParams = {
    offset: (page - 1) * limit,
    limit,
    attributesToHighlight: ['textContent', 'title'],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
    attributesToCrop: ['textContent'],
    cropLength: 200,
    showMatchesPosition: true,
  };

  // Build filter array
  const filterParts = [];
  if (filters?.domain) {
    filterParts.push(`domain = "${filters.domain}"`);
  }
  if (filters?.tags?.length) {
    const tagFilters = filters.tags.map((t) => `tagNames = "${t}"`);
    filterParts.push(`(${tagFilters.join(' OR ')})`);
  }
  if (filterParts.length) {
    searchParams.filter = filterParts.join(' AND ');
  }

  if (sort) {
    searchParams.sort = [sort];
  }

  const results = await index.search(query, searchParams);

  return {
    hits: results.hits,
    total: results.estimatedTotalHits,
    page,
    limit,
    processingTimeMs: results.processingTimeMs,
  };
}

/**
 * Remove a document from the search index
 */
export async function removeDocument(id) {
  const meilisearch = getClient();
  const index = meilisearch.index(INDEX_NAME);
  await index.deleteDocument(id);
}
