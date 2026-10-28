# Memória Privada de Longo Prazo — FinOps & Frugal DBA

> **Aviso de Isolamento Estrito**: Este arquivo é de leitura e escrita **exclusiva** do `finops-frugal-dba`. Nenhum outro agente tem permissão para ler ou modificar este arquivo.
> **Regra de Conteúdo**: Registrar apenas aprendizados e lições duráveis de frugalidade, modelagem e finanças (1 linha por tópico), nunca narrativas de entrega ou logs transitórios.

## Lições Duráveis de Frugalidade & Banco de Dados (N1 a N7)
- N1: Proibido criar tabelas, colunas ou índices especulativos no Prisma sem caso de uso explícito e imediato.
- N2: Alterações de schema no Prisma devem respeitar o protocolo Expand & Contract para garantir zero-downtime.
- N3: Em consultas Prisma, sempre utilizar `select` explícito de colunas, paginação com `take`/`skip` e limitar filtros `in` a no máximo 50 itens.
- N4: Streaming e buffers devem ser desalocados prontamente para prevenir memory leaks em instâncias de VPS enxutas.
- N5: Tabelas de logs ou transações devem prever índices temporais compostos e políticas de expiração/retenção.
- N6: A capacidade nominal de usuários simultâneos deve ser calculada por: `active_users = (RPS * 60) / actions_per_minute * 0.70`, garantindo TTFB < 200ms.
- N7: O backend é a única autoridade financeira do sistema; regras N1-N7 de sinal Pix (100% < R$15, 50% até R$399,99, flexível >= R$400) e split de pagamento são invioláveis.
- Hold de 15 minutos (`expiresAt`) em agendamentos pendentes deve ser garantido para evitar retenção indefinida de vagas.
- Em formulários de serviço na UI, `downPaymentPercent` enviado ao backend deve ser normalizado para `[30, 50]` (30 apenas se `totalPrice >= 400`), enquanto `estimateDeposit` é usado exclusivamente para exibição visual (incluindo o sinal automático de 100% para serviços < R$ 15,00), sem jamais enviar valores calculados para persistência.
- N5 (Disco & Build I/O): No Nest CLI em Windows, manter `deleteOutDir: false` em `nest-cli.json` e `incremental: false` em `tsconfig.build.json` evita I/O destrutivo concorrente sobre `dist/` e omissão de módulos por `.tsbuildinfo` defasado.
- Tooling/Orquestração: Orquestradores em puro Node.js com streaming `node:readline` linha a linha evitam injeção de dependências pesadas na raiz e garantem consumo previsível de RAM (RSS < 25MB) sem retenção cumulativa de logs.
- Hold de 15 minutos de veto: Deve ser formalmente dispensado com justificativa técnica sempre que a demanda tratar exclusivamente de Developer Experience / automação local ou segurança de sessão sem tocar em persistência ou precificação.
- Revogação JWT Frugal (N1/N3/N4): A revogação imediata de `access_token` pós-logout deve reutilizar a coluna `User.refreshToken` já lida no PK lookup de `JwtStrategy.validate` combinada ao claim `sid` (`if (payload.sid && !user.refreshToken)`), evitando tabelas de blacklist, instâncias Redis extras ou queries adicionais, enquanto no frontend `queryClient.clear()` e `sessionEpoch` liberam imediatamente a RAM.
- Anti-Zombie Session & Corrida Otimista Frugal (N1/N3): Armazenar `${sid}:${hash}` (97 chars) na coluna existente `User.refreshToken` (`text`) resolve Zombie Session Revival no re-login sem migrations DDL nem TOAST heap overhead, enquanto `prisma.user.updateMany` condicionado ao `refreshToken` lido atua como trava otimista atômica contra corrida entre logout e refresh sem distributed locks.
- Persistência Mobile Offline-First & Economia Gamificada (N1–N7): Em apps React Native com `AsyncStorage`, limitar o histórico a 365 registros (`~132 KB/ano`), proibir geração de missões retroativas em hiatos de inatividade, agrupar escritas JSON apenas em transições de domínio e aplicar tripla trava de idempotência (`rewardClaimed`, `status === 'COMPLETED'` e `questId` no histórico) garante 60 FPS (`< 16ms`), zero crash por JSON corrompido e zero inflação de recompensas.
