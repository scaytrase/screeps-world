import Role from "./role";
import SpawnStrategy from "./spawn_strategy";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import {HARVESTER_ADVANCED_BODY, HARVESTER_BODY, HARVESTERS_COUNT} from "./config";
import CreepTrait from "./creep_traits";

const _ = require('lodash');

const ROLE_HARVESTER = 'harvester';
const STORAGE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_SPAWN,
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_EXTENSION,
];

export default class HarvesterRole implements Role {
    private static getSource(creep: Creep): Source {
        let sources = creep.room.find(FIND_SOURCES);

        return creep.memory['assigned_to_resource_id'] === undefined
            ? sources[0] :
            Game.getObjectById(creep.memory['assigned_to_resource_id']);
    }

    private static getTarget(creep: Creep): AnyStructure | null {
        let targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return STORAGE_STRUCTURES.includes(structure.structureType) &&
                    structure['store'].getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        if (targets.length > 0) {
            return targets[0];
        }

        return null;
    }

    run(creep: Creep) {
        if (creep['store'].getFreeCapacity() > 0) {
            CreepTrait.harvest(creep, HarvesterRole.getSource(creep));
        } else {
            CreepTrait.transferAllEnergy(creep, HarvesterRole.getTarget(creep));
        }

        CreepTrait.renewIfNeeded(creep);
    }

    match(creep: Creep) {
        return creep.memory['role'] == ROLE_HARVESTER;
    }

    spawn(spawn: StructureSpawn, game: Game) {
        spawn.spawnCreep(
            this.getCurrentCreepCount(game) > 4 ? HARVESTER_ADVANCED_BODY : HARVESTER_BODY,
            'Harvester' + game.time,
            {memory: {role: ROLE_HARVESTER}}
        )
    }

    getCurrentCreepCount(game: Game): Number {
        return _.filter(game.creeps, (creep: Creep) => this.match(creep)).length;
    }

    getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(HARVESTERS_COUNT, this);
    }
}
