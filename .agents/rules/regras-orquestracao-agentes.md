# Norma Operacional: Orquestração Multi-Agente de 5 Etapas (Padrão Google / Big Tech)

Esta norma regulamenta o funcionamento, coordenação, isolamento de papéis, gates de aprovação e protocolo de auto-correção (*Self-Healing*) entre os agentes de IA no ecossistema **AriseFit** operando sob o **Google Antigravity**.

---

## 1. O Fluxo de 5 Etapas e Tabela de Ledger

Toda demanda de feature, refatoração de infraestrutura, modelagem financeira ou correção arquitetural transita obrigatoriamente e sequencialmente por 5 agentes especialistas:

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

### 1.1 Tabela de Ledger Canônica

| Etapa | Agente Responsável | Status de Saída | Data/Hora | Descrição Breve da Ação | Artefato Vinculado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Arquitetura** | 🏛️ Principal Engineer (`principal-engineer`) | `READY_FOR_FINOPS` | `AAAA-MM-DD` | Especificação técnica, segurança e contratos REST mapeados | `docs/specs/<feature>-architecture.md` |
| **2. FinOps & DoR** | 💰 FinOps & Frugal DBA (`finops-frugal-dba`) | `APPROVED_DOR` | `AAAA-MM-DD` | Auditoria N1-N7, hold 15min e modelagem frugal | `docs/specs/<feature>-financial-spec.md` |
| **3. Implementação** | 💻 Developer (`developer`) | `READY_FOR_REVIEW` | `AAAA-MM-DD` | Implementação com design system, testes e verificação na API | Repositórios (`api` / `frontend`) |
| **4. Code Review** | 🔍 Reviewer Gatekeeper (`reviewer-gatekeeper`) | `APPROVED` | `AAAA-MM-DD` | Auditoria Dual-Gate (Qualidade, AppSec, Multi-Tenant e Commits) | `docs/reviews/<feature>-review.md` |
| **5. QA & Caos** | 🛡️ QA Engineer (`qa-engineer`) | `APPROVED` | `AAAA-MM-DD` | Testes unitários/integração, Playwright E2E na jornada real e caos | `docs/qa/<feature>-qa-report.md` |

**Status Válidos do Ledger**:
`PENDING` · `IN_PROGRESS` · `READY_FOR_FINOPS` · `APPROVED_DOR` · `REJECTED_DOR` · `READY_FOR_REVIEW` · `CHANGES_REQUESTED` · `APPROVED` · `FAILED` · `BLOCKED`.

---

## 2. Invocação de Subagentes Nativos no Antigravity (`invoke_subagent`)

No Google Antigravity, cada etapa da esteira roda em uma janela de contexto limpa e isolada via ferramenta nativa `invoke_subagent`.

### 2.1 Parâmetros Obrigatórios da Invocação
- `TypeName: "self"` (para herdar o ferramental completo do Antigravity: `ask_question`, terminal, visualização e edição de arquivos).
- `Role: "<Nome do Papel>"` (`"Principal Engineer"`, `"FinOps & Frugal DBA"`, `"Developer"`, `"Reviewer Gatekeeper"`, `"QA Engineer"`).
- `Model: "inherit"`.
- `TaskName`: Nome legível e conciso da tarefa.
- `TaskSummary`: Resumo conciso de 1-2 sentenças.
- `RecordingName`: Identificador em minúsculas com underscores (ex: `etapa1_principal_spec`).
- `Task` (Prompt): Instrução imperativa e objetiva orientando o subagente a:
  1. Carregar integralmente sua definição de agente em `.agents/agents/<agente>.md`.
  2. Ler **exclusivamente** sua memória privada em `.agents/agent-memory/<agente>/MEMORY.md`.
  3. Ler o Dossiê da Demanda em `docs/dossies/<feature>/dossie.md`.
  4. Executar seu papel, registrar suas evidências na sua seção do dossiê, atualizar sua linha no Ledger e atualizar suas lições na memória privada.
  5. Retornar um relatório final objetivo.

> [!IMPORTANT]
> O orquestrador **NUNCA** repassa o histórico completo do chat ao subagente. Ele repassa estritamente o caminho do arquivo do dossiê (`docs/dossies/<feature>/dossie.md`) e a etapa a ser processada.

---

## 3. Dossiê Compartilhado vs Memórias Privadas Isoladas

### 3.1 Dossiê da Demanda (`docs/dossies/<feature>/dossie.md`)
O Dossiê da Demanda é o **ÚNICO canal de sincronização e comunicação** entre os agentes:
- Toda demanda inicia com a criação do arquivo a partir de `docs/dossies/_TEMPLATE/dossie.md`.
- **Regra de Leitura Universal**: Todo agente lê o dossiê na íntegra para absorver contexto.
- **Regra de Escrita Segregada**: Cada agente escreve **exclusivamente na sua própria seção** (Seções 1 a 5) e altera **apenas a sua respectiva linha no Ledger**.

### 3.2 Memórias Privadas de Longo Prazo (`.agents/agent-memory/<agente>/MEMORY.md`)
Cada um dos 5 papéis possui seu repositório de conhecimento durável:
- `.agents/agent-memory/principal-engineer/MEMORY.md`
- `.agents/agent-memory/finops-frugal-dba/MEMORY.md`
- `.agents/agent-memory/developer/MEMORY.md`
- `.agents/agent-memory/reviewer-gatekeeper/MEMORY.md`
- `.agents/agent-memory/qa-engineer/MEMORY.md`

**Invariantes de Memória**:
- **Isolamento Estrito**: É proibido a qualquer agente ler ou modificar o arquivo de memória de outro agente.
- **Concisão Extrema**: Apenas lições e regras duráveis do papel (máximo 1 linha por tópico). Narrativas de tarefas e logs transitórios são terminantemente proibidos.

---

## 4. Gate de Dúvidas e Aprovação (`ask_question` Exclusivo do Principal Engineer)

1. **Exclusividade**: O `principal-engineer` é o **ÚNICO** agente com autorização para acionar o modal interativo `ask_question` e conversar com o usuário.
2. **Formato Obrigatório do `ask_question`**:
   - Modal com opções claras e objetivas.
   - A opção recomendada deve vir sempre em primeiro lugar, prefixada com `(Recommended)`.
   - Agrupamento de dúvidas em lote para não interromper desnecessariamente o usuário.
3. **Condição para Início do Desenvolvimento (Etapa 3)**:
   - O campo `Aprovação para implementar` no dossiê deve estar obrigatoriamente preenchido como:
     - `usuário`: caso o usuário tenha respondido às perguntas ou aprovado a spec; OU
     - `auto-aprovado pelo Principal`: caso a demanda seja 100% inequívoca, com a justificativa técnica preenchida no dossiê.
4. **Tratamento de Dúvidas em Etapas Posteriores**:
   - Se o FinOps, Developer, Reviewer ou QA se depararem com incertezas ou divergências na spec, eles **NÃO PODEM** perguntar ao usuário. Devem marcar o Ledger como `BLOCKED`, registrar o motivo no `Log de Ciclos de Correção` e devolver a demanda para o `principal-engineer`.

---

## 5. Protocolo de Reprovação e Self-Healing Autônomo

FinOps, Reviewer e QA possuem autoridade de veto e auto-cura:

1. **Reprovação na Etapa 2 (`REJECTED_DOR`) — FinOps**:
   - Registra violações financeiras (N1-N7, hold 15min, split) no `Log de Ciclos de Correção`.
   - Devolve para a **Etapa 1 (`principal-engineer`)** ajustar a spec técnica.
2. **Reprovação na Etapa 4 (`CHANGES_REQUESTED`) — Reviewer Gatekeeper**:
   - O Reviewer é **estritamente somente leitura** (nunca altera código).
   - Se houver falha no Gate 1 (Qualidade/Frugalidade/UX) ou Gate 2 (AppSec/Multi-Tenant/Testes):
     1. Marca `CHANGES_REQUESTED` na linha 4 do Ledger.
     2. Incrementa o contador `Ciclo atual de correção (Self-Healing): N / 3` no topo do dossiê.
     3. Preenche a linha correspondente no `Log de Ciclos de Correção`.
     4. Devolve para a **Etapa 3 (`developer`)**.
     5. O Developer aplica as correções, marca `READY_FOR_REVIEW`, e o fluxo retorna para a **Etapa 4** e **Etapa 5**.
3. **Reprovação na Etapa 5 (`FAILED`) — QA Engineer**:
   - Se qualquer build quebrar, teste falhar ou vulnerabilidade de segurança/fuzzing for encontrada:
     1. Marca `FAILED` na linha 5 do Ledger.
     2. Incrementa o contador de ciclos no dossiê.
     3. Preenche causa raiz e prescrição no `Log de Ciclos de Correção`.
     4. Devolve para a **Etapa 3 (`developer`)**.
     5. Após a correção do Developer, o código passa obrigatoriamente pela **Etapa 4 (Code Review)** e **Etapa 5 (QA)** novamente.
4. **Teto Inegociável de 3 Ciclos (`max_iter: 3`)**:
   - Se o ciclo atingir 3 sem convergência, o agente marca `BLOCKED` e apresenta um diagnóstico detalhado com opções de decisão ao usuário.

---

## 6. Os 6 Pilares de Engenharia de Alta Confiabilidade (Padrão Google)

1. **🌪️ Testes de Caminho Infeliz & Resiliência (Chaos & Fault Injection)**:
   - Pelo menos 50% dos casos de teste devem provocar ativamente quedas de gateways externos (Asaas, Brevo, Cloudinary), timeouts e cenários de concorrência simultânea.
2. **🛡️ AppSec & Red Teaming (Segurança Ofensiva Zero-Trust)**:
   - Eliminação total de BOLA/IDOR/BFLA; claims confiáveis derivadas apenas do token JWT verificado; proteção contra Mass Assignment e validação multi-tenant fail-closed.
3. **🔄 Protocolo Expand & Contract (Zero-Downtime Database Evolution)**:
   - Alterações no Prisma com suporte a versões legadas e modernas concorrentemente até migração total.
4. **🎨 UX Guardrails (Design System, Modais & Acessibilidade)**:
   - Aderência obrigatória aos componentes atômicos; modais obrigatoriamente no padrão canônico `.modal-card`; skeletons assíncronos; empty states com CTA; touch targets >= 44x44px.
5. **💰 FinOps, Regras N1-N7 & Capacity Planning**:
   - Sinal Pix compulsório (100% < R$15; 50% até R$399,99; flexível >= R$400), hold de 15 minutos, projeção de RPS com margem de segurança de 70% e TTFB < 200ms.
6. **🔁 Convergência em Loop Fechado (Self-Healing Autônomo com Limite de 3 Iterações)**:
   - Ciclos estruturados de causa raiz isolada e correção cirúrgica.

---

## 7. Bloco de Comprovação Obrigatório (Pré-Commit)

Nenhum commit pode ser realizado sem o seguinte bloco estar 100% atestado e preenchido pelo QA Engineer no dossiê:

```text
[x] Build Backend: npm run build (0 erros) [api-arisefit]
[x] Build Frontend: npm run build (0 erros) [frontend-arisefit]
[x] Testes Automatizados Executados:
    - Frontend (Playwright E2E): tests/e2e/<spec>.spec.ts (X passed)
    - Backend (Unit/Integration): src/modules/<module>/<spec>.spec.ts (X passed)
```
