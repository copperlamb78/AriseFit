# Template de Especificação Financeira & DoR — FinOps & Frugal DBA

> **Autor:** 💰 FinOps & Frugal DBA  
> **Feature:** [Nome da Funcionalidade]  
> **Referência:** `docs/specs/<feature>-architecture.md`  
> **Data:** YYYY-MM-DD  
> **Status:** `APPROVED_DOR` | `CHANGES_REQUESTED`

---

## 1. Validação das Regras Financeiras N1–N7
- [ ] **N1 — Cálculo do Sinal Pix:**
  - Menor que R$ 15,00: 100% compulsório.
  - R$ 15,00 a R$ 399,99: 50% automático.
  - Maior ou igual a R$ 400,00: 50% ou 30% flexível.
- [ ] **N2 — Taxa da Plataforma & Split Asaas:** Divisão percentual e subcontas validadas.
- [ ] **N3 — Hold de 15 Minutos:** Reserva com expiração em `expiresAt`.
- [ ] **N4 — Escrow (Custódia):** Sinal retido até conclusão do serviço (`COMPLETED`).
- [ ] **N5 — Zero Trust Financeiro:** Valores calculados exclusivamente no backend; zero valores gravados a partir de payload do frontend.

---

## 2. Auditoria Frugal de Banco de Dados (Prisma/PostgreSQL)
- [ ] **Zero Poluição:** Nenhuma coluna, tabela ou relação desnecessária criada.
- [ ] **Queries sem Tracking & Projeção Seletiva:** Uso obrigatório de `select` cirúrgico.
- [ ] **Paginação no Motor:** Uso de `skip` e `take`.
- [ ] **Índices Criados:** Índices em foreign keys e filtros frequentes.

---

## 3. Capacity Planning & Dimensionamento
- **Meta de TTFB:** < 200ms sob estresse.
- **RPS Estimado:** X requisições/segundo.
- **Usuários Ativos Simultâneos Suportados:**
  `active_users = ((RPS * 60) / actions_per_minute) * 0.70`

---

## 4. Veredito de DoR
- **STATUS:** `APPROVED_DOR` (Liberado para implementação pelo Desenvolvedor)
