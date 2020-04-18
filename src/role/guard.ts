import {GUARDS_ATTACK_BORDERS, GUARDS_COUNT_LIMIT} from "../config/config";
import {ATTACKER_BODIES, BASE_ATTACKER_BODY} from "../config/const";
import CreepTrait from "../creep_traits";
import BaseCreepRole from "../base_roles/base_creep";
import {Sort} from "../utils/sort_utils";
import AndChainSpawnStrategy from "../spawn_strategy/and_chain";
import RoleCountStrategy from "../spawn_strategy/role_count";
import RoomFindSpawnStrategy from "../spawn_strategy/room_find";
import Utils from "../utils/utils";
import {COLOR_ATTACK} from "../config/colors";
import ProtoCreep from "../proto_creep";

export default class GuardRole extends BaseCreepRole {
    private static getTarget(creep: Creep): Creep | null {
        return creep.room
            .find(FIND_HOSTILE_CREEPS, {filter: (hostile: Creep) => GUARDS_ATTACK_BORDERS || Utils.isWithinTraversableBorders(hostile)})
            .sort(Sort.byDistance(creep))
            .shift();
    }

    run(creep: Creep): void {
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
                        .sort(Sort.byDistance(creep))
                        .shift(),
                    {visualizePathStyle: {stroke: COLOR_ATTACK}}
                );
            }
        }
    }

    public getRoleName(): string {
        return 'guard';
    }

    protected createPrototype(spawn: StructureSpawn): ProtoCreep | null {
        const strategy = new AndChainSpawnStrategy(
            [
                new RoomFindSpawnStrategy(FIND_HOSTILE_CREEPS),
                RoleCountStrategy.room(GUARDS_COUNT_LIMIT, this),
            ]
        );

        if (strategy.shouldSpawn(spawn)) {
            return new ProtoCreep(
                Utils.getBiggerPossibleBodyNow(ATTACKER_BODIES, BASE_ATTACKER_BODY, spawn),
                this.getDefaultMemory(spawn)
            );
        }

        return null;
    }
}
