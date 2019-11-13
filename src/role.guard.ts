import Role from "./role";
import SpawnStrategy from "./spawn_strategy";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import {GUARD_BODY, GUARDS_COUNT, HARVESTERS_COUNT} from "./config";
import CreepTrait from "./creep_traits";
import {RESOURCE_ASSIGNMENT} from "./resource_assigner";

const _ = require('lodash');

export const ROLE_GUARD = 'guard';

export default class GuardRole implements Role {
    private static getSource(creep: Creep): Source | null {
        return creep.memory[RESOURCE_ASSIGNMENT] === undefined
            ? null
            : Game.getObjectById(creep.memory[RESOURCE_ASSIGNMENT]);
    }

    private static getTarget(creep: Creep): Creep | null {
        let targets = creep.room.find(FIND_HOSTILE_CREEPS);

        targets = targets.sort((a, b) => Math.sign(a.pos.getRangeTo(creep) - b.pos.getRangeTo(creep)));

        if (targets.length > 0) {
            return targets[0];
        }

        return null;
    }

    run(creep: Creep) {
        if (creep['store'].getUsedCapacity() === 0) {
            CreepTrait.harvest(creep, GuardRole.getSource(creep));
        } else {
            CreepTrait.attack(creep, GuardRole.getTarget(creep));
        }

        CreepTrait.attack(creep, GuardRole.getTarget(creep));

        CreepTrait.renewIfNeeded(creep);
    }

    match(creep: Creep) {
        return creep.memory['role'] == ROLE_GUARD;
    }

    spawn(spawn: StructureSpawn, game: Game) {
        spawn.spawnCreep(
            this.getBody(game),
            'Guard' + game.time,
            {memory: {role: ROLE_GUARD}}
        )
    }

    private getBody(game: Game) {
        const currentCreepCount = this.getCurrentCreepCount(game);

        return GUARD_BODY;
    }

    getCurrentCreepCount(game: Game): Number {
        return _.filter(game.creeps, (creep: Creep) => this.match(creep)).length;
    }

    getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(GUARDS_COUNT, this);
    }
}
