export interface BibTeXEntry {
  type: string;
  key: string;
  title?: string;
  author?: string;
  year?: number;
  journal?: string;
  booktitle?: string;
  pages?: string;
  volume?: string;
  number?: string;
  publisher?: string;
  doi?: string;
  url?: string;
  abstract?: string;
  keywords?: string;
  isbn?: string;
  issn?: string;
  editor?: string;
  address?: string;
  month?: string;
  note?: string;
  location?: string;
}

export interface ParsedAuthor {
  name: string;
  email?: string;
  affiliation?: string;
}

export function parseBibTeX(bibtexContent: string): BibTeXEntry[] {
  const entries: BibTeXEntry[] = [];

  // Remove comments and clean up the content
  const cleanContent = bibtexContent
    .replace(/%.*$/gm, '') // Remove comments
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Match BibTeX entries
  const entryRegex = /@(\w+)\s*{\s*([^,]+)\s*,\s*([\s\S]*?)(?=@\w+\s*{|$)/g;
  let match;

  while ((match = entryRegex.exec(cleanContent)) !== null) {
    const [, type, key, fields] = match;

    const entry: BibTeXEntry = {
      type: type.toLowerCase(),
      key: key.trim()
    };

    // Parse fields
    const fieldRegex = /(\w+)\s*=\s*({[^{}]*(?:{[^{}]*}[^{}]*)*}|"[^"]*"|[^,]*),?/g;
    let fieldMatch;

    while ((fieldMatch = fieldRegex.exec(fields)) !== null) {
      const [, fieldName, fieldValue] = fieldMatch;
      const cleanFieldName = fieldName.toLowerCase().trim();
      let cleanFieldValue = fieldValue.trim();

      // Remove braces or quotes
      if (cleanFieldValue.startsWith('{') && cleanFieldValue.endsWith('}')) {
        cleanFieldValue = cleanFieldValue.slice(1, -1);
      } else if (cleanFieldValue.startsWith('"') && cleanFieldValue.endsWith('"')) {
        cleanFieldValue = cleanFieldValue.slice(1, -1);
      }

      // Clean up the value
      cleanFieldValue = cleanFieldValue
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, '\\')
        .replace(/\s+/g, ' ')
        .trim();

      // Map field names to our interface
      switch (cleanFieldName) {
        case 'title':
          entry.title = cleanFieldValue;
          break;
        case 'author':
          entry.author = cleanFieldValue;
          break;
        case 'year':
          entry.year = parseInt(cleanFieldValue);
          break;
        case 'journal':
          entry.journal = cleanFieldValue;
          break;
        case 'booktitle':
          entry.booktitle = cleanFieldValue;
          break;
        case 'pages':
          entry.pages = cleanFieldValue;
          break;
        case 'volume':
          entry.volume = cleanFieldValue;
          break;
        case 'number':
          entry.number = cleanFieldValue;
          break;
        case 'publisher':
          entry.publisher = cleanFieldValue;
          break;
        case 'doi':
          entry.doi = cleanFieldValue;
          break;
        case 'url':
          entry.url = cleanFieldValue;
          break;
        case 'abstract':
          entry.abstract = cleanFieldValue;
          break;
        case 'keywords':
          entry.keywords = cleanFieldValue;
          break;
        case 'isbn':
          entry.isbn = cleanFieldValue;
          break;
        case 'issn':
          entry.issn = cleanFieldValue;
          break;
        case 'editor':
          entry.editor = cleanFieldValue;
          break;
        case 'address':
          entry.address = cleanFieldValue;
          break;
        case 'month':
          entry.month = cleanFieldValue;
          break;
        case 'note':
          entry.note = cleanFieldValue;
          break;
        case 'location':
          entry.location = cleanFieldValue;
          break;
      }
    }

    entries.push(entry);
  }

  return entries;
}

export function parseAuthors(authorString: string): ParsedAuthor[] {
  if (!authorString) return [];

  // Split by 'and' (case insensitive)
  const authorParts = authorString.split(/\s+and\s+/i);

  return authorParts.map(authorPart => {
    const cleanAuthor = authorPart.trim();

    // Try to extract email if present
    const emailMatch = cleanAuthor.match(/([^<]+)<([^>]+)>/);
    if (emailMatch) {
      return {
        name: emailMatch[1].trim(),
        email: emailMatch[2].trim()
      };
    }

    // Handle "Last, First" format
    if (cleanAuthor.includes(',')) {
      const parts = cleanAuthor.split(',');
      if (parts.length >= 2) {
        const lastName = parts[0].trim();
        const firstName = parts[1].trim();
        return {
          name: `${firstName} ${lastName}`
        };
      }
    }

    // Default: use as-is
    return {
      name: cleanAuthor
    };
  });
}

export function bibtexEntryToArticle(entry: BibTeXEntry): {
  title: string;
  abstract?: string;
  keywords?: string;
  doi?: string;
  url?: string;
  pages?: string;
  authors: ParsedAuthor[];
  venue?: string;
  year?: number;
} {
  const authors = parseAuthors(entry.author || '');

  // Determine venue (journal, conference, etc.)
  let venue = entry.journal || entry.booktitle;
  if (entry.volume) {
    venue = venue ? `${venue}, Vol. ${entry.volume}` : `Vol. ${entry.volume}`;
  }
  if (entry.number) {
    venue = venue ? `${venue}(${entry.number})` : `No. ${entry.number}`;
  }

  return {
    title: entry.title || 'Untitled',
    abstract: entry.abstract,
    keywords: entry.keywords,
    doi: entry.doi,
    url: entry.url,
    pages: entry.pages,
    authors,
    venue,
    year: entry.year
  };
}