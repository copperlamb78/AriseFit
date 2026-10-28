# AriseFit — Aplicativo Mobile de Evolução Física Gamificada ("O Sistema")

Aplicativo mobile nativo desenvolvido em **React Native**, **Expo**, **TypeScript (`strict: true`)**, **Expo Router**, **Zustand** e **AsyncStorage**, inspirado conceitualmente no **"Sistema" de Solo Leveling**.

O usuário atua como um **Caçador** convocado pelo Sistema para cumprir uma **Missão Diária Calistênica** composta por 4 exercícios obrigatórios, evoluindo seu Nível, Rank (`E` até `S`), Atributos (`STR`, `AGI`, `VIT`) e Sequência Diária (*Streak*) em uma interface *Dark Fantasy Futurista* 100% nativa.

---

## Stack Tecnológica

- **Framework Mobile**: React Native (`0.76`) + Expo (`~52.0`)
- **Linguagem**: TypeScript em modo estrito (`strict: true`)
- **Roteamento**: Expo Router (File-based routing em `src/app/`)
- **Gerenciamento de Estado**: Zustand (`src/store/useSystemStore.ts`)
- **Persistência Local Offline-First**: `@react-native-async-storage/async-storage` encapsulado pelo `StorageRepository` (`schemaVersion: 1`, chave `@arisefit/system-state:v1`)
- **Testes Automatizados**: Jest + `ts-jest` (`tests/`)

---

## Regras do Sistema Implementadas

1. **Missão Diária de 4 Exercícios**:
   - **Flexões (`pushups`)**: Multiplicador `1x` (Meta inicial `5`, teto `100`).
   - **Agachamentos (`squats`)**: Multiplicador `1x` (Meta inicial `5`, teto `100`).
   - **Abdominais (`situps`)**: Multiplicador `1x` (Meta inicial `5`, teto `100`).
   - **Polichinelos (`jumping_jacks`)**: Multiplicador `10x` (Meta inicial `50`, teto `1000`).
2. **Escala Adaptativa de Degraus (`5..100`)**:
   - Degraus oficiais: `5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100`.
   - Opção de **Desfazer / Editar** qualquer exercício enquanto a missão do dia ainda não foi encerrada.
   - Ao cumprir ou superar a meta diária, o Caçador escolhe explicitamente entre **"Aceitar nova meta"** (`ACCEPT_NEW_TARGET`) ou **"Manter meta atual"** (`KEEP_CURRENT_TARGET`).
3. **Classificação de Ranks (`E` até `S`)**:
   - `5 a 15` -> **Rank E**
   - `20 a 35` -> **Rank D**
   - `40 a 50` -> **Rank C**
   - `60 a 70` -> **Rank B**
   - `80 a 90` -> **Rank A**
   - `100` -> **Rank S**
4. **Economia Idempotente & Atributos**:
   - Cada Missão Diária concluída concede exatamente uma única vez: **`+XP` (`100 + baseTarget * 2`)**, **`+Moedas` (`50 + baseTarget`)** e **`+3 Pontos de Atributo`** livres para distribuir em **Força (`STR`)**, **Agilidade (`AGI`)** e **Vitalidade (`VIT`)**.
5. **Controle de Datas Locais e Resiliência**:
   - Chave de data local `YYYY-MM-DD` imune a desvios de UTC noturnos.
   - Virada de dia preserva 100% do histórico anterior e nunca cria missões retroativas infinitas para dias sem treino.
   - Recuperação automática (*Fail-Safe*) contra JSON corrompido ou versão de schema incompatível no `AsyncStorage`.

---

## Como Executar o Projeto (Android, iOS e Expo Go)

### 1. Pré-requisitos
- **Node.js** `>= 18` instalado
- Aplicativo **Expo Go** instalado no celular (Android ou iOS) **ou** Android Studio / Xcode configurados

### 2. Instalação das Dependências
```bash
npm install
```

### 3. Iniciar o Servidor de Desenvolvimento (Expo Go)
```bash
npx expo start
```
- Escaneie o QR Code exibido no terminal com o aplicativo **Expo Go** (no Android) ou com a câmera nativa (no iOS).
- Para abrir diretamente no emulador Android:
  ```bash
  npm run android
  ```
- Para abrir diretamente no simulador iOS (macOS):
  ```bash
  npm run ios
  ```

### 4. Validação de Tipagem e Testes Automatizados
```bash
# Verificação estrita de TypeScript (0 erros)
npx tsc --noEmit

# Suíte de testes unitários, integração e caos (Jest)
npm test
```

---

## Estrutura de Pastas

```text
src/
├── app/                   # Rotas Expo Router ((tabs)/index, daily-quest, progression, profile, history e quest-cleared)
├── components/
│   ├── ui/                # Primitivos nativos (SystemButton, SystemCard, SystemBadge, ProgressBar, NumericInput, SystemModal)
│   ├── system/            # HUD Solo Leveling (SystemHeader, RankCrest, LevelProgressHud, SystemAlertBanner)
│   ├── quests/            # Cards de exercício, prompt de evolução de meta e modal de conclusão
│   ├── rewards/           # Resumo de espólios e alocador de atributos (+1)
│   └── profile/           # Estatísticas acumuladas e linha do tempo imutável do histórico
├── features/              # Módulos compostos (quests, progression, rewards, profile)
├── domain/
│   ├── models/            # Interfaces e contratos estritos do domínio
│   └── rules/             # Regras puras e determinísticas (progression, rank, quest, reward, attribute, date)
├── services/storage/      # StorageRepository com AsyncStorage, schemaVersion: 1 e sanitização fail-safe
├── store/                 # Store Zustand (useSystemStore) com proteção contra corrida de cliques
├── hooks/                 # Hook de hidratação e sincronização diária (useDailySync)
├── theme/                 # Tokens oficiais do Design System Dark Fantasy Futurista
└── utils/                 # Validação numérica inteira e formatação
tests/                     # Suíte Jest cobrindo os 12+ cenários críticos e resiliência a caos
```
