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
});
