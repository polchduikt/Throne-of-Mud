import { characterEntities, buildingEntities, world } from '../world';
import { GridMap } from '../../grid/GridMap';
import { AStar } from '../../pathfinding/AStar';
import type { Job } from '../../../types/game';
import { useGameStore } from '../../../store/useGameStore';
import { getTreeProceduralData } from '../../../components/canvas/FoliageRenderer';
import { setEntitySpeech } from '../entityHelpers';

export class JobSystem {
  public static update(grid: GridMap, currentTick: number): void {
    const { pendingJobs, removePendingJob, time, regions, playerRegionId, playerSpawnPoint } = useGameStore.getState();

    for (const unit of characterEntities) {
      const isPlayerUnit = unit.factionId === 'player' || unit.factionId === undefined;
      const isNoble =
        unit.characterClass === 'king' ||
        unit.characterClass === 'lady' ||
        unit.characterClass === 'warrior' ||
        unit.characterClass === 'lord';

      const uRegionId = unit.regionId !== undefined ? unit.regionId : (playerRegionId ?? 0);
      const uRegion = regions.find((r) => r.id === uRegionId) || regions[0];
      const uBounds = uRegion?.bounds;
      const campPos = uRegion?.campPosition || playerSpawnPoint || [52, 52];
      const cx = campPos[0];
      const cz = campPos[1];

      const isNightTime = time.hour >= 20 || time.hour < 6;
      const isCriticallyExhausted = Boolean(unit.needs && unit.needs.energy <= 5);
      const isAlreadySleeping = unit.currentJob?.type === 'sleep';
      const isMidManualJob =
        unit.currentJob?.type === 'chop_tree' ||
        unit.currentJob?.type === 'wait_tree_fall' ||
        unit.currentJob?.type === 'chop_fallen_log' ||
        unit.currentJob?.type === 'build_structure';

      if (!isNightTime && isAlreadySleeping) {
        const isRested = !unit.needs || unit.needs.energy >= 75 || time.hour === 6;
        if (isRested) {
          unit.currentJob = {
            id: `idle-${Date.now()}`,
            type: 'idle',
            progress: 0,
            totalWork: 0,
          };
          if (unit.needs) {
            unit.needs.energy = Math.max(85, unit.needs.energy);
            unit.needs.mood = Math.min(100, (unit.needs.mood || 50) + 15);
          }
          setEntitySpeech(
            unit,
            isNoble ? 'Новий день у королівстві!' : 'Доброго ранку! До праці!',
            'mood',
            currentTick,
            30
          );

          if (unit.gridPosition) {
            const [ux, uz] = unit.gridPosition;
            const exitCandidates: [number, number][] = [
              [ux, uz + 1],
              [ux, uz + 2],
              [ux + 1, uz + 1],
              [ux - 1, uz + 1],
              [ux, uz - 1],
            ];
            for (const [ex, ez] of exitCandidates) {
              if (grid.isWalkable(ex, ez)) {
                const exitPath = AStar.findPath(grid, [ux, uz], [ex, ez], false, uBounds);
                if (exitPath && exitPath.length > 0) {
                  unit.path = exitPath;
                  break;
                }
              }
            }
          }
          continue;
        }
      }

      if ((isNightTime || isCriticallyExhausted) && !isMidManualJob) {
        if (isAlreadySleeping) {
          if (unit.needs) {
            unit.needs.energy = Math.min(100, unit.needs.energy + 0.35);
          }
          if ((!unit.path || unit.path.length === 0) && unit.currentJob.targetPosition) {
            const [bedX, bedZ] = unit.currentJob.targetPosition;
            const currentUPos = unit.position;
            if (currentUPos) {
              const distToBed = Math.hypot(currentUPos[0] - bedX, currentUPos[2] - bedZ);
              if (distToBed > 0.3) {
                unit.position = [bedX, 0.05, bedZ];
                unit.gridPosition = [Math.floor(bedX), Math.floor(bedZ)];
                unit.path = [];
              }
            }
          }
          continue;
        }

        const completedBuildings = Array.from(buildingEntities).filter(
          (b) => b.isCompleted && (b.regionId === undefined || b.regionId === uRegionId)
        );
        const buildingSleepers: Record<string, number> = {};
        for (const other of characterEntities) {
          if (other.currentJob?.type === 'sleep' && other.currentJob.targetBuildingId) {
            buildingSleepers[other.currentJob.targetBuildingId] =
              (buildingSleepers[other.currentJob.targetBuildingId] || 0) + 1;
          }
        }

        let chosenBuilding: any = null;
        let bedWorldPos: [number, number] | null = null;
        let targetDoorPos: [number, number] | null = null;
        let bedAngle = 0;

        if (isNoble) {
          const tents = completedBuildings.filter((b) => b.buildingType === 'tent');
          for (const t of tents) {
            const count = buildingSleepers[t.id] || 0;
            if (count < 1) {
              chosenBuilding = t;
              const [bx, bz] = t.gridPosition || [cx, cz];
              bedWorldPos = [bx + 1.0, bz + 1.17];
              bedAngle = 0;
              targetDoorPos = [bx + 1, bz + 2];
              break;
            }
          }
        }

        if (!chosenBuilding) {
          const peasantHouses = completedBuildings.filter((b) => b.buildingType === 'peasant_house');
          for (const ph of peasantHouses) {
            const count = buildingSleepers[ph.id] || 0;
            if (count < 2) {
              chosenBuilding = ph;
              const [bx, bz] = ph.gridPosition || [cx, cz];
              const bedOffsets: [number, number][] = [
                [0.55, 1.05],
                [2.45, 1.05],
              ];
              const offset = bedOffsets[count % 2];
              bedWorldPos = [bx + offset[0], bz + offset[1]];
              bedAngle = 0;
              targetDoorPos = [bx + 1, bz + 2];
              break;
            }
          }
        }

        if (!chosenBuilding && !isNoble) {
          const tents = completedBuildings.filter((b) => b.buildingType === 'tent');
          for (const t of tents) {
            const count = buildingSleepers[t.id] || 0;
            if (count < 1) {
              chosenBuilding = t;
              const [bx, bz] = t.gridPosition || [cx, cz];
              bedWorldPos = [bx + 1.0, bz + 1.17];
              bedAngle = 0;
              targetDoorPos = [bx + 1, bz + 2];
              break;
            }
          }
        }

        if (!chosenBuilding) {
          const huts = completedBuildings.filter((b) => b.buildingType === 'lumberjack_hut');
          for (const h of huts) {
            const count = buildingSleepers[h.id] || 0;
            if (count < 1) {
              chosenBuilding = h;
              const [bx, bz] = h.gridPosition || [cx, cz];
              bedWorldPos = [bx + 0.52, bz + 1.05];
              bedAngle = 0;
              targetDoorPos = [bx + 1, bz + 2];
              break;
            }
          }
        }

        if (!chosenBuilding) {
          const campfires = completedBuildings.filter((b) => b.buildingType === 'campfire');
          if (campfires.length > 0) {
            const c = campfires[0];
            const [bx, bz] = c.gridPosition || [cx, cz];
            const angle = Math.random() * Math.PI * 2;
            bedWorldPos = [bx + 0.5 + Math.cos(angle) * 1.2, bz + 0.5 + Math.sin(angle) * 1.2];
            bedAngle = angle;
            targetDoorPos = [Math.floor(bedWorldPos[0]), Math.floor(bedWorldPos[1])];
          }
        }

        if (!bedWorldPos) {
          const [ux, uz] = unit.gridPosition || [cx, cz];
          bedWorldPos = [ux + 0.5, uz + 0.5];
          bedAngle = 0;
          targetDoorPos = [ux, uz];
        }

        if (unit.gridPosition && targetDoorPos) {
          let sleepPath: [number, number][] | null = null;
          if (
            Math.abs(unit.gridPosition[0] - targetDoorPos[0]) > 1 ||
            Math.abs(unit.gridPosition[1] - targetDoorPos[1]) > 1
          ) {
            sleepPath = AStar.findPath(grid, unit.gridPosition, targetDoorPos, false, uBounds);
            if (!sleepPath && chosenBuilding && chosenBuilding.gridPosition) {
              sleepPath = AStar.findPathToArea(
                grid,
                unit.gridPosition,
                chosenBuilding.gridPosition[0],
                chosenBuilding.gridPosition[1],
                chosenBuilding.buildingWidth || 2,
                chosenBuilding.buildingHeight || 2,
                uBounds
              );
            }
          }

          const currentUPos = unit.position || [unit.gridPosition[0] + 0.5, 0.05, unit.gridPosition[1] + 0.5];
          const distToBed = Math.hypot(currentUPos[0] - bedWorldPos[0], currentUPos[2] - bedWorldPos[1]);

          if (sleepPath && sleepPath.length > 0) {
            unit.path = sleepPath;
          } else if (distToBed <= 2.5) {
            unit.position = [bedWorldPos[0], 0.05, bedWorldPos[1]];
            unit.gridPosition = [Math.floor(bedWorldPos[0]), Math.floor(bedWorldPos[1])];
            unit.path = [];
          } else {
            const [ux, uz] = unit.gridPosition;
            bedWorldPos = [ux + 0.5, uz + 0.5];
            bedAngle = 0;
            unit.position = [ux + 0.5, 0.05, uz + 0.5];
            unit.path = [];
          }
        }

        unit.currentJob = {
          id: `sleep-${unit.id}`,
          type: 'sleep',
          targetBuildingId: chosenBuilding?.id,
          targetPosition: bedWorldPos,
          targetAngle: bedAngle,
          progress: 0,
          totalWork: 100,
        };

        const houseLabel =
          chosenBuilding?.name ||
          (chosenBuilding?.buildingType === 'peasant_house'
            ? 'хатину'
            : chosenBuilding?.buildingType === 'tent'
            ? 'палатку'
            : 'вогнище');

        setEntitySpeech(
          unit,
          chosenBuilding ? `Іду спати у ${houseLabel}...` : 'Час нічного відпочинку...',
          'mood',
          currentTick,
          30
        );
        continue;
      }

      if (unit.isLevy && unit.commandingLordId) {
        const lord = Array.from(characterEntities).find((c) => c.id === unit.commandingLordId);
        if (lord && lord.gridPosition && unit.gridPosition) {
          const dist = Math.hypot(lord.gridPosition[0] - unit.gridPosition[0], lord.gridPosition[1] - unit.gridPosition[1]);
          if (dist > 2.5 && (!unit.path || unit.path.length === 0)) {
            const path = AStar.findPath(grid, unit.gridPosition, lord.gridPosition, true, uBounds);
            if (path && path.length > 0) {
              unit.path = path;
              unit.currentJob = {
                id: `patrol-${unit.id}`,
                type: 'patrol',
                progress: 0,
                totalWork: 100,
              };
            }
          }
        }
        continue;
      }

      if (isNoble) {
        if (!unit.path || unit.path.length === 0) {
          if (Math.random() < 0.08 && unit.gridPosition) {
            let targetX = cx;
            let targetZ = cz;
            let speech = '';

            const buildingsList = Array.from(buildingEntities).filter((b) => !b.regionId || b.regionId === uRegionId);

            if (unit.characterClass === 'king' || unit.characterClass === 'lord') {
              if (buildingsList.length > 0 && Math.random() < 0.6) {
                const b = buildingsList[Math.floor(Math.random() * buildingsList.length)];
                if (b.gridPosition) {
                  targetX = b.gridPosition[0] + Math.floor(Math.random() * 3 - 1);
                  targetZ = b.gridPosition[1] + Math.floor(Math.random() * 3 - 1);
                  speech = `Оглядаю: ${b.name || 'володіння'}`;
                }
              } else {
                targetX = cx + Math.floor(Math.random() * 5 - 2);
                targetZ = cz + Math.floor(Math.random() * 5 - 2);
                speech = 'Королівство в порядку!';
              }
            } else {
              targetX = cx + Math.floor(Math.random() * 5 - 2);
              targetZ = cz + Math.floor(Math.random() * 5 - 2);
              speech = 'Варта біля табору!';
            }

            const minX = uBounds ? uBounds.minX + 2 : 2;
            const maxX = uBounds ? uBounds.maxX - 2 : grid.width - 3;
            const minZ = uBounds ? uBounds.minZ + 2 : 2;
            const maxZ = uBounds ? uBounds.maxZ - 2 : grid.height - 3;
            const clampedX = Math.max(minX, Math.min(maxX, targetX));
            const clampedZ = Math.max(minZ, Math.min(maxZ, targetZ));

            if (grid.isWalkable(clampedX, clampedZ)) {
              const noblePath = AStar.findPath(grid, unit.gridPosition, [clampedX, clampedZ], false, uBounds);
              if (noblePath && noblePath.length > 0) {
                unit.path = noblePath;
                unit.currentJob = {
                  id: `wander-${Date.now()}`,
                  type: 'wander',
                  progress: 0,
                  totalWork: 10,
                };
                if (speech && Math.random() < 0.4) {
                  unit.speechBubble = {
                    text: speech,
                    expiresAtTick: currentTick + 25,
                    type: 'mood',
                  };
                }
              }
            }
          }
        }
        continue;
      }

      if (!isNoble && unit.workBuildingId && time.hour >= 7 && time.hour <= 18) {
        const building = Array.from(buildingEntities).find((b) => b.id === unit.workBuildingId);
        if (building && building.isCompleted) {
          if (building.buildingType === 'lumberjack_hut') {
            const hutWood = building.localInventory?.wood || 0;
            const maxStorage = 20;

            if (hutWood >= maxStorage) {
              if (unit.currentJob?.type === 'chop_tree' || unit.currentJob?.type === 'wait_tree_fall' || unit.currentJob?.type === 'chop_fallen_log') {
              } else {
                unit.currentJob = { id: `idle-full-${unit.id}`, type: 'idle', progress: 0, totalWork: 0 };

                if (building.gridPosition && unit.gridPosition) {
                  const distToHut = Math.hypot(building.gridPosition[0] - unit.gridPosition[0], building.gridPosition[1] - unit.gridPosition[1]);
                  if (distToHut > 2.2 && (!unit.path || unit.path.length === 0)) {
                    const hutPath = AStar.findPath(grid, unit.gridPosition, building.gridPosition, true, uBounds);
                    if (hutPath && hutPath.length > 0) {
                      unit.path = hutPath;
                    }
                  }
                }

                if (currentTick % 30 === 0) {
                  unit.speechBubble = {
                    text: `Сховище хатини повне (${hutWood}/${maxStorage})! Відпочиваю`,
                    expiresAtTick: currentTick + 25,
                    type: 'work',
                  };
                }
                continue;
              }
            } else if (unit.currentJob?.type === 'chop_tree' || unit.currentJob?.type === 'wait_tree_fall' || unit.currentJob?.type === 'chop_fallen_log') {
            } else {
              let bestTarget: [number, number] | null = null;
              let bestPath: [number, number][] | null = null;
              let isFallenCandidate = false;

              if (unit.gridPosition) {
                const [ux, uz] = unit.gridPosition;
                const hutPos = building.gridPosition || [cx, cz];
                const candidateTrees: Array<{ pos: [number, number]; dist: number; isFallen: boolean }> = [];

                const minSearchX = uBounds ? Math.max(uBounds.minX, hutPos[0] - 18) : Math.max(0, hutPos[0] - 18);
                const maxSearchX = uBounds ? Math.min(uBounds.maxX, hutPos[0] + 18) : Math.min(grid.width - 1, hutPos[0] + 18);
                const minSearchZ = uBounds ? Math.max(uBounds.minZ, hutPos[1] - 18) : Math.max(0, hutPos[1] - 18);
                const maxSearchZ = uBounds ? Math.min(uBounds.maxZ, hutPos[1] + 18) : Math.min(grid.height - 1, hutPos[1] + 18);

                for (let x = minSearchX; x <= maxSearchX; x++) {
                  for (let z = minSearchZ; z <= maxSearchZ; z++) {
                    const tile = grid.tiles[x]?.[z];
                    if (tile && (tile.foliageType === 'fallen_tree' || tile.foliageType === 'tree')) {
                      const distFromHut = Math.hypot(x - hutPos[0], z - hutPos[1]);
                      const distFromUnit = Math.hypot(x - ux, z - uz);
                      if (distFromHut <= 18) {
                        const priorityBonus = tile.foliageType === 'fallen_tree' ? -4.5 : 0;
                        candidateTrees.push({
                          pos: [x, z],
                          dist: distFromHut * 0.7 + distFromUnit * 0.3 + priorityBonus,
                          isFallen: tile.foliageType === 'fallen_tree',
                        });
                      }
                    }
                  }
                }

                candidateTrees.sort((a, b) => a.dist - b.dist);

                for (const candidate of candidateTrees.slice(0, 4)) {
                  const testPath = AStar.findPath(grid, unit.gridPosition, candidate.pos, true, uBounds);
                  if (testPath && testPath.length > 0) {
                    bestTarget = candidate.pos;
                    bestPath = testPath;
                    isFallenCandidate = candidate.isFallen;
                    break;
                  }
                }
              }

              if (bestTarget && bestPath) {
                unit.path = bestPath;
                unit.currentJob = {
                  id: `chop-auto-${unit.id}-${Date.now()}`,
                  type: isFallenCandidate ? 'chop_fallen_log' : 'chop_tree',
                  targetPosition: bestTarget,
                  progress: 0,
                  totalWork: isFallenCandidate ? 45 : 55,
                };
                unit.speechBubble = {
                  text: isFallenCandidate ? 'Іду розрубувати повалене дерево' : 'Іду валити дерево',
                  expiresAtTick: currentTick + 25,
                  type: 'work',
                };
              } else if (building.gridPosition && unit.gridPosition) {
                const distToHut = Math.hypot(building.gridPosition[0] - unit.gridPosition[0], building.gridPosition[1] - unit.gridPosition[1]);
                if (distToHut > 2.5 && (!unit.path || unit.path.length === 0)) {
                  const hutPath = AStar.findPath(grid, unit.gridPosition, building.gridPosition, true, uBounds);
                  if (hutPath && hutPath.length > 0) {
                    unit.path = hutPath;
                    unit.currentJob = {
                      id: `work-hut-${unit.id}`,
                      type: 'work_at_building',
                      targetBuildingId: unit.workBuildingId,
                      targetPosition: building.gridPosition,
                      progress: 0,
                      totalWork: 100,
                    };
                  }
                }
              }
            }
          } else {
            if (building.gridPosition && unit.gridPosition) {
              const dist = Math.hypot(building.gridPosition[0] - unit.gridPosition[0], building.gridPosition[1] - unit.gridPosition[1]);
              if (dist > 2.0 && (!unit.path || unit.path.length === 0)) {
                const path = AStar.findPath(grid, unit.gridPosition, building.gridPosition, true, uBounds);
                if (path && path.length > 0) {
                  unit.path = path;
                  unit.currentJob = {
                    id: `work-${unit.id}`,
                    type: 'work_at_building',
                    targetBuildingId: unit.workBuildingId,
                    targetPosition: building.gridPosition,
                    progress: 0,
                    totalWork: 100,
                  };
                  unit.speechBubble = {
                    text: `Іду на зміну: ${building.name || 'споруда'}`,
                    expiresAtTick: currentTick + 25,
                    type: 'work',
                  };
                }
              } else if (dist <= 2.0 && (!unit.currentJob || unit.currentJob.type === 'idle')) {
                unit.currentJob = {
                  id: `work-${unit.id}`,
                  type: 'work_at_building',
                  targetBuildingId: unit.workBuildingId,
                  targetPosition: building.gridPosition,
                  progress: 0,
                  totalWork: 100,
                };
              }
            }
          }
        }
      }

      if (!isNoble && unit.workBuildingId && (time.hour < 7 || time.hour > 18)) {
        if (unit.currentJob?.type === 'chop_tree') {
          unit.currentJob = { id: `idle-${Date.now()}`, type: 'idle', progress: 0, totalWork: 0 };
          const campPath = AStar.findPath(grid, unit.gridPosition || [cx, cz], [cx, cz], true, uBounds);
          if (campPath && campPath.length > 0) {
            unit.path = campPath;
            unit.speechBubble = {
              text: 'Робочий день завершено, іду до табору',
              expiresAtTick: currentTick + 25,
              type: 'mood',
            };
          }
        }
      }

      if (isPlayerUnit && !unit.workBuildingId && (!unit.currentJob || unit.currentJob.type === 'idle' || unit.currentJob.type === 'wander')) {
        const availableJob = pendingJobs.find((j) => !j.assignedUnitId || j.type === 'build_structure');
        if (availableJob && unit.gridPosition) {
          let path: [number, number][] | null = null;

          if (availableJob.type === 'build_structure' && availableJob.targetBuildingId) {
            const b = Array.from(buildingEntities).find((e) => e.id === availableJob.targetBuildingId);
            if (b && b.gridPosition) {
              const bWidth = b.buildingWidth || 2;
              const bHeight = b.buildingHeight || 2;
              path = AStar.findPathToArea(grid, unit.gridPosition, b.gridPosition[0], b.gridPosition[1], bWidth, bHeight, uBounds);
            }
          } else if (availableJob.targetPosition) {
            path = AStar.findPath(
              grid,
              unit.gridPosition,
              availableJob.targetPosition,
              true,
              uBounds
            );
          }

          if (path && path.length > 0) {
            if (!availableJob.assignedUnitId) {
              availableJob.assignedUnitId = unit.id;
            }
            unit.currentJob = { ...availableJob, id: `job-${unit.id}-${Date.now()}` };
            unit.path = path;
            unit.speechBubble = {
              text: JobSystem.getJobAnnouncement(availableJob.type),
              expiresAtTick: currentTick + 20,
              type: 'work',
            };
          }
        } else if (!unit.path || unit.path.length === 0) {
          if (Math.random() < 0.08 && unit.gridPosition) {
            const minX = uBounds ? uBounds.minX + 2 : 2;
            const maxX = uBounds ? uBounds.maxX - 2 : grid.width - 3;
            const minZ = uBounds ? uBounds.minZ + 2 : 2;
            const maxZ = uBounds ? uBounds.maxZ - 2 : grid.height - 3;
            const rx = Math.max(minX, Math.min(maxX, cx + Math.floor(Math.random() * 7 - 3)));
            const rz = Math.max(minZ, Math.min(maxZ, cz + Math.floor(Math.random() * 7 - 3)));
            if (grid.isWalkable(rx, rz)) {
              const wanderPath = AStar.findPath(grid, unit.gridPosition, [rx, rz], false, uBounds);
              if (wanderPath && wanderPath.length > 0) {
                unit.path = wanderPath;
                unit.currentJob = {
                  id: `wander-${Date.now()}`,
                  type: 'wander',
                  progress: 0,
                  totalWork: 10,
                };
              }
            }
          }
        }
      }

      if (unit.currentJob && unit.currentJob.type !== 'idle' && unit.currentJob.type !== 'wander') {
        const job = unit.currentJob;

        if (unit.path && unit.path.length > 0) {
          continue;
        }

        const buildSkill = unit.skills?.building || 5;
        const woodSkill = unit.skills?.woodcutting || 5;

        if (job.type === 'chop_tree') {
          const isStrikeTick = currentTick % 10 === 0 || job.progress === 0;
          if (isStrikeTick) {
            const strikePower = 11 + Math.floor(woodSkill * 0.4);
            job.progress += strikePower;

            const pct = Math.round((job.progress / job.totalWork) * 100);
            if (pct <= 40) {
              unit.speechBubble = {
                text: 'Підрубую стовбур...',
                expiresAtTick: currentTick + 15,
                type: 'work',
              };
            } else if (pct <= 75) {
              unit.speechBubble = {
                text: 'Стовбур тріщить!',
                expiresAtTick: currentTick + 15,
                type: 'work',
              };
            } else if (pct < 100) {
              unit.speechBubble = {
                text: 'Обережно, дерево падає!',
                expiresAtTick: currentTick + 15,
                type: 'work',
              };
            }
          }
        } else if (job.type === 'wait_tree_fall') {
          job.progress += 1;
          if (currentTick % 6 === 0) {
            unit.speechBubble = {
              text: 'Чекаю, поки дерево впаде...',
              expiresAtTick: currentTick + 15,
              type: 'work',
            };
          }
        } else if (job.type === 'chop_fallen_log') {
          const isStrikeTick = currentTick % 10 === 0 || job.progress === 0;
          if (isStrikeTick) {
            const strikePower = 11 + Math.floor(woodSkill * 0.4);
            job.progress += strikePower;

            const pct = Math.round((job.progress / job.totalWork) * 100);
            if (pct <= 45) {
              unit.speechBubble = {
                text: 'Розрубую стовбур на колоди...',
                expiresAtTick: currentTick + 15,
                type: 'work',
              };
            } else if (pct < 100) {
              unit.speechBubble = {
                text: 'Розколюю колоди...',
                expiresAtTick: currentTick + 15,
                type: 'work',
              };
            }
          }
        } else {
          const workStep = 2 + Math.floor(buildSkill * 0.4);
          job.progress += workStep;

          if (job.type === 'build_structure' && currentTick % 12 === 0) {
            unit.speechBubble = {
              text: 'Зводжу споруду...',
              expiresAtTick: currentTick + 15,
              type: 'work',
            };
          }
        }

        if (job.type === 'build_structure' && job.targetBuildingId) {
          for (const b of buildingEntities) {
            if (b.id === job.targetBuildingId) {
              const newProg = Math.min(99, Math.round((job.progress / job.totalWork) * 100));
              b.constructionProgress = newProg;
              break;
            }
          }
        }

        if (job.progress >= job.totalWork) {
          if (job.type === 'chop_tree' && job.targetPosition) {
            const [gx, gz] = job.targetPosition;
            const { treeType } = getTreeProceduralData(gx, gz);

            const [ux, , uz] = unit.position || [gx + 0.5, 0, gz + 0.5];
            const fdx = (gx + 0.5) - ux;
            const fdz = (gz + 0.5) - uz;
            const fallAngle = Math.hypot(fdx, fdz) > 0.01 ? Math.atan2(fdx, fdz) : 0;

            grid.removeFoliage(gx, gz);

            useGameStore.getState().registerTreeFall(gx, gz, treeType, fallAngle);
            useGameStore.getState().incrementFoliageVersion();

            unit.currentJob = {
              id: `wait-fall-${unit.id}-${Date.now()}`,
              type: 'wait_tree_fall',
              targetPosition: [gx, gz],
              progress: 0,
              totalWork: 16,
            };
            unit.speechBubble = {
              text: 'Дерево падає! Чекаю приземлення...',
              expiresAtTick: currentTick + 20,
              type: 'work',
            };
            continue;
          }

          if (job.type === 'wait_tree_fall' && job.targetPosition) {
            const [gx, gz] = job.targetPosition;
            unit.currentJob = {
              id: `chop-log-${unit.id}-${Date.now()}`,
              type: 'chop_fallen_log',
              targetPosition: [gx, gz],
              progress: 0,
              totalWork: 45,
            };
            unit.speechBubble = {
              text: 'Дерево впало! Розрубую стовбур на колоди',
              expiresAtTick: currentTick + 25,
              type: 'work',
            };
            continue;
          }

          JobSystem.completeJob(job, unit, grid, currentTick);
          if (job.targetBuildingId) {
            const { pendingJobs } = useGameStore.getState();
            for (const pj of pendingJobs) {
              if (pj.targetBuildingId === job.targetBuildingId || pj.id === job.id) {
                removePendingJob(pj.id);
              }
            }
          } else {
            removePendingJob(job.id);
          }
          unit.currentJob = { id: `idle-${Date.now()}`, type: 'idle', progress: 0, totalWork: 0 };
        }
      }
    }
  }

  private static completeJob(job: Job, unit: any, grid: GridMap, currentTick: number): void {
    const { addResource, addChronicleEvent, incrementBuildingVersion, incrementFoliageVersion, regions, updateRegionStats } = useGameStore.getState();
    const isPlayerUnit = unit.factionId === 'player' || unit.factionId === undefined;

    switch (job.type) {
      case 'chop_tree':
      case 'chop_fallen_log':
        if (job.targetPosition) {
          grid.removeFoliage(job.targetPosition[0], job.targetPosition[1]);
          incrementFoliageVersion();

          let b: any = null;
          if (unit.workBuildingId) {
            b = Array.from(buildingEntities).find((be) => be.id === unit.workBuildingId);
          }

          if (b && b.buildingType === 'lumberjack_hut') {
            if (!b.localInventory) b.localInventory = { wood: 0 };
            const maxStorage = 20;
            const currentWood = b.localInventory.wood || 0;
            const addAmt = Math.min(8, Math.max(0, maxStorage - currentWood));
            b.localInventory.wood = currentWood + addAmt;
            if (isPlayerUnit) {
              addResource('wood', addAmt);
            }

            const isFull = b.localInventory.wood >= maxStorage;
            unit.speechBubble = {
              text: isFull
                ? `Деревину заготовлено! Сховище повне (${b.localInventory.wood}/${maxStorage})`
                : `Деревину заготовлено! (${b.localInventory.wood}/${maxStorage} у хатині)`,
              expiresAtTick: currentTick + 30,
              type: 'work',
            };
          } else {
            if (isPlayerUnit) {
              addResource('wood', 8);
            }
            unit.speechBubble = {
              text: 'Деревину заготовлено! (+8 деревини)',
              expiresAtTick: currentTick + 25,
              type: 'work',
            };
          }
        }
        break;

      case 'mine_rock':
        if (job.targetPosition) {
          grid.removeFoliage(job.targetPosition[0], job.targetPosition[1]);
          incrementFoliageVersion();
          if (isPlayerUnit) {
            addResource('stone', 8);
          }
          unit.speechBubble = {
            text: 'Камінь видобуто! (+8 каменю)',
            expiresAtTick: currentTick + 25,
            type: 'work',
          };
        }
        break;

      case 'build_structure':
        if (job.targetBuildingId) {
          for (const b of buildingEntities) {
            if (b.id === job.targetBuildingId) {
              b.constructionProgress = 100;
              b.isCompleted = true;
              b.buildingHealth = b.maxBuildingHealth || 150;
              incrementBuildingVersion();

              if (isPlayerUnit) {
                addChronicleEvent({
                  title: 'Будівництво завершено!',
                  description: `Зведено нову споруду: ${b.name || 'Будівля'}.`,
                  type: 'success',
                });
              } else if (b.factionId && b.factionId.startsWith('bot-')) {
                const reg = regions.find((r) => r.id === b.regionId);
                if (reg) {
                  if (b.buildingType === 'peasant_house') {
                    const newPId = `unit-${b.factionId}-immigrant-${Date.now() % 1000}`;
                    world.add({
                      id: newPId,
                      name: `Селянин (${reg.lordName})`,
                      title: 'Поселенець',
                      characterClass: 'peasant',
                      avatarColor: reg.heraldryColor,
                      isCharacter: true,
                      factionId: b.factionId,
                      regionId: reg.id,
                      gridPosition: [b.gridPosition ? b.gridPosition[0] + 1 : 0, b.gridPosition ? b.gridPosition[1] + 1 : 0],
                      position: [b.gridPosition ? b.gridPosition[0] + 1.5 : 0, 0.3, b.gridPosition ? b.gridPosition[1] + 1.5 : 0],
                      moveSpeed: 1.35,
                      gold: 4,
                      needs: { hunger: 90, energy: 90, mood: 80, ale: 60, hygiene: 80 },
                      skills: { farming: 5, woodcutting: 6, mining: 5, building: 6, cooking: 4, brewing: 3, combat: 3, intellect: 4, charisma: 4 },
                      currentJob: { id: `idle-${newPId}`, type: 'idle', progress: 0, totalWork: 0 },
                    });
                  }
                  const curBotUnits = Array.from(characterEntities).filter(
                    (e) => e.isCharacter && e.regionId === reg.id
                  );
                  updateRegionStats(reg.id, {
                    buildingsCount: reg.buildingsCount + 1,
                    population: curBotUnits.length,
                    wealth: reg.wealth + 15,
                  });
                  addChronicleEvent({
                    title: `Розвиток ${reg.ukrName}`,
                    description: `${reg.lordName} завершив будівництво ${b.name || 'споруди'} у володінні ${reg.ukrName}. Поселення росте!`,
                    type: 'info',
                  });
                }
              }

              unit.speechBubble = {
                text: 'Будівлю зведено!',
                expiresAtTick: currentTick + 25,
                type: 'work',
              };
              break;
            }
          }
        }
        break;

      case 'harvest_wheat':
        if (isPlayerUnit) {
          addResource('wheat', 10);
        }
        unit.speechBubble = {
          text: 'Врожай зібрано! (+10 пшениці)',
          expiresAtTick: currentTick + 25,
          type: 'work',
        };
        break;

      case 'sleep':
        unit.speechBubble = {
          text: 'Відпочив і сповнений сил!',
          expiresAtTick: currentTick + 20,
          type: 'mood',
        };
        break;

      case 'work_at_building':
        if (Math.random() < 0.2) {
          unit.speechBubble = {
            text: 'Зміна триває...',
            expiresAtTick: currentTick + 20,
            type: 'work',
          };
        }
        break;

      case 'patrol':
        break;

      default:
        break;
    }
  }

  private static getJobAnnouncement(type: string): string {
    switch (type) {
      case 'chop_tree': return 'Іду рубати ліс';
      case 'mine_rock': return 'Іду видобувати камінь';
      case 'build_structure': return 'Іду на будівництво';
      case 'harvest_wheat': return 'Час збирати врожай';
      case 'work_at_building': return 'Іду на робоче місце';
      case 'patrol': return 'Патрулюю володіння';
      case 'sleep': return 'Іду відпочивати';
      default: return 'Виконую наказ';
    }
  }
}
