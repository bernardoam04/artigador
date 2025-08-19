import { Category } from '@/types/article';

export const categories: Category[] = [
  {
    id: 'cs',
    name: 'Computer Science',
    description: 'Computing and information technology research',
    subcategories: [
      {
        id: 'cs.ai',
        name: 'Artificial Intelligence',
        description: 'Machine learning, neural networks, AI systems'
      },
      {
        id: 'cs.cv',
        name: 'Computer Vision',
        description: 'Image processing, pattern recognition, visual computing'
      },
      {
        id: 'cs.db',
        name: 'Databases',
        description: 'Database systems, data management, information retrieval'
      },
      {
        id: 'cs.se',
        name: 'Software Engineering',
        description: 'Software development, testing, maintenance, methodologies'
      },
      {
        id: 'cs.sys',
        name: 'Systems',
        description: 'Operating systems, distributed systems, networking'
      }
    ]
  },
  {
    id: 'math',
    name: 'Mathematics',
    description: 'Pure and applied mathematics research',
    subcategories: [
      {
        id: 'math.na',
        name: 'Numerical Analysis',
        description: 'Computational mathematics, numerical methods'
      },
      {
        id: 'math.st',
        name: 'Statistics',
        description: 'Statistical theory and applications'
      },
      {
        id: 'math.pr',
        name: 'Probability',
        description: 'Probability theory and stochastic processes'
      }
    ]
  },
  {
    id: 'physics',
    name: 'Physics',
    description: 'Physics and related fields',
    subcategories: [
      {
        id: 'physics.comp-ph',
        name: 'Computational Physics',
        description: 'Computer simulation and modeling in physics'
      },
      {
        id: 'physics.data-an',
        name: 'Data Analysis',
        description: 'Statistical methods and data analysis in physics'
      }
    ]
  },
  {
    id: 'bio',
    name: 'Biology',
    description: 'Biological sciences and life sciences',
    subcategories: [
      {
        id: 'bio.info',
        name: 'Bioinformatics',
        description: 'Computational biology, genomics, systems biology'
      },
      {
        id: 'bio.mol',
        name: 'Molecular Biology',
        description: 'Molecular mechanisms and cellular processes'
      }
    ]
  }
];