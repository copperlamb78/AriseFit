# Regra de Ouro — Verificação Prévia Mandatória na API (Backend Source of Truth)

> **Inviolável em todo o ecossistema AriseFit:**  
> **Você NÃO PODE adicionar absolutamente NADA na UI (telas, componentes, rotas, abas, botões, cards, campos de formulário, filtros, modais, dados informativos, badges ou comportamentos) sem antes inspecionar o código-fonte real do backend (`api-arisefit/`) para saber e comprovar se aquilo realmente existe.**

---

## 1. Princípio Fundamental: Backend como Única Fonte da Verdade

O frontend SPA (`frontend-arisefit/`) é um consumidor estrito dos contratos expostos pela API (`api-arisefit/`).  
É **terminantemente proibido** conceber, prototipar em código ou implementar qualquer elemento de interface gráfica baseado em suposições, imaginação ou premissas não verificadas no código-fonte real do backend.

---

## 2. O que Inspecionar Obrigatoriamente no Backend Antes de Tocar na UI

Antes de escrever qualquer linha de código em React/TSX/CSS no frontend, o agente ou desenvolvedor **DEVE OBRIGATORIAMENTE** abrir e ler os arquivos correspondentes em `api-arisefit/`:

1. **Controllers & Rotas (`src/modules/**/controllers/` ou `*.controller.ts`)**:
   - O endpoint HTTP existe? Qual é o método (`GET`, `POST`, `PATCH`, `DELETE`)?
   - Qual é o caminho exato da rota (ex.: `/api/v1/auth/login`, `/api/v1/appointments/`)?
   - Quais guards estão aplicados (`JwtAuthGuard`, `RolesGuard`, etc.)?
2. **DTOs de Entrada e Saída (`src/modules/**/dto/`)**:
   - Quais campos são aceitos no body/query/params?
   - Quais campos são obrigatórios (`@IsNotEmpty`) e quais são opcionais (`@IsOptional`)?
   - Quais são os tipos exatos e formatos (ex.: `ISO8601`, `UUID`, `number` em centavos ou reais)?
3. **Services e Regras de Negócio (`src/modules/**/services/` ou `*.service.ts`)**:
   - O serviço realmente implementa a operação que a UI deseja disparar?
   - Quais exceções (`NotFoundException`, `ConflictException`, `BadRequestException`) podem ser lançadas?
4. **Prisma Schema (`prisma/schema.prisma`)**:
   - Os modelos, colunas e relacionamentos existem exatamente com esses nomes?
   - Quais enums estão definidos (ex.: `AppointmentStatus`, `Role`, `PaymentStatus`)?
   - NUNCA invente status ou tipos que não estejam no enum do Prisma.
5. **Entidades e Respostas Reais**:
   - O objeto de resposta retornado pela API contém exatamente as propriedades esperadas pela UI?

---

## 3. Práticas Estritamente Proibidas (Tolerância Zero)

- ❌ **Proibido inventar campos na UI:** Se o backend não retorna `avatarUrl` ou `phoneNumber`, o frontend NUNCA pode inventar campos ou supor que eles existem.
- ❌ **Proibido criar botões/ações sem endpoint real:** Nunca adicione botões como "Exportar PDF", "Filtrar por Categoria" ou "Cancelar Agendamento" se o backend não possui endpoint implementado e funcional para atender tal ação.
- ❌ **Proibido mockar dados fictícios no frontend:** É vedado criar mocks estáticos ou retornos falsos para fingir que uma funcionalidade existe na UI quando o backend ainda não a possui.
- ❌ **Proibido supor nomes de campos:** Nunca presuma se o campo chama `userId`, `client_id`, `id` ou `sub`, nem se o nome é `fullName`, `name` ou `displayName`. Inspecione o DTO e o Prisma Schema.
- ❌ **Proibido criar filtros que a API não processa:** Se o endpoint `GET /appointments` não possui parâmetros de filtro no DTO de query, a UI não pode exibir dropdowns de filtro que não surtirão efeito real.

---

## 4. Fluxo Obrigatório Quando a Funcionalidade Não Existe no Backend

Caso uma nova tela, card, campo ou botão seja necessário para a demanda de negócio e o backend ainda não possua o suporte correspondente:

```text
[Necessidade de Nova UI identificada]
         │
         ▼
[Inspecionar api-arisefit/] ──▶ Não existe no backend?
         │
         ├─── NÃO tente criar a UI primeiro!
         │
         ▼
[1º Passo: Implementar no Backend (api-arisefit/)]
  - Schema Prisma / Migração (se necessário)
  - DTOs tipados com validação class-validator
  - Service com regra de negócio e tratamento de erros
  - Controller com rota e documentação Swagger
  - Testes unitários/integração verdes
         │
         ▼
[2º Passo: Implementar no Frontend (frontend-arisefit/)]
  - Mapear tipos com base no DTO real do backend
  - Criar serviço/hook de integração HTTP
  - Desenvolver a UI com Design System oficial consumindo o endpoint real
```

---

## 5. Responsabilidades por Papel na Equipe de Agentes

1. **🏛️ Principal Engineer (Tech Lead & PM):**
   - Na Etapa 1 do Dossiê ([`docs/dossiers/<feature>-dossier.md`](file:///docs/dossiers/<feature>-dossier.md)), deve inspecionar os arquivos reais da API e listar explicitamente os controllers, DTOs e models que dão sustentação à feature antes de autorizar a spec.
2. **💻 Developer (Full-Stack Coder):**
   - Antes de codificar qualquer componente React, deve abrir e inspecionar o backend. Se o backend precisar de ajustes, deve implementá-los primeiro ou reportar a dependência.
3. **🔍 Reviewer Gatekeeper:**
   - **No GATE 1:** Reprovação imediata (`CHANGES_REQUESTED`) se encontrar qualquer tela, botão, input ou badge na UI que não tenha correspondência real e funcional no backend.
4. **🛡️ QA Engineer:**
   - Validar nos testes E2E Playwright que cada interação da interface se comunica com rotas reais existentes, reprovando sumariamente telas com dados órfãos ou estáticos.
