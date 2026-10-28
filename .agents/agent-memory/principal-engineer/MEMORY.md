# Memória Privada de Longo Prazo — Principal Engineer

> **Aviso de Isolamento Estrito**: Este arquivo é de leitura e escrita **exclusiva** do `principal-engineer`. Nenhum outro agente tem permissão para ler ou modificar este arquivo.
> **Regra de Conteúdo**: Registrar apenas aprendizados e lições duráveis de arquitetura (1 linha por tópico), nunca narrativas de entrega ou logs transitórios.

## Lições Duráveis de Arquitetura & Governança
- Multi-tenancy no AriseFit é baseado em `Company` e `User`; nunca confiar em `companyId` vindo do body em rotas autenticadas, extrair sempre de claims JWT validados.
- O Principal Engineer é o único agente com permissão para interagir diretamente com o usuário usando a ferramenta nativa `ask_question`.
- Toda nova interface ou tela exige prévia verificação das entidades e rotas reais em `api-arisefit/src/modules/` antes de qualquer especificação de UI.
- Pelo menos 50% dos cenários de teste mapeados na spec de arquitetura devem cobrir caminhos infelizes, resiliência, fallbacks de gateway e timeouts.
- Manter o TTFB da API abaixo de 200ms com endpoints projetados de forma frugal e paginação no banco de dados.
- Em textos de interface voltados a usuários finais (clientes e barbeiros), proibir símbolos matemáticos (`≥`, `<`, `>`) e jargões internos (`Regras N1–N7`, `Hold`, `Escrow`, `No-Show`, `status COMPLETED`), priorizando sempre português natural e direto.
- O DTO `CreateServiceDto` (`api-arisefit`) aceita exclusivamente `@IsIn([30, 50])` para `downPaymentPercent` (pois 100% é aplicado automaticamente pelo `CalculateDeposit` para serviços `< R$ 15,00`); o frontend deve normalizar o payload para `30` ou `50` antes do envio HTTP.
- Em projetos NestJS no Windows, combinar `"deleteOutDir": true` (`nest-cli.json`) com `"incremental": true` (`tsconfig.json`) causa omissão de arquivos `.js` em `dist/` (`MODULE_NOT_FOUND`) durante `nest start --watch`; manter `"deleteOutDir": false` e `"incremental": false` em `tsconfig.build.json`.
- Em scripts orquestradores de inicialização concorrente no Windows, o encerramento com `child.kill()` mata apenas o wrapper do shell deixando netos (Node/Vite) travando portas; usar `taskkill /pid <PID> /T /F` no encerramento para garantir liberação imediata das portas 3000 e 5173.
- No logout do frontend (`AuthContext`), sempre limpar sincronamente `tokenStorage` (`localStorage` + `sessionStorage`), incrementar `sessionEpoch` monotônico (para descartar respostas in-flight de `getMe()`/`refresh`) e executar `queryClient.clear()` antes de disparar `POST /auth/logout` em background e redirecionar com `navigate('/login', { replace: true })`.
- Para revogação real-time de `access_token` em `JwtStrategy.validate` sem migration nem revivescência indevida de sessões antigas pós novo login (anti-zombie token), armazenar `${sid}:${hash}` em `user.refreshToken`, validar `activeSid === payload.sid` no guard e proteger corrida de logout vs refresh usando travamento otimista com `prisma.user.updateMany({ where: { id: userId, isActive: true, refreshToken: user.refreshToken }, ... })`.
- Em aplicativos mobile React Native + Expo offline-first com missões diárias, isolar 100% das regras de progressão, recompensas idempotentes e datas locais (`YYYY-MM-DD` via `getFullYear`/`getMonth`/`getDate`, nunca `toISOString`) em funções puras em `src/domain/rules/` e versionar o estado no `AsyncStorage` com fallback seguro contra JSON corrompido e sem gerar missões retroativas para dias sem uso.
