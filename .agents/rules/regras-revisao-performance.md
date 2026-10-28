# Regras de Performance, Frugalidade e FinOps no AriseFit

A eficiência de recursos em ambas as camadas (`api-arisefit/` e `frontend-arisefit/`) é inegociável para garantir sustentabilidade orçamentária e alta densidade de usuários simultâneos em infraestrutura econômica.

---

## 1. Diretrizes no Backend (NestJS + Prisma + PostgreSQL)

1. **Zero Bloqueios Síncronos:** Toda operação de I/O (consultas Prisma, chamadas HTTP ao Asaas/Brevo/Cloudinary, leitura de disco) deve ser assíncrona pura com `async/await`.
2. **Projeções Cirúrgicas no Prisma:**
   - Evite `findMany()` sem cláusula `select` trazendo modelos relacionais pesados inteiros para a memória.
   - Projete apenas as colunas consumidas pelo DTO de resposta.
3. **Paginação Mandatória no Banco:**
   - É terminantemente proibido carregar listas inteiras para filtrar ou ordenar em memória Node.js.
   - Aplique sempre paginação no banco de dados via `skip` e `take`.
4. **Prevenção Ativa de N+1:**
   - Utilize `include` criterioso ou queries em lote para relacionamentos (ex.: carregar barbeiros e serviços em uma única rodada).
5. **Pool de Conexões Saudável:**
   - Fechar conexões e evitar transações de banco de dados prolongadas que travem conexões do pool PostgreSQL.

---

## 2. Diretrizes no Frontend (React 19 + TanStack Query)

1. **Debounce em Entradas de Busca:**
   - Campos de busca textual de barbearias ou serviços devem possuir debounce mínimo de **300ms** para evitar rajadas de requisições à API.
2. **Cache Eficiente com TanStack Query:**
   - Configurar `staleTime` e políticas de invalidação cirúrgicas para evitar requisições redundantes de dados estáticos (ex.: catálogo de serviços da barbearia).
3. **Prevenção de Vazamento de Memória:**
   - Limpeza obrigatória de timers (`setInterval`, `setTimeout`) e cancelamento de requisições de controllers `AbortController` na desmontagem de componentes.

---

## 3. Checklist Pré-Commit de Performance

- [ ] Queries Prisma com `select` cirúrgico e paginação (`skip`/`take`) no banco?
- [ ] Eliminação de consultas N+1?
- [ ] Chamadas assíncronas puras sem bloqueio da event loop do Node?
- [ ] Frontend com debounce de 300ms em buscas e cache apropriado?
- [ ] Timers e inscrições desmontados corretamente?
