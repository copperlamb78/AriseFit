# Template de Relatório de QA & Automação E2E — QA Engineer

> **Autor:** 🛡️ QA Engineer  
> **Feature:** [Nome da Funcionalidade]  
> **Iteração:** [1/3, 2/3, 3/3]  
> **Data:** YYYY-MM-DD  
> **Status:** `APPROVED` | `REJECTED`

---

## 1. Testes Automatizados no Backend (Jest / Supertest)
- [ ] Testes unitários de serviços com mocks de Asaas/Brevo/Cloudinary.
- [ ] Validação de regras financeiras N1-N7 e concorrência de slots.
- **Resultado da Suíte Jest:** X testes executados, X aprovados, 0 falhas.

---

## 2. Testes Automatizados E2E no Frontend (Playwright)
- [ ] **Jornada Real do Usuário:** Fluxo completo ponta a ponta verificado.
- [ ] **Seletores Semânticos:** Uso de `getByRole`, `getByLabel`, `getByText`, `data-testid`.
- [ ] **Viewport Mobile:** Validado em 360px a 430px de largura.
- [ ] **Touch Targets:** Área clicável >= 44x44px em todos os botões e links.
- [ ] **Modais & Formulários:** Validação de rolagem interna sem corte de botões.
- **Resultado dos Testes Playwright:** X specs executadas, X aprovadas, 0 falhas.

---

## 3. Testes de Caminho Infeliz & Resiliência (Chaos Injection)
- [ ] Falha transitória simulada em gateway / rede tratada graciosamente.
- [ ] Expiração de hold de 15 minutos (`expiresAt`) testada.
- [ ] Tentativa de reserva duplicada tratada com erro amigável ao usuário.

---

## 4. Veredito Final
- **STATUS:** `APPROVED` (Pronto para commit individual por arquivo) | `REJECTED` (Devolver ao Developer)
- **Causa Raiz Isolada (se REJECTED):**
  - *Teste que falhou:* `caminho/do/teste.spec.ts`
  - *Comportamento observado:*
  - *Comportamento esperado:*
