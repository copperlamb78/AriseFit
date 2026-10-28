# Memória Privada de Longo Prazo — Developer

> **Aviso de Isolamento Estrito**: Este arquivo é de leitura e escrita **exclusiva** do `developer`. Nenhum outro agente tem permissão para ler ou modificar este arquivo.
> **Regra de Conteúdo**: Registrar apenas aprendizados e lições duráveis de implementação, design system e APIs (1 linha por tópico), nunca narrativas de entrega ou logs transitórios.

## Lições Duráveis de Implementação & Frontend/Backend
- O frontend NUNCA calcula nem envia `servicePrice`, `downPaymentAmount` ou `platformTax` para gravação no banco de dados.
- Todo modal no frontend DEVE obrigatoriamente seguir a estrutura canônica `.modal-card` com header fixo (`shrink-0`), corpo rolável (`flex-1 overflow-y-auto min-h-0`) e rodapé fixo (`shrink-0`).
- Proibido usar elementos HTML nativos (`<button>`, `<input>`) diretamente nas telas; utilizar sempre os componentes do Design System oficial (`src/design-system/ui/`).
- Em chamadas de API assíncronas no frontend, renderizar sempre Loading Skeletons e fornecer Empty States acolhedores com ação clara de CTA.
- Proibido engolir erros em blocos `catch` silenciosos; todo erro deve ser devidamente tratado e propagado de forma sanitizada.
- Verificar a existência e tipagem dos endpoints no backend antes de conectá-los na interface gráfica.
- Touch targets em interfaces móveis devem ter no mínimo 44x44px para telas entre 360px e 430px de largura.
- O Developer NUNCA executa `git commit`; os commits são auditados e liberados pelo Reviewer e QA.
- Evitar símbolos matemáticos (`≥`, `<`, `>`, `&ge;`, `&gt;`) e jargões técnicos (`Hold`, `Escrow`, `No-Show`, `Regras N1–N7`, `vacância`, `ICS`) em rótulos de UI; usar sempre português claro e cotidiano.
- No envio de criação/edição de serviços (`DashboardServicesView.tsx`), normalizar defensivamente `downPaymentPercent` para `30` (se `totalPrice >= 400 && downPaymentPercent === 30`) ou `50` para respeitar `@IsIn([30, 50])` do backend, usando `estimateDeposit` na UI para exibir 100% em serviços `< R$ 15,00`.
- No backend NestJS em Windows (`api-arisefit`), manter `"deleteOutDir": false` em `nest-cli.json` e `"incremental": false` em `tsconfig.build.json` para evitar `MODULE_NOT_FOUND` por condição de corrida ou cache `.tsbuildinfo` órfão durante `nest start --watch`.
- Em orquestradores de desenvolvimento multiplataforma (`scripts/dev.js`), spawns com shell no Windows exigem `taskkill /pid <PID> /T /F` para encerrar toda a árvore de processos descendentes e liberar portas de rede (ex.: 3000 e 5173).
- O consumo de streams `stdout`/`stderr` de subprocessos com `node:readline` (`crlfDelay: Infinity`) garante logs multiplexados sem corrupção de quebra de linha e previne memory leak no heap.
- Flags como `--check` ou `--dry-run` em scripts de orquestração viabilizam validação rápida de sintaxe e pré-requisitos em pipelines de CI e testes automatizados.
- No logout do frontend (`AuthContext.tsx`), executar a limpeza local (`tokenStorage.clear()`, `clearQueryCache()`, `setToken(null)`, `setUser(null)`) de forma síncrona antes do disparo fire-and-forget `void authService.logout(currentToken)` e proteger `/auth/me` e `/auth/refresh` com contador monotônico `sessionEpoch` para impedir que respostas in-flight atrasadas ressuscitam sessões encerradas.
- Em `PublicOnlyRoute`, distinguir se o usuário já entrou autenticado na rota (`!enteredUnauthenticated.current` -> `<Navigate>` imediato) ou se acabou de autenticar via formulário na própria página (`LoginForm` / `RegisterCompanyForm`), permitindo que o `navigate()` pós-submit do formulário conduza ao destino específico sem hijack.
- O armazenamento frugal de tokens no formato `${sid}:${hash}` na coluna `User.refreshToken` elimina a vulnerabilidade de revivescência de sessão em novo login sem exigir DDL ou tabelas adicionais.
- A trava otimista via `prisma.user.updateMany({ where: { id, isActive: true, refreshToken: user.refreshToken }, data: ... })` previne que renovações simultâneas de tokens restaurem sessões encerradas por logout concorrente.
- Em testes de autorização e anti-IDOR, o isolamento estrito é comprovado quando queries filtradas por chave primária e tenant do token retornam `404 Not Found` (fail-closed), sem expor metadados de existência do recurso a terceiros.
- Em apps mobile offline-first (React Native + Zustand + AsyncStorage), combinar trava síncrona em memória com verificação tripla de idempotência no domínio (`rewardClaimed`, `status === 'COMPLETED'` e `questId` no histórico) impede duplicação de recompensas em duplo toque concorrente e garante recuperação segura contra JSON corrompido.
- Em projetos com `expo-router@4.0.x` e `@react-navigation/core@7.16.x`, declarar explicitamente `"query-string": "7.1.3"` em `dependencies` do `package.json` para que o Metro Bundler (`npx expo export --platform android`) resolva `expo-router/build/fork/getPathFromState.js`.
