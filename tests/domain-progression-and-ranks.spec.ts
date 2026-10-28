import {
  calculateRankFromBaseTarget,
  canAdvanceBaseTarget,
  getAllExerciseTargetsForBase,
  getExerciseTarget,
  getHunterTitleByRank,
  getNextRankPreview,
  getNextStep,
  normalizeBaseTarget,
  PROGRESSION_STEPS,
} from '../src/domain/rules/progression.rules';

describe('Domain Rules — Progressão Adaptativa (5..100), Multiplicador 10x e Ranks (E..S)', () => {
  it('deve conter exatamente os 15 degraus oficiais de progressão de 5 até 100', () => {
    expect(PROGRESSION_STEPS).toEqual([
      5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100,
    ]);
  });

  it('deve calcular corretamente as transições críticas de degrau (5->10, 45->50, 50->60, 90->100, 100->100)', () => {
    expect(getNextStep(5)).toBe(10);
    expect(getNextStep(10)).toBe(15);
    expect(getNextStep(45)).toBe(50);
    expect(getNextStep(50)).toBe(60);
    expect(getNextStep(60)).toBe(70);
    expect(getNextStep(90)).toBe(100);
    // Teto absoluto no Rank S (nunca ultrapassa 100)
    expect(getNextStep(100)).toBe(100);
    expect(getNextStep(150)).toBe(100);
  });

  it('deve tratar entradas abaixo do mínimo ou inválidas retornando o degrau inicial 5', () => {
    expect(getNextStep(0)).toBe(5);
    expect(getNextStep(-20)).toBe(5);
    expect(getNextStep(Number.NaN)).toBe(5);
    expect(normalizeBaseTarget(-5)).toBe(5);
    expect(normalizeBaseTarget(1000)).toBe(100);
  });

  it('deve aplicar o multiplicador 10x exclusivamente para Polichinelos (50..1000)', () => {
    expect(getExerciseTarget('pushups', 5)).toBe(5);
    expect(getExerciseTarget('squats', 5)).toBe(5);
    expect(getExerciseTarget('situps', 5)).toBe(5);
    expect(getExerciseTarget('jumping_jacks', 5)).toBe(50);

    const targetsAt50 = getAllExerciseTargetsForBase(50);
    expect(targetsAt50).toEqual({
      pushups: 50,
      squats: 50,
      situps: 50,
      jumping_jacks: 500,
    });

    const targetsAt100 = getAllExerciseTargetsForBase(100);
    expect(targetsAt100).toEqual({
      pushups: 100,
      squats: 100,
      situps: 100,
      jumping_jacks: 1000,
    });
  });

  it('deve mapear deterministicamente todas as faixas de Rank de E até S', () => {
    // Rank E: 5 a 15
    expect(calculateRankFromBaseTarget(5)).toBe('E');
    expect(calculateRankFromBaseTarget(10)).toBe('E');
    expect(calculateRankFromBaseTarget(15)).toBe('E');

    // Rank D: 20 a 35
    expect(calculateRankFromBaseTarget(20)).toBe('D');
    expect(calculateRankFromBaseTarget(25)).toBe('D');
    expect(calculateRankFromBaseTarget(30)).toBe('D');
    expect(calculateRankFromBaseTarget(35)).toBe('D');

    // Rank C: 40 a 50
    expect(calculateRankFromBaseTarget(40)).toBe('C');
    expect(calculateRankFromBaseTarget(45)).toBe('C');
    expect(calculateRankFromBaseTarget(50)).toBe('C');

    // Rank B: 60 a 70
    expect(calculateRankFromBaseTarget(60)).toBe('B');
    expect(calculateRankFromBaseTarget(70)).toBe('B');

    // Rank A: 80 a 90
    expect(calculateRankFromBaseTarget(80)).toBe('A');
    expect(calculateRankFromBaseTarget(90)).toBe('A');

    // Rank S: 100
    expect(calculateRankFromBaseTarget(100)).toBe('S');
  });

  it('deve informar corretamente quando o Caçador pode avançar de meta e prever próximo Rank', () => {
    expect(canAdvanceBaseTarget(5)).toBe(true);
    expect(canAdvanceBaseTarget(90)).toBe(true);
    expect(canAdvanceBaseTarget(100)).toBe(false);

    expect(getNextRankPreview(15)).toEqual({
      nextBaseTarget: 20,
      nextRank: 'D',
    });
    expect(getNextRankPreview(90)).toEqual({
      nextBaseTarget: 100,
      nextRank: 'S',
    });
    expect(getHunterTitleByRank('S')).toBe('Monarca das Sombras');
  });
});
