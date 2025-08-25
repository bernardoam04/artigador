# Artigador.com - Academic Article Library

A comprehensive academic article library platform similar to ACM Digital Library and arXiv, built with modern web technologies. Artigador provides researchers, academics, and students with a powerful platform to discover, manage, and access scientific publications across multiple disciplines.

Group Members:
   - Bernardo Alves Miranda (FullStack)
   - Bernardo Venancio Cunha de Oliveira
   - Lucas Albuquerque Santos Costa
   - Cauã Magalhães Pereira (FullStack)
     
AI tools being used:
  - Claudecli PRO - paid version (R$ 110,00 monthly)

## 🌟 Features

### Core Functionality
- 🔍 **Advanced Search & Discovery** - Multi-field search across articles, authors, and events with intelligent suggestions
- 📚 **Article Management** - Complete CRUD operations for academic articles with PDF upload support
- 🎓 **Author Profiles** - Comprehensive author pages with publication statistics and career timelines
- 🎪 **Event Management** - Full conference and event management system with editions
- 📊 **BibTeX Integration** - Import articles via BibTeX file upload with automatic parsing
- 📧 **Email Subscriptions** - Newsletter system with double opt-in confirmation
- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile devices

### Admin Features
- 🛠️ **Admin Dashboard** - Complete admin interface for system management
- 📈 **Analytics & Statistics** - System-wide metrics and usage statistics
- 👥 **User Management** - User administration with role assignments
- 🗃️ **Content Management** - Bulk operations and content moderation tools

### Public Features
- 🏠 **Modern Homepage** - Hero section with search, featured articles, and statistics
- 🔎 **Browse & Filter** - Advanced filtering by categories, authors, venues, and dates
- 📖 **Article Pages** - Rich article display with full metadata and PDF viewer
- 🏛️ **Event Pages** - Dedicated pages for conferences and academic events
- 📧 **Newsletter Signup** - Multiple subscription options with preference management

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide React icons
- **State Management**: React hooks and context

### Backend
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT with role-based access control
- **Email**: Nodemailer with SMTP support
- **File Upload**: Built-in file handling for PDFs and BibTeX
- **API**: RESTful API with Next.js API routes

### Development
- **Package Manager**: npm
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Database Management**: Prisma CLI

## 📁 Project Structure

```
src/
├── app/                     # Next.js app router pages
│   ├── admin/              # Admin dashboard pages
│   │   ├── articles/       # Article management
│   │   ├── authors/        # Author management
│   │   ├── events/         # Event management
│   │   ├── editions/       # Edition management
│   │   └── import/         # BibTeX import
│   ├── api/                # API routes
│   │   ├── articles/       # Article CRUD operations
│   │   ├── authors/        # Author operations
│   │   ├── auth/           # Authentication
│   │   ├── events/         # Event management
│   │   ├── editions/       # Edition management
│   │   ├── subscriptions/  # Newsletter management
│   │   └── upload/         # File upload handling
│   ├── article/[id]/       # Individual article pages
│   ├── authors/            # Author directory and profiles
│   ├── browse/             # Browse/search interface
│   ├── events/             # Event listing and details
│   ├── editions/           # Event edition pages
│   ├── login/              # Authentication pages
│   ├── subscribe/          # Newsletter subscription
│   └── unsubscribe/        # Newsletter unsubscription
├── components/             # Reusable React components
│   ├── admin/              # Admin-specific components
│   ├── ArticleCard.tsx     # Article display component
│   ├── Header.tsx          # Main navigation
│   ├── Footer.tsx          # Site footer
│   ├── SearchWithSuggestions.tsx  # Advanced search
│   └── NewsletterSignup.tsx # Subscription component
├── lib/                    # Utility functions
│   ├── auth.ts            # Authentication utilities
│   ├── bibtex.ts          # BibTeX parsing
│   └── email.ts           # Email templates and sending
├── data/                   # Sample data and configurations
└── types/                  # TypeScript type definitions
prisma/
├── schema.prisma          # Database schema
└── migrations/            # Database migration files
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/artigador.git
   cd artigador
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy the example environment file and configure your settings:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configurations:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"
   
   # JWT Secret (change this in production)
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   
   # Email Configuration (using Gmail SMTP)
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT=587
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-app-password"
   EMAIL_FROM="Artigador <noreply@artigador.com>"
   
   # App Configuration
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NEXT_PUBLIC_ADMIN_EMAIL="admin@artigador.com"
   
   # File Upload
   MAX_FILE_SIZE=50000000  # 50MB in bytes
   UPLOAD_DIR="./public/uploads"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Create initial data (optional)**
   ```bash
   npx prisma db seed
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Admin Dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

### First-Time Setup

1. **Create an admin account** by registering at `/login`
2. **Access the admin dashboard** at `/admin`
3. **Import sample data** via BibTeX upload or manual entry
4. **Configure email settings** for newsletter functionality

## 📋 Available Scripts

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality
- `npx prisma studio` - Open Prisma Studio for database management
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database

## 🎯 Key Features in Detail

### 1. Article Management
- **Upload System**: PDF upload with metadata extraction
- **BibTeX Import**: Bulk import from `.bib` files with automatic parsing
- **Rich Metadata**: Title, abstract, authors, venue, DOI, keywords
- **Search Integration**: Full-text search across all article fields
- **Category Organization**: Hierarchical categorization system

### 2. User Authentication
- **JWT-based Authentication**: Secure token-based auth system
- **Role-based Access**: Admin and user roles with different permissions
- **Protected Routes**: Secure admin areas and user-specific content
- **Session Management**: Persistent login with token refresh

### 3. Event Management
- **Conference Management**: Create and manage academic conferences
- **Event Editions**: Support for annual conferences with multiple editions
- **Article Association**: Link articles to specific conference editions
- **Public Pages**: Dedicated pages for each event and edition

### 4. Search & Discovery
- **Advanced Search**: Multi-field search with suggestions
- **Smart Filtering**: Filter by authors, venues, dates, categories
- **Real-time Suggestions**: Auto-complete search suggestions
- **Sort Options**: Sort by relevance, date, citations, downloads

### 5. Author Profiles
- **Comprehensive Profiles**: Author pages with career statistics
- **Publication Lists**: Complete publication history with metrics
- **Venue Statistics**: Analysis of publication venues
- **Collaboration Networks**: Author collaboration information

### 6. Email Newsletter System
- **Double Opt-in**: Secure subscription confirmation workflow
- **Preference Management**: Customizable subscription preferences
- **HTML Templates**: Professional email templates with branding
- **Unsubscribe Handling**: Easy unsubscribe with feedback collection

### 7. Admin Dashboard
- **System Overview**: Key metrics and statistics
- **Content Management**: CRUD operations for all content types
- **User Management**: User administration and role assignments
- **Import Tools**: BibTeX import with validation and preview

## 🗄️ Database Schema

The application uses a relational database with the following main entities:

- **User**: User accounts with authentication
- **Article**: Academic papers with full metadata
- **Author**: Author information and affiliations
- **Event**: Academic conferences and workshops  
- **EventEdition**: Specific instances of recurring events
- **Category**: Hierarchical categorization system
- **Subscription**: Email newsletter subscriptions
- **ImportLog**: BibTeX import tracking

## 🔧 Configuration

### Email Configuration
Configure SMTP settings in your `.env` file for newsletter functionality:
- Supports Gmail, Outlook, and custom SMTP servers
- Requires app-specific passwords for Gmail
- HTML and text email templates included

### File Upload Configuration
- Maximum file size: 50MB (configurable)
- Supported formats: PDF, BibTeX (.bib)
- Files stored in `public/uploads/` directory
- Automatic file validation and processing

### Database Configuration
- Default: SQLite for development
- Production: Can be configured for PostgreSQL, MySQL, etc.
- Automatic migrations with Prisma
- Seed data available for testing

## 🔒 Security Features

- **Input Validation**: All inputs validated and sanitized
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **XSS Protection**: React's built-in XSS protection
- **JWT Security**: Secure token generation and validation
- **File Upload Security**: File type validation and size limits
- **Rate Limiting**: Built-in protection against abuse

## 🚀 Deployment

### Production Checklist
1. Update environment variables for production
2. Configure production database
3. Set up email service (SendGrid, AWS SES, etc.)
4. Configure file storage (AWS S3, Google Cloud Storage)
5. Set up SSL certificates
6. Configure monitoring and logging

### Deployment Options
- **Vercel**: One-click deployment with database
- **Heroku**: Docker deployment with add-ons
- **AWS**: EC2 with RDS database
- **DigitalOcean**: App Platform deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Article Endpoints
- `GET /api/articles` - List articles with pagination
- `GET /api/articles/[id]` - Get specific article
- `POST /api/articles` - Create new article (admin)
- `PUT /api/articles/[id]` - Update article (admin)
- `DELETE /api/articles/[id]` - Delete article (admin)
- `GET /api/articles/search` - Search articles

### Author Endpoints
- `GET /api/authors` - List authors
- `GET /api/authors/[id]` - Get author profile
- `POST /api/authors` - Create author (admin)

### Subscription Endpoints
- `POST /api/subscriptions` - Subscribe to newsletter
- `GET /api/subscriptions/confirm` - Confirm subscription
- `POST /api/subscriptions/unsubscribe` - Unsubscribe

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📊 Performance

- **Lighthouse Score**: 90+ across all metrics
- **Core Web Vitals**: Optimized for LCP, FID, CLS
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic route-based code splitting
- **Database Optimization**: Indexed queries and pagination

## 🛟 Support

- **Issues**: Report bugs and feature requests on GitHub
- **Documentation**: Comprehensive docs available in `/docs`
- **Community**: Join discussions in GitHub Discussions
- **Email**: Contact support at support@artigador.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by ACM Digital Library and arXiv
- Built with modern web technologies
- Designed for the academic community
- Special thanks to all contributors

---

**Artigador** - Making academic research more accessible, one article at a time.
