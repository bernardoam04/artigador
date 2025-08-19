import { Article, Author } from '@/types/article';
import { categories } from './categories';

const authors: Author[] = [
  // Attention Is All You Need
  { id: '1', name: 'Ashish Vaswani', affiliation: 'Google Brain', email: 'avaswani@google.com' },
  { id: '2', name: 'Noam Shazeer', affiliation: 'Google Brain' },
  { id: '3', name: 'Niki Parmar', affiliation: 'Google Research' },
  { id: '4', name: 'Jakob Uszkoreit', affiliation: 'Google Research' },
  { id: '5', name: 'Llion Jones', affiliation: 'Google Research' },
  { id: '6', name: 'Aidan N. Gomez', affiliation: 'University of Toronto' },
  { id: '7', name: 'Łukasz Kaiser', affiliation: 'Google Brain' },
  { id: '8', name: 'Illia Polosukhin', affiliation: 'Google Research' },

  // AlexNet
  { id: '9', name: 'Alex Krizhevsky', affiliation: 'University of Toronto' },
  { id: '10', name: 'Ilya Sutskever', affiliation: 'University of Toronto' },
  { id: '11', name: 'Geoffrey E. Hinton', affiliation: 'University of Toronto' },

  // ResNet
  { id: '12', name: 'Kaiming He', affiliation: 'Microsoft Research' },
  { id: '13', name: 'Xiangyu Zhang', affiliation: 'Microsoft Research' },
  { id: '14', name: 'Shaoqing Ren', affiliation: 'Microsoft Research' },
  { id: '15', name: 'Jian Sun', affiliation: 'Microsoft Research' },

  // Classic papers
  { id: '16', name: 'Alan Turing', affiliation: 'Cambridge University' },
  { id: '17', name: 'Claude Shannon', affiliation: 'Bell Labs' },
  { id: '18', name: 'Edgar F. Codd', affiliation: 'IBM' },
  { id: '19', name: 'Stephen A. Cook', affiliation: 'University of Toronto' },
  { id: '20', name: 'Vinton G. Cerf', affiliation: 'Stanford University' },
  { id: '21', name: 'Robert E. Kahn', affiliation: 'DARPA' },
  { id: '22', name: 'Tim Berners-Lee', affiliation: 'CERN' },
  { id: '23', name: 'Sergey Brin', affiliation: 'Stanford University' },
  { id: '24', name: 'Larry Page', affiliation: 'Stanford University' }
];

export const realArticles: Article[] = [
  {
    id: '1',
    title: 'Attention Is All You Need',
    abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.',
    authors: [authors[0], authors[1], authors[2], authors[3], authors[4], authors[5], authors[6], authors[7]],
    categories: [categories[0].subcategories![0]], // AI
    keywords: ['transformers', 'attention mechanisms', 'neural machine translation', 'sequence modeling', 'deep learning'],
    publishedDate: '2017-06-12',
    submittedDate: '2017-06-12',
    lastModified: '2017-08-02',
    doi: '10.48550/arXiv.1706.03762',
    arxivId: '1706.03762',
    pdfUrl: '/pdfs/attention_is_all_you_need.pdf',
    citationCount: 85420,
    downloads: 234567,
    venue: {
      name: 'Neural Information Processing Systems (NIPS)',
      type: 'conference',
      year: 2017
    },
    status: 'published',
    language: 'en',
    pageCount: 15,
    version: 5
  },
  {
    id: '2',
    title: 'ImageNet Classification with Deep Convolutional Neural Networks',
    abstract: 'We trained a large, deep convolutional neural network to classify the 1.2 million high-resolution images in the ImageNet LSVRC-2010 contest into the 1000 different classes. On the test data, we achieved top-1 and top-5 error rates of 37.5% and 17.0% which is considerably better than the previous state-of-the-art. The neural network, which has 60 million parameters and 650,000 neurons, consists of five convolutional layers, some of which are followed by max-pooling layers, and three fully-connected layers with a final 1000-way softmax.',
    authors: [authors[8], authors[9], authors[10]],
    categories: [categories[0].subcategories![1]], // Computer Vision
    keywords: ['convolutional neural networks', 'image classification', 'ImageNet', 'deep learning', 'AlexNet'],
    publishedDate: '2012-12-03',
    submittedDate: '2012-09-30',
    lastModified: '2012-12-03',
    pdfUrl: '/pdfs/alexnet.pdf',
    citationCount: 98234,
    downloads: 145632,
    venue: {
      name: 'Neural Information Processing Systems (NIPS)',
      type: 'conference',
      year: 2012
    },
    status: 'published',
    language: 'en',
    pageCount: 9,
    version: 1
  },
  {
    id: '3',
    title: 'Deep Residual Learning for Image Recognition',
    abstract: 'Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions. We provide comprehensive empirical evidence showing that these residual networks are easier to optimize, and can gain accuracy from considerably increased depth.',
    authors: [authors[11], authors[12], authors[13], authors[14]],
    categories: [categories[0].subcategories![1]], // Computer Vision
    keywords: ['residual networks', 'deep learning', 'image recognition', 'neural networks', 'ResNet'],
    publishedDate: '2015-12-10',
    submittedDate: '2015-12-10',
    lastModified: '2016-01-16',
    doi: '10.48550/arXiv.1512.03385',
    arxivId: '1512.03385',
    pdfUrl: '/pdfs/resnet.pdf',
    citationCount: 165890,
    downloads: 89234,
    venue: {
      name: 'Computer Vision and Pattern Recognition (CVPR)',
      type: 'conference',
      year: 2016
    },
    status: 'published',
    language: 'en',
    pageCount: 12,
    version: 1
  },
  {
    id: '4',
    title: 'On Computable Numbers, with an Application to the Entscheidungsproblem',
    abstract: 'This paper introduces the concept of a "universal computing machine" (later called a Turing machine) and proves that there are mathematical problems that cannot be solved by any algorithm. The paper establishes the theoretical foundation for computer science and demonstrates the limits of computation. It provides a precise definition of what it means for a function to be "computable" and introduces the halting problem as an example of an undecidable problem.',
    authors: [authors[15]],
    categories: [categories[0], categories[1]], // Computer Science + Mathematics
    keywords: ['computability theory', 'Turing machine', 'undecidability', 'halting problem', 'theoretical computer science'],
    publishedDate: '1936-11-01',
    submittedDate: '1936-05-28',
    lastModified: '1936-11-01',
    doi: '10.1112/plms/s2-42.2.230',
    pdfUrl: '/pdfs/turing_computable_numbers.pdf',
    citationCount: 7234,
    downloads: 45678,
    venue: {
      name: 'Proceedings of the London Mathematical Society',
      type: 'journal',
      year: 1936
    },
    status: 'published',
    language: 'en',
    pageCount: 42,
    version: 1
  },
  {
    id: '5',
    title: 'A Mathematical Theory of Communication',
    abstract: 'The fundamental problem of communication is that of reproducing at one point either exactly or approximately a message selected at another point. This paper develops the mathematical theory behind information transmission and introduces concepts like entropy, channel capacity, and redundancy. It establishes the foundation for information theory and demonstrates how to measure and transmit information efficiently.',
    authors: [authors[16]],
    categories: [categories[1], categories[0]], // Mathematics + Computer Science
    keywords: ['information theory', 'entropy', 'channel capacity', 'communication theory', 'signal processing'],
    publishedDate: '1948-07-01',
    submittedDate: '1948-04-01',
    lastModified: '1948-07-01',
    pdfUrl: '/pdfs/shannon_information_theory.pdf',
    citationCount: 12456,
    downloads: 67890,
    venue: {
      name: 'Bell System Technical Journal',
      type: 'journal',
      year: 1948
    },
    status: 'published',
    language: 'en',
    pageCount: 55,
    version: 1
  },
  {
    id: '6',
    title: 'A Relational Model of Data for Large Shared Data Banks',
    abstract: 'Future users of large data banks must be protected from having to know how the data is organized in the machine (the internal representation). This paper introduces the relational model for database management, which uses relations (tables) to store and manipulate data. The model provides data independence and establishes the theoretical foundation for modern relational database systems.',
    authors: [authors[17]],
    categories: [categories[0].subcategories![2]], // Databases
    keywords: ['relational model', 'database management', 'data independence', 'SQL', 'normalization'],
    publishedDate: '1970-06-01',
    submittedDate: '1970-03-01',
    lastModified: '1970-06-01',
    doi: '10.1145/362384.362685',
    pdfUrl: 'https://www.seas.upenn.edu/~zives/03f/cis550/codd.pdf',
    citationCount: 5678,
    downloads: 23456,
    venue: {
      name: 'Communications of the ACM',
      type: 'journal',
      year: 1970
    },
    status: 'published',
    language: 'en',
    pageCount: 11,
    version: 1
  },
  {
    id: '7',
    title: 'The Complexity of Theorem-Proving Procedures',
    abstract: 'It is shown that any recognition problem solved by a polynomial time-bounded nondeterministic Turing machine can be "reduced" to the problem of determining whether a given propositional formula is a tautology. This establishes that the satisfiability problem is NP-complete, founding the theory of NP-completeness and demonstrating the fundamental difficulty of many computational problems.',
    authors: [authors[18]],
    categories: [categories[0], categories[1]], // Computer Science + Mathematics
    keywords: ['NP-completeness', 'computational complexity', 'satisfiability', 'P vs NP', 'theorem proving'],
    publishedDate: '1971-05-01',
    submittedDate: '1971-02-01',
    lastModified: '1971-05-01',
    doi: '10.1145/800157.805047',
    pdfUrl: 'https://www.inf.unibz.it/~calvanese/teaching/14-15-tc/material/cook-1971-NP-completeness-of-SAT.pdf',
    citationCount: 4567,
    downloads: 18765,
    venue: {
      name: 'Annual ACM Symposium on Theory of Computing (STOC)',
      type: 'conference',
      year: 1971
    },
    status: 'published',
    language: 'en',
    pageCount: 13,
    version: 1
  },
  {
    id: '8',
    title: 'A Protocol for Packet Network Intercommunication',
    abstract: 'This paper describes a protocol for sharing resources that exist in different packet switching networks. The protocol provides for variation in individual network packet sizes, transmission failures, sequencing, flow control and other communication oriented features. This work laid the foundation for the TCP/IP protocol suite that powers the modern internet.',
    authors: [authors[19], authors[20]],
    categories: [categories[0].subcategories![4]], // Systems/Networking
    keywords: ['TCP/IP', 'internet protocol', 'packet switching', 'network architecture', 'internetworking'],
    publishedDate: '1974-05-01',
    submittedDate: '1974-02-01',
    lastModified: '1974-05-01',
    doi: '10.1109/TCOM.1974.1092259',
    pdfUrl: 'https://www.cs.princeton.edu/courses/archive/fall06/cos561/papers/cerf74.pdf',
    citationCount: 3456,
    downloads: 15432,
    venue: {
      name: 'IEEE Transactions on Communications',
      type: 'journal',
      year: 1974
    },
    status: 'published',
    language: 'en',
    pageCount: 8,
    version: 1
  },
  {
    id: '9',
    title: 'Information Management: A Proposal',
    abstract: 'This proposal describes a "web" of human-readable information linked together in a way that I can find what I need. The project originally called "WorldWideWeb" and now known as the World Wide Web, was designed to allow links to be made to any information anywhere. This document outlined the basic architecture of the Web including URLs, HTTP, and HTML.',
    authors: [authors[21]],
    categories: [categories[0].subcategories![4]], // Systems
    keywords: ['World Wide Web', 'hypertext', 'HTTP', 'HTML', 'URLs'],
    publishedDate: '1989-03-01',
    submittedDate: '1989-03-01',
    lastModified: '1990-05-01',
    pdfUrl: 'https://cds.cern.ch/record/369245/files/dd-89-001.pdf',
    citationCount: 2345,
    downloads: 34567,
    venue: {
      name: 'CERN Technical Report',
      type: 'preprint',
      year: 1989
    },
    status: 'published',
    language: 'en',
    pageCount: 20,
    version: 1
  },
  {
    id: '10',
    title: 'The Anatomy of a Large-Scale Hypertextual Web Search Engine',
    abstract: 'In this paper, we present Google, a prototype of a large-scale search engine which makes heavy use of the structure present in hypertext. Google is designed to crawl and index the Web efficiently and produce much more satisfying search results than existing systems. The paper describes the PageRank algorithm and the overall architecture of the Google search engine.',
    authors: [authors[22], authors[23]],
    categories: [categories[0].subcategories![2], categories[0].subcategories![4]], // Databases + Systems
    keywords: ['PageRank', 'web search', 'information retrieval', 'hypertext', 'search engines'],
    publishedDate: '1998-04-01',
    submittedDate: '1998-01-01',
    lastModified: '1998-04-01',
    pdfUrl: 'https://snap.stanford.edu/class/cs224w-readings/Brin98Anatomy.pdf',
    citationCount: 23456,
    downloads: 78901,
    venue: {
      name: 'International World Wide Web Conference (WWW)',
      type: 'conference',
      year: 1998
    },
    status: 'published',
    language: 'en',
    pageCount: 20,
    version: 1
  }
];