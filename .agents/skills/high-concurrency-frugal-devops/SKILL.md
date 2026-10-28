---
name: high-concurrency-frugal-devops
description: >-
  Especialista em dimensionamento de capacidade, alta concorrência de agendamentos,
  testes de estresse e otimização de infraestrutura em VPS enxuta para o AriseFit.
---

# ⚡ High-Concurrency & Frugal DevOps Specialist — AriseFit

Especialista em testes de carga, benchmarking e capacity planning para maximizar a densidade de usuários ativos simultâneos em infraestrutura econômica no ecossistema AriseFit.

---

## 🎯 Fórmulas e Critérios de Dimensionamento

1. **Fórmula de Usuários Ativos Simultâneos Suportados:**
   ```text
   active_users = ((RPS * 60) / actions_per_minute) * 0.70
   ```
   - Onde o fator `0.70` representa a margem de segurança operacional (headroom de 30% para rajadas inesperadas).

2. **Metas de Latência e Performance:**
   - **TTFB (Time to First Byte):** < 200ms sob estresse moderado.
   - **Latência P95:** < 500ms sob carga de pico em endpoints de consulta de slots e storefront.
   - **Pool de Conexões Prisma/PostgreSQL:** Limite estrito de conexões simultâneas para evitar exaustão de sockets.

3. **Métricas de FinOps:**
   - Custo monetário por 1.000 requisições (R$).
   - Custo mensal por barbearia / tenant ativo (R$).
   - Zero desperdício de memória RAM por conexão inativa.
