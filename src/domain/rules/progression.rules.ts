import { ExerciseId, RankTier } from '../models/system.models';
import { calculateRankFromBaseTarget, getHunterTitleByRank, getRankDescription } from './rankRules';

export { calculateRankFromBaseTarget, getHunterTitleByRank, getRankDescription };

export const PROGRESSION_STEPS = [
  5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100,
] as const;

export const MIN_BASE_TARGET = 5 as const;
export const MAX_BASE_TARGET = 100 as const;
export const MAX_JUMPING_JACKS_REPS = 1000 as const;

export interface ExerciseCatalogItem {
  id: ExerciseId;
  name: string;
  shortDescription: string;
  unitLabel: string;
  multiplier: 1 | 10;
  maxAllowedReps: number;
}

export const EXERCISE_CATALOG: Record<ExerciseId, ExerciseCatalogItem> = {
  pushups: {
    id: 'pushups',
    name: 'Flexões',
    shortDescription: 'Força de membros superiores e peitoral (STR)',
    unitLabel: 'repetições',
    multiplier: 1,
    maxAllowedReps: 100,
  },
  squats: {
    id: 'squats',
    name: 'Agachamentos',
    shortDescription: 'Potência de membros inferiores e base (STR/VIT)',
    unitLabel: 'repetições',
    multiplier: 1,
    maxAllowedReps: 100,
  },
  situps: {
    id: 'situps',
    name: 'Abdominais',
    shortDescription: 'Estabilidade de core e resistência central (VIT)',
    unitLabel: 'repetições',
    multiplier: 1,
    maxAllowedReps: 100,
  },
  jumping_jacks: {
    id: 'jumping_jacks',
    name: 'Polichinelos',
    shortDescription: 'Capacidade cardiorrespiratória e agilidade (AGI - 10x)',
    unitLabel: 'repetições',
    multiplier: 10,
    maxAllowedReps: 1000,
  },
};

/**
 * Calcula o próximo degrau da progressão adaptativa.
 * Degraus: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100.
 * Teto absoluto: 100.
 */
export function getNextStep(current: number): number {
  if (!Number.isFinite(current) || current < MIN_BASE_TARGET) {
    return MIN_BASE_TARGET;
  }
  if (current >= MAX_BASE_TARGET) {
    return MAX_BASE_TARGET;
  }
  for (const step of PROGRESSION_STEPS) {
    if (step > current) {
      return step;
    }
  }
  return MAX_BASE_TARGET;
}

/**
 * Normaliza qualquer valor de meta-base para um degrau válido entre 5 e 100.
 */
export function normalizeBaseTarget(value: number): number {
  if (!Number.isFinite(value) || value <= MIN_BASE_TARGET) {
    return MIN_BASE_TARGET;
  }
  if (value >= MAX_BASE_TARGET) {
    return MAX_BASE_TARGET;
  }
  let closest: number = MIN_BASE_TARGET;
  for (const step of PROGRESSION_STEPS) {
    if (step <= value) {
      closest = step;
    } else {
      break;
    }
  }
  return closest;
}

/**
 * Retorna a meta do exercício a partir da meta-base vigente.
 * Exercícios base: 1x (5..100). Polichinelos: 10x (50..1000).
 */
export function getExerciseTarget(exerciseId: ExerciseId, baseTarget: number): number {
  const safeBase = normalizeBaseTarget(baseTarget);
  const catalog = EXERCISE_CATALOG[exerciseId];
  const rawTarget = safeBase * catalog.multiplier;
  return Math.min(rawTarget, catalog.maxAllowedReps);
}

/**
 * Retorna o resumo de metas para todos os 4 exercícios em um determinado degrau.
 */
export function getAllExerciseTargetsForBase(baseTarget: number): Record<ExerciseId, number> {
  return {
    pushups: getExerciseTarget('pushups', baseTarget),
    squats: getExerciseTarget('squats', baseTarget),
    situps: getExerciseTarget('situps', baseTarget),
    jumping_jacks: getExerciseTarget('jumping_jacks', baseTarget),
  };
}

export function canAdvanceBaseTarget(baseTarget: number): boolean {
  return normalizeBaseTarget(baseTarget) < MAX_BASE_TARGET;
}

export function getNextRankPreview(baseTarget: number): {
  nextBaseTarget: number;
  nextRank: RankTier;
} {
  const nextBaseTarget = getNextStep(baseTarget);
  return {
    nextBaseTarget,
    nextRank: calculateRankFromBaseTarget(nextBaseTarget),
  };
}
