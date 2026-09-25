import type { RegionData, SpawnPointData } from '../types/game';

export const MAP_SIZE = 256;
export const DEFAULT_MAP_SEED = 1234.56;

export function getPresetSpawnPoints(regionId: number): SpawnPointData[] {
  switch (regionId) {
    case 0:
      return [
        { id: 'sp-0-1', name: 'Серце долини', position: [52, 52], description: 'Простора рівнинна галявина в центрі володіння з легким доступом до лісів та каменю' },
        { id: 'sp-0-2', name: 'Північний бір', position: [88, 36], description: 'Затишне плато біля північного дубового гаю та пагорбів' },
        { id: 'sp-0-3', name: 'Річковий вигін', position: [40, 96], description: 'Родючі луки біля південного струмка з високою врожайністю' },
      ];
    case 1:
      return [
        { id: 'sp-1-1', name: 'Дубова просіка', position: [176, 52], description: 'Затишна галявина посеред вікових дубів та сосен із багатими запасами деревини' },
        { id: 'sp-1-2', name: 'Мисливський пагорб', position: [216, 44], description: 'Височина з панорамним оглядом східних лісових угідь' },
        { id: 'sp-1-3', name: 'Соснове урочище', position: [172, 98], description: 'Багатий лісовий бір біля джерела, ідеальний для заготівлі кругляку' },
      ];
    case 2:
      return [
        { id: 'sp-2-1', name: 'Озерна затока', position: [52, 144], description: 'Мальовничий північний берег озера з багатим рибальством та очеретом' },
        { id: 'sp-2-2', name: 'Вербовий мис', position: [96, 180], description: 'Родючі мулисті чорноземи для великих пшеничних нив та млинів' },
        { id: 'sp-2-3', name: 'Південна низина', position: [52, 218], description: 'Захищена від вітрів тепла долина біля південного узбережжя' },
      ];
    case 3:
      return [
        { id: 'sp-3-1', name: 'Кам\'яне плато', position: [176, 176], description: 'Міцне кам\'янисте узвишшя з покладами вапняку та граніту' },
        { id: 'sp-3-2', name: 'Гірський перевал', position: [220, 160], description: 'Стратегічна оборонна висота між скельними кряжами' },
        { id: 'sp-3-3', name: 'Скельна тераса', position: [184, 218], description: 'Природний скельний бастіон із багатими кам\'яними жилами' },
      ];
    default:
      return [
        { id: 'sp-def', name: 'Центральний табір', position: [52, 52], description: 'Рівнинна галявина' },
      ];
  }
}

export const DEFAULT_REGIONS: RegionData[] = [
  {
    id: 0,
    name: 'Goldhof',
    ukrName: 'Ґольдгоф',
    description: 'Центральні родючі рівнини, багаті луки, помірний ліс. Ідеальне місце для серця королівства.',
    bounds: { minX: 0, maxX: 127, minZ: 0, maxZ: 127 },
    center: [64, 64],
    spawnPoints: getPresetSpawnPoints(0),
    owner: 'player',
    lordName: 'Король Болеслав',
    lordTitle: 'Правитель земель',
    heraldryColor: '#f59e0b',
    heraldryIcon: '👑',
    population: 3,
    approval: 80,
    wealth: 50,
    buildingsCount: 2,
    campPosition: [52, 52],
  },
  {
    id: 1,
    name: 'Waldau',
    ukrName: 'Вальдау',
    description: 'Густі дубові та соснові бори, багаті мисливські угіддя та невичерпні запаси деревини.',
    bounds: { minX: 128, maxX: 255, minZ: 0, maxZ: 127 },
    center: [192, 64],
    spawnPoints: getPresetSpawnPoints(1),
    owner: 'bot',
    lordName: 'Барон фон Берг',
    lordTitle: 'Лорд-завойовник',
    heraldryColor: '#dc2626',
    heraldryIcon: '⚔️',
    population: 3,
    approval: 75,
    wealth: 40,
    buildingsCount: 2,
    campPosition: [176, 52],
  },
  {
    id: 2,
    name: 'Eichenau',
    ukrName: 'Айхенау',
    description: 'Озерне узбережжя, річкові заплави та родючі ґрунти для пшеничних ланів та млинів.',
    bounds: { minX: 0, maxX: 127, minZ: 128, maxZ: 255 },
    center: [64, 192],
    spawnPoints: getPresetSpawnPoints(2),
    owner: 'bot',
    lordName: 'Леді Хільдеґард',
    lordTitle: 'Володарка лісів',
    heraldryColor: '#2563eb',
    heraldryIcon: '🛡️',
    population: 3,
    approval: 82,
    wealth: 60,
    buildingsCount: 2,
    campPosition: [52, 144],
  },
  {
    id: 3,
    name: 'Zweiau',
    ukrName: 'Цвайау',
    description: 'Скелясті височини, гірські вали, багаті поклади каменю та природні рубежі оборони.',
    bounds: { minX: 128, maxX: 255, minZ: 128, maxZ: 255 },
    center: [192, 192],
    spawnPoints: getPresetSpawnPoints(3),
    owner: 'unclaimed',
    lordName: 'Вільні землі',
    lordTitle: 'Нейтральна територія',
    heraldryColor: '#64748b',
    heraldryIcon: '🦅',
    population: 0,
    approval: 0,
    wealth: 0,
    buildingsCount: 0,
    campPosition: [176, 176],
  },
];

export const PRESET_BOT_LORDS = [
  {
    id: 'bot-1',
    name: 'Барон фон Берг',
    title: 'Лорд-завойовник',
    color: '#dc2626',
    avatarColor: '#b91c1c',
    peasantColor: '#ef4444',
    heraldryIcon: '⚔️',
  },
  {
    id: 'bot-2',
    name: 'Леді Хільдеґард',
    title: 'Володарка лісів',
    color: '#2563eb',
    avatarColor: '#1d4ed8',
    peasantColor: '#3b82f6',
    heraldryIcon: '🛡️',
  },
  {
    id: 'bot-3',
    name: 'Герцог Вільгельм',
    title: 'Гірський ярл',
    color: '#16a34a',
    avatarColor: '#15803d',
    peasantColor: '#22c55e',
    heraldryIcon: '🦅',
  },
];
