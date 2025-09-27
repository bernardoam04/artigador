# Backlog das Sprints - Artigador

O projeto foi desenvolvido em quase uma unica sprint conjunta, com todos os membros programando em conjunto (pair/mob programming). Por praticidade, usamos apenas um ambiente configurado na conta de um integrante. Nesse contexto, o time contou com o apoio de uma ferramenta de IA no modo agente (Claude PRO, versão paga) para auxiliar na organização, revisão e aceleração do desenvolvimento.

## Sprint 1: Gerenciamento de Eventos

### História #1: Como administrador, eu quero cadastrar (editar, deletar) um evento
**Descrição**: Implementar funcionalidade completa de CRUD para eventos acadêmicos (ex: Simpósio Brasileiro de Engenharia de Software)

**Tarefas e responsáveis:**
- Criar tabela Event no banco de dados e definir schema Prisma [Bernardo Alves Miranda]
- Implementar API routes para CRUD de eventos (/api/events) [Lucas Albuquerque Santos Costa]
- Criar interface de administração para listagem de eventos (/admin/events) [Bernardo Venancio Cunha de Oliveira]
- Implementar formulário de criação de evento (/admin/events/new) [Cauã Magalhães Pereira]
- Implementar funcionalidade de edição de evento (/admin/events/[id]/edit) [Bernardo Alves Miranda]
- Implementar funcionalidade de exclusão de evento com confirmação [Lucas Albuquerque Santos Costa]
- Adicionar validação de dados no frontend e backend [Bernardo Venancio Cunha de Oliveira]

---

## Sprint 2: Gerenciamento de Edições de Eventos

### História #2: Como administrador, eu quero cadastrar (editar, deletar) uma nova edição de um evento
**Descrição**: Implementar funcionalidade para gerenciar edições específicas de eventos (ex: edição de 2025 do SBES)

**Tarefas e responsáveis:**
- Criar tabela EventEdition no banco e estabelecer relacionamento com Event [Bernardo Venancio Cunha de Oliveira]
- Implementar API routes para CRUD de edições (/api/events/[id]/editions) [Cauã Magalhães Pereira]
- Criar interface de listagem de edições dentro da página do evento [Bernardo Alves Miranda]
- Implementar formulário de criação de edição (/admin/events/[id]/editions/new) [Lucas Albuquerque Santos Costa]
- Implementar funcionalidade de edição de edição (/admin/editions/[id]/edit) [Bernardo Venancio Cunha de Oliveira]
- Implementar funcionalidade de exclusão de edição [Cauã Magalhães Pereira]
- Adicionar validação para datas e dados da edição [Bernardo Alves Miranda]
- Implementar vinculação de artigos às edições específicas [Lucas Albuquerque Santos Costa]

---

## Sprint 3: Home Page Personalizada por Autor

### História #3: Como usuário, eu quero ter uma home page com meus artigos, organizados por ano
**Descrição**: Criar páginas personalizadas para autores mostrando seus artigos organizados cronologicamente (similar a simple-lib/authors/nome-autor)

**Tarefas e responsáveis:**
- Implementar estatísticas do autor (total de artigos, citações, etc.) [Cauã Magalhães Pereira]
- Criar layout responsivo para página do autor [Cauã Magalhães Pereira]
- Adicionar breadcrumbs e navegação contextual [Bernardo Venancio Cunha de Oliveira]

---

## Sprint 4: Sistema de Notificações por Email

### História #4: Como usuário, eu quero me cadastrar para receber um mail sempre que eu tiver um novo artigo disponibilizado
**Descrição**: Implementar sistema de notificações automáticas por email para novos artigos.

**Tarefas e responsáveis:**
- Criar tabela AuthorSubscription para relacionar usuários e autores [Cauã Magalhães Pereira]
- Implementar API routes para gerenciar inscrições de autores (/api/author-subscriptions) [Bernardo Alves Miranda]
- Implementar sistema de templates de email para notificações [Lucas Albuquerque Santos Costa]
- Implementar página de gerenciamento de inscrições do usuário [Bernardo Alves Miranda]
- Adicionar sistema de unsubscribe para notificações de autor específico [Bernardo Venancio Cunha de Oliveira]

---

## Observações Técnicas

### Dependências Entre Sprints
- Sprint 2 depende da conclusão da Sprint 1 (eventos devem existir antes das edições)
- Sprint 3 é independente e pode ser desenvolvida em paralelo
- Sprint 4 depende parcialmente da Sprint 3 (páginas de autor devem existir)

### Critérios de Aceitação
- Interfaces devem ser responsivas e acessíveis
- APIs devem ter validação adequada de dados
- Todas as operações admin devem ter logs de auditoria