# Memória Privada de Longo Prazo — Reviewer Gatekeeper

> **Aviso de Isolamento Estrito**: Este arquivo é de leitura e escrita **exclusiva** do `reviewer-gatekeeper`. Nenhum outro agente tem permissão para ler ou modificar este arquivo.
> **Regra de Conteúdo**: Registrar apenas aprendizados e lições duráveis de auditoria Dual-Gate, AppSec e qualidade (1 linha por tópico), nunca narrativas de entrega ou logs transitórios.

## Lições Duráveis de Auditoria Dual-Gate & AppSec
- O Reviewer é estritamente somente leitura no código de produção; nunca modifica ou corrige código diretamente, apenas reprova prescrevendo a correção.
- Gate 1: Rejeitar qualquer código que desvie da spec arquitetural, viole a frugalidade N1-N7 ou use padrões visuais fora do Design System (`.modal-card`).
- Gate 2: Verificar ativamente a prevenção de BOLA/IDOR; garantir que `companyId`, `userId` ou `role` venham estritamente do token JWT assinado.
- Impedir Mass Assignment verificando se os DTOs do NestJS possuem `whitelist: true`, `forbidNonWhitelisted: true` e decoradores `class-validator` adequados.
- Exigir testes unitários/integração para toda camada de backend modificada e testes Playwright E2E para novas interações de usuário no frontend.
- Ao reprovar com `CHANGES_REQUESTED`, preencher a causa raiz isolada e a correção prescritiva no `Log de Ciclos de Correção` e incrementar o contador do dossiê.
- Política de commits: 1 commit semântico por arquivo modificado seguindo Conventional Commits em português.
- Em refatorações de linguagem na UI que toquem formulários de serviço, auditar se helpers de estimativa (`estimateDeposit`) são puramente visuais e se campos de porcentagem (`downPaymentPercent`) são normalizados para o domínio estrito `[30, 50]` do DTO do backend, preservando textos invariantes de suítes E2E legadas.
- Em correções de pipeline de compilação NestJS no Windows, auditar se `deleteOutDir: false` (`nest-cli.json`) e `incremental: false` (`tsconfig.build.json`) estão cobertos por testes de regressão automatizados para prevenir omissão de emissão de módulos CommonJS (`MODULE_NOT_FOUND`).
- Em scripts orquestradores de ambiente local multiplataforma, auditar se comandos de encerramento (`taskkill`) operam estritamente sobre PIDs numéricos nativos (`ChildProcess.pid`) imunes a injeção, se o streaming de logs usa `readline` com descarte imediato (evitando memory leaks no heap) e se scripts de conveniência em PowerShell validam pré-requisitos no PATH.
- Em auditorias de autenticação, sessão e logout, verificar se o frontend limpa sincronamente `tokenStorage`, `sessionStorage` e `queryClient` antes da chamada HTTP, usa contador monotônico (`sessionEpoch`) contra race conditions de `/auth/me` e `/auth/refresh` in-flight, e se o backend invalida imediatamente tokens JWT com claim `sid` quando `user.refreshToken` é nulo.
- Em auditorias de revogação de sessão via JWT, validar se a persistência vincula o Session ID ativo em formato canônico delimitado (`${sid}:${hash}`), se `JwtStrategy` rejeita estritamente tokens zumbis de logins anteriores quando `activeSid !== payload.sid`, e se a rotação de refresh token utiliza trava otimista condicional em `updateMany` contra condições de corrida concorrente com logout.
