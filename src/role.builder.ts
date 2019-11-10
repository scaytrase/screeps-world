import Role from "./role";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import SpawnStrategy from "./spawn_strategy";
import {BUILDER_BODY, BUILDERS_COUNT, BUILDERS_ENERGY_LIMIT} from "./config";

const ROLE_BUILDER = 'builder';

export default class BuilderRole implements Role {
    run(creep: Creep) {
        if (creep.memory['building'] && creep['store'][RESOURCE_ENERGY] == 0) {
            creep.memory['building'] = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory['building'] && creep['store'].getFreeCapacity() == 0) {
            creep.memory['building'] = true;
            creep.say('🚧 build');
        }

        if (creep.memory['building']) {
            const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if (targets.length) {
                if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        } else {
            let targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_SPAWN &&
                        structure['store'].getUsedCapacity(RESOURCE_ENERGY) > BUILDERS_ENERGY_LIMIT;
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
        return creep.memory['role'] == ROLE_BUILDER;
    }

    spawn(spawn: StructureSpawn, game: Game) {
        spawn.spawnCreep(
            BUILDER_BODY,
            'Builder' + game.time,
            {memory: {role: ROLE_BUILDER}}
        )
    }

    getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(BUILDERS_COUNT, this);
    }
}
