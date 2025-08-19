import { Event, EventEdition } from '@/types/event';

export const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Brazilian Symposium on Software Engineering',
    shortName: 'SBES',
    description: 'The Brazilian Symposium on Software Engineering (SBES) is the premier software engineering conference in Brazil, bringing together researchers, practitioners, and students to discuss the latest advances in software engineering.',
    website: 'https://sbes.org.br',
    organizer: 'Brazilian Computer Society (SBC)',
    field: 'Software Engineering',
    topics: ['software engineering', 'software architecture', 'software testing', 'requirements engineering', 'software maintenance'],
    categories: ['cs.se'], // software engineering category
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isActive: true
  },
  {
    id: '2',
    name: 'International Conference on Machine Learning',
    shortName: 'ICML',
    description: 'ICML is one of the leading international academic conferences in machine learning. The conference brings together researchers from around the world to share cutting-edge research in all aspects of machine learning.',
    website: 'https://icml.cc',
    organizer: 'International Machine Learning Society (IMLS)',
    field: 'Machine Learning',
    topics: ['machine learning', 'deep learning', 'artificial intelligence', 'neural networks', 'reinforcement learning'],
    categories: ['cs.ai'], // AI category
    createdAt: '2019-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isActive: true
  },
  {
    id: '3',
    name: 'Conference on Computer Vision and Pattern Recognition',
    shortName: 'CVPR',
    description: 'CVPR is an annual conference on computer vision and pattern recognition. It is one of the top venues for computer vision research, covering all aspects of visual computing.',
    website: 'https://cvpr.org',
    organizer: 'IEEE Computer Society',
    field: 'Computer Vision',
    topics: ['computer vision', 'pattern recognition', 'image processing', 'deep learning', 'visual computing'],
    categories: ['cs.cv'], // computer vision category
    createdAt: '2018-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isActive: true
  }
];

export const mockEventEditions: EventEdition[] = [
  // SBES Editions
  {
    id: '1',
    eventId: '1',
    year: 2024,
    location: {
      city: 'Curitiba',
      country: 'Brazil',
      venue: 'Pontifícia Universidade Católica do Paraná'
    },
    dates: {
      start: '2024-09-23',
      end: '2024-09-27'
    },
    deadlines: {
      submission: '2024-04-15',
      notification: '2024-06-15',
      cameraReady: '2024-07-15'
    },
    website: 'https://sbes2024.org.br',
    description: 'The 38th Brazilian Symposium on Software Engineering',
    chairpersons: [
      {
        name: 'Dr. Maria Silva',
        affiliation: 'Universidade Federal de Pernambuco',
        email: 'maria.silva@ufpe.br'
      },
      {
        name: 'Dr. João Santos',
        affiliation: 'Universidade de São Paulo',
        email: 'joao.santos@usp.br'
      }
    ],
    tracks: ['Research Track', 'Industry Track', 'Tool Demonstration Track', 'Doctoral Symposium'],
    isPublished: true,
    createdAt: '2023-10-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    eventId: '1',
    year: 2025,
    location: {
      city: 'Salvador',
      country: 'Brazil',
      venue: 'Universidade Federal da Bahia'
    },
    dates: {
      start: '2025-09-22',
      end: '2025-09-26'
    },
    deadlines: {
      submission: '2025-04-15',
      notification: '2025-06-15',
      cameraReady: '2025-07-15'
    },
    website: 'https://sbes2025.org.br',
    description: 'The 39th Brazilian Symposium on Software Engineering',
    chairpersons: [
      {
        name: 'Dr. Ana Costa',
        affiliation: 'Universidade Federal da Bahia',
        email: 'ana.costa@ufba.br'
      }
    ],
    tracks: ['Research Track', 'Industry Track', 'Tool Demonstration Track', 'Doctoral Symposium'],
    isPublished: false,
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  // ICML Editions
  {
    id: '3',
    eventId: '2',
    year: 2024,
    location: {
      city: 'Vienna',
      country: 'Austria',
      venue: 'Austria Center Vienna'
    },
    dates: {
      start: '2024-07-21',
      end: '2024-07-27'
    },
    deadlines: {
      submission: '2024-02-01',
      notification: '2024-05-01',
      cameraReady: '2024-06-01'
    },
    website: 'https://icml.cc/Conferences/2024',
    description: 'The 41st International Conference on Machine Learning',
    chairpersons: [
      {
        name: 'Dr. Andreas Krause',
        affiliation: 'ETH Zurich',
        email: 'krausea@ethz.ch'
      },
      {
        name: 'Dr. Emma Brunskill',
        affiliation: 'Stanford University',
        email: 'ebrun@stanford.edu'
      }
    ],
    tracks: ['Main Conference Track', 'Workshop Track', 'Tutorial Track'],
    isPublished: true,
    createdAt: '2023-08-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  // CVPR Editions
  {
    id: '4',
    eventId: '3',
    year: 2024,
    location: {
      city: 'Seattle',
      country: 'USA',
      venue: 'Washington State Convention Center'
    },
    dates: {
      start: '2024-06-17',
      end: '2024-06-21'
    },
    deadlines: {
      submission: '2023-11-17',
      notification: '2024-02-27',
      cameraReady: '2024-04-14'
    },
    website: 'https://cvpr.thecvf.com/Conferences/2024',
    description: 'The IEEE/CVF Conference on Computer Vision and Pattern Recognition 2024',
    chairpersons: [
      {
        name: 'Dr. Ming-Hsuan Yang',
        affiliation: 'UC Merced',
        email: 'mhyang@ucmerced.edu'
      },
      {
        name: 'Dr. Ramin Zabih',
        affiliation: 'Cornell University',
        email: 'rdz@cs.cornell.edu'
      }
    ],
    tracks: ['Main Conference Track', 'Workshop Track', 'Tutorial Track', 'Demo Track'],
    isPublished: true,
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];