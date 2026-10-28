# Especificação de Arquitetura Técnica & DoR — `mvp-mobile-arisefit`

- **Slug da Demanda**: `mvp-mobile-arisefit`
- **Agente Responsável**: 🏛️ Principal Engineer (`principal-engineer`)
- **Data**: `2026-10-27`
- **Status do Artefato**: `STATUS: READY_FOR_FINOPS`
- **Plataforma Alvo**: Aplicativo Mobile Nativo (React Native + Expo SDK 52/54 + TypeScript Strict + Expo Router + Zustand + AsyncStorage)

---

## 1. Visão Geral de Negócio e Arquitetura da Solução

O **AriseFit** é um aplicativo mobile nativo de evolução física gamificada inspirado conceitualmente no **"Sistema" de Solo Leveling**. O usuário atua como um **Jogador (Caçador)** convocado pelo Sistema para cumprir uma **Missão Diária de Treinamento Calistênico** composta por 4 exercícios fundamentais (Flexões, Agachamentos, Abdominais e Polichinelos).

### 1.1 Diretrizes Arquiteturais Inegociáveis
1. **100% Mobile Nativo (Zero Web/HTML)**:
   - Construído exclusivamente com primitivos nativos do `react-native` (`View`, `Text`, `Pressable`, `TextInput`, `ScrollView`, `Modal`, `SafeAreaView`, `StyleSheet`).
   - **Proibição Absoluta**: É terminantemente proibido utilizar tags HTML (`div`, `span`, `button`, `input`, `section`, `p`, `h1`) ou CSS Web/Tailwind.
2. **Arquitetura Offline-First Sem Backend**:
   - Todo o estado do jogador, missão ativa, progressão adaptativa e histórico imutável é persistido localmente no dispositivo via `@react-native-async-storage/async-storage`, encapsulado por um repositório tipado, versionado e resiliente a corrupção (`StorageRepository`).
3. **Separação Estrita entre Domínio Puro e UI**:
   - Todas as regras de negócio (progressão em degraus, multiplicador 10x de polichinelos, cálculo de Rank `E` a `S`, cálculo de XP/Nível, idempotência de recompensas, alocação de atributos e transição de dia local) residem em funções puras e determinísticas em `src/domain/rules/`, 100% livres de dependências de React ou armazenamento, permitindo testes unitários instantâneos e determinísticos.
4. **Tipagem Estrita (`strict: true`)**:
   - Zero `any`, zero `@ts-ignore`, zero non-null assertions (`!`) em estado reativo.

---

## 2. Estrutura de Diretórios Canônica

```text
AriseFit/
├── app.json                                   # Configuração Expo (dark mode, orientação portrait, scheme arisefit)
├── babel.config.js                            # Configuração Babel para Expo Router
├── jest.config.js                             # Configuração Jest para testes de domínio, store e resiliência
├── package.json                               # Dependências React Native, Expo, Expo Router, Zustand, AsyncStorage, Jest
├── tsconfig.json                              # TypeScript em modo estrito (strict: true, path alias @/* -> src/*)
├── src/
│   ├── app/                                   # Rotas Expo Router (File-based Routing)
│   │   ├── _layout.tsx                        # Root Layout: hidratação segura da store, StatusBar light, SafeArea
│   │   └── (tabs)/                            # Navegação Principal em 4 Abas (HUD do Sistema)
│   │       ├── _layout.tsx                    # Tab Bar customizada estilo HUD Solo Leveling
│   │       ├── index.tsx                      # Tela 1: Painel do Sistema (Home / Status do Caçador + Resumo)
│   │       ├── daily-quest.tsx                # Tela 2: Missão Diária (Execução dos 4 exercícios, Desfazer e Conclusão)
│   │       ├── progression.tsx                # Tela 3: Progressão & Atributos (Alocação STR/AGI/VIT, Degraus e Ranks)
│   │       └── profile.tsx                    # Tela 4: Perfil & Histórico Imutável de Missões e Recompensas
│   ├── components/
│   │   ├── ui/                                # Primitivos do Design System (SystemButton, SystemCard, SystemBadge, SystemModal, ProgressBar, NumericInput)
│   │   ├── system/                            # Componentes temáticos Solo Leveling (SystemHeader, RankCrest, LevelProgressHud, SystemAlertBanner)
│   │   ├── quests/                            # Componentes de Missão (ExerciseQuestCard, QuestCompletionModal, TargetEvolutionPrompt)
│   │   ├── rewards/                           # Componentes de Recompensa (RewardSummaryCard, AttributeAllocatorRow)
│   │   └── profile/                           # Componentes de Histórico (HistoryTimelineItem, HunterStatsSummary)
│   ├── features/
│   │   ├── quests/                            # Orquestração visual e hooks de interação da Missão Diária
│   │   ├── progression/                       # Orquestração visual de evolução de metas, Ranks e atributos
│   │   ├── rewards/                           # Lógica de apresentação de conquistas e tesouros do Sistema
│   │   └── profile/                           # Apresentação de estatísticas acumuladas e histórico filtrado
│   ├── domain/
│   │   ├── models/                            # Interfaces e Tipos Estritos do Domínio
│   │   │   └── system.models.ts               # ExerciseId, RankTier, AttributeKey, DailyQuest, PlayerStats, PersistedAppState
│   │   └── rules/                             # Funções Puras e Determinísticas (100% Testáveis sem mocks de UI)
│   │       ├── progression.rules.ts           # Degraus 5..100, getNextStep, calculateRankFromBaseTarget, multiplicador 10x
│   │       ├── quest.rules.ts                 # Criação de missão, validação de repetições, desfazer, detecção de superação
│   │       ├── reward.rules.ts                # Recompensas idempotentes (+XP, +Gold, +3 Pts), cálculo de nível e alocação STR/AGI/VIT
│   │       └── date.rules.ts                  # getLocalDateKey (YYYY-MM-DD local), transição de dia sem retroativos infinitos
│   ├── services/
│   │   └── storage/                           # Persistência Local Estruturada e Resiliente
│   │       └── storage.repository.ts          # Leitura/escrita versionada no AsyncStorage, sanitização e fallback contra JSON corrompido
│   ├── store/                                 # Gerenciamento de Estado Global (Zustand)
│   │   └── useSystemStore.ts                  # Store com locks contra duplo clique, sincronização de data e persistência atômica
│   ├── hooks/                                 # Hooks Customizados
│   │   └── useDailySync.ts                    # Sincronização automática ao montar app / trocar dia local
│   ├── theme/                                 # Design System Tokens
│   │   └── tokens.ts                          # Paleta de cores oficial, espaçamento (múltiplos de 4), tipografia, bordas e sombras
│   └── utils/                                 # Utilitários Puros
│       └── validation.ts                      # Sanitização numérica inteira, clamp e formatação de números/datas
└── tests/                                     # Suíte Automatizada Jest (Domínio, Integração de Store/Storage e Caos)
    ├── domain-progression-and-ranks.spec.ts   # Testes de degraus 5..100, teto 100/1000 e Ranks E..S
    ├── domain-quests-and-rewards.spec.ts      # Testes de execução, desfazer, escolha de evolução, idempotência e atributos
    └── storage-and-chaos-resilience.spec.ts   # Testes de JSON corrompido, schema incompatível, virada de dia e corrida de cliques
```

---

## 3. Design System — Dark Fantasy Futurista ("O Sistema")

A identidade visual reproduz as janelas holográficas azuis/ciano translúcidas sobre fundo abissal características do Sistema de *Solo Leveling*, garantindo legibilidade imediata durante o treino físico e contraste WCAG AAA.

### 3.1 Tokens de Cores Oficiais (`src/theme/tokens.ts`)

| Token Semântico | Hexadecimal | Uso Arquitetural na Interface Nativa |
| :--- | :---: | :--- |
| `backgroundPrimary` | `#080B14` | Fundo principal abissal de todas as telas (`SafeAreaView` / `ScrollView`) |
| `backgroundSecondary` | `#0D1220` | Fundo de seções secundárias, barras de navegação e containers internos |
| `surfaceCard` | `#111827` | Superfície padrão dos cards de exercício, status e histórico |
| `surfaceElevated` | `#172238` | Superfície elevada para modais do Sistema, cabeçalhos ativos e inputs |
| `borderSubtle` | `#25334B` | Bordas técnicas de painéis, divisores HUD e contornos inativos |
| `textPrimary` | `#F4F7FF` | Texto principal, títulos, contadores de repetições e valores de atributos |
| `textSecondary` | `#9AA9C2` | Rótulos técnicos, subtítulos, descrições e metadados de datas |
| `accentCyan` | `#00E5FF` | Brilho principal do Sistema, bordas de foco, progresso ativo e destaques |
| `accentBlue` | `#3B82F6` | Ações primárias do Sistema, preenchimento de barras e badges secundários |
| `statusSuccess` | `#4ADE80` | Exercício concluído, missão diária completa e confirmação de evolução |
| `statusWarning` | `#FBBF24` | Alerta de missão pendente, superação de meta aguardando decisão e streak |
| `statusDanger` | `#F87171` | Mensagens de erro de validação, aviso de falha/penalidade e ações de reset |

### 3.2 Sistema de Espaçamento, Tipografia, Bordas e Elevação
- **Espaçamento (Grid Estrito em Múltiplos de 4)**:
  - `spacing`: `{ xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 40, massive: 48 }`.
- **Tipografia Hierárquica**:
  - `xs`: `12px` (lineHeight `16px`, letterSpacing `0.8px`, uppercase para rótulos de HUD `[SISTEMA]`)
  - `sm`: `14px` (lineHeight `20px`, corpo técnico secundário)
  - `md`: `16px` (lineHeight `24px`, corpo principal e inputs)
  - `lg`: `20px` (lineHeight `28px`, títulos de cards e exercícios)
  - `xl`: `24px` (lineHeight `32px`, títulos de janelas do Sistema)
  - `xxl`: `32px` (lineHeight `40px`, números de Nível, Rank e contadores principais)
- **Bordas e Raios (`radii`)**:
  - `{ sm: 4, md: 8, lg: 12, xl: 16, pill: 9999 }` com `borderWidth: 1` (padrão) ou `1.5` (painel ativo com `#00E5FF`).
- **Touch Targets e Ergonomia Mobile**:
  - Todo `Pressable` interativo possui `minHeight: 48` e `minWidth: 48` (superando o mínimo de 44x44dp para operação fácil mesmo com mãos suadas durante o treino).
- **Padrão de Modais Nativos (`SystemModal`)**:
  - Construído com `<Modal transparent animationType="fade">` do `react-native`, contendo cabeçalho fixo (`flexShrink: 0`), corpo rolável (`ScrollView` flexível) e rodapé fixo de ações (`flexShrink: 0`).

---

## 4. Modelagem de Dados e Regras de Domínio Puras

### 4.1 Modelos de Dados (`src/domain/models/system.models.ts`)

```typescript
export type ExerciseId = 'pushups' | 'squats' | 'situps' | 'jumping_jacks';

export type RankTier = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export type AttributeKey = 'STR' | 'AGI' | 'VIT';

export type DailyQuestStatus = 'IN_PROGRESS' | 'COMPLETED';

export type ProgressionChoice =
  | 'ACCEPT_NEW_TARGET'
  | 'KEEP_CURRENT_TARGET'
  | 'NOT_APPLICABLE';

export interface ExerciseProgress {
  id: ExerciseId;
  name: string;
  unitLabel: string;
  multiplier: 1 | 10;
  targetReps: number;      // Meta do dia (5..100 para base; 50..1000 para polichinelos)
  maxAllowedReps: number;  // Teto absoluto (100 para base; 1000 para polichinelos)
  performedReps: number;   // Repetições efetivamente registradas pelo usuário
  completed: boolean;      // true quando performedReps >= targetReps
  completedAt: string | null;
}

export interface DailyQuest {
  id: string;              // Formato determinístico: "quest-YYYY-MM-DD"
  dateKey: string;         // Data local "YYYY-MM-DD"
  baseTarget: number;      // Meta-base vigente no dia (5..100)
  status: DailyQuestStatus;
  exercises: Record<ExerciseId, ExerciseProgress>;
  rewardClaimed: boolean;  // Garante idempotência absoluta de recompensas
  exceededTarget: boolean; // true se pelo menos 1 exercício teve performedReps > targetReps
  progressionChoice: ProgressionChoice;
  completedAt: string | null;
}

export interface PlayerAttributes {
  STR: number; // Força (inicial: 10)
  AGI: number; // Agilidade (inicial: 10)
  VIT: number; // Vitalidade (inicial: 10)
}

export interface PlayerStats {
  hunterName: string;
  title: string;
  level: number;                    // Inicial: 1
  currentXp: number;                // Inicial: 0
  xpToNextLevel: number;            // Calculado deterministicamente
  totalXpEarned: number;            // Acumulado vitalício
  coins: number;                    // Moedas do Sistema (inicial: 0)
  availableAttributePoints: number; // Pontos livres para distribuir (inicial: 0, +3 por missão)
  attributes: PlayerAttributes;
  baseTarget: number;               // Degrau atual da meta-base (inicial: 5, máx: 100)
  rank: RankTier;                   // Derivado de baseTarget (inicial: 'E')
  currentStreak: number;            // Dias consecutivos concluídos
  bestStreak: number;
  totalCompletedQuests: number;
  lastActiveDateKey: string;        // "YYYY-MM-DD" local
}

export interface QuestHistoryEntry {
  questId: string;
  dateKey: string;
  status: 'COMPLETED' | 'INCOMPLETE';
  baseTargetAtCompletion: number;
  nextBaseTargetApplied: number;
  progressionChoice: ProgressionChoice;
  exceededTarget: boolean;
  xpEarned: number;
  coinsEarned: number;
  attributePointsEarned: number;
  exercisesSummary: Record<ExerciseId, { target: number; performed: number }>;
  recordedAt: string;
}

export interface PersistedAppState {
  schemaVersion: number; // Versão atual: 1
  player: PlayerStats;
  dailyQuest: DailyQuest;
  history: QuestHistoryEntry[];
}
```

### 4.2 Regras Determinísticas de Progressão e Exercícios (`src/domain/rules/progression.rules.ts`)

1. **4 Exercícios Diários Obrigatórios**:
   - **Flexões (`pushups`)**: `multiplier = 1`, `targetReps = baseTarget` (inicial `5`, teto `100`).
   - **Agachamentos (`squats`)**: `multiplier = 1`, `targetReps = baseTarget` (inicial `5`, teto `100`).
   - **Abdominais (`situps`)**: `multiplier = 1`, `targetReps = baseTarget` (inicial `5`, teto `100`).
   - **Polichinelos (`jumping_jacks`)**: `multiplier = 10`, `targetReps = baseTarget * 10` (inicial `50`, teto `1000`).
2. **Tabela Canônica de Degraus (`PROGRESSION_STEPS`)**:
   - `const PROGRESSION_STEPS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100] as const;`
   - **Função `getNextStep(current: number): number`**:
     - Se `current >= 100`, retorna `100` (nunca ultrapassa o teto).
     - Se `current < 5`, retorna `5`.
     - Localiza o primeiro degrau em `PROGRESSION_STEPS` estritamente maior que `current` (`step > current`).
3. **Mapeamento Determinístico de Ranks (`calculateRankFromBaseTarget`)**:
   - `baseTarget` de `5` a `15` -> Rank **`E`**
   - `baseTarget` de `20` a `35` -> Rank **`D`**
   - `baseTarget` de `40` a `50` -> Rank **`C`**
   - `baseTarget` de `60` a `70` -> Rank **`B`**
   - `baseTarget` de `80` a `90` -> Rank **`A`**
   - `baseTarget` igual a `100` -> Rank **`S`**

### 4.3 Regras de Registro de Execução, Desfazer e Conclusão da Missão (`src/domain/rules/quest.rules.ts`)

1. **Validação Estrita das Repetições Realizadas (`validateExerciseInput`)**:
   - O valor informado pelo jogador deve ser um **número finito e inteiro** (`Number.isInteger(reps)`). Valores `NaN`, `Infinity`, decimais (ex: `10.5`) ou textos inválidos são rejeitados com erro explícito.
   - Não pode ser negativo (`reps >= 0`).
   - Não pode exceder o teto absoluto do exercício (`<= 100` para Flexões, Agachamentos e Abdominais; `<= 1000` para Polichinelos).
   - Para marcar um exercício individual como **concluído** (`completed = true`), o jogador deve registrar um valor compatível com a meta (`performedReps >= targetReps` e `performedReps <= maxAllowedReps`). Caso informe um valor menor que `targetReps`, o sistema pode registrar o progresso parcial (`completed = false`) ou orientar claramente que faltam `targetReps - performedReps` repetições para completar o requisito do exercício.
2. **Possibilidade de Desfazer / Editar antes de Encerrar a Missão (`undoExerciseExecution`)**:
   - Enquanto `dailyQuest.status === 'IN_PROGRESS'` e `dailyQuest.rewardClaimed === false`, o jogador pode acionar **"Desfazer / Editar"** em qualquer exercício já marcado como concluído, revertendo `completed` para `false` e zerando (ou permitindo reeditar) `performedReps`.
   - Após a missão diária ser encerrada (`status === 'COMPLETED'`), os registros daquele dia tornam-se imutáveis.
3. **Escolha Explícita na Conclusão quando Superar a Meta (`completeDailyQuest`)**:
   - Pré-condição: Todos os 4 exercícios do dia devem estar com `completed === true` (`performedReps >= targetReps`).
   - **Detecção de Superação (`exceededTarget`)**:
     - `exceededTarget` é `true` quando pelo menos um exercício teve `performedReps > targetReps` (e `baseTarget < 100`).
     - Além disso, quando o jogador cumpre ou supera a meta diária com `baseTarget < 100`, o modal de conclusão do Sistema apresenta explicitamente a decisão ao Caçador:
       - **Opção 1 — "Aceitar nova meta" (`ACCEPT_NEW_TARGET`)**: Atualiza `player.baseTarget = getNextStep(player.baseTarget)` e recalcula `player.rank = calculateRankFromBaseTarget(newBaseTarget)` para a próxima missão diária.
       - **Opção 2 — "Manter meta atual" (`KEEP_CURRENT_TARGET`)**: Preserva `player.baseTarget` e `player.rank` atuais para consolidar o condicionamento físico sem forçar aumento automático sem consentimento.
     - Se `exceededTarget === false` e nenhuma escolha de avanço foi solicitada (ou se `baseTarget === 100`), `progressionChoice` pode ser `'KEEP_CURRENT_TARGET'` ou `'NOT_APPLICABLE'`, mantendo a meta estável.

### 4.4 Regras de Recompensas Idempotentes, Níveis e Atributos (`src/domain/rules/reward.rules.ts`)

1. **Pacote de Recompensa Diária**:
   - **XP Ganho**: `100 + (baseTarget * 2)` XP (ex: meta 5 = `110 XP`; meta 100 = `300 XP`).
   - **Moedas do Sistema (`coins`)**: `50 + baseTarget` moedas.
   - **Pontos de Atributo Livres (`availableAttributePoints`)**: **`+3` pontos fixos** por missão diária concluída.
2. **Cálculo de Nível (`calculateLevelFromXp`)**:
   - Curva determinística: Cada nível `L` requer `100 * L` XP para avançar ao próximo nível (Nível 1 -> 2 requer 100 XP; Nível 2 -> 3 requer 200 XP, etc.).
   - Quando `currentXp >= xpToNextLevel`, o jogador sobe de nível (`level += 1`), deduzindo o limiar e recalculando o título do Caçador conforme o nível/rank.
3. **Idempotência Estrita de Recompensas**:
   - Se `dailyQuest.rewardClaimed === true` ou `dailyQuest.status === 'COMPLETED'` ou já existir entrada em `history` com `questId === dailyQuest.id` e `status === 'COMPLETED'`, qualquer nova chamada a `completeDailyQuest` retorna o estado inalterado (no-op idempotente), protegendo contra duplo clique rápido ou re-execução de efeito.
4. **Alocação Segura de Pontos de Atributo (`allocateAttributePoints`)**:
   - Valida: `attribute` pertence a `'STR' | 'AGI' | 'VIT'`, `points` é inteiro positivo (`Number.isInteger(points) && points > 0`), e `points <= player.availableAttributePoints`.
   - Caso contrário, rejeita a operação sem alterar o estado e retorna erro de domínio descritivo.

### 4.5 Controle de Datas Locais e Virada de Dia (`src/domain/rules/date.rules.ts`)

1. **Chave de Data Local (`getLocalDateKey`)**:
   ```typescript
   export function getLocalDateKey(date: Date = new Date()): string {
     const year = date.getFullYear();
     const month = String(date.getMonth() + 1).padStart(2, '0');
     const day = String(date.getDate()).padStart(2, '0');
     return `${year}-${month}-${day}`;
   }
   ```
   - Garante que um treino às 22h30 no fuso de Brasília (`UTC-3`) seja registrado na data local correta, sem pular prematuramente para o dia seguinte por causa de UTC.
2. **Transição de Dia (`syncStateWithLocalDate`)**:
   - Quando `todayKey > state.dailyQuest.dateKey`:
     - Se a `dailyQuest` anterior estava `IN_PROGRESS` (não foi concluída), ela é registrada uma única vez no topo de `history` com `status: 'INCOMPLETE'` e `xpEarned: 0`, e `player.currentStreak` é zerado (`0`).
     - **Proibição de Missões Retroativas Infinitas**: Se o usuário ficou 5, 30 ou 365 dias sem abrir o aplicativo, o sistema **NÃO** gera 365 registros vazios no histórico. Registra apenas o desfecho da última missão instanciada e cria imediatamente a nova `DailyQuest` para `todayKey` usando o `player.baseTarget` atual.
     - O histórico (`history`) das missões anteriores já concluídas é 100% preservado.

---

## 5. Critérios de Aceite em Gherkin (User Stories)

```gherkin
Funcionalidade: Sistema de Missão Diária, Progressão Adaptativa e Evolução Solo Leveling

  Cenário 01: Inicialização do Caçador no Primeiro Acesso
    Dado que o aplicativo é aberto pela primeira vez sem dados no AsyncStorage
    Quando o Sistema inicializa o estado do jogador
    Então o Caçador começa no Nível 1, Rank "E", com STR 10, AGI 10, VIT 10 e 0 pontos livres
    E a Missão Diária da data local atual possui meta de 5 Flexões, 5 Agachamentos, 5 Abdominais e 50 Polichinelos

  Cenário 02: Registro de Execução, Superação de Meta e Opção de Desfazer
    Dado que o Caçador está com a Missão Diária "IN_PROGRESS" com meta-base 5
    Quando ele registra 10 Flexões, 5 Agachamentos, 5 Abdominais e 60 Polichinelos
    E ele decide desfazer o registro de Agachamentos antes de encerrar a missão
    Então Agachamentos volta para o estado pendente (0 repetições) e a missão não pode ser encerrada ainda
    Quando ele registra novamente 5 Agachamentos
    Então todos os 4 exercícios ficam marcados como concluídos e a missão detecta superação de meta (exceededTarget = true)

  Cenário 03: Conclusão Idempotente com Escolha Explícita de Nova Meta
    Dado que todos os 4 exercícios da Missão Diária foram concluídos com superação de meta (baseTarget = 5)
    Quando o Caçador encerra a missão escolhendo "Aceitar nova meta"
    Então ele recebe +XP, +Moedas e +3 Pontos de Atributo uma única vez
    E a meta-base para a próxima missão avança para o degrau 10 (e 100 Polichinelos)
    E se houver um duplo toque rápido no botão de concluir, nenhuma recompensa adicional é concedida

  Cenário 04: Conclusão Optando por Manter a Meta Atual
    Dado que todos os 4 exercícios da Missão Diária foram concluídos com superação de meta (baseTarget = 15)
    Quando o Caçador encerra a missão escolhendo "Manter meta atual"
    Então ele recebe as recompensas normais do dia
    Mas a meta-base permanece em 15 (Rank E) para o próximo dia

  Cenário 05: Virada de Dia com Dias Sem Treino (Sem Retroativos Infinitos)
    Dado que a última missão do Caçador foi em "2026-10-20" e ficou incompleta
    Quando o Caçador abre o aplicativo em "2026-10-27"
    Então a missão de "2026-10-20" é arquivada no histórico como "INCOMPLETE"
    E nenhum registro fantasma é criado para os dias 21 a 26 de outubro
    E uma nova missão limpa é gerada para "2026-10-27" mantendo a meta-base do Caçador
```

---

## 6. Matriz de Casos Infelizes, Resiliência & Caos (>= 50% dos Cenários)

Para atender ao padrão de alta confiabilidade do ecossistema AriseFit, **7 dos 12 cenários de validação arquitetural (58,3%)** cobrem explicitamente caminhos infelizes, falhas de armazenamento, concorrência de UI e entradas inválidas:

| # | Categoria | Cenário de Teste / Caso de Uso | Comportamento Esperado (Fail-Safe / Determinístico) |
| :-: | :--- | :--- | :--- |
| **01** | **Caos / Storage** | **JSON Corrompido no AsyncStorage** (`"{invalid_json"`) | `StorageRepository.loadState()` captura o `SyntaxError`, não derruba o app, limpa ou isola o payload inválido e restaura um `PersistedAppState` inicial íntegro para a data local. |
| **02** | **Caos / Storage** | **Schema Version Incompatível ou Campos Faltando** (`schemaVersion: 999` ou `player: null`) | O validador estrutural de hidratação detecta a incompatibilidade de schema/campos obrigatórios e executa migração segura ou fallback limpo sem `TypeError: Cannot read property of undefined`. |
| **03** | **Caos / Concorrência** | **Duplo Toque Rápido (Race Condition) ao Concluir Missão Diária** | Trava síncrona na store + verificação de `rewardClaimed === true` e `questId` no histórico garantem que XP, moedas, +3 pontos de atributo e histórico sejam gravados **exatamente 1 vez**. |
| **04** | **Caminho Infeliz / Domínio** | **Tentativa de Alocar Mais Pontos de Atributo do que o Disponível** (ex: pedir +5 em `STR` tendo apenas `3` disponíveis, ou valor negativo `-2`) | `allocateAttributePoints` rejeita a mutação, preserva `STR/AGI/VIT` e `availableAttributePoints` intactos e retorna mensagem de erro amigável na UI. |
| **05** | **Caminho Infeliz / Input** | **Valores Inválidos nos Exercícios** (negativos `-10`, decimais `5.5`, `NaN`, ou acima do teto `105` em Flexões / `1500` em Polichinelos) | `validateExerciseInput` bloqueia o registro inválido, exibe feedback visual claro (`#F87171`) informando os limites (`0..100` ou `0..1000`) e nunca corrompe `performedReps`. |
| **06** | **Caos / Limite Superior** | **Tentativa de Evoluir Meta Acima do Teto Máximo (Rank S / Base 100)** | Em `baseTarget = 100` (`jumping_jacks = 1000`), `getNextStep(100)` retorna `100` (clamp estrito), impedindo overflow de meta além do Rank `S`. |
| **07** | **Caos / Temporal** | **Virada de Dia com Múltiplos Dias Sem Treino e Fuso Horário Noturno (`23:30` local)** | `getLocalDateKey` usa horário local real (sem desvio UTC), arquiva apenas a missão anterior pendente como `INCOMPLETE`, zera o `currentStreak`, preserva o histórico antigo e não cria missões retroativas para o hiato. |
| **08** | **Caminho Feliz** | **Progressão Completa de Todos os Degraus (`5` até `100`) e Multiplicador `10x`** | Valida toda a cadeia `5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100` e verifica que Polichinelos é sempre `baseTarget * 10`. |
| **09** | **Caminho Feliz** | **Cálculo de Ranks `E`, `D`, `C`, `B`, `A`, `S` por Faixa de Meta** | Confirma a transição exata de Rank em cada fronteira da tabela (`E: 5-15`, `D: 20-35`, `C: 40-50`, `B: 60-70`, `A: 80-90`, `S: 100`). |
| **10** | **Caminho Feliz** | **Fluxo de Desfazer (`Undo`) Exercício antes do Encerramento da Missão** | Permite corrigir ou desmarcar um exercício enquanto a missão está `IN_PROGRESS`, recalculando `exceededTarget` e bloqueando a conclusão até que os 4 exercícios voltem a estar completos. |
| **11** | **Caminho Feliz** | **Escolha Explícita: "Aceitar nova meta" vs "Manter meta atual"** | Comprova que o aumento de meta após superação só ocorre quando o jogador escolhe explicitamente `ACCEPT_NEW_TARGET`. |
| **12** | **Caminho Feliz** | **Persistência Completa e Reidratação Fiel via `StorageRepository`** | Estado salvo no `AsyncStorage` é recarregado intacto após reinicialização do app, mantendo nível, XP, atributos, missão do dia e histórico. |

---

## 7. Metas de Desempenho e Frugalidade Mobile

- **Tempo de Hidratação Local (Cold Start)**: `< 50ms` para leitura e validação do documento JSON único em `@arisefit/system-state:v1`.
- **Latência de Interação de UI**: `< 16ms` (60 FPS constantes) nas transições de abas, registro de repetições e alocação de atributos.
- **Pegada de Armazenamento**: Documento único compactado com retenção controlada de histórico (máximo de 365 entradas recentes no array `history`), garantindo que o payload no `AsyncStorage` nunca ultrapasse `~150 KB` mesmo após 1 ano inteiro de uso diário.
