/**
 * Modelos e Contratos de Domínio Estritos — AriseFit ("O Sistema")
 */

export const CURRENT_SCHEMA_VERSION = 1 as const;
export const MAX_HISTORY_ENTRIES = 365 as const;

export const EXERCISE_IDS = ['pushups', 'squats', 'situps', 'jumping_jacks'] as const;
export type ExerciseId = (typeof EXERCISE_IDS)[number];

export const RANK_TIERS = ['E', 'D', 'C', 'B', 'A', 'S'] as const;
export type RankTier = (typeof RANK_TIERS)[number];

export const ATTRIBUTE_KEYS = ['STR', 'AGI', 'VIT'] as const;
export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number];

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
  avatarId?: string;
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

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitizedReps?: number;
}

export interface DomainOperationResult<T> {
  ok: boolean;
  state: T;
  error?: string;
}
