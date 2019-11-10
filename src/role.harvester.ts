import Role from "./role";
import SpawnStrategy from "./spawn_strategy";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import {HARVESTER_BODY, HARVESTERS_COUNT} from "./config";

const ROLE_HARVESTER = 'harvester';

export default class HarvesterRole implements Role {
    run(creep: Creep) {
        if (creep['store'].getFreeCapacity() > 0) {
            let sources = creep.room.find(FIND_SOURCES);
            let source: Source = creep.memory['assigned_to_resource_id'] === undefined
                ? sources[0] :
                Game.getObjectById(creep.memory['assigned_to_resource_id']);
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        } else {
            let targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) &&
                        structure['store'].getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            if (targets.length > 0) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    }

    match(creep: Creep) {
        return creep.memory['role'] == ROLE_HARVESTER;
    }

    spawn(spawn: StructureSpawn, game: Game) {
        spawn.spawnCreep(
            HARVESTER_BODY,
            'Harvester' + game.time,
            {memory: {role: ROLE_HARVESTER}}
        )
    }

    getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(HARVESTERS_COUNT, this);
    }
}
