# Dossiê da Demanda: [SLUG_DA_FEATURE]

> **Demanda Original (Verbatim):**
> ```text
> [Insira aqui a transcrição exata da solicitação do usuário, sem cortes, resumos ou atenuações]
> ```

---

## 📌 Metadados da Demanda
- **Slug da Feature:** `[slug-da-feature]`
- **Data de Abertura:** `AAAA-MM-DD`
- **Última Atualização:** `AAAA-MM-DD HH:mm`
- **Superfícies Impactadas:** `api-arisefit` | `frontend-arisefit` | Ambos
- **Toca persistência / schema Prisma?** `[Sim / Não]`
- **Ciclo atual de correção (Self-Healing):** `0 / 3`
- **Status Consolidado:** `PENDING` *(PENDING | IN_PROGRESS | READY_FOR_FINOPS | APPROVED_DOR | REJECTED_DOR | READY_FOR_REVIEW | CHANGES_REQUESTED | APPROVED | FAILED | BLOCKED)*

---

## 📊 Ledger de Etapas (Quadro de Transição da Esteira)

| Etapa | Agente Responsável | Status de Saída | Data/Hora | Descrição Breve da Ação | Artefato Vinculado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Arquitetura** | 🏛️ Principal Engineer (`principal-engineer`) | `PENDING` | `AAAA-MM-DD` | Especificação técnica, segurança e contratos REST mapeados | `docs/specs/[slug]-architecture.md` |
| **2. FinOps & DoR** | 💰 FinOps & Frugal DBA (`finops-frugal-dba`) | `PENDING` | `AAAA-MM-DD` | Auditoria N1-N7, hold 15min e modelagem frugal | `docs/specs/[slug]-financial-spec.md` |
| **3. Implementação** | 💻 Developer (`developer`) | `PENDING` | `AAAA-MM-DD` | Implementação com design system, testes e verificação na API | Repositórios (`api` / `frontend`) |
| **4. Code Review** | 🔍 Reviewer Gatekeeper (`reviewer-gatekeeper`) | `PENDING` | `AAAA-MM-DD` | Auditoria Dual-Gate (Qualidade, AppSec, Multi-Tenant e Commits) | `docs/reviews/[slug]-review.md` |
| **5. QA & Caos** | 🛡️ QA Engineer (`qa-engineer`) | `PENDING` | `AAAA-MM-DD` | Testes unitários/integração, Playwright E2E na jornada real e caos | `docs/qa/[slug]-qa-report.md` |

*Status válidos do Ledger: `PENDING` · `IN_PROGRESS` · `READY_FOR_FINOPS` · `APPROVED_DOR` · `REJECTED_DOR` · `READY_FOR_REVIEW` · `CHANGES_REQUESTED` · `APPROVED` · `FAILED` · `BLOCKED`.*

---

## 💬 Perguntas e Decisões do Usuário
*Esta seção é de uso exclusivo do **Principal Engineer** para registrar alinhamentos via ferramenta nativa `ask_question`.*

- **Aprovação para implementar:** `pendente` *(pendente | usuário | auto-aprovado pelo Principal)*
- **Justificativa da Aprovação:** `[Preenchido pelo Principal Engineer se auto-aprovado ou após retorno do usuário]`

### Perguntas e Respostas Registradas:
- **Pergunta 1:** `[Descrição da dúvida levantada]`
  - *Opção Recomendada:* `[Opção recomendada apresentada ao usuário]`
  - *Decisão do Usuário:* `[Decisão tomada]`

---

## 🏛️ Seção 1 — Arquitetura & Contratos (Principal Engineer)
*Esta seção deve ser preenchida exclusivamente pelo **Principal Engineer**.*

- **Resumo Executivo da Solução:** `[Breve síntese arquitetural]`
- **Verificação Prévia na API (Backend Source of Truth):**
  - Rotas inspecionadas em `api-arisefit`: `[ex: /src/modules/appointments/appointments.controller.ts]`
  - Provedor/Multi-Tenant validado: `[Claims JWT 'sub', role, companyId]`
- **Contratos REST Mapeados:**
  - `[MÉTODO /rota] -> Request DTO / Response DTO`
- **Matriz de Casos Infelizes & Caos (Mínimo 50% dos cenários):**
  1. `[Cenário 1 - Caminho infeliz / falha de gateway / timeout]`
  2. `[Cenário 2 - Concorrência de slots ou erro de banco]`
  3. `[Cenário 3 - Caminho feliz]`
- **Meta de Desempenho:** TTFB < 200ms sob concorrência nominal.
- **Artefato da Especificação:** `docs/specs/[slug]-architecture.md`
- **Checklist de Saída:**
  - [ ] Verificação prévia da API concluída sem suposições
  - [ ] Zero claims confidenciais exigidos do payload (autenticação estrita via JWT claims)
  - [ ] Mínimo 50% de cenários infelizes/caos mapeados
  - [ ] `Aprovação para implementar` preenchida como `usuário` ou `auto-aprovado pelo Principal`

---

## 💰 Seção 2 — FinOps, Frugal DBA & DoR (FinOps & Frugal DBA)
*Esta seção deve ser preenchida exclusivamente pelo **FinOps & Frugal DBA**.*

- **Auditoria de 7 Níveis (N1 a N7):**
  - **N1 (Schema):** Zero tabelas/índices especulativos. Tipos primitivos enxutos.
  - **N2 (Migração):** Protocolo Expand & Contract respeitado? `[Sim / Não / N/A]`
  - **N3 (Queries):** Leituras com `select` explícito, sem N+1, paginação no banco (Take/Skip), limite `WHERE IN` <= 50.
  - **N4 (RAM):** Buffers controlados, sem memory leak ou streaming desgovernado.
  - **N5 (Disco):** Políticas de retenção e limpeza preventiva.
  - **N6 (Capacidade):** Dimensionamento: `active_users = (RPS * 60) / actions_per_minute * 0.70`.
  - **N7 (Custo):** Custo marginal por 1.000 requisições e isolamento de split Asaas/Pix.
- **Hold de 15 Minutos:** `[Aplicado para veto de schema/custo | Dispensado com justificativa técnica]`
- **Artefato Financeiro:** `docs/specs/[slug]-financial-spec.md`
- **Decisão do DoR:** `[APPROVED_DOR | REJECTED_DOR]`

---

## 💻 Seção 3 — Implementação & Testes Unitários (Developer)
*Esta seção deve ser preenchida exclusivamente pelo **Developer**.*

- **Arquivos Criados / Modificados:**
  - `api-arisefit/src/...`
  - `frontend-arisefit/src/...`
- **UX Guardrails e Design System:**
  - [ ] Uso exclusivo de componentes de `src/design-system/ui/`
  - [ ] Modais seguindo o padrão canônico `.modal-card` (header shrink-0, body overflow-y-auto, footer shrink-0)
  - [ ] Empty states informativos com CTA acolhedor
  - [ ] Skeletons em carregamentos assíncronos
  - [ ] Touch targets mobile >= 44x44px (viewport 360px–430px)
- **Tratamento de Erros:**
  - [ ] Zero blocos `catch` vazios ou silenciosos
  - [ ] Erros propagados com mensagens sanitizadas
- **Testes Unitários / Integração Escritos:**
  - `[Caminho dos arquivos de teste criados]`

---

## 🔍 Seção 4 — Auditoria Dual-Gate (Reviewer Gatekeeper)
*Esta seção deve ser preenchida exclusivamente pelo **Reviewer Gatekeeper**.*

- **Gate 1: Qualidade de Código & UX:**
  - [ ] Conformidade 100% com a spec aprovada
  - [ ] Frugalidade de banco e ausência de queries lentas/N+1
  - [ ] Aderência ao Design System e padrão `.modal-card`
- **Gate 2: AppSec, Zero-Trust & Commits:**
  - [ ] Anti-IDOR / Anti-BOLA / Anti-BFLA (zero confiança em IDs do body)
  - [ ] Isolamento estrito multi-tenant (validação de `companyId` / posse)
  - [ ] Testes automatizados cobrindo cada camada modificada
  - [ ] Preparação para 1 commit semântico por arquivo
- **Parecer Final:** `[APPROVED | CHANGES_REQUESTED]`
- **Artefato de Revisão:** `docs/reviews/[slug]-review.md`

---

## 🛡️ Seção 5 — QA, Caos & Validação E2E (QA Engineer)
*Esta seção deve ser preenchida exclusivamente pelo **QA Engineer**.*

- **Execução Empírica de Testes:**
  - [ ] Backend Jest Tests: 100% verde
  - [ ] Frontend Playwright E2E: jornada do usuário executada e validada
  - [ ] Testes de Caos & Caminho Infeliz (>= 50% dos cenários)
  - [ ] Fuzzing de Segurança (SQLi, XSS, payload malformado, BOLA/IDOR)
- **Artefato de QA:** `docs/qa/[slug]-qa-report.md`
- **Autorização de Release:** `[APPROVED | FAILED]`

---

## 🧾 Bloco de Comprovação Obrigatório (Pré-Commit)
*Preenchido e atestado pelo **QA Engineer** antes de qualquer commit ser realizado.*

```text
[x] Build Backend: npm run build (0 erros) [api-arisefit]
[x] Build Frontend: npm run build (0 erros) [frontend-arisefit]
[x] Testes Automatizados Executados:
    - Frontend (Playwright E2E): tests/e2e/[nome].spec.ts (X passed)
    - Backend (Unit/Integration): src/modules/[nome]/[nome].spec.ts (X passed)
```

---

## 🔄 Log de Ciclos de Correção (Self-Healing)
*Tabela preenchida pelo Reviewer, QA ou FinOps sempre que houver reprovação ou necessidade de correção (limite: 3 ciclos).*

| Ciclo | Origem | Arquivo / Teste Afetado | Causa Raiz Isolada | Correção Necessária (Prescritiva) | Correção Aplicada (Developer) | Resultado Final |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| `1` | `Reviewer / QA / FinOps` | `caminho/arquivo.ext` | `Descrição precisa do erro` | `O que deve ser corrigido` | `O que foi alterado pelo Dev` | `APPROVED / REPROVADO` |
