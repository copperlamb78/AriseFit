import { RankTier } from '../models/system.models';

/**
 * Regras puras e determinísticas de cálculo de Rank e Títulos do Caçador.
 * Faixas oficiais:
 * - E: 5 a 15
 * - D: 20 a 35
 * - C: 40 a 50
 * - B: 60 a 70
 * - A: 80 a 90
 * - S: 100
 */

export function calculateRankFromBaseTarget(baseTarget: number): RankTier {
  if (!Number.isFinite(baseTarget) || baseTarget <= 15) {
    return 'E';
  }
  if (baseTarget <= 35) {
    return 'D';
  }
  if (baseTarget <= 50) {
    return 'C';
  }
  if (baseTarget <= 70) {
    return 'B';
  }
  if (baseTarget <= 90) {
    return 'A';
  }
  return 'S';
}

export function getHunterTitleByRank(rank: RankTier): string {
  switch (rank) {
    case 'E':
      return 'Caçador Desperto';
    case 'D':
      return 'Combatente de Dungeon';
    case 'C':
      return 'Vanguarda de Assalto';
    case 'B':
      return 'Cavaleiro da Guilda';
    case 'A':
      return 'Mestre de Raid';
    case 'S':
      return 'Monarca das Sombras';
  }
}

export function getRankDescription(rank: RankTier): string {
  switch (rank) {
    case 'E':
      return 'Estágio inicial de despertar físico (Meta-base: 5 a 15)';
    case 'D':
      return 'Resistência corporal consolidada (Meta-base: 20 a 35)';
    case 'C':
      return 'Condicionamento de combate intermediário (Meta-base: 40 a 50)';
    case 'B':
      return 'Capacidade física de alto desempenho (Meta-base: 60 a 70)';
    case 'A':
      return 'Domínio próximo ao limite humano (Meta-base: 80 a 90)';
    case 'S':
      return 'Ápice absoluto do Sistema (Meta-base: 100 / 1000 Polichinelos)';
  }
}
