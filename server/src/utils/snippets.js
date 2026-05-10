/**
 * Extract a snippet of text around a keyword match, with context.
 * Returns highlighted snippet with <mark> tags.
 */
export function extractSnippets(text, query, options = {}) {
  const { maxSnippets = 3, contextChars = 120 } = options;

  if (!text || !query) return [];

  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const snippets = [];

  for (const word of words) {
    const regex = new RegExp(escapeRegex(word), 'gi');
    let match;

    while ((match = regex.exec(text)) !== null && snippets.length < maxSnippets) {
      const start = Math.max(0, match.index - contextChars);
      const end = Math.min(text.length, match.index + match[0].length + contextChars);

      let snippet = text.slice(start, end).trim();

      // Add ellipsis
      if (start > 0) snippet = '…' + snippet;
      if (end < text.length) snippet = snippet + '…';

      // Highlight all query words in this snippet
      for (const w of words) {
        const re = new RegExp(`(${escapeRegex(w)})`, 'gi');
        snippet = snippet.replace(re, '<mark>$1</mark>');
      }

      snippets.push(snippet);

      // Skip ahead to avoid overlapping snippets
      regex.lastIndex = end;
    }
  }

  return snippets;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
