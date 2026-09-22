import type { ResourceDeposit } from '../../types/game';
import { world } from '../ecs/world';
import { GridMap } from '../grid/GridMap';

export const INITIAL_RESOURCE_DEPOSITS: ResourceDeposit[] = [
  {
    id: 'deposit-0-fish',
    type: 'fish',
    name: 'Королівський рибний ставок',
    regionId: 0,
    gridPosition: [72, 70],
    position: [72.5, 0.05, 70.5],
    currentAmount: 102,
    maxAmount: 102,
    isRich: false,
    seasonalRenewal: true,
    icon: '🐟',
    harvestBuildingLabel: 'Хатина рибалки',
    description: 'Спокійна річкова заплава, багата на пструга, щуку та коропа. Забезпечує жителів свіжою рибою. Відновлюється кожного року.',
  },
  {
    id: 'deposit-0-berries',
    type: 'berries',
    name: 'Багаті ягідні чагарники',
    regionId: 0,
    gridPosition: [42, 68],
    position: [42.5, 0.1, 68.5],
    currentAmount: 128,
    maxAmount: 128,
    isRich: true,
    seasonalRenewal: true,
    icon: '🫐',
    harvestBuildingLabel: 'Хатина збирача ягід',
    description: 'Пишні чагарники дикої чорниці та суниці на теплій галявині. Подвійний запас ягід для швидкого насичення селян у теплий сезон.',
  },
  {
    id: 'deposit-0-stone',
    type: 'stone',
    name: 'Виходи вапняку',
    regionId: 0,
    gridPosition: [88, 45],
    position: [88.5, 0.15, 45.5],
    currentAmount: 300,
    maxAmount: 300,
    isRich: false,
    seasonalRenewal: false,
    icon: '🪨',
    harvestBuildingLabel: 'Каменоломня',
    description: 'Масивні пласти білого вапняку, що виходять на поверхню пагорба. Основне джерело будівельного каменю для міцних споруд.',
  },
  {
    id: 'deposit-0-clay',
    type: 'clay',
    name: 'Поклади гончарної глини',
    regionId: 0,
    gridPosition: [58, 88],
    position: [58.5, 0.08, 88.5],
    currentAmount: 200,
    maxAmount: 200,
    isRich: false,
    seasonalRenewal: false,
    icon: '🏺',
    harvestBuildingLabel: 'Глиняний карʼєр',
    description: 'Вологі теракотові пласти пластичної глини. Необхідні для випалювання якісної покрівельної черепиці та гончарного посуду.',
  },

  {
    id: 'deposit-1-game',
    type: 'wild_game',
    name: 'Багаті мисливські угіддя',
    regionId: 1,
    gridPosition: [210, 48],
    position: [210.5, 0.12, 48.5],
    currentAmount: 40,
    maxAmount: 40,
    isRich: true,
    seasonalRenewal: true,
    icon: '🦌',
    harvestBuildingLabel: 'Табір мисливців',
    description: 'Густий праліс із величезною популяцією благородних оленів та диких кабанів. Постачає цінне мʼясо та шкури.',
  },
  {
    id: 'deposit-1-fish',
    type: 'fish',
    name: 'Лісовий ставок Вальдау',
    regionId: 1,
    gridPosition: [186, 72],
    position: [186.5, 0.05, 72.5],
    currentAmount: 95,
    maxAmount: 95,
    isRich: false,
    seasonalRenewal: true,
    icon: '🐟',
    harvestBuildingLabel: 'Хатина рибалки',
    description: 'Глибоке лісове озеро, оточене віковими соснами. Річний ліміт вилову озерної форелі та окуня.',
  },
  {
    id: 'deposit-1-iron',
    type: 'iron',
    name: 'Поклади залізної руди',
    regionId: 1,
    gridPosition: [165, 38],
    position: [165.5, 0.14, 38.5],
    currentAmount: 240,
    maxAmount: 240,
    isRich: false,
    seasonalRenewal: false,
    icon: '⛏️',
    harvestBuildingLabel: 'Залізна шахта',
    description: 'Бура залізнякова жила, що залягає під лісовими пагорбами. Сировина для виплавки криці та кування мечів і броні.',
  },
  {
    id: 'deposit-1-berries',
    type: 'berries',
    name: 'Лісові ягідники',
    regionId: 1,
    gridPosition: [218, 85],
    position: [218.5, 0.1, 85.5],
    currentAmount: 64,
    maxAmount: 64,
    isRich: false,
    seasonalRenewal: true,
    icon: '🫐',
    harvestBuildingLabel: 'Хатина збирача ягід',
    description: 'Зарості лісової ожини та малини вздовж узлісся. Сезонне доповнення раціону місцевих жителів.',
  },
  {
    id: 'deposit-1-stone',
    type: 'stone',
    name: 'Скелястий виступ Вальдау',
    regionId: 1,
    gridPosition: [152, 78],
    position: [152.5, 0.18, 78.5],
    currentAmount: 260,
    maxAmount: 260,
    isRich: false,
    seasonalRenewal: false,
    icon: '🪨',
    harvestBuildingLabel: 'Каменоломня',
    description: 'Тверді кремʼяні та вапнякові валуни для будівництва баронських частоколів та камʼяниць.',
  },

  {
    id: 'deposit-2-fish',
    type: 'fish',
    name: 'Багата озерна затока Айхенау',
    regionId: 2,
    gridPosition: [60, 195],
    position: [60.5, 0.05, 195.5],
    currentAmount: 180,
    maxAmount: 180,
    isRich: true,
    seasonalRenewal: true,
    icon: '🐟',
    harvestBuildingLabel: 'Хатина рибалки',
    description: 'Велика спокійна затока з невичерпними зграями річкової риби. Багате родовище з подвійним річним лімітом вилову.',
  },
  {
    id: 'deposit-2-clay',
    type: 'clay',
    name: 'Багаті пласти гончарної глини',
    regionId: 2,
    gridPosition: [82, 175],
    position: [82.5, 0.08, 175.5],
    currentAmount: 380,
    maxAmount: 380,
    isRich: true,
    seasonalRenewal: false,
    icon: '🏺',
    harvestBuildingLabel: 'Глиняний карʼєр',
    description: 'Глибоке багате родовище тонкої червоної глини озерного походження. Ідеально для масового черепичного виробництва.',
  },
  {
    id: 'deposit-2-berries',
    type: 'berries',
    name: 'Ягідні луки',
    regionId: 2,
    gridPosition: [36, 168],
    position: [36.5, 0.1, 168.5],
    currentAmount: 64,
    maxAmount: 64,
    isRich: false,
    seasonalRenewal: true,
    icon: '🫐',
    harvestBuildingLabel: 'Хатина збирача ягід',
    description: 'Солодкі дикі ягоди на родючих заливних луках поблизу Айхенау.',
  },
  {
    id: 'deposit-2-salt',
    type: 'salt',
    name: 'Соляні джерела заплави',
    regionId: 2,
    gridPosition: [102, 215],
    position: [102.5, 0.12, 215.5],
    currentAmount: 160,
    maxAmount: 160,
    isRich: false,
    seasonalRenewal: false,
    icon: '🧂',
    harvestBuildingLabel: 'Солеварня',
    description: 'Мінералізоване соляне джерело. Сіль необхідна для соління риби, мʼяса та консервації провізії на зиму.',
  },

  {
    id: 'deposit-3-stone',
    type: 'stone',
    name: 'Багаті гірські каменоломні',
    regionId: 3,
    gridPosition: [178, 165],
    position: [178.5, 0.25, 165.5],
    currentAmount: 600,
    maxAmount: 600,
    isRich: true,
    seasonalRenewal: false,
    icon: '🪨',
    harvestBuildingLabel: 'Глибока каменоломня',
    description: 'Гігантський скельний розлом з гранітними та вапняковими монолітами. Багате родовище для спорудження неприступних фортець.',
  },
  {
    id: 'deposit-3-iron',
    type: 'iron',
    name: 'Багата залізорудна жила',
    regionId: 3,
    gridPosition: [215, 175],
    position: [215.5, 0.28, 175.5],
    currentAmount: 420,
    maxAmount: 420,
    isRich: true,
    seasonalRenewal: false,
    icon: '⛏️',
    harvestBuildingLabel: 'Глибока копальня',
    description: 'Товста жила високоякісного магнетиту та залізного колчедану. Дозволяє розвивати найпотужнішу зброярню у королівстві.',
  },
  {
    id: 'deposit-3-salt',
    type: 'salt',
    name: 'Багаті поклади камʼяної солі',
    regionId: 3,
    gridPosition: [168, 222],
    position: [168.5, 0.22, 222.5],
    currentAmount: 320,
    maxAmount: 320,
    isRich: true,
    seasonalRenewal: false,
    icon: '🧂',
    harvestBuildingLabel: 'Соляна шахта',
    description: 'Підземні пласти білої галітової солі. Стратегічний товар для торгівлі та забезпечення всіх сусідніх земель.',
  },
  {
    id: 'deposit-3-game',
    type: 'wild_game',
    name: 'Гірські мисливські пустки',
    regionId: 3,
    gridPosition: [225, 218],
    position: [225.5, 0.2, 218.5],
    currentAmount: 20,
    maxAmount: 20,
    isRich: false,
    seasonalRenewal: true,
    icon: '🦌',
    harvestBuildingLabel: 'Табір мисливців',
    description: 'Місця випасу гірських сарн та диких козлів серед камʼяних розсипів.',
  },
];

export function initResourceDeposits(grid?: GridMap): ResourceDeposit[] {
  const existing = world.entities.filter((e) => e.isResourceDeposit);
  for (const e of existing) {
    world.remove(e);
  }

  const deposits: ResourceDeposit[] = JSON.parse(JSON.stringify(INITIAL_RESOURCE_DEPOSITS));

  for (const dep of deposits) {
    const [gx, gz] = dep.gridPosition;

    let h = dep.position[1];
    if (grid) {
      const tile = grid.getTile(gx, gz);
      if (tile) {
        h = dep.type === 'fish' ? 0.05 : Math.max(0.08, tile.height + 0.05);
        dep.position[1] = h;
      }

      if (dep.type !== 'fish') {
        for (let dx = -2; dx <= 2; dx++) {
          for (let dz = -2; dz <= 2; dz++) {
            if (dx * dx + dz * dz > 5) continue;
            const tx = gx + dx;
            const tz = gz + dz;
            const t = grid.getTile(tx, tz);
            if (t && t.terrain !== 'water') {
              if (t.foliageType === 'tree' || t.foliageType === 'rock') {
                t.foliageType = undefined;
                t.isPassable = true;
                t.movementCost = 1.0;
              }
            }
          }
        }
      }
    }

    world.add({
      id: dep.id,
      name: dep.name,
      isResourceDeposit: true,
      depositType: dep.type,
      regionId: dep.regionId,
      gridPosition: [gx, gz],
      position: [dep.position[0], h, dep.position[2]],
      resourceAmount: dep.currentAmount,
      maxResourceAmount: dep.maxAmount,
      isRichDeposit: dep.isRich,
      yearlyYield: dep.currentAmount,
      maxYearlyYield: dep.maxAmount,
      harvestBuildingLabel: dep.harvestBuildingLabel,
      depositDescription: dep.description,
      depositIcon: dep.icon,
    });
  }

  if (grid) {
    grid.refreshFoliageCoords();
  }

  return deposits;
}
