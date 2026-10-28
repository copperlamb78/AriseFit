import { PlayerStats } from '../models/system.models';
import {
  ATTRIBUTE_METADATA,
  ATTRIBUTE_POINTS_PER_QUEST,
  AttributeAllocationResult,
  allocateAttributePoints,
  createInitialAttributes,
  INITIAL_ATTRIBUTE_VALUE,
  isValidAttributeKey,
} from './attributeRules';
import { normalizeBaseTarget } from './progression.rules';

export {
  ATTRIBUTE_METADATA,
  ATTRIBUTE_POINTS_PER_QUEST,
  AttributeAllocationResult,
  allocateAttributePoints,
  createInitialAttributes,
  INITIAL_ATTRIBUTE_VALUE,
  isValidAttributeKey,
};

export interface QuestRewardBundle {
  xpEarned: number;
  coinsEarned: number;
  attributePointsEarned: number;
}

export interface LevelProgressionResult {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  levelsGained: number;
}

/**
 * Calcula o XP necessário para avançar do nível atual para o próximo.
 * Fórmula determinística: 100 * level.
 */
export function getXpToNextLevel(level: number): number {
  const safeLevel = Number.isFinite(level) && level >= 1 ? Math.floor(level) : 1;
  return safeLevel * 100;
}

/**
 * Calcula o pacote de recompensas de uma Missão Diária concluída.
 * - XP: 100 + (baseTarget * 2)
 * - Moedas: 50 + baseTarget
 * - Pontos de Atributo: +3 fixos
 */
export function calculateQuestRewards(baseTarget: number): QuestRewardBundle {
  const safeBase = normalizeBaseTarget(baseTarget);
  return {
    xpEarned: 100 + safeBase * 2,
    coinsEarned: 50 + safeBase,
    attributePointsEarned: ATTRIBUTE_POINTS_PER_QUEST,
  };
}

/**
 * Aplica ganho de XP com carry-over determinístico de múltiplos níveis se necessário.
 */
export function applyLevelProgression(
  currentLevel: number,
  currentXp: number,
  addedXp: number,
): LevelProgressionResult {
  let level = Number.isFinite(currentLevel) && currentLevel >= 1 ? Math.floor(currentLevel) : 1;
  let xp = Number.isFinite(currentXp) && currentXp >= 0 ? Math.floor(currentXp) : 0;
  const safeAdded = Number.isFinite(addedXp) && addedXp > 0 ? Math.floor(addedXp) : 0;

  xp += safeAdded;
  let levelsGained = 0;
  let required = getXpToNextLevel(level);

  while (xp >= required) {
    xp -= required;
    level += 1;
    levelsGained += 1;
    required = getXpToNextLevel(level);
  }

  return {
    level,
    currentXp: xp,
    xpToNextLevel: required,
    levelsGained,
  };
}

/**
 * Aplica o pacote de recompensas ao estado do Caçador.
 */
export function grantRewardsToPlayer(
  player: PlayerStats,
  rewards: QuestRewardBundle,
): PlayerStats {
  const levelOutcome = applyLevelProgression(player.level, player.currentXp, rewards.xpEarned);

  return {
    ...player,
    level: levelOutcome.level,
    currentXp: levelOutcome.currentXp,
    xpToNextLevel: levelOutcome.xpToNextLevel,
    totalXpEarned: player.totalXpEarned + rewards.xpEarned,
    coins: player.coins + rewards.coinsEarned,
    availableAttributePoints: player.availableAttributePoints + rewards.attributePointsEarned,
  };
}
