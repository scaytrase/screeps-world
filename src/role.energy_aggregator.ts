import Role from "./role";
import SpawnStrategy from "./spawn_strategy";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import {ENERGY_AGGREGATOR_BODY, ENERGY_AGGREGATORS_COUNT, ENERGY_CENTER} from "./config";
import CreepTrait from "./creep_traits";

const ROLE_ENERGY_AGGREGATOR = 'energy_aggregator';

const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_LINK,
    STRUCTURE_CONTAINER,
];
const TARGET_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
];

export default class EnergyAggregatorRole implements Role {
    private static getSource(creep: Creep): AnyStructure | null {
        const flag = EnergyAggregatorRole.getFlag(creep);

        if (!flag) {
            return null;
        }

        const sources = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return SOURCE_STRUCTURES.includes(structure.structureType) &&
                        structure['store'].getUsedCapacity() >= 0 &&
                    structure.pos.getRangeTo(flag) > 1
                    ;
            }
        });

        return sources.sort((a, b) => Math.sign(b.pos.getRangeTo(flag) - a.pos.getRangeTo(flag))).shift();
    }

    private static getFlag(creep: Creep): Flag | null {
        const flags = creep.room.find(FIND_FLAGS, {
            filter: (flag) => {
                return flag.name === ENERGY_CENTER;
            }
        });

        if (flags.length === 0) {
            return null;
        }

        return flags[0];
    }

    private static getTarget(creep: Creep): AnyStructure | null {
        let targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return TARGET_STRUCTURES.includes(structure.structureType) &&
                    structure['store'].getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        const flag = EnergyAggregatorRole.getFlag(creep);

        if (!flag) {
            return null;
        }

        targets = targets.sort((a, b) => Math.sign(a.pos.getRangeTo(flag) - b.pos.getRangeTo(flag)));

        if (targets.length > 0) {
            return targets[0];
        }

        return null;
    }

    getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(ENERGY_AGGREGATORS_COUNT, this);
    }

    match(creep: Creep): boolean {
        return creep.memory['role'] == ROLE_ENERGY_AGGREGATOR;
    }

    run(creep: Creep): void {
        if (creep['store'].getUsedCapacity() > 0) {
            CreepTrait.withdrawAllResources(creep, EnergyAggregatorRole.getSource(creep));
        } else {
            CreepTrait.transferAllResources(creep, EnergyAggregatorRole.getTarget(creep))
        }

        CreepTrait.renewIfNeeded(creep);
    }

    spawn(spawn: StructureSpawn, game: Game): void {
        spawn.spawnCreep(
            ENERGY_AGGREGATOR_BODY,
            'EnergyAggregator' + game.time,
            {memory: {role: ROLE_ENERGY_AGGREGATOR}}
        )
    }
}
