import {GUARD_BODY, GUARDS_ATTACK_BORDERS, GUARDS_COUNT_LIMIT} from "./config";
import CreepTrait, {COLOR_ATTACK} from "./creep_traits";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import FoundMoreThanLimitSpawnStrategy from "./spawn_strategy.find_condition_more_than";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

export default class GuardRole extends BaseCreepRole {
    private static getTarget(creep: Creep): Creep | null {
        return creep.room
            .find(FIND_HOSTILE_CREEPS, {filter: (hostile: Creep) => GUARDS_ATTACK_BORDERS || Utils.isWithinTraversableBorders(hostile)})
            .sort(Utils.sortByDistance(creep))
            .shift();
    }

    run(creep: Creep, game: Game): void {
        const target = GuardRole.getTarget(creep);
        if (target) {
            creep.memory['target'] = {pos: target.pos};
            CreepTrait.attack(creep, target, {reusePath: 1});
        } else {
            if (creep.memory['target'] !== undefined) {
                creep.moveTo(
                    creep.room
                        .find<StructureRampart>(FIND_MY_STRUCTURES, {
                            filter: (structure) => structure.structureType === STRUCTURE_RAMPART &&
                                creep.room.find(FIND_MY_CREEPS).filter(other_creep => other_creep !== creep && other_creep.pos.isEqualTo(structure)).length === 0
                        })
                        .sort(Utils.sortByDistance(creep))
                        .shift(),
                    {visualizePathStyle: {stroke: COLOR_ATTACK}}
                );
            }
        }
    }

    getSpawnStrategy(): SpawnStrategy {
        return new AndChainSpawnStrategy(
            [
                new FoundMoreThanLimitSpawnStrategy(0, FIND_HOSTILE_CREEPS),
                new LimitedSpawnByRoleCountStrategy(GUARDS_COUNT_LIMIT, this),
            ]
        );
    }

    protected getBody(game: Game): BodyPartConstant[] {
        return GUARD_BODY;
    }

    protected getRoleName(): string {
        return 'guard';
    }
}
