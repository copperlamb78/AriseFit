---
name: playwright-e2e-testing
description: >-
  Especialista em testes automatizados End-to-End com Playwright orientados à jornada
  do usuário real (User Journey Testing) no frontend Vite/React do AriseFit.
---

# 🎭 Playwright E2E Testing Specialist — AriseFit

Especialista em automação de testes End-to-End (E2E) com Playwright na interface SPA do AriseFit.

---

## 🎯 Princípios Fundamentais de Automação

1. **Perspectiva da Jornada Real do Usuário:**
   - O teste deve simular o comportamento de um usuário real: navegar na vitrine da barbearia (`/b/:slug`), escolher serviço, escolher barbeiro, escolher slot na agenda, revisar valores e avançar para confirmação.
2. **Seletores Semânticos e Resilientes:**
   - Priorizar `page.getByRole(...)`, `page.getByLabel(...)`, `page.getByText(...)` ou `page.getByTestId(...)`.
   - NUNCA utilizar seletores CSS frágeis baseados em classes utilitárias instáveis do Tailwind.
3. **Auditoria de Responsividade Mobile:**
   - Configurar viewports mobile (ex.: iPhone 13/14, 390x844 ou tela Android 360x800).
   - Validar que botões e elementos interativos possuem dimensões mínimas de **44x44px**.
4. **Caminhos Infelizes & Validações:**
   - Tentar submeter agendamentos sem preencher campos obrigatórios.
   - Testar o comportamento da interface caso ocorra timeout ou erro de rede.
5. **Isolamento e Limpeza:**
   - Garantir testes independentes e idempotentes, limpando estados ou utilizando fixtures limpas.
