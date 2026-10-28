import {
  ATTRIBUTE_KEYS,
  AttributeKey,
  PlayerAttributes,
  PlayerStats,
} from '../models/system.models';

export const INITIAL_ATTRIBUTE_VALUE = 10 as const;
export const ATTRIBUTE_POINTS_PER_QUEST = 3 as const;

export const ATTRIBUTE_METADATA: Record<
  AttributeKey,
  { code: AttributeKey; label: string; description: string }
> = {
  STR: {
    code: 'STR',
    label: 'Força (STR)',
    description: 'Poder muscular bruto e capacidade de carga calistênica.',
  },
  AGI: {
    code: 'AGI',
    label: 'Agilidade (AGI)',
    description: 'Velocidade de execução, coordenação e ritmo cardiorrespiratório.',
  },
  VIT: {
    code: 'VIT',
    label: 'Vitalidade (VIT)',
    description: 'Resistência física prolongada, estabilidade de core e vigor.',
  },
};

export interface AttributeAllocationResult {
  ok: boolean;
  success: boolean;
  player: PlayerStats;
  error?: string;
}

export function createInitialAttributes(): PlayerAttributes {
  return {
    STR: INITIAL_ATTRIBUTE_VALUE,
    AGI: INITIAL_ATTRIBUTE_VALUE,
    VIT: INITIAL_ATTRIBUTE_VALUE,
  };
}

export function isValidAttributeKey(key: unknown): key is AttributeKey {
  return typeof key === 'string' && (ATTRIBUTE_KEYS as readonly string[]).includes(key);
}

/**
 * Distribui pontos de atributo de forma atômica e segura.
 * Nunca permite saldo negativo, valores fracionários, zero/negativos ou chaves inválidas.
 */
export function allocateAttributePoints(
  player: PlayerStats,
  attribute: AttributeKey,
  amount: number = 1,
): AttributeAllocationResult {
  if (!isValidAttributeKey(attribute)) {
    return {
      ok: false,
      success: false,
      player,
      error: 'Atributo inválido selecionado.',
    };
  }

  if (typeof amount !== 'number' || !Number.isFinite(amount) || !Number.isInteger(amount) || amount <= 0) {
    return {
      ok: false,
      success: false,
      player,
      error: 'A quantidade de pontos deve ser um número inteiro positivo.',
    };
  }

  if (player.availableAttributePoints < amount) {
    return {
      ok: false,
      success: false,
      player,
      error: 'Pontos de atributo insuficientes para realizar esta alocação.',
    };
  }

  const updatedPlayer: PlayerStats = {
    ...player,
    availableAttributePoints: player.availableAttributePoints - amount,
    attributes: {
      ...player.attributes,
      [attribute]: player.attributes[attribute] + amount,
    },
  };

  return {
    ok: true,
    success: true,
    player: updatedPlayer,
  };
}
