# Regras de Segurança Zero-Trust & Prevenção de IDOR no AriseFit

A segurança do ecossistema AriseFit é fundamentada no princípio de desconfiança contínua (**Zero-Trust**). Todos os endpoints, controllers, serviços e fluxos devem cumprir as diretrizes abaixo:

---

## 1. Identidade e Propriedade Derivadas de Claims (Anti-IDOR)

1. **Nunca confie em identificadores fornecidos pelo cliente:**
   - NUNCA utilize `barbershopId`, `ownerId`, `userId`, `appointmentId` ou `professionalId` passados na rota, na URL, em query parameters ou no corpo da requisição para autorizar mutações ou leituras sensíveis.
2. **Extração Segura via Token:**
   - Toda identificação do usuário logado deve ser extraída estritamente a partir dos **Claims autenticados do token JWT** validado pelo `JwtAuthGuard`.
3. **Validação Explícita de Propriedade no Banco:**
   - Antes de qualquer atualização, exclusão ou visualização de dados de barbearia, o serviço deve validar via Prisma se o registro alvo realmente pertence ao usuário/organização autenticada (`where: { id, userId: req.user.id }`).

---

## 2. Contrato Financeiro Zero-Trust

1. **O Backend é a Única Fonte da Verdade Financeira:**
   - O frontend **nunca** calcula, define ou envia `servicePrice`, `downPaymentAmount`, `splitPercent` ou `platformTax` para gravação no banco de dados.
   - Qualquer payload de frontend que tentar injetar preços ou valores de sinal deve ser rejeitado ou ter os campos ignorados.
   - O backend recalcula e valida todos os valores monetários no momento exato do agendamento, consultando o banco de dados e aplicando as regras N1–N7.

---

## 3. Princípio Fail-Closed (Caminho Crítico Seguro)

- Em qualquer verificação de segurança, autenticação, autorização de acesso ou webhook financeiro, qualquer falha imprevista, timeout ou ausência de dados confirmatórios deve resultar em **Negação Imediata (Fail-Closed)**.
- Nunca assuma permissão na dúvida.

---

## 4. Sanitização de Respostas e Zero Vazamento

- Respostas de erro para o frontend nunca devem expor stack traces, strings de conexão, detalhes internos de queries Prisma ou segredos de infraestrutura.
- Endpoints de webhook (ex.: Asaas) devem validar tokens de assinatura de webhook antes de processar qualquer evento.
- Retorne erros HTTP padronizados (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`).

---

## 5. Governança Permanente de Sessão, Logout Atômico e RBAC

1. **Invalidação Atômica de Cache no Logout (`clearQueryCache`)**:
   - Todo fluxo de logout, expiração de sessão ou troca de conta no frontend **DEVE obrigatoriamente** invocar `clearQueryCache()` (`queryClient.cancelQueries()` + `queryClient.clear()`) e limpar `localStorage` (`@arisefit:token`, `@arisefit:refresh_token`, `@arisefit:user`) e `sessionStorage` de forma síncrona **antes** de qualquer chamada de rede (`POST /auth/logout` é *fire-and-forget*).
2. **Proteção Contra Race Condition (`sessionEpoch`)**:
   - Chamadas assíncronas de restauração (`/auth/me`) ou renovação (`/auth/refresh`) devem validar o contador `sessionEpoch` do `tokenStorage` antes de gravar novos tokens ou hidratar o estado do usuário, impedindo que respostas atrasadas ressuscitam uma sessão já encerrada.
3. **Revogação Imediata de Sessão no Backend (`sid` + `refreshToken`)**:
   - Tokens JWT emitidos pelo `AuthService.getTokens()` incluem a claim `sid` (UUID v4). A `JwtStrategy.validate()` verifica `if (payload.sid && !user.refreshToken)` e rejeita com `401 Unauthorized` qualquer `accessToken` cuja sessão tenha sido encerrada por logout, troca/redefinição de senha ou desativação de conta (`deactivateUser`).
4. **Guards de Rota por Role (`ProtectedRoute` e `PublicOnlyRoute`)**:
   - Rotas exclusivas de gestão (`/painel`, `/painel/:tab`) devem exigir `allowedRoles` explícitas no `<ProtectedRoute>`. Rotas públicas de autenticação (`/login`, `/cadastro`, `/cadastro/empresa`, `/cadastro/barbearia`) devem ser envolvidas por `<PublicOnlyRoute>`.
   - Componentes de layout compartilhados (`ClientPortalLayout`, `SiteHeader`, `DashboardSidebar`) nunca devem exibir chips de usuário ou botão `Sair` quando `isAuthenticated` for `false`, e ao acionar `Sair` devem redirecionar com `navigate('/login', { replace: true })`.
