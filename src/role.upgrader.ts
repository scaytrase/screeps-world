import Role from "./role";
import SpawnStrategy from "./spawn_strategy";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import {UPGRADER_BODY, UPGRADERS_COUNT, UPGRADERS_ENERGY_LIMIT} from "./config";

const ROLE_UPGRADER = 'upgrader';

export default class UpgraderRole implements Role {
    run(creep: Creep) {
        if (creep.memory['upgrading'] && creep['store'][RESOURCE_ENERGY] == 0) {
            creep.memory['upgrading'] = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory['upgrading'] && creep['store'].getFreeCapacity() == 0) {
            creep.memory['upgrading'] = true;
            creep.say('⚡ upgrade');
        }

        if (creep.memory['upgrading']) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else {
            let targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_SPAWN &&
                        structure['store'].getUsedCapacity(RESOURCE_ENERGY) > UPGRADERS_ENERGY_LIMIT;
                }
            });
            if (targets.length > 0) {
                if (creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
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
