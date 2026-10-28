---
trigger: always_on
---

# AriseFit — Regras Globais do Workspace Multi-Repo

Você é o assistente Antigravity atuando no ecossistema **AriseFit**, composto por dois repositórios complementares:
1. **`api-arisefit/`**: Backend em NestJS 11, TypeScript 5, Prisma 7, PostgreSQL, Asaas (Pix split), Brevo e Cloudinary.
2. **`frontend-arisefit/`**: Frontend SPA em React 19, TypeScript 5, Vite, Tailwind CSS 4, TanStack Query, Lucide Icons e Playwright.

---

## §1 — SEPARAÇÃO RÍGIDA DE ESCOPOS (BACKEND vs FRONTEND)

1. **Nunca misture padrões de frontend no backend:**
   - O backend `api-arisefit` NUNCA contém React, Tailwind CSS, Playwright, HTML templates de UI ou design system visual.
   - O backend segue estritamente a arquitetura de módulos NestJS, DTOs com `class-validator`, serviços com injeção de dependência e persistência via `PrismaService`.
2. **Nunca misture segredos ou acesso direto a banco no frontend:**
   - O frontend `frontend-arisefit` consome a API exclusivamente via HTTP/REST (`Axios`/`fetch`).
   - O frontend segue a arquitetura Vertical Slice (`src/features/`), Thin Pages (`src/routes/pages/`) e Design System atômico (`src/design-system/ui/`).

---

## §2 — CONTRATO FINANCEIRO ZERO TRUST

1. **O Backend é a Única Source of Truth Financeira:**
   - O frontend nunca calcula nem envia `servicePrice`, `downPaymentAmount` ou `platformTax` para gravação no banco.
   - O backend valida ou calcula todos os valores monetários no momento do agendamento.
2. **Regras de Negócio N1–N7 (`api-arisefit/docs/modelo-de-negocio.md`):**
   - Serviços < R$ 15,00: Sinal de 100% compulsório.
   - Serviços de R$ 15,00 a R$ 399,99: Sinal automático de 50%.
   - Serviços >= R$ 400,00: Sinal flexível (50% ou 30%).
   - Reserva de 15 minutos (`expiresAt`) para pagamento do Pix.

---

## §3 — GOVERNANÇA DE COMMITS

- Cada repositório possui seu próprio controle Git.
- Política mandatória: **1 commit semântico por arquivo** (`git add <arquivo> && git commit -m '...'`) no padrão Conventional Commits em português.
- Nunca commite código quebrado. Ambos os projetos devem compilar (`npm run build` ou `npm test`) antes de commits definitivos.
- Consulte detalhes em [regras-de-commit.md](file:///.agents/rules/regras-de-commit.md).

---

## §4 — REGRA DE OURO: VERIFICAÇÃO PRÉVIA MANDATÓRIA NA API (BACKEND SOURCE OF TRUTH)

1. **Zero Premissas / Zero Suposições / Proibição Absoluta de Adicionar UI sem Backend:**
   - Antes de adicionar qualquer funcionalidade, tela, seção, fluxo, card, botão, campo, filtro, modal, badge ou comportamento no frontend, você **DEVE OBRIGATORIAMENTE** inspecionar previamente o código-fonte real da `api-arisefit/` (especialmente `src/modules/`, controllers, DTOs, entities, Prisma schema e enums).
   - Você **NÃO PODE ADICIONAR NADA NA UI** sem antes comprovar que aquilo realmente existe e está funcional no backend.
   - É estritamente proibido supor rotas, inventar endpoints, criar campos fictícios, exibir recursos que o backend ainda não possui implementado ou usar mocks no frontend.
   - Caso a interface precise de um dado ou ação nova, o desenvolvimento **deve iniciar compulsoriamente pelo backend**.
   - Diretriz detalhada em [regras-verificacao-previa-api.md](file:///.agents/rules/regras-verificacao-previa-api.md).

## §5 — DOSSIÊ VIVO DA DEMANDA (COORDENAÇÃO E VALIDAÇÃO CONTÍNUA)

1. **Obrigatório para Todo Novo Fluxo:**
   - Toda nova demanda, fluxo, refatoração ou correção inicia obrigatoriamente pela criação de um **Dossiê Vivo da Demanda** em [`docs/dossiers/<feature>-dossier.md`](file:///docs/dossiers/<feature>-dossier.md), derivado do template canônico [`docs/dossiers/TEMPLATE-DOSSIER.md`](file:///docs/dossiers/TEMPLATE-DOSSIER.md).
2. **Atualização Mandatória por Cada Agente:**
   - Cada um dos 5 agentes deve preencher e validar sua respectiva etapa no Dossiê com:
     - **Breve descrição** do que está fazendo / fez na etapa.
     - **Checklist de validação** dos critérios técnicos, financeiros, de código, revisão ou QA.
     - **Mapeamento de arquivos** criados ou modificados (Developer) e links de artefatos.
     - **Histórico de auto-correção (Self-Healing)** com causa raiz em caso de devoluções (limite de 3 iterações).

---

## §6 — CATÁLOGO DE REGRAS E ORQUESTRAÇÃO COMPLEMENTARES

O ecossistema multi-agente é regido pelo conjunto de regras ativas abaixo:
- [regras-verificacao-previa-api.md](file:///.agents/rules/regras-verificacao-previa-api.md): Proibição absoluta de adicionar UI sem backend existente (API Source of Truth).
- [regras-orquestracao-agentes.md](file:///.agents/rules/regras-orquestracao-agentes.md): Ciclo operacional dos 5 agentes, os 6 Pilares de Alta Confiabilidade (Padrão Google) e persistência de estado.
- [team-governance.md](file:///.agents/rules/team-governance.md): Esteira oficial de trabalho, estados de transição (DoR, Review, QA) e limite de auto-correção (`max_iter: 3`).
- [regras-de-commit.md](file:///.agents/rules/regras-de-commit.md): Padrão Conventional Commits com política mandatória de 1 commit por arquivo.
- [regras-seguranca-zero-trust.md](file:///.agents/rules/regras-seguranca-zero-trust.md): Prevenção de IDOR por claims JWT, caminho fail-closed e integridade financeira.
- [regras-de-estilos-e-ux.md](file:///.agents/rules/regras-de-estilos-e-ux.md): Design System oficial, padrão canônico de botões Button.tsx, modais .modal-card, empty states, skeletons e touch targets mobile.
- [regras-revisao-performance.md](file:///.agents/rules/regras-revisao-performance.md): Frugalidade de recursos, consultas Prisma sem tracking e com paginação no banco, debounce de 300ms.
- [regras-atualizacoes.md](file:///.agents/rules/regras-atualizacoes.md): Build mandatório de todas as camadas e cobertura E2E Playwright da jornada do usuário.

---

## §7 — GOVERNANÇA PERMANENTE DO DESIGN SYSTEM E INFRAESTRUTURA VISUAL

Todo agente ou desenvolvedor que alterar, criar ou revisar o frontend deve seguir estritamente:
1. **Design System como Única Fonte da Verdade**: Sempre consultar `src/design-system/ui/` antes de tocar em UI. Proibido tags HTML cruas (`<button>`, `<input>`) para ações do sistema.
2. **Reutilização antes de Duplicação**: Nunca crie componentes paralelos se já houver um componente oficial compatível.
3. **Consistência Global**: Problemas de estilo devem ser resolvidos na causa raiz (tokens, design system, CSS global), nunca com hacks isolados por tela.
4. **Padrão de Botões (`Button.tsx`)**: Layout flex direto (proibido wrapping span com SVG), `whitespace-nowrap`, `[&>svg]:shrink-0`, contraste WCAG com `--primary-foreground`, `font-semibold text-sm rounded-md`.
5. **Validação Visual Obrigatória**: O build passar não é garantia de interface correta. Toda alteração visual exige validação em navegador real e Playwright E2E.

---

## §8 — UPLOADS DE MÍDIA VS URLs MANUAIS (CLOUDINARY)

1. **Upload Obrigatório para Mídia Fornecida pelo Usuário**:
   - Sempre que um campo for destinado a foto de perfil, avatar, logotipo, banner ou documento, o agente **DEVE** implementar seleção de arquivo local e upload integrado ao Cloudinary via backend (`ImageUpload.tsx`).
   - É terminantemente **proibido substituir upload por campo de texto de digitação manual de URL** apenas porque o banco armazena uma string.
2. **Segurança de Credenciais**:
   - Nunca exponha `API_SECRET` do Cloudinary no frontend. O upload é realizado exclusivamente através do backend autenticado (`/upload/image/:companyId/:imageType`), com validação binária de Magic Bytes e proteção Anti-IDOR.
3. **Persistência e Opcionalidade**:
   - Fotos devem ser tratadas como opcionais. A ausência de foto não deve bloquear o cadastro nem apagar imagens pré-existentes na edição.

---

## §9 — RESILIÊNCIA DE ESTADO, CICLO DE VIDA DE NAVEGAÇÃO E ZERO NON-NULL ASSERTIONS

1. **Proibição Absoluta de Non-Null Assertions (`!`) em Estados Reativos**:
   - Nunca use `!` para acessar propriedades de entidades selecionadas ou dados de API (`selectedItem!.createdAt`). Trate explicitamente com encadeamento opcional e fallbacks (`selectedItem?.createdAt ? ... : '-'`).
2. **Limpeza Síncrona de Estados Dependentes**:
   - Ao fechar modais, gavetas ou retornar de rotas de detalhe, limpe tanto a entidade selecionada quanto dados secundários dependentes para evitar leituras de propriedades em objetos descartados.
3. **Renderização Condicional de Modais**:
   - Modais com dados vinculados a uma entidade selecionada devem ser condicionados a ela (`{selectedItem && <Modal ...>...</Modal>}`), garantindo que nós filhos não sejam instanciados quando o estado for `null`.


