import Role from "./role";
import SpawnStrategy from "./spawn_strategy";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import {UPGRADER_BODY, UPGRADERS_COUNT, UPGRADERS_ENERGY_LIMIT} from "./config";
import CreepTrait from "./creep_traits";

const ROLE_UPGRADER = 'upgrader';

const SOURCE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_SPAWN
];

export default class UpgraderRole implements Role {
    private static getSource(creep: Creep): AnyStructure | null {
        let sources = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return SOURCE_STRUCTURES.includes(structure.structureType) &&
                    structure['store'].getUsedCapacity(RESOURCE_ENERGY) > UPGRADERS_ENERGY_LIMIT;
            }
        });

        if (sources.length > 0) {
            return sources[0];
        }

        return null;
    }

    run(creep: Creep) {
        if (creep.memory['upgrading'] && creep['store'][RESOURCE_ENERGY] == 0) {
            creep.memory['upgrading'] = false;
            creep.say('🔄 harvest');
        } else if (!creep.memory['upgrading'] && creep['store'].getFreeCapacity() == 0) {
            creep.memory['upgrading'] = true;
            creep.say('⚡ upgrade');
        }

        if (creep.memory['upgrading']) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else {
            const source = UpgraderRole.getSource(creep);
            if (source) {
                if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }

        CreepTrait.renewIfNeeded(creep);
    }

    match(creep: Creep) {
        return creep.memory['role'] == ROLE_UPGRADER;
    }

    spawn(spawn: StructureSpawn, game: Game) {
        spawn.spawnCreep(
            UPGRADER_BODY,
            'Upgrader' + game.time,
            {memory: {role: ROLE_UPGRADER}}
        )
    }

    getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(UPGRADERS_COUNT, this);
    }
}
