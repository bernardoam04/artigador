import { Article, Author } from '@/types/article';
import { categories } from './categories';

const authors: Author[] = [
  { id: '1', name: 'Dr. Sarah Chen', affiliation: 'MIT Computer Science', email: 'chen@mit.edu' },
  { id: '2', name: 'Prof. Michael Rodriguez', affiliation: 'Stanford AI Lab', email: 'rodriguez@stanford.edu' },
  { id: '3', name: 'Dr. Emily Johnson', affiliation: 'Google Research', email: 'ejohnson@google.com' },
  { id: '4', name: 'Prof. David Kim', affiliation: 'Carnegie Mellon University', email: 'dkim@cmu.edu' },
  { id: '5', name: 'Dr. Lisa Zhang', affiliation: 'Facebook AI Research', email: 'lzhang@fb.com' },
  { id: '6', name: 'Prof. Robert Brown', affiliation: 'UC Berkeley', email: 'rbrown@berkeley.edu' },
  { id: '7', name: 'Dr. Anna Petrov', affiliation: 'Oxford University', email: 'petrov@ox.ac.uk' },
  { id: '8', name: 'Prof. James Wilson', affiliation: 'MIT Mathematics', email: 'jwilson@mit.edu' }
];

export const mockArticles: Article[] = [];