import {GUARDS_ATTACK_BORDERS, RANGE_GUARD_BODY, RANGE_GUARDS_COUNT_LIMIT} from "./config";
import CreepTrait, {COLOR_ATTACK} from "./creep_traits";
import BaseCreepRole from "./role.base_creep";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import FoundMoreThanLimitSpawnStrategy from "./spawn_strategy.find_condition_more_than";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

export default class RangeGuardRole extends BaseCreepRole {
    private static getTarget(creep: Creep): Creep | null {
        return creep.room
            .find(FIND_HOSTILE_CREEPS, {filter: (hostile: Creep) => GUARDS_ATTACK_BORDERS || Utils.isWithinTraversableBorders(hostile)})
            .sort(Utils.sortByDistance(creep))
            .shift();
    }

    run(creep: Creep, game: Game): void {
        const target = RangeGuardRole.getTarget(creep);
        if (target) {
            creep.memory['last_target'] = {pos: target.pos};
            CreepTrait.attack(creep, target, {reusePath: 1});
        } else {
            if (creep.memory['last_target'] !== undefined) {
                const creeps = creep.room.find(FIND_MY_CREEPS);
                creep.moveTo(
                    creep.room
                        .find<StructureRampart>(FIND_MY_STRUCTURES, {
                            filter: (structure) => structure.structureType === STRUCTURE_RAMPART &&
                                creeps.filter(other_creep => other_creep !== creep && other_creep.pos.isEqualTo(structure)).length === 0
                        })
                        .sort(Utils.sortByDistance(
                            {
                                pos: new RoomPosition(
                                    creep.memory['last_target'].pos.x,
                                    creep.memory['last_target'].pos.y,
                                    creep.memory['last_target'].pos.roomName
                                )
                            }
                        ))
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
                new LimitedSpawnByRoleCountStrategy(RANGE_GUARDS_COUNT_LIMIT, this),
            ]
        );
    }

    protected getBody(game: Game): BodyPartConstant[] {
        return RANGE_GUARD_BODY;
    }

    protected getRoleName(): string {
        return 'range_guard';
    }
}
