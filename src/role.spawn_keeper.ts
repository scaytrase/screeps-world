import Role from "./role";
import SpawnStrategy from "./spawn_strategy";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import {SPAWN_KEEPER_BODY, SPAWN_KEEPERS_COUNT} from "./config";
import CreepTrait from "./creep_traits";

const ROLE_SPAWN_KEEPER = 'spawn_keeper';

const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
];
const TARGET_STRUCTURES: StructureConstant[] = [
    STRUCTURE_EXTENSION,
    STRUCTURE_SPAWN
];

export default class SpawnKeeperRole implements Role {
    private static getSource(creep: Creep): AnyStructure | null {
        let sources = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return SOURCE_STRUCTURES.includes(structure.structureType) &&
                    structure['store'].getUsedCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        if (sources.length > 0) {
            return sources[0];
        }

        return null;
    }

    private static getTarget(creep: Creep): AnyStructure | null {
        let targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return TARGET_STRUCTURES.includes(structure.structureType) &&
                    structure['store'].getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        if (targets.length > 0) {
            return targets[0];
        }

        return null;
    }

    getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(SPAWN_KEEPERS_COUNT, this);
    }

    match(creep: Creep): boolean {
        return creep.memory['role'] == ROLE_SPAWN_KEEPER;
    }

    run(creep: Creep): void {
        if (creep['store'].getFreeCapacity() > 0) {
            CreepTrait.withdraw(creep, SpawnKeeperRole.getSource(creep));
        } else {
            CreepTrait.transferAllEnergy(creep, SpawnKeeperRole.getTarget(creep))
        }

        CreepTrait.renewIfNeeded(creep);
    }

    spawn(spawn: StructureSpawn, game: Game) {
        spawn.spawnCreep(
            SPAWN_KEEPER_BODY,
            'SpawnKeeper' + game.time,
            {memory: {role: ROLE_SPAWN_KEEPER}}
        )
    }
}
