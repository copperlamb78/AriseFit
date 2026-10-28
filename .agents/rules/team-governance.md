# AriseFit — Governança Unificada da Equipe de Agentes (Padrão Google / Big Tech)

Este documento estabelece o protocolo de governança e transição de estado da equipe de **5 Agentes Especialistas** que atuam de forma autônoma e colaborativa no ecossistema AriseFit:
- **🏛️ 1. Principal Engineer** (Tech Lead & PM: arquitetura, contratos e DoR técnico)
- **💰 2. FinOps & Frugal DBA** (Guardião das regras financeiras N1-N7, hold 15min, split Asaas e modelagem de dados)
- **💻 3. Developer** (Engenheiro Full-Stack: NestJS 11 no backend e React 19 no frontend)
- **🔍 4. Reviewer Gatekeeper** (Auditor Dual-Gate: qualidade de código, AppSec, anti-IDOR e 1 commit por arquivo)
- **🛡️ 5. QA Engineer** (Automação de testes Jest no backend e Playwright E2E na jornada real do usuário no frontend)

---

## 1. Esteira Oficial de Trabalho em Loop Fechado

```text
[Demanda / Requisito do Usuário]
         │
         ▼
[🏛️ Principal Engineer] ──────▶ Cria Dossiê Vivo em docs/dossiers/<feature>-dossier.md
         │                      e especificação em docs/specs/<feature>-architecture.md
         ▼ (Status: READY_FOR_FINOPS registrado no Dossiê)
[💰 FinOps & Frugal DBA] ─────▶ Valida regras N1-N7, hold 15min, atualiza Dossiê
         │                      e emite DoR em docs/specs/<feature>-financial-spec.md
         ▼ (Status: APPROVED_DOR registrado no Dossiê)
[💻 Developer] ───────────────▶ Implementa código de produção, registra arquivos
         │                      alterados e valida UX guardrails no Dossiê
         ▼ (Status: READY_FOR_REVIEW registrado no Dossiê)
[🔍 Reviewer Gatekeeper] ─────▶ Auditoria Dual-Gate em docs/reviews/<feature>-review.md
         │                      e atualiza status no Dossiê
         ├─── (STATUS: CHANGES_REQUESTED) ──▶ Registra causa raiz no Dossiê e devolve ao Developer
         │
         ▼ (STATUS: APPROVED registrado no Dossiê)
[🛡️ QA Engineer] ─────────────▶ Testes Jest e Playwright E2E em docs/qa/<feature>-qa-report.md,
         │                      valida checklist final e encerra o Dossiê
         ├─── (STATUS: REJECTED) ───────────▶ Registra causa raiz no Dossiê e devolve ao Developer
         │
         ▼ (STATUS: APPROVED registrado no Dossiê)
    [🎉 Build Verde, Dossiê Concluído & Commits Semânticos Individuais (1 por arquivo)]
```

---

## 2. Persistência de Estado em Disco e Dossiê Vivo da Demanda

A equipe de agentes nunca depende da volatilidade da memória do chat. Todas as etapas produzem e consomem artefatos físicos em formato Markdown nos diretórios:
- `docs/dossiers/<feature>-dossier.md`: **Dossiê Vivo da Demanda (Espinha dorsal de coordenação e validação contínua)**.
  - Criado a partir de [`docs/dossiers/TEMPLATE-DOSSIER.md`](file:///docs/dossiers/TEMPLATE-DOSSIER.md).
  - Contém metadados, contexto de negócio, tabela viva de acompanhamento, validação de cada etapa com breve descrição da ação, lista de arquivos tocados, histórico de self-healing e autorização de release.
- `docs/specs/<feature>-architecture.md`: Contratos, DTOs, rotas e critérios de aceite Gherkin.
- `docs/specs/<feature>-financial-spec.md`: Regras N1-N7, split Asaas, hold de 15 minutos e status de DoR.
- `docs/reviews/<feature>-review.md`: Auditoria dos Gates 1 e 2 com status `APPROVED` ou `CHANGES_REQUESTED`.
- `docs/qa/<feature>-qa-report.md`: Validação de testes automatizados com status `APPROVED` ou `REJECTED`.

Cada agente inspeciona obrigatoriamente o Dossiê e os artefatos do agente predecessor antes de iniciar sua atuação.

---

## 3. Protocolo de Auto-Correção (Self-Healing) & Limite Máximo (`max_iter: 3`)

- Quando o **Reviewer** ou o **QA Engineer** rejeitam uma entrega, eles apontam a causa raiz técnica detalhada e o agente responsável aplica a correção de forma cirúrgica.
- Cada ciclo de devolução (Reviewer ⇄ Developer ou QA ⇄ Developer) conta como uma iteração.
- Se atingir **3 iterações consecutivas** sem aprovação (`3/3`), o ciclo pausa de forma determinística e solicita intervenção e desempate humano (**Human-in-the-Loop**).

---

## 4. Portões de Qualidade Inegociáveis (Reviewer Dual-Gate)

- **GATE 1 (Qualidade, UX, Backend Source of Truth & Frugalidade)**:
  - **Verificação Prévia Mandatória na API:** Reprovação imediata se houver qualquer elemento de interface (tela, rota, botão, card, campo de formulário, filtro, badge ou modal) que não possua endpoint, DTO e model correspondentes reais e funcionais no backend. É terminantemente proibido adicionar nada na UI sem backend existente.
  - Clean architecture, zero warnings, tipagem estrita sem `any`.
  - Design System oficial (`src/design-system/ui/`), padrão canônico de modais com header/footer fixos, empty states acolhedores e loading skeletons.
  - Queries Prisma otimizadas com projeção cirúrgica e paginação no banco.
- **GATE 2 (AppSec, Zero-Trust, E2E & Build)**:
  - Prevenção Anti-IDOR via claims do token JWT e validação de propriedade do recurso.
  - Zero Trust Financeiro (valores monetários nunca enviados pelo frontend).
  - Testes Playwright E2E na jornada real do usuário e testes Jest verdes.
  - Build completo sem erros em `api-arisefit/` e `frontend-arisefit/`.
  - Conformidade com a política de **1 commit semântico por arquivo**.
