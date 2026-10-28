---
name: multitenant-saas-security-specialist
description: Especialista em arquitetura e segurança defensiva/ofensiva para sistemas SaaS Multi-Tenant no AriseFit. Aplica defesa em 7 camadas contra vazamentos de dados entre tenants (Cross-Tenant Data Leakage), spoofing de host, replay de token e ataque de vizinho barulhento.
---

# Multi-Tenant SaaS Security Specialist — AriseFit

Esta skill orienta o **Principal Engineer**, **Developer**, **Reviewer Gatekeeper** e **QA Engineer** na aplicação rigorosa do modelo de isolamento e segurança multi-tenant no ecossistema AriseFit.

---

## 🏛️ Defesa em Profundidade em 7 Camadas (Padrão Enterprise)

### Camada 1: Anti-Host & Header Spoofing (`TrustedProxies`)
- **Vulnerabilidade**: Invasor envia headers forjados como `X-Forwarded-Host`, `X-Original-Host` ou `Host` para enganar o resolver de tenant e resolver para o tenant da vítima.
- **Diretriz Mandatória**:
  - Configurar proxies reversos confiáveis estritos no NestJS / Express (`app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal'])`).
  - Nunca resolver `companyId` ou tenant a partir de headers customizáveis pelo cliente sem validação contra lista estrita de domínios permitidos.

### Camada 2: Binding Estrito `Token JWT ↔ Tenant Resolvido ↔ Sessão Ativa` (Fail-Closed)
- **Vulnerabilidade**: *Cross-Tenant Token Replay*. O usuário possui uma conta legítima na Empresa A, extrai o token JWT e tenta utilizá-lo para acessar endpoints da Empresa B passando `slug=empresa-b` na URL ou header.
- **Diretriz Mandatória**:
  - Todo Guard de autenticação deve validar se o `companyId` da URL/recurso coincide estritamente com o `companyId` ou vínculo de empresa contido nos claims criptográficos do token JWT autenticado (`req.user.companyId` ou autorização de empresa).
  - Em caso de divergência, rejeitar sumariamente com HTTP 403 Forbidden em modo *Fail-Closed*.

### Camada 3: Segregação Rígida de Superfícies Admin vs Tenant (Prevenção BFLA)
- **Vulnerabilidade**: Broken Function Level Authorization. Usuários com papel `COMPANY_OWNER` ou `EMPLOYEE` acessando endpoints administrativos globais (`SUPER_ADMIN`).
- **Diretriz Mandatória**:
  - Decoradores `@Roles(Role.SUPER_ADMIN, Role.ADMIN)` obrigatórios em controllers administrativos de escopo de plataforma.
  - O isolamento deve ser validado via Guard antes mesmo de instanciar a lógica de negócio do serviço.

### Camada 4: Prevenção de Context Bleeding em Background Jobs, Filas e Caches
- **Vulnerabilidade**: Vazamento de contexto assíncrono. Jobs agendados (`@Cron`) ou filas compartilhadas executando no contexto do tenant anterior por reutilização de instâncias singleton ou cache global.
- **Diretriz Mandatória**:
  - Todo job assíncrono deve receber o `tenantId` explicitamente no payload do job e inicializar um contexto limpo.
  - Toda chave de cache (Redis ou em memória) DEVE conter o prefixo do tenant: `tenant:{companyId}:chave`.

### Camada 5: Separação Criptográfica por Tenant (AEAD `AES-256-GCM` com AAD)
- **Vulnerabilidade**: Transplante de ciphertext entre tenants (Cross-Tenant Ciphertext Splicing). Um dado criptografado da Empresa A é injetado no banco da Empresa B.
- **Diretriz Mandatória**:
  - Toda cifra autenticada em repouso deve derivar chave via `HKDF-SHA256(masterKey, tenantId)` OU passar o `companyId` como *Additional Authenticated Data* (AAD) no algoritmo `AES-256-GCM`.
  - Se o ciphertext for transportado para outro tenant, a decriptação falhará imediatamente devido ao mismatch do AAD.
  - Bloqueio automático de chaves padrão (`secret`, `changeme`) em ambiente de produção.

### Camada 6: Proteção Anti-Noisy-Neighbor (Rate Limit Particionado por Tenant)
- **Vulnerabilidade**: Um tenant sob ataque de negação de serviço ou script mal-otimizado esgota o pool de conexões do PostgreSQL ou a quota do gateway Asaas de todos os demais clientes.
- **Diretriz Mandatória**:
  - Rate limiting particionado por tenant (`ThrottlerGuard` chaveado por `companyId` + IP).
  - Limite estrito de concorrência por tenant em operações pesadas.

### Camada 7: Deprovisioning Seguro sem Dados Órfãos
- **Vulnerabilidade**: Cancelamento de conta que deixa registros órfãos ou dados acessíveis por novos cadastros que reutilizem o mesmo slug.
- **Diretriz Mandatória**:
  - Soft delete com flag `disabledAt` / `isActive: false` e renomeação de slug para liberar o identificador de forma segura.
  - Varredura de integridade referencial para impedir recuperação inadvertida de histórico sensível.

---

## 🔍 Referências Técnicas
Para o catálogo completo de testes automatizados e vetores de ataque `MT-01` a `MT-07`, consulte:
[references/multitenant-attack-vectors-and-tests.md](file:///references/multitenant-attack-vectors-and-tests.md).
