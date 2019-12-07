import {HARVESTER_ADVANCED_BODY, HARVESTER_BODY, HARVESTER_SUPER_ADVANCED_BODY, HARVESTERS_COUNT_LIMIT} from "./config";
import CreepTrait from "./creep_traits";
import {RESOURCE_ASSIGNMENT} from "./resource_assigner";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

const _ = require('lodash');

const STORAGE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_LINK,
    STRUCTURE_SPAWN,
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_EXTENSION,
];

export default class HarvesterRole extends BaseCreepRole {
    private static getRecipientStructures(creep: Creep): StructureConstant[] {
        if (creep.room.energyAvailable < 600) {
            return [STRUCTURE_LINK, STRUCTURE_SPAWN, STRUCTURE_EXTENSION];
        } else {
            return STORAGE_STRUCTURES;
        }
    }

    run(creep: Creep, game: Game): void {
        if (creep['store'].getFreeCapacity() > 0) {
            CreepTrait.harvest(creep, Game.getObjectById(creep.memory[RESOURCE_ASSIGNMENT]));
        } else {
            CreepTrait.transferAllEnergy(creep, Utils.getClosestEnergyRecipient(creep, HarvesterRole.getRecipientStructures(creep)));
        }
    }

    getCurrentCreepCount(game: Game): Number {
        return _.filter(game.creeps, (creep: Creep) => this.match(creep)).length;
    }

    getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(HARVESTERS_COUNT_LIMIT, this);
    }

    protected getBody(game: Game) {
        const currentCreepCount = this.getCurrentCreepCount(game);
        if (currentCreepCount < 2) {
            return HARVESTER_BODY;
        }

        if (currentCreepCount < 4) {
            return HARVESTER_ADVANCED_BODY;
        }

        return HARVESTER_SUPER_ADVANCED_BODY;
    }

    protected getRoleName(): string {
        return 'harvester';
    }
}
