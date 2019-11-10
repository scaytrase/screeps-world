import Role from "./role";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import SpawnStrategy from "./spawn_strategy";
import {REPAIRER_BODY, REPAIRERS_COUNT, REPAIRERS_ENERGY_LIMIT} from "./config";

const ROLE_REPAIRER = 'repairer';

export default class RepairerRole implements Role {
    run(creep: Creep) {
        if (creep.memory['repairing'] && creep['store'][RESOURCE_ENERGY] == 0) {
            creep.memory['repairing'] = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory['repairing'] && creep['store'].getFreeCapacity() == 0) {
            creep.memory['repairing'] = true;
            creep.say('🚧 repair');
        }

        if (creep.memory['repairing']) {
            const targets = creep.room.find(FIND_STRUCTURES, {
                filter: object => object.hits < object.hitsMax
            });

            targets.sort((a, b) => a.hits - b.hits);

            if (targets.length > 0) {
                if (creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            } else {
                let targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_SPAWN;
                    }
                });
                if (targets.length > 0) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        } else {
            let targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_SPAWN &&
                        structure['store'].getUsedCapacity(RESOURCE_ENERGY) > REPAIRERS_ENERGY_LIMIT;
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
        return creep.memory['role'] == ROLE_REPAIRER;
    }

    spawn(spawn: StructureSpawn, game: Game) {
        spawn.spawnCreep(
            REPAIRER_BODY,
            'Repairer' + game.time,
            {memory: {role: ROLE_REPAIRER}}
        )
    }

    getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(REPAIRERS_COUNT, this);
    }
}
