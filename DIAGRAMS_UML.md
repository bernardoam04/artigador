# Diagramas UML - Sistema Artigador

Este documento contém dois diagramas UML do sistema Artigador. Um diagrama de sequência e um diagrama de pacote


## Diagrama de Pacotes - Arquitetura do Sistema

Este diagrama mostra a organização dos principais pacotes e suas dependências no sistema.

```mermaid
graph TB
    subgraph "Frontend Layer"
        subgraph "app/"
            Pages[📄 Pages<br/>- page.tsx<br/>- layout.tsx<br/>- globals.css]
            AdminPages[🔐 Admin Pages<br/>- /admin/*<br/>- Gerenciamento]
            PublicPages[🌐 Public Pages<br/>- /authors/*<br/>- /articles/*<br/>- /events/*]
        end
        
        subgraph "components/"
            UI[🎨 UI Components<br/>- Header<br/>- Footer<br/>- ArticleCard<br/>- SearchWithSuggestions]
            AdminUI[⚙️ Admin Components<br/>- AdminLayout<br/>- Forms<br/>- Tables]
        end
        
        subgraph "contexts/"
            Context[🔄 React Contexts<br/>- AuthContext<br/>- State Management]
        end
    end
    
    subgraph "API Layer"
        subgraph "app/api/"
            PublicAPI[🌍 Public APIs<br/>- /articles<br/>- /authors<br/>- /events<br/>- /subscriptions]
            AdminAPI[🔒 Admin APIs<br/>- /admin/*<br/>- Authentication Required]
            AuthAPI[🔑 Auth APIs<br/>- /auth/login<br/>- JWT Management]
        end
    end
    
    subgraph "Business Logic Layer"
        subgraph "lib/"
            Auth[🛡️ Authentication<br/>- JWT Utils<br/>- Role Validation]
            Email[📧 Email System<br/>- Nodemailer<br/>- Templates<br/>- SMTP]
            Prisma[🗄️ Database Client<br/>- Prisma Client<br/>- Connection Pool]
            Utils[🔧 Utilities<br/>- BibTeX Parser<br/>- Validators]
        end
    end
    
    subgraph "Data Layer"
        subgraph "prisma/"
            Schema[📋 Database Schema<br/>- Models<br/>- Relations<br/>- Migrations]
            DB[(🗃️ SQLite Database<br/>- dev.db<br/>- Production Ready)]
        end
        
        subgraph "External Storage"
            Files[📁 File System<br/>- /public/uploads<br/>- PDF Storage]
        end
    end
    
    subgraph "Configuration & Types"
        subgraph "types/"
            Types[📝 TypeScript Types<br/>- Article<br/>- Event<br/>- Author<br/>- User]
        end
        
        subgraph "data/"
            MockData[🎭 Mock Data<br/>- Categories<br/>- Sample Articles<br/>- Test Data]
        end
    end
    
    subgraph "External Services"
        SMTP[📮 SMTP Provider<br/>- Gmail<br/>- SendGrid<br/>- AWS SES]
    end

    %% Dependencies
    Pages --> UI
    Pages --> Context
    AdminPages --> AdminUI
    AdminPages --> Auth
    PublicPages --> UI
    
    UI --> PublicAPI
    AdminUI --> AdminAPI
    Context --> AuthAPI
    
    PublicAPI --> Prisma
    PublicAPI --> Utils
    AdminAPI --> Auth
    AdminAPI --> Prisma
    AdminAPI --> Files
    AuthAPI --> Auth
    AuthAPI --> Prisma
    
    Auth --> Prisma
    Email --> SMTP
    Prisma --> Schema
    Schema --> DB
    
    Utils --> Types
    Prisma --> Types
    PublicAPI --> Types
    AdminAPI --> Types
    
    MockData --> Types
```

## Diagrama de Sequência - Busca e Navegação de Artigos

Este diagrama mostra o fluxo de busca e navegação de artigos por usuários.

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant API as API Routes
    participant DB as Prisma/SQLite

    Note over U,DB: Fluxo de Busca de Artigos

    U->>F: Acessa /browse
    F->>API: GET /api/articles?page=1&limit=20
    
    API->>DB: SELECT articles com joins
    Note over API,DB: Include authors, categories, eventEdition<br/>Order by createdAt desc
    DB-->>API: Resultados paginados
    API-->>F: Lista de artigos + paginação
    
    F->>U: Exibe grid de artigos
    
    U->>F: Digite termo de busca
    F->>F: Debounce (300ms)  
    F->>API: GET /api/articles?q=termo&page=1
    
    API->>DB: Complex search query
    Note over API,DB: WHERE title CONTAINS termo<br/>OR abstract CONTAINS termo<br/>OR keywords CONTAINS termo<br/>OR author.name CONTAINS termo<br/>OR event.name CONTAINS termo
    DB-->>API: Resultados filtrados
    API-->>F: Artigos correspondentes
    
    F->>U: Atualiza lista em tempo real
    
    U->>F: Clica em artigo
    F->>API: GET /api/articles/[id] (não implementado)
    Note over API: Endpoint não existe,<br/>navega direto para /article/[id]
    F->>U: Navega para /article/[id]
    
    U->>F: Clica em autor
    F->>API: GET /api/authors/[id]?page=1&limit=10
    API->>DB: Busca autor + contagem
    API->>DB: Busca artigos do autor paginados
    Note over API,DB: ArticleAuthor join com Article<br/>Include authors, eventEdition, categories
    DB-->>API: Dados do autor + artigos + paginação
    API-->>F: Perfil completo com estatísticas
    F->>U: Navega para /authors/[id]
```

