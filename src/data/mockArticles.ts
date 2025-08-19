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

export const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Deep Learning Approaches for Natural Language Understanding in Conversational AI',
    abstract: 'This paper presents novel deep learning architectures for improving natural language understanding in conversational AI systems. We introduce a transformer-based model that achieves state-of-the-art performance on multiple benchmarks while maintaining computational efficiency. Our approach combines attention mechanisms with hierarchical representations to better capture contextual information in multi-turn conversations.',
    authors: [authors[0], authors[1]],
    categories: [categories[0].subcategories![0]], // AI
    keywords: ['deep learning', 'natural language processing', 'conversational AI', 'transformers', 'attention mechanisms'],
    publishedDate: '2024-03-15',
    submittedDate: '2024-01-20',
    lastModified: '2024-03-10',
    doi: '10.1000/abc123',
    arxivId: '2403.12345',
    pdfUrl: '/pdfs/sample1.pdf',
    citationCount: 47,
    downloads: 1834,
    venue: {
      name: 'International Conference on Machine Learning',
      type: 'conference',
      year: 2024
    },
    status: 'published',
    language: 'en',
    pageCount: 12,
    version: 1
  },
  {
    id: '2',
    title: 'Efficient Computer Vision Models for Real-time Object Detection on Edge Devices',
    abstract: 'Mobile and edge computing devices require efficient computer vision models that can perform real-time object detection with limited computational resources. This work proposes a novel architecture that reduces model size by 70% while maintaining detection accuracy comparable to larger models. We evaluate our approach on standard datasets and demonstrate its effectiveness on various edge computing platforms.',
    authors: [authors[2], authors[3]],
    categories: [categories[0].subcategories![1]], // Computer Vision
    keywords: ['computer vision', 'object detection', 'edge computing', 'mobile AI', 'model compression'],
    publishedDate: '2024-02-28',
    submittedDate: '2024-01-05',
    lastModified: '2024-02-25',
    doi: '10.1000/def456',
    pdfUrl: '/pdfs/sample2.pdf',
    citationCount: 23,
    downloads: 967,
    venue: {
      name: 'Computer Vision and Pattern Recognition',
      type: 'conference',
      year: 2024
    },
    status: 'published',
    language: 'en',
    pageCount: 8,
    version: 1
  },
  {
    id: '3',
    title: 'Scalable Database Systems for Big Data Analytics: A Distributed Approach',
    abstract: 'As data volumes continue to grow exponentially, traditional database systems face significant challenges in processing and analyzing big data efficiently. This paper presents a distributed database architecture that can scale horizontally while maintaining ACID properties. Our system demonstrates superior performance compared to existing solutions in handling complex analytical queries over large datasets.',
    authors: [authors[4], authors[5]],
    categories: [categories[0].subcategories![2]], // Databases
    keywords: ['distributed systems', 'big data', 'database scalability', 'ACID properties', 'analytical queries'],
    publishedDate: '2024-01-15',
    submittedDate: '2023-11-20',
    lastModified: '2024-01-10',
    doi: '10.1000/ghi789',
    pdfUrl: '/pdfs/sample3.pdf',
    citationCount: 31,
    downloads: 1256,
    venue: {
      name: 'ACM Transactions on Database Systems',
      type: 'journal',
      year: 2024
    },
    status: 'published',
    language: 'en',
    pageCount: 15,
    version: 1
  },
  {
    id: '4',
    title: 'Advanced Software Testing Methodologies for Microservices Architecture',
    abstract: 'Microservices architecture introduces unique challenges for software testing due to the distributed nature of services and complex inter-service communications. This research proposes comprehensive testing strategies that include contract testing, chaos engineering, and automated integration testing. We provide empirical evidence of improved software quality and reduced production incidents.',
    authors: [authors[6]],
    categories: [categories[0].subcategories![3]], // Software Engineering
    keywords: ['software testing', 'microservices', 'contract testing', 'chaos engineering', 'integration testing'],
    publishedDate: '2024-04-02',
    submittedDate: '2024-02-15',
    lastModified: '2024-03-28',
    pdfUrl: '/pdfs/sample4.pdf',
    citationCount: 8,
    downloads: 445,
    venue: {
      name: 'International Conference on Software Engineering',
      type: 'conference',
      year: 2024
    },
    status: 'published',
    language: 'en',
    pageCount: 10,
    version: 1
  },
  {
    id: '5',
    title: 'Numerical Methods for Solving Partial Differential Equations in High-Performance Computing',
    abstract: 'This paper investigates advanced numerical methods for solving complex partial differential equations (PDEs) using high-performance computing clusters. We introduce a parallel algorithm that significantly reduces computation time while maintaining numerical stability and accuracy. The proposed method is particularly effective for time-dependent PDEs in computational fluid dynamics applications.',
    authors: [authors[7]],
    categories: [categories[1].subcategories![0]], // Numerical Analysis
    keywords: ['numerical methods', 'partial differential equations', 'high-performance computing', 'parallel algorithms', 'computational fluid dynamics'],
    publishedDate: '2024-03-20',
    submittedDate: '2024-01-30',
    lastModified: '2024-03-15',
    doi: '10.1000/jkl012',
    pdfUrl: '/pdfs/sample5.pdf',
    citationCount: 15,
    downloads: 734,
    venue: {
      name: 'Journal of Computational Physics',
      type: 'journal',
      year: 2024
    },
    status: 'published',
    language: 'en',
    pageCount: 18,
    version: 1
  },
  {
    id: '6',
    title: 'Quantum Machine Learning for Optimization Problems',
    abstract: 'This paper explores the application of quantum computing principles to machine learning algorithms, specifically focusing on optimization problems. We develop quantum-inspired algorithms that leverage quantum superposition and entanglement concepts to solve complex optimization challenges more efficiently than classical approaches.',
    authors: [authors[0], authors[7]],
    categories: [categories[0].subcategories![0], categories[2].subcategories![0]], // AI + Computational Physics
    keywords: ['quantum computing', 'machine learning', 'optimization', 'quantum algorithms', 'superposition'],
    publishedDate: '2024-04-10',
    submittedDate: '2024-02-28',
    lastModified: '2024-04-05',
    pdfUrl: '/pdfs/sample6.pdf',
    citationCount: 3,
    downloads: 289,
    status: 'preprint',
    language: 'en',
    pageCount: 14,
    version: 1
  }
];