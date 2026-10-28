# Regras de Atualizações, Build e Testes Obrigatórios no AriseFit

Toda e qualquer alteração de código no ecossistema AriseFit deve obedecer rigorosamente às seguintes diretrizes:

---

## 1. Build Mandatório em Ambas as Camadas

Antes de qualquer conclusão ou commit:
- **No Backend (`api-arisefit/`):** Executar `npm run build` (ou compilação NestJS/TypeScript). Não pode haver nenhum erro de tipo ou falha de compilação.
- **No Frontend (`frontend-arisefit/`):** Executar `npm run build` (Vite build com checagem de tipos `tsc`). O build deve passar com zero erros.

---

## 2. Testes Automatizados E2E com Foco na Jornada do Usuário (Playwright)

- Toda nova tela, componente de fluxo, checkout ou vitrine no frontend EXIGE a criação ou atualização de testes ponta a ponta com **Playwright**.
- O teste deve responder à pergunta fundamental: *"Como o usuário real interage com a tela?"*, cobrindo:
  - Seleção de serviço e profissional.
  - Escolha de data e horário disponível.
  - Visualização do resumo e cálculo do sinal Pix.
  - Feedback de sucesso ou exibição de mensagens humanizadas de erro.
- Execução com 100% de aprovação.

---

## 3. Testes Unitários e de Integração no Backend (Jest)

- Regras de negócio financeiras N1-N7, cálculos de split, geração de cobrança Pix e controle de concorrência devem possuir testes unitários e de integração (Jest) com mocks rigorosos de serviços externos (Asaas, Cloudinary, Brevo).
- Zero chamadas externas reais durante testes.

---

## 4. Proteção Absoluta contra Regressões

- Nenhuma alteração é aprovada se qualquer teste pré-existente falhar. A suíte completa deve permanecer 100% verde.
