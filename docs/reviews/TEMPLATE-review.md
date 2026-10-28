# Template de Parecer de Code Review — Dual-Gate Reviewer

> **Autor:** 🔍 Reviewer Gatekeeper  
> **Feature:** [Nome da Funcionalidade]  
> **Iteração:** [1/3, 2/3, 3/3]  
> **Data:** YYYY-MM-DD  
> **Status:** `APPROVED` | `CHANGES_REQUESTED`

---

## 🚪 GATE 1: Qualidade de Código, UI/UX, Frugalidade & Banco
- [ ] **1. Clean Code & Tipagem:** Sem warnings, sem `any`, sem `catch` silenciosos.
- [ ] **2. Governança Prisma:** Projeção `select` explícita, paginação no banco, sem N+1.
- [ ] **3. UX Guardrails no Frontend:**
  - Componentes oficiais do Design System (`src/design-system/ui/`). Zero tags HTML cruas para botões/inputs.
  - Modais com padrão canônico `.modal-card` (header/footer fixos, corpo rolável).
  - Empty states amigáveis com CTA; Skeletons em chamadas assíncronas; botões com ícone + texto.
- [ ] **4. Frugalidade & Memória:** Debounce 300ms, sem vazamentos em timers ou listeners.

---

## 🚪 GATE 2: AppSec Ofensivo, Zero-Trust, Commits & Build
- [ ] **5. Anti-IDOR:** Identidade extraída via claims JWT; propriedade do recurso validada.
- [ ] **6. Zero Trust Financeiro:** Preços e taxas blindados no backend.
- [ ] **7. Sanitização:** Sem vazamento de stack traces ou segredos.
- [ ] **8. Governança de Commits:** Política de **1 commit semântico por arquivo** cumprida.
- [ ] **9. Build Verde:** `npm run build` passa com 0 erros em ambas as camadas.

---

## 📋 Veredito Final
- **STATUS:** `APPROVED` (Avançar para QA Engineer) | `CHANGES_REQUESTED` (Devolver ao Developer)
- **Causa Raiz Isolada (se CHANGES_REQUESTED):**
  - *Arquivo:* `caminho/do/arquivo.ts:linha`
  - *Problema:* Descrição do fato observável.
  - *Ação Requerida:* Como corrigir.
