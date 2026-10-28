# Guia do Framework Agêntico — AriseFit (Padrão Big Tech / Google Antigravity)

Este documento é a **fonte central de diretrizes arquiteturais, regras inegociáveis, catálogo de agentes, catálogo de regras ativas e catálogo de skills** para qualquer agente de IA ou desenvolvedor atuando no ecossistema **AriseFit**.

> [!NOTE]
> Este arquivo é mantido em sincronia na raiz do workspace ([AGENTS.md](file:///AGENTS.md)) e em [.agents/AGENTS.md](file:///.agents/AGENTS.md).
> Para a norma completa de orquestração, consulte [.agents/rules/regras-orquestracao-agentes.md](file:///.agents/rules/regras-orquestracao-agentes.md).
> Para as definições detalhadas dos agentes, consulte [.agents/agents/](file:///.agents/agents/).
> Para os dossiês de demandas, consulte [docs/dossies/](file:///docs/dossies/).

---

## 1. Visão Geral do Ecossistema Multi-Repo & Stack Real

O AriseFit é um ecossistema SaaS Multi-Tenant desacoplado e escalável:
1. **`api-arisefit/`**:
   - Backend em NestJS 11, TypeScript 5, Prisma 7, PostgreSQL.
   - Gateway Asaas (Pix, split, subcontas), Brevo (e-mails transacionais), Cloudinary (mídia).
   - Build: `cd api-arisefit && npm run build` (`nest build`).
   - Testes: `cd api-arisefit && npm test` (Jest) / `npm run test:e2e`.
   - Multi-Tenancy: Entidades vinculadas a `Company` (`companyId`), `User` e roles (`CLIENT`, `PROVIDER`, `COMPANY_OWNER`, `EMPLOYEE`, `ADMIN`, `SUPER_ADMIN`).
2. **`frontend-arisefit/`**:
   - Frontend SPA em React 19, TypeScript 5, Vite 6, Tailwind CSS 4, TanStack Query 5, Lucide Icons e Playwright.
   - Build: `cd frontend-arisefit && npm run build` (`tsc -b && vite build`).
   - Testes E2E: `cd frontend-arisefit && npx playwright test`.

---

## 2. Invariantes Mandatórias do Framework

### 🛡️ 2.1 Separação Rígida de Escopos
- O backend `api-arisefit/` **NUNCA** contém React, Tailwind, Playwright ou lógica de interface gráfica.
- O frontend `frontend-arisefit/` **NUNCA** acessa banco de dados diretamente nem possui segredos de infraestrutura. Consome a API exclusivamente via HTTP/REST.

### 💰 2.2 Contrato Financeiro Zero-Trust (Regras N1–N7)
- **O Backend é a Única Fonte da Verdade Financeira:** O frontend **NUNCA** calcula nem envia `servicePrice`, `downPaymentAmount`, `platformTax` ou `splitPercent` para gravação no banco de dados.
- **Sinal Pix Automático:**
  - Serviços < R$ 15,00: Sinal compulsório de 100%.
  - Serviços de R$ 15,00 a R$ 399,99: Sinal automático de 50%.
  - Serviços >= R$ 400,00: Sinal flexível (50% ou 30%).
- **Hold de 15 Minutos:** Vaga reservada temporariamente por 15 minutos (`expiresAt`) até confirmação do Pix.

### 🔍 2.3 Regra de Ouro: Verificação Prévia Mandatória na API (Backend Source of Truth)
- **Proibição Absoluta de Adicionar Elementos na UI sem Backend:** O agente **NUNCA PODE ADICIONAR NADA NA UI** sem antes inspecionar o código-fonte real da `api-arisefit/` (`src/modules/`, controllers, DTOs, entities, Prisma schema e enums) para comprovar que o recurso existe e está funcional.
- Se a interface precisa de um dado ou rota inexistente, o desenvolvimento **deve iniciar compulsoriamente pelo backend**.

### 📦 2.4 Governança de Commits: 1 Commit Semântico Por Arquivo
- Cada repositório possui seu próprio histórico Git.
- **Política mandatória: 1 commit individual por arquivo** (`git add <arquivo> && git commit -m '...'`) no padrão Conventional Commits em português.
- Nunca commite código quebrado. Ambas as camadas devem compilar (`npm run build`) com testes verdes antes de qualquer commit.

### 🎨 2.5 UX Guardrails no Frontend & Governança Visual Permanente
- **Design System como Única Fonte da Verdade**: Proibição de tags HTML cruas para botões/inputs; usar sempre o **Design System oficial** (`src/design-system/ui/`). Reutilização antes de duplicação: estender componentes existentes em vez de criar componentes concorrentes ou paralelos.
- **Padrão Canônico de Botões (`Button.tsx`)**:
  - Layout flex direto sem `<span>` inline genérico envolvente (no Tailwind 4, `svg { display: block }` empilha ícones se dentro de span inline).
  - Inviolabilidade de linha única (`whitespace-nowrap`) e blindagem de ícones contra encolhimento (`[&>svg]:shrink-0`).
  - Contraste semântico WCAG AAA: variantes primárias usam `bg-primary text-primary-foreground` (onde `--primary-foreground` resolve para contraste seguro tanto no tema claro quanto no escuro, nunca forçando `text-white` que gera contraste insuficiente no dark mode).
  - Tipografia moderna e feedback tátil: `font-semibold text-sm rounded-md active:scale-[0.98]`.
- **Padrão Canônico de Modais (`.modal-card`)**: Cabeçalho fixo (`shrink-0`), corpo rolável (`flex-1 overflow-y-auto min-h-0`) e rodapé fixo de ações (`shrink-0`). O modal nunca quebra em telas menores.
- **Badges & Selos (`whitespace-nowrap`)**: Proibido misturar ícones soltos dentro de `children` do `<Badge>`. Usar sempre a prop oficial `icon` com `shrink-0` e garantir renderização estrita em linha única (`whitespace-nowrap`).
- **Validação Visual Obrigatória**: O build passar (`npm run build`) **não é prova suficiente** de que a interface está correta. Toda alteração visual deve ser inspecionada no navegador real e validada por testes E2E do Playwright.
- Empty states informativos com CTA acolhedor; Loading Skeletons em chamadas assíncronas; touch targets mobile >= 44x44px (viewport 360px a 430px).

### ☁️ 2.6 Governança de Uploads, Imagens e Mídia (Cloudinary vs URLs Manuais)
- **Proibição de Substituir Upload por URL Manual:** Sempre que um campo for destinado a foto de perfil, avatar, logomarca, banner de estabelecimento, comprovante ou documento, o agente **DEVE obrigatoriamente** fornecer experiência de seleção de arquivo local (`ImageUpload.tsx`), com upload para o Cloudinary via backend autenticado e preenchimento automático da URL.
- **O Banco Guardar String Não Justifica Input de URL:** O fato de a coluna no banco (`photoUrl`, `logoPhoto`, `bannerPhoto`) ser `String` é detalhe interno de persistência. O usuário nunca deve copiar, colar ou conhecer URLs do Cloudinary.
- **Segurança de Credenciais:** Proibido expor `CLOUDINARY_API_SECRET` ou chaves privadas no frontend. O upload é realizado exclusivamente via backend (`/upload/image/:companyId/:imageType`) com validação de Magic Bytes e isolamento Anti-IDOR.
- **Comportamento Opcional:** Fotos e avatares são opcionais por padrão; a ausência de foto nunca deve bloquear o cadastro nem corromper a persistência existente.

### 🛡️ 2.7 Resiliência de Estado, Ciclo de Vida de Modais e Navegação
- **Proibição Absoluta de Non-Null Assertions (`!`) em Estado Reativo:** NUNCA utilize `entity!.property` em renderização de componentes para objetos que possam ser nulos durante montagem, desmontagem, fechamento de modais ou retorno de histórico (`history.back()`).
- **Limpeza de Estado Dependente (Zero Referências Órfãs):** Ao fechar modais ou drawers (ex.: estatísticas de funcionário), resete tanto a entidade selecionada quanto os dados secundários (`setSelectedEmployeeForStats(null); setEmployeeStats(null);`).
- **Renderização Condicional de Modais:** O modal de detalhe deve ser condicionado à existência da entidade (`{selectedItem && <Modal ...>...</Modal>}`), impedindo que React avalie nós filhos com referências nulas.

---

## 3. A Esteira Multi-Agente de 5 Etapas & Tabela de Ledger

```text
+-----------------------------------------------------------------------------------------+
|                  ESTEIRA MULTI-AGENTE ARISEFIT DE ALTA CONFIABILIDADE                 |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  [Demanda / Solicitação do Usuário]                                                     |
|         │                                                                               |
|         ▼                                                                               |
|  ┌────────────────────────────────────────┐                                             |
|  │ 1. PRINCIPAL ENGINEER (Arquiteto & PM) │ ── Cria o Dossiê Vivo (docs/dossies/)       |
|  └────────────────────────────────────────┘    e especifica contratos (docs/specs/)     |
|         │                                                                               |
|         ▼ (Status: READY_FOR_FINOPS registrado no Ledger do Dossiê)                     |
|  ┌────────────────────────────────────────┐                                             |
|  │ 2. FINOPS & FRUGAL DBA                 │ ── Valida N1-N7, hold 15min, split, schema  |
|  └────────────────────────────────────────┘    frugal, atualiza Dossiê e emite DoR      |
|         │                                                                               |
|         ▼ (Status: APPROVED_DOR registrado no Ledger do Dossiê)                         |
|  ┌────────────────────────────────────────┐                                             |
|  │ 3. DEVELOPER (Full-Stack Coder)        │ ── Implementa código, registra no Dossiê    |
|  └────────────────────────────────────────┘    arquivos alterados e valida UX guardrails|
|         │                                                                               |
|         ▼ (Status: READY_FOR_REVIEW no Ledger do Dossiê)                                |
|  ┌────────────────────────────────────────┐                                             |
|  │ 4. REVIEWER GATEKEEPER                 │ ── Auditoria Dual-Gate (Qualidade, AppSec,  |
|  │    (Qualidade, AppSec & Commits)       │    1 commit por arquivo) e atualiza Dossiê  |
|  └────────────────────────────────────────┘                                             |
|         │                                                                               |
|         ├── [CHANGES_REQUESTED] ──┐                                                     |
|         │                         │ Auto-Correção Autônoma (Self-Healing no Dossiê)     |
|         ▼ [APPROVED]              │ (Máximo 3 ciclos de convergência)                   |
|  ┌────────────────────────────────────────┐                                             |
|  │ 5. QA ENGINEER (E2E & Caos)            │ ── Valida Jest, Playwright E2E na jornada,  |
|  └────────────────────────────────────────┘    comprova builds e autoriza o commit      |
|         │                         │                                                     |
|         ├── [FAILED] ─────────────┴──> Devolve ao Developer com causa raiz no Dossiê    |
|         │                                                                               |
|         ▼ [APPROVED registrado no Dossiê e em docs/qa/<feature>-qa-report.md]           |
|  [🎉 Conclusão: Builds 100% Verdes, Testes Atestados e 1 Commit Semântico Por Arquivo]  |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

### 3.1 Tabela de Ledger Canônica

| Etapa | Agente Responsável | Status de Saída | Data/Hora | Descrição Breve da Ação | Artefato Vinculado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Arquitetura** | 🏛️ Principal Engineer (`principal-engineer`) | `READY_FOR_FINOPS` | `AAAA-MM-DD` | Especificação técnica, segurança e contratos REST mapeados | `docs/specs/<feature>-architecture.md` |
| **2. FinOps & DoR** | 💰 FinOps & Frugal DBA (`finops-frugal-dba`) | `APPROVED_DOR` | `AAAA-MM-DD` | Auditoria N1-N7, hold 15min e modelagem frugal | `docs/specs/<feature>-financial-spec.md` |
| **3. Implementação** | 💻 Developer (`developer`) | `READY_FOR_REVIEW` | `AAAA-MM-DD` | Implementação com design system, testes e verificação na API | Repositórios (`api` / `frontend`) |
| **4. Code Review** | 🔍 Reviewer Gatekeeper (`reviewer-gatekeeper`) | `APPROVED` | `AAAA-MM-DD` | Auditoria Dual-Gate (Qualidade, AppSec, Multi-Tenant e Commits) | `docs/reviews/<feature>-review.md` |
| **5. QA & Caos** | 🛡️ QA Engineer (`qa-engineer`) | `APPROVED` | `AAAA-MM-DD` | Testes unitários/integração, Playwright E2E na jornada real e caos | `docs/qa/<feature>-qa-report.md` |

*Status Válidos do Ledger*:
`PENDING` · `IN_PROGRESS` · `READY_FOR_FINOPS` · `APPROVED_DOR` · `REJECTED_DOR` · `READY_FOR_REVIEW` · `CHANGES_REQUESTED` · `APPROVED` · `FAILED` · `BLOCKED`.

---

## 4. Invocação Nativa de Subagentes no Antigravity (`invoke_subagent`)

No Google Antigravity, cada etapa roda em uma janela de contexto limpa e isolada usando `invoke_subagent`:
- `TypeName: "self"` (herança de todas as ferramentas nativas: terminal, visualização e edição de arquivos, e `ask_question`).
- `Role: "<Papel>"` (`"Principal Engineer"`, `"FinOps & Frugal DBA"`, `"Developer"`, `"Reviewer Gatekeeper"`, `"QA Engineer"`).
- `Model: "inherit"`.
- `Prompt`: O orquestrador instrui o subagente a carregar sua definição em `.agents/agents/<agente>.md`, ler **exclusivamente** sua memória privada em `.agents/agent-memory/<agente>/MEMORY.md` e ler o dossiê da demanda em `docs/dossies/<feature>/dossie.md`.
- **Regra de Ouro do Contexto**: O orquestrador **NUNCA** repassa o histórico completo do chat aos subagentes. Repassa unicamente o caminho do dossiê e a etapa atual.

---

## 5. Dossiê Compartilhado vs Memórias Privadas Isoladas

1. **Dossiê da Demanda (`docs/dossies/<feature>/dossie.md`) — Canal Único de Sincronização**:
   - Criado a partir do template canônico [docs/dossies/_TEMPLATE/dossie.md](file:///docs/dossies/_TEMPLATE/dossie.md).
   - Todos os agentes leem o dossiê completo.
   - Cada agente escreve **exclusivamente na sua própria seção** (Seções 1 a 5) e atualiza **apenas a sua linha no Ledger**.
   - Contém: Cabeçalho com demanda verbatim, contador de ciclos `Ciclo atual de correção (Self-Healing): 0 / 3`, superfícies impactadas, `Toca persistência/schema?`, Ledger de Etapas, seção `Perguntas e Decisões do Usuário`, Seções 1 a 5, `Bloco de Comprovação Obrigatório` e tabela `Log de Ciclos de Correção`.

2. **Memórias Privadas de Longo Prazo (`.agents/agent-memory/<agente>/MEMORY.md`)**:
   - Arquivos estritamente isolados por papel:
     - [.agents/agent-memory/principal-engineer/MEMORY.md](file:///.agents/agent-memory/principal-engineer/MEMORY.md)
     - [.agents/agent-memory/finops-frugal-dba/MEMORY.md](file:///.agents/agent-memory/finops-frugal-dba/MEMORY.md)
     - [.agents/agent-memory/developer/MEMORY.md](file:///.agents/agent-memory/developer/MEMORY.md)
     - [.agents/agent-memory/reviewer-gatekeeper/MEMORY.md](file:///.agents/agent-memory/reviewer-gatekeeper/MEMORY.md)
     - [.agents/agent-memory/qa-engineer/MEMORY.md](file:///.agents/agent-memory/qa-engineer/MEMORY.md)
   - **Regra de Isolamento**: Nenhum agente pode ler ou escrever na memória de outro agente.
   - **Formato**: Apenas lições duráveis do papel (1 linha por tópico), nunca narrativa de entrega.

---

## 6. Gate de Dúvidas & Protocolo de Reprovação (Self-Healing)

### 6.1 `ask_question` Exclusivo do Principal Engineer
- O `principal-engineer` é o **ÚNICO** agente com autorização para acionar o modal interativo `ask_question`.
- Dúvidas devem ser formuladas em lote, objetivas, com a opção recomendada listada em primeiro lugar prefixada por `(Recommended)`.
- A implementação (Etapa 3) só inicia com o campo `Aprovação para implementar` preenchido como `usuário` ou `auto-aprovado pelo Principal`.
- Os outros 4 agentes **NUNCA** perguntam ao usuário. Em caso de bloqueio, marcam `BLOCKED` e devolvem ao Principal Engineer.

### 6.2 Protocolo de Reprovação & Auto-Cura
- **Etapa 2 (FinOps)**: Rejeita com `REJECTED_DOR` e devolve à Etapa 1.
- **Etapa 4 (Reviewer Gatekeeper)**: É somente leitura no código. Ao encontrar falha em Gate 1 ou Gate 2, marca `CHANGES_REQUESTED`, incrementa o contador de ciclos e preenche a causa raiz e correção prescritiva no `Log de Ciclos de Correção`. Devolve à Etapa 3.
- **Etapa 5 (QA Engineer)**: Se qualquer build ou teste quebrar, marca `FAILED`, incrementa o contador de ciclos, preenche o `Log de Ciclos de Correção` e devolve à Etapa 3. Após o fix, o código passa novamente pelas Etapas 4 e 5.
- **Limite**: Máximo de 3 iterações (`max_iter: 3`). Se não convergir, marca `BLOCKED` e solicita decisão ao usuário.

---

## 7. Bloco de Comprovação Obrigatório (Pré-Commit)

Atestado empiricamente pelo QA Engineer antes de qualquer autorização de commit:
```text
[x] Build Backend: npm run build (0 erros) [api-arisefit]
[x] Build Frontend: npm run build (0 erros) [frontend-arisefit]
[x] Testes Automatizados Executados:
    - Frontend (Playwright E2E): tests/e2e/<spec>.spec.ts (X passed)
    - Backend (Unit/Integration): src/modules/<module>/<spec>.spec.ts (X passed)
```

---

## 8. Catálogo de Agentes Especialistas (`.agents/agents/`)

```text
.agents/agents/
├── principal-engineer.md      # Etapa 1: Arquiteto de Solução, Tech Lead & PM (Único com ask_question)
├── finops-frugal-dba.md       # Etapa 2: Guardião das Regras Financeiras N1-N7, Frugal DBA e DoR
├── developer.md               # Etapa 3: Desenvolvedor Full-Stack (NestJS 11 + React 19) e UX Guardrails
├── reviewer-gatekeeper.md     # Etapa 4: Auditor Dual-Gate (Qualidade, AppSec, Multi-Tenant e Commits)
└── qa-engineer.md             # Etapa 5: QA Automation Engineer (Playwright E2E, Jest, Caos e Builds)
```

---

## 9. Catálogo de Regras do Projeto (`.agents/rules/`)

```text
.agents/rules/
├── rules.md                       # Regras globais, escopos, contrato financeiro e verificação na API
├── team-governance.md             # Governança da esteira, DoR e Human-in-the-Loop
├── regras-orquestracao-agentes.md # Norma operacional de 5 etapas, subagentes e Self-Healing
├── regras-verificacao-previa-api.md # Proibição absoluta de adicionar UI sem backend existente
├── regras-de-commit.md            # Conventional Commits e política de 1 commit por arquivo
├── regras-seguranca-zero-trust.md # Zero-Trust, Anti-IDOR por claims JWT e princípio Fail-Closed
├── regras-de-estilos-e-ux.md      # Design System, modais .modal-card, empty states, skeletons
├── regras-revisao-performance.md  # Frugalidade de banco NestJS/Prisma, projeção select e debounce
└── regras-atualizacoes.md         # Build mandatório em ambas as camadas e testes E2E Playwright
```

---

## 10. Catálogo de Skills Especialistas (`.agents/skills/`)

```text
.agents/skills/
├── multitenant-saas-security-specialist/        # Defesa multi-tenant em 7 camadas e catálogo MT-01 a MT-07
├── security-idor-prevention/                   # Guia contra IDOR/BOLA/BFLA e Mass Assignment
├── enterprise-security-cryptography-specialist/# Criptografia AEAD AES-256-GCM, Fail-Closed e RFC 9457
├── arisefit-principal-engineer/              # Arquiteto de Solução e Tech Lead
├── arisefit-finops/                          # Guardião Financeiro N1-N7 e Frugal DBA
├── arisefit-developer/                       # Desenvolvedor Full-Stack e UX Guardrails
├── arisefit-reviewer/                        # Auditor Dual-Gate de Código e Segurança
├── arisefit-qa/                              # Automação E2E Playwright e Caos
├── playwright-e2e-testing/                     # Especialista em testes Playwright com seletores semânticos
└── high-concurrency-frugal-devops/             # Dimensionamento de capacidade e RPS em VPS enxuta
```
