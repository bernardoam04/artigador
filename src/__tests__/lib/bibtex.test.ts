import { describe, it, expect } from 'vitest';
import { parseBibTeX, parseAuthors, bibtexEntryToArticle } from '@/lib/bibtex';

describe('bibtex parsing', () => {
    it('parses a simple BibTeX entry', () => {
        const content = `@article{key1, title={Sample Title}, author={John Doe and Jane Roe}, year={2020}, journal={J Test}}`;
        const res = parseBibTeX(content);
        expect(res).toHaveLength(1);
        expect(res[0]).toMatchObject({ type: 'article', key: 'key1', title: 'Sample Title', year: 2020, journal: 'J Test' });
    });

    it('parses nested braces in fields', () => {
        const content = `@inproceedings{key2, title={{A {Nested} Title}}, booktitle={Proc XYZ}, pages={10--20}}`;
        const [entry] = parseBibTeX(content);
        expect(entry.title?.includes('A {Nested} Title')).toBe(true);
        expect(entry.booktitle).toBe('Proc XYZ');
        expect(entry.pages).toBe('10--20');
    });

    it('parses multiple entries', () => {
        const content = `@misc{a, title={A}} @misc{b, title={B}}`;
        const res = parseBibTeX(content);
        expect(res).toHaveLength(2);
        expect(res.map(e => e.key)).toEqual(['a', 'b']);
    });
});

describe('author parsing', () => {
    it('splits authors by and and extracts email', () => {
        const authors = parseAuthors('John Doe <john@x.com> and Roe, Jane');
        expect(authors).toEqual([
            { name: 'John Doe', email: 'john@x.com' },
            { name: 'Jane Roe' },
        ]);
    });

    it('handles empty author string', () => {
        const authors = parseAuthors('');
        expect(authors).toEqual([]);
    });

    it('parses "Last, First" format correctly', () => {
        const authors = parseAuthors('Smith, John and Doe, Jane Marie');
        expect(authors).toEqual([
            { name: 'John Smith' },
            { name: 'Jane Marie Doe' },
        ]);
    });

    it('handles single author without email', () => {
        const authors = parseAuthors('Alice Johnson');
        expect(authors).toEqual([{ name: 'Alice Johnson' }]);
    });

    it('handles multiple authors with mixed formats', () => {
        const authors = parseAuthors('Alice Johnson <alice@test.com> AND Smith, Bob and Charlie Brown');
        expect(authors).toEqual([
            { name: 'Alice Johnson', email: 'alice@test.com' },
            { name: 'Bob Smith' },
            { name: 'Charlie Brown' },
        ]);
    });
});

describe('bibtexEntryToArticle', () => {
    it('maps fields and builds venue string', () => {
        const [entry] = parseBibTeX(`@article{k, title={T}, author={A}, journal={J}, volume={12}, number={3}, pages={1-2}, year={2021}}`);
        const article = bibtexEntryToArticle(entry);
        expect(article).toMatchObject({
            title: 'T',
            authors: [{ name: 'A' }],
            venue: 'J, Vol. 12(3)',
            year: 2021,
            pages: '1-2',
        });
    });

    it('uses "Untitled" when title is missing', () => {
        const entry: any = { type: 'article', key: 'k1' };
        const article = bibtexEntryToArticle(entry);
        expect(article.title).toBe('Untitled');
    });

    it('handles entry with booktitle instead of journal', () => {
        const [entry] = parseBibTeX(`@inproceedings{k, title={T}, author={A}, booktitle={Conference XYZ}, year={2022}}`);
        const article = bibtexEntryToArticle(entry);
        expect(article).toMatchObject({
            title: 'T',
            venue: 'Conference XYZ',
            year: 2022,
        });
    });

    it('builds venue with volume but no journal', () => {
        const entry: any = { type: 'article', key: 'k', title: 'T', volume: '5' };
        const article = bibtexEntryToArticle(entry);
        expect(article.venue).toBe('Vol. 5');
    });

    it('builds venue with number but no other venue info', () => {
        const entry: any = { type: 'article', key: 'k', title: 'T', number: '3' };
        const article = bibtexEntryToArticle(entry);
        expect(article.venue).toBe('No. 3');
    });

    it('includes optional fields when present', () => {
        const [entry] = parseBibTeX(`@article{k, title={T}, author={A}, abstract={This is abstract}, keywords={ML, AI}, doi={10.1234/xyz}, url={https://example.com}}`);
        const article = bibtexEntryToArticle(entry);
        expect(article).toMatchObject({
            title: 'T',
            abstract: 'This is abstract',
            keywords: 'ML, AI',
            doi: '10.1234/xyz',
            url: 'https://example.com',
        });
    });
});

describe('bibtex parsing edge cases', () => {
    it('handles empty content', () => {
        const result = parseBibTeX('');
        expect(result).toEqual([]);
    });

    it('handles content with only comments', () => {
        const result = parseBibTeX('% This is a comment\n% Another comment');
        expect(result).toEqual([]);
    });

    it('removes comments from content', () => {
        const content = `@article{key1, title={Title}, % this is a comment\nauthor={Author}}`;
        const [entry] = parseBibTeX(content);
        expect(entry.title).toBe('Title');
        expect(entry.author).toBe('Author');
    });

    it('handles escaped characters in field values', () => {
        const content = `@article{k, title={\\"Quoted\\" Title}, note={It\\'s working}}`;
        const [entry] = parseBibTeX(content);
        expect(entry.title).toContain('"Quoted"');
        expect(entry.note).toContain("It's");
    });

    it('parses entries with quoted field values', () => {
        const content = `@article{k, title="Quoted Title", author="John Doe"}`;
        const [entry] = parseBibTeX(content);
        expect(entry.title).toBe('Quoted Title');
        expect(entry.author).toBe('John Doe');
    });

    it('handles various entry types', () => {
        const content = `@inproceedings{k1, title={T1}} @book{k2, title={T2}} @misc{k3, title={T3}}`;
        const entries = parseBibTeX(content);
        expect(entries).toHaveLength(3);
        expect(entries.map(e => e.type)).toEqual(['inproceedings', 'book', 'misc']);
    });
});
