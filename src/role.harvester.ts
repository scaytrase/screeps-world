import Role from "./role";
import SpawnStrategy from "./spawn_strategy";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import {HARVESTER_ADVANCED_BODY, HARVESTER_BODY, HARVESTER_SUPER_ADVANCED_BODY, HARVESTERS_COUNT} from "./config";
import CreepTrait from "./creep_traits";
import {RESOURCE_ASSIGNMENT} from "./resource_assigner";

const _ = require('lodash');

const ROLE_HARVESTER = 'harvester';
const STORAGE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_SPAWN,
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_EXTENSION,
];

export default class HarvesterRole implements Role {
    private static getSource(creep: Creep): Source | null {
        return creep.memory[RESOURCE_ASSIGNMENT] === undefined
            ? null
            : Game.getObjectById(creep.memory[RESOURCE_ASSIGNMENT]);
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
            this.getBody(game),
            'Harvester' + game.time,
            {memory: {role: ROLE_HARVESTER}}
        )
    }

    private getBody(game: Game) {
        const currentCreepCount = this.getCurrentCreepCount(game);
        if (currentCreepCount < 5) {
            return HARVESTER_BODY;
        }

        if (currentCreepCount < 10) {
            return HARVESTER_ADVANCED_BODY;
        }

        return HARVESTER_SUPER_ADVANCED_BODY;
    }

    getCurrentCreepCount(game: Game): Number {
        return _.filter(game.creeps, (creep: Creep) => this.match(creep)).length;
    }

    getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(HARVESTERS_COUNT, this);
    }
}
