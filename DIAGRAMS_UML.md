# Diagramas UML - Sistema Artigador

Este documento contém dois diagramas UML do sistema Artigador. Um diagrama de sequência e um diagrama de pacote


## Diagrama de Pacotes - Arquitetura do Sistema

Este diagrama mostra a organização dos principais pacotes e suas dependências no sistema.

```mermaid
graph TB
    subgraph "Presentation Layer - Frontend"
        subgraph "app/ - Next.js App Router"
            RootLayout[📄 Root Layout<br/>- layout.tsx<br/>- globals.css<br/>- AuthProvider wrapper]
            
            PublicPages[🌐 Public Pages<br/>- / homepage<br/>- /authors & /authors/id<br/>- /article/id<br/>- /events & /events/id<br/>- /editions/id<br/>- /browse<br/>- /categories<br/>- /ranking<br/>- /subscribe & /unsubscribe<br/>- /shortName & /shortName/year]
            
            AuthPages[🔐 Auth Pages<br/>- /login]
            
            AdminPages[⚙️ Admin Pages<br/>- /admin dashboard<br/>- /admin/articles & new<br/>- /admin/events & new & edit<br/>- /admin/events/id/editions<br/>- /admin/import]
        end
        
        subgraph "components/"
            CoreUI[🎨 Core UI Components<br/>- Header navigation<br/>- Footer<br/>- ArticleCard<br/>- SearchWithSuggestions<br/>- NewsletterSignup]
            
            AdminUI[🛠️ Admin Components<br/>- AdminLayout<br/>- Protected routes wrapper]
        end
        
        subgraph "contexts/"
            AuthContext[🔄 AuthContext<br/>- User state management<br/>- Login/logout handlers<br/>- Role validation<br/>- Token storage]
        end
    end
    
    subgraph "API Layer - Backend Routes"
        subgraph "app/api/"
            PublicAPI[🌍 Public APIs<br/><br/>Articles:<br/>- GET /articles list<br/>- GET /articles/id<br/>- GET /articles/search<br/><br/>Authors:<br/>- GET /authors list<br/>- GET /authors/id<br/><br/>Events:<br/>- GET /events list<br/>- GET /events/id<br/>- GET /events/shortname/name<br/>- GET /events/shortname/name/year<br/><br/>Editions:<br/>- GET /editions/id<br/><br/>Subscriptions:<br/>- POST /subscriptions<br/>- POST /subscriptions/unsubscribe<br/>- GET /subscriptions/unsubscribe<br/>- GET /subscriptions/confirm<br/>- GET /subscriptions list admin]
            
            AuthAPI[🔑 Authentication<br/>- POST /auth/login<br/>- JWT generation<br/>- Credential validation<br/>- GET /test-auth]
            
            AdminAPI[🔒 Admin APIs<br/>Requires JWT + ADMIN role<br/><br/>Articles:<br/>- GET /admin/articles<br/>- POST /admin/articles<br/>- GET /admin/articles/id<br/>- PUT /admin/articles/id<br/>- DELETE /admin/articles/id<br/><br/>Events:<br/>- GET /admin/events<br/>- POST /admin/events<br/>- GET /admin/events/id editions list<br/>- POST /admin/events/id create edition<br/><br/>Editions:<br/>- GET /admin/events/id/editions<br/>- POST /admin/events/id/editions<br/>- GET /admin/editions/id<br/>- PUT /admin/editions/id<br/>- DELETE /admin/editions/id<br/><br/>Categories:<br/>- GET /admin/categories<br/>- POST /admin/categories<br/><br/>Import:<br/>- POST /admin/import/bibtex<br/><br/>Seed:<br/>- POST /admin/seed]
        end
    end
    
    subgraph "Business Logic Layer"
        subgraph "lib/"
            Auth[🛡️ Authentication lib/auth.ts<br/><br/>Functions:<br/>- hashPassword bcryptjs<br/>- verifyPassword bcryptjs<br/>- generateToken JWT<br/>- verifyToken JWT<br/>- authenticateUser<br/>- createUser<br/>- initializeAdminUser<br/><br/>Types:<br/>- AuthUser interface]
            
            Email[📧 Email System lib/email.ts<br/><br/>Functions:<br/>- sendEmail nodemailer<br/>- emailTemplates<br/>  * newArticleNotification<br/>  * eventArticleNotification<br/>  * welcomeEmail<br/>  * subscriptionConfirmation<br/>  * subscriptionWelcome<br/><br/>Config:<br/>- SMTP transporter<br/>- Gmail/Custom SMTP]
            
            BibTeX[📚 BibTeX Parser lib/bibtex.ts<br/><br/>Functions:<br/>- parseBibTeX<br/>- parseAuthors<br/>- bibtexEntryToArticle<br/><br/>Types:<br/>- BibTeXEntry<br/>- ParsedAuthor<br/><br/>Features:<br/>- Entry parsing<br/>- Field extraction<br/>- Author parsing<br/>- Data normalization]
            
            PrismaClient[🗄️ Database Client lib/prisma.ts<br/><br/>- PrismaClient singleton<br/>- Global instance<br/>- Connection pooling<br/>- Type-safe queries]
            
            Seed[🌱 Database Seeding lib/seed.ts<br/><br/>Functions:<br/>- seedCategories<br/>- Initial data setup]
        end
    end
    
    subgraph "Data Layer"
        subgraph "prisma/"
            Schema[📋 Schema Definition schema.prisma<br/><br/>Models:<br/>- User username, email, role<br/>- Category hierarchical<br/>- Event shortName, topics<br/>- EventEdition year, venue<br/>- Author name, email, orcid<br/>- Article title, abstract, keywords<br/>- ArticleAuthor M:N + order<br/>- ArticleCategory M:N<br/>- EventCategory M:N<br/>- EmailSubscription filters<br/>- ImportLog tracking<br/>- Subscription newsletter<br/><br/>Enums:<br/>- Role USER, ADMIN<br/>- ArticleStatus<br/>- ImportType BIBTEX, CSV, JSON<br/>- ImportStatus]
            
            DB[(🗃️ SQLite Database<br/>- dev.db<br/>- File-based<br/>- Zero-config<br/>- Local development)]
        end
        
        subgraph "File Storage"
            Uploads[📁 public/uploads/<br/><br/>Directories:<br/>- /imports/timestamp/<br/>  * BibTeX imported PDFs<br/>  * ZIP extracted files<br/><br/>Access:<br/>- Public static serving<br/>- Next.js public folder]
            
            StaticFiles[📄 public/<br/><br/>Files:<br/>- SVG icons<br/>- /pdfs/ sample papers<br/>- Static assets]
        end
    end
    
    subgraph "Type System"
        subgraph "types/"
            TypeDefs[📝 TypeScript Definitions<br/><br/>Files:<br/>- article.ts interfaces<br/>- event.ts interfaces<br/>- adm-zip.d.ts declarations<br/><br/>Shared across:<br/>- Frontend components<br/>- API routes<br/>- Business logic]
        end
        
        subgraph "data/"
            StaticData[🎭 Static Data<br/><br/>Files:<br/>- categories.ts hierarchy<br/>- mockArticles.ts testing<br/>- mockEvents.ts testing<br/>- realArticles.ts samples<br/><br/>Purpose:<br/>- Development data<br/>- Testing fixtures<br/>- Initial categories]
        end
    end
    
    subgraph "External Services"
        SMTP[📮 SMTP Email Provider<br/><br/>Supported:<br/>- Gmail App Password<br/>- SendGrid<br/>- AWS SES<br/>- Custom SMTP<br/><br/>Used by:<br/>- Subscription confirmations<br/>- Article notifications<br/>- System emails]
        
        AdmZip[📦 AdmZip Library<br/><br/>Package: adm-zip<br/><br/>Used in:<br/>- /admin/import/bibtex<br/>- ZIP extraction<br/>- PDF file handling<br/>- Batch imports]
    end
    
    subgraph "External Libraries"
        NextJS[⚡ Next.js 15.4.7<br/>- App Router<br/>- React 19.1.0<br/>- Turbopack dev]
        
        UILibs[🎨 UI Libraries<br/>- Tailwind CSS 4<br/>- Lucide React icons<br/>- Headless UI<br/>- date-fns<br/>- clsx]
        
        AuthLibs[🔐 Auth Libraries<br/>- bcryptjs hashing<br/>- jsonwebtoken JWT]
    end

    %% Frontend Dependencies
    RootLayout --> AuthContext
    RootLayout --> CoreUI
    PublicPages --> CoreUI
    PublicPages --> PublicAPI
    AuthPages --> AuthAPI
    AdminPages --> AdminUI
    AdminPages --> AdminAPI
    
    CoreUI --> AuthContext
    CoreUI --> PublicAPI
    AdminUI --> AuthContext
    
    AuthContext --> AuthAPI
    AuthContext --> Auth
    
    %% API Layer Dependencies
    PublicAPI --> PrismaClient
    PublicAPI --> TypeDefs
    AuthAPI --> Auth
    AuthAPI --> PrismaClient
    
    AdminAPI --> Auth
    AdminAPI --> PrismaClient
    AdminAPI --> BibTeX
    AdminAPI --> Uploads
    AdminAPI --> AdmZip
    AdminAPI --> Seed
    
    %% Business Logic Dependencies
    Auth --> PrismaClient
    Auth --> AuthLibs
    Email --> SMTP
    BibTeX --> TypeDefs
    Seed --> PrismaClient
    Seed --> StaticData
    
    %% Data Layer Dependencies
    PrismaClient --> Schema
    Schema --> DB
    
    %% Type System Dependencies
    TypeDefs --> Schema
    StaticData --> TypeDefs
    
    %% Framework Dependencies
    RootLayout --> NextJS
    PublicPages --> NextJS
    AdminPages --> NextJS
    CoreUI --> UILibs
    PublicAPI --> NextJS
    AuthAPI --> NextJS
    AdminAPI --> NextJS
    
    %% Styling
    classDef frontend fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef api fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef logic fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef data fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    classDef external fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    
    class RootLayout,PublicPages,AuthPages,AdminPages,CoreUI,AdminUI,AuthContext frontend
    class PublicAPI,AuthAPI,AdminAPI api
    class Auth,Email,BibTeX,PrismaClient,Seed logic
    class Schema,DB,Uploads,StaticFiles,TypeDefs,StaticData data
    class SMTP,AdmZip,NextJS,UILibs,AuthLibs external
```

## Diagrama de Sequência - Importação em Massa de Artigos (BibTeX + ZIP)

Este diagrama mostra o fluxo completo de importação em massa de artigos a partir de arquivos BibTeX e ZIP com PDFs.

```mermaid
sequenceDiagram
    participant Admin as Administrador
    participant UI as Frontend<br/>/admin/import
    participant API as API Route<br/>/api/admin/import/bibtex
    participant Parser as BibTeX Parser<br/>lib/bibtex.ts
    participant Zip as AdmZip<br/>Processor
    participant FS as File System<br/>public/uploads
    participant DB as Prisma/SQLite

    Note over Admin,DB: Fluxo de Importação em Massa

    Admin->>UI: Acessa /admin/import
    UI->>API: GET /api/admin/events
    API->>DB: SELECT events com editions
    DB-->>API: Lista de eventos
    API-->>UI: Eventos disponíveis
    UI->>API: GET /api/admin/categories
    API->>DB: SELECT categories
    DB-->>API: Lista de categorias
    API-->>UI: Categorias disponíveis
    UI-->>Admin: Exibe formulário

    Admin->>UI: Seleciona Event & Edition
    Admin->>UI: Marca Default Categories
    Admin->>UI: Upload arquivo .bib
    UI->>UI: Lê conteúdo do arquivo
    UI-->>Admin: Preview no textarea
    
    Admin->>UI: Upload arquivo .zip (PDFs)
    UI->>UI: Armazena arquivo ZIP
    UI-->>Admin: Confirma arquivo carregado

    Admin->>UI: Clica "Import Articles"
    UI->>UI: Cria FormData
    Note over UI: FormData contém:<br/>- bibtexFile<br/>- pdfZip<br/>- eventEditionId<br/>- defaultCategories

    UI->>API: POST multipart/form-data
    
    API->>API: Verifica autenticação JWT
    alt Token inválido
        API-->>UI: 401 Unauthorized
        UI-->>Admin: Erro de autenticação
    else Token válido mas não é ADMIN
        API-->>UI: 403 Forbidden
        UI-->>Admin: Acesso negado
    end

    API->>API: Extrai FormData
    API->>API: Lê bibtexFile.text()
    
    API->>Parser: parseBibTeX(content)
    Parser->>Parser: Remove comentários
    Parser->>Parser: Regex para @inproceedings
    Parser->>Parser: Extrai campos (author, title, etc)
    
    alt BibTeX inválido
        Parser-->>API: throw Error
        API-->>UI: 400 Invalid BibTeX format
        UI-->>Admin: Erro: BibTeX inválido
    end
    
    Parser-->>API: Array de BibTeXEntry[]

    API->>DB: Verifica eventEditionId exists
    DB-->>API: EventEdition found/not found
    
    alt Event Edition não existe
        API-->>UI: 404 Event edition not found
        UI-->>Admin: Erro: Edição não encontrada
    end

    opt ZIP fornecido
        API->>Zip: new AdmZip(buffer)
        Zip->>Zip: getEntries()
        loop Para cada arquivo .pdf
            Zip->>Zip: Extrai basename (key)
            Zip->>API: Map<key, Buffer>
        end
    end

    API->>FS: Cria diretório /uploads/imports
    FS-->>API: Diretório pronto

    API->>API: Verifica se location é obrigatório
    Note over API: hasAnyLocation = entries.some(e => e.location)

    API->>API: Inicializa importResults
    Note over API: success: 0<br/>failed: 0<br/>errors: []<br/>articles: []

    loop Para cada BibTeX entry
        API->>API: Valida campos obrigatórios
        Note over API: ⚠️ CAMPOS ATUALMENTE OBRIGATÓRIOS:<br/>- author<br/>- title<br/>- year<br/>- location (condicional)<br/><br/>📝 COMENTADOS (opcionais):<br/>- booktitle<br/>- pages<br/>- publisher

        alt Campos faltando
            API->>API: importResults.failed++
            API->>API: errors.push("missing fields: ...")
            Note over API: Entry pulado, próxima iteração
        else Campos OK
            opt ZIP fornecido
                API->>API: Procura key.pdf no ZIP
                alt PDF não encontrado
                    API->>API: importResults.failed++
                    API->>API: errors.push("PDF not found")
                    Note over API: Entry pulado, próxima iteração
                else PDF encontrado
                    API->>FS: writeFile(timestamp_key.pdf)
                    FS-->>API: PDF salvo
                    API->>API: pdfUrl = /uploads/imports/...
                end
            end

            API->>Parser: bibtexEntryToArticle(entry)
            Parser->>Parser: parseAuthors(entry.author)
            Parser->>Parser: Extrai venue, keywords
            Parser-->>API: articleData

            API->>API: Parse pages (1--11 → startPage, endPage)

            API->>DB: BEGIN TRANSACTION

            API->>DB: article.create({...})
            Note over API,DB: Campos:<br/>- title, abstract, keywords<br/>- doi, pdfUrl<br/>- startPage, endPage, pageCount<br/>- publishedDate, eventEditionId
            DB-->>API: newArticle

            loop Para cada author
                API->>DB: author.upsert(email)
                Note over API,DB: Cria ou atualiza autor<br/>Gera email se não existir
                DB-->>API: author

                API->>DB: articleAuthor.create({...})
                Note over API,DB: Associa artigo-autor<br/>com ordem
                DB-->>API: association created
            end

            opt defaultCategories fornecidas
                API->>DB: articleCategory.createMany([...])
                DB-->>API: categories associadas
            end

            API->>DB: COMMIT TRANSACTION
            DB-->>API: Transaction successful

            API->>API: importResults.success++
            API->>API: articles.push({id, title, key})
        end
    end

    API->>API: Monta resposta final
    Note over API: message: "X success, Y failed"<br/>results: { success, failed, errors, articles }

    API-->>UI: 200 OK + importResults
    
    UI->>UI: setImportResult(data.results)
    UI->>UI: Limpa formulário
    UI->>UI: Reset file inputs

    UI-->>Admin: Exibe relatório visual
    Note over Admin,UI: Cards com estatísticas:<br/>✅ Importados: X<br/>❌ Falhados: Y<br/>📄 Total: X+Y

    UI-->>Admin: Lista artigos importados
    loop Para cada artigo importado
        UI->>Admin: Mostra key + título
    end

    UI-->>Admin: Lista erros detalhados
    loop Para cada erro
        UI->>Admin: Mostra entry + motivo
        Note over Admin,UI: Ex: "sbes-paper2 skipped:<br/>missing fields: year, location"
    end

    Admin->>UI: Clica "Start New Import"
    UI->>UI: Reset states
    UI-->>Admin: Formulário limpo
```

