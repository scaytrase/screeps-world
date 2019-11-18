import {GUARD_BODY, GUARDS_COUNT} from "./config";
import CreepTrait from "./creep_traits";
import {RESOURCE_ASSIGNMENT} from "./resource_assigner";
import Role from "./role";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import FoundMoreThanLimitSpawnStrategy from "./spawn_strategy.find_condition_more_than";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";

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

    private static getBody(game: Game): BodyPartConstant[] {
        return GUARD_BODY;
    }

    run(creep: Creep, game: Game): void {
        if (creep['store'].getUsedCapacity() === 0) {
            CreepTrait.harvest(creep, GuardRole.getSource(creep));
        } else {
            CreepTrait.attack(creep, GuardRole.getTarget(creep));
        }

        CreepTrait.attack(creep, GuardRole.getTarget(creep));

        CreepTrait.renewIfNeeded(creep);
    }

    match(creep: Creep): boolean {
        return creep.memory['role'] == ROLE_GUARD;
    }

    spawn(spawn: StructureSpawn, game: Game): void {
        if (spawn.room.find(FIND_HOSTILE_CREEPS).length === 0) {
            return;
        }

        spawn.spawnCreep(
            GuardRole.getBody(game),
            'Guard' + game.time,
            {memory: {role: ROLE_GUARD}}
        );
    }

    getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy(
            [
                new FoundMoreThanLimitSpawnStrategy(0, FIND_HOSTILE_CREEPS),
                new LimitedSpawnByRoleCountStrategy(GUARDS_COUNT, this),
            ]
        );
    }
}
